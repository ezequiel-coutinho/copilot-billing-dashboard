import { authenticator } from 'otplib';
import { CONFIG } from '../config/config.js';

async function gerenciarLogin(page, context) {
    console.log("Sessão expirada. Iniciando login via TOTP...");
    await page.goto("https://github.com/login");
    await page.fill("#login_field", CONFIG.user);
    await page.fill("#password", CONFIG.pass);
    await page.click("input[type='submit']");

    await page.waitForSelector("#app_totp");
    // Remove espaços em branco do segredo (comum ao copiar e colar do GitHub)
    const segredoLimpo = CONFIG.totpSecret.replace(/\s+/g, '');

    // Permite ajustar o relógio via .env caso a VM esteja com o relógio travado/atrasado
    const timeOffsetSeconds = parseFloat(process.env.TIME_OFFSET_SECONDS || "0");
    if (timeOffsetSeconds !== 0) {
        const adjustedEpoch = Date.now() + (timeOffsetSeconds * 1000);
        authenticator.options = { epoch: adjustedEpoch };
        console.log(`🕒 Aplicando ajuste de tempo de ${timeOffsetSeconds} segundos na geração do 2FA. (Hora real simulada: ${new Date(adjustedEpoch).toISOString()})`);
    }

    const codigoMfa = authenticator.generate(segredoLimpo);
    console.log(`🕒 Código 2FA Gerado pela Automação: ${codigoMfa} (Restam ${30 - (Math.floor(Date.now() / 1000) % 30)}s para expirar)`);
    
    await page.fill("#app_totp", codigoMfa);

    // O GitHub faz auto-submit quando 6 dígitos são preenchidos.
    // Vamos esperar até 5 segundos pela navegação automática. Se não navegar, apertamos Enter manualmente.
    try {
        await Promise.race([
            page.waitForURL("https://github.com/", { timeout: 5000 }),
            page.waitForSelector(".flash-error, [role='alert']", { timeout: 5000 }).then(async () => {
                const errorText = await page.locator(".flash-error, [role='alert']").first().innerText().catch(() => "");
                throw new Error(`GitHub rejeitou o código 2FA: "${errorText.trim()}".`);
            })
        ]);
    } catch (err) {
        if (err.message.includes("GitHub rejeitou")) {
            throw err;
        }
        // Se deu timeout de 5 segundos sem navegar e sem erro na tela, tenta enviar com Enter manual
        console.log("🕒 Não navegou automaticamente em 5s. Enviando com Enter manual...");
        await page.keyboard.press("Enter");
        
        // Agora aguarda o resultado definitivo (sucesso ou falha rápida)
        try {
            await Promise.race([
                page.waitForURL("https://github.com/", { timeout: 25000 }),
                page.waitForSelector(".flash-error, [role='alert']", { timeout: 15000 }).then(async () => {
                    const errorText = await page.locator(".flash-error, [role='alert']").first().innerText().catch(() => "");
                    throw new Error(`GitHub rejeitou o código 2FA: "${errorText.trim()}". Verifique se a hora da VM está sincronizada ou se o GH_TOTP_SECRET no .env está correto.`);
                })
            ]);
        } catch (subErr) {
            console.error("Erro no login:", subErr.message);
            throw subErr;
        }
    }

    await context.storageState({ path: CONFIG.cookieFile });
}

export { gerenciarLogin };
