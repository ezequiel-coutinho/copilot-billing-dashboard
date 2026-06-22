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
    
    await page.fill("#app_totp", codigoMfa);
    await page.keyboard.press("Enter");

    // Espera navegar com sucesso ou falhar rápido se o código for inválido
    try {
        await Promise.race([
            page.waitForURL("https://github.com/", { timeout: 30000 }),
            page.waitForSelector(".flash-error, [role='alert']", { timeout: 15000 }).then(async () => {
                const errorText = await page.locator(".flash-error, [role='alert']").first().innerText().catch(() => "");
                throw new Error(`GitHub rejeitou o código 2FA: "${errorText.trim()}". Verifique se a hora da VM está sincronizada ou se o GH_TOTP_SECRET no .env está correto.`);
            })
        ]);
    } catch (err) {
        console.error("Erro no login:", err.message);
        throw err;
    }

    await context.storageState({ path: CONFIG.cookieFile });
}

export { gerenciarLogin };
