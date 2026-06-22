import { authenticator } from 'otplib';
import 'dotenv/config';

const secret = process.env.GH_TOTP_SECRET ? process.env.GH_TOTP_SECRET.replace(/\s+/g, '') : '';

if (!secret) {
    console.error("ERRO: GH_TOTP_SECRET não está definido no arquivo .env!");
    process.exit(1);
}

try {
    const code = authenticator.generate(secret);
    const timeUsed = Math.floor(Date.now() / 1000);
    const timeLeft = 30 - (timeUsed % 30);

    console.log("=========================================");
    console.log("   DEBUG DO SEGUNDO FATOR (MFA/TOTP)     ");
    console.log("=========================================");
    console.log(`Hora do Sistema: ${new Date().toLocaleTimeString()}`);
    console.log(`Segredo Utilizado (sem espaços): ${secret}`);
    console.log(`Código Gerado pelo Script: ${code}`);
    console.log(`Tempo restante para este código: ${timeLeft} segundos`);
    console.log("=========================================");
    console.log("\nINSTRUÇÃO:");
    console.log("Abra o aplicativo de autenticação (Google Authenticator, Authy, etc.) no seu celular.");
    console.log("Verifique se o código gerado acima coincide exatamente com o código exibido no seu celular para esta conta.");
    console.log("Se os códigos NÃO coincidirem, o segredo fornecido no .env não é o correto para esta conta do GitHub.");
    console.log("=========================================");
} catch (err) {
    console.error("Erro ao gerar o TOTP:", err.message);
}
