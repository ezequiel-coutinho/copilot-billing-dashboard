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
    const codigoMfa = authenticator.generate(segredoLimpo);
    
    await page.fill("#app_totp", codigoMfa);
    await page.waitForURL("https://github.com/");
    await context.storageState({ path: CONFIG.cookieFile });
}

export { gerenciarLogin };
