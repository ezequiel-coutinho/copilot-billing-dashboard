import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function injectData(template, placeholder, data) {
    const regex = new RegExp(`\\/\\* ${placeholder}_START \\*\\/[\\s\\S]*?\\/\\* ${placeholder}_END \\*\\/`, 'g');
    return template.replace(regex, `/* ${placeholder}_START */ ${JSON.stringify(data, null, 4)} /* ${placeholder}_END */`);
}

function lerHistorico() {
    const dir = "historico";
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter(f => f.endsWith('.json'))
        .map(f => {
            try { return JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")); }
            catch { return null; }
        })
        .filter(Boolean);
}

try {
    const jsonPath = "relatorio_final_copilot.json";

    if (!fs.existsSync(jsonPath)) {
        console.error(`Erro: Arquivo ${jsonPath} não foi encontrado!`);
        process.exit(1);
    }

    const relatorioFinal = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    const historico = lerHistorico();

    // ── 1. Compila index.html (dashboard principal) ───────────────────────────
    const dashTemplatePath = "devices/helpers/dashboard_template.html";
    if (!fs.existsSync(dashTemplatePath)) {
        console.error(`Erro: Arquivo ${dashTemplatePath} não foi encontrado!`);
        process.exit(1);
    }
    let dashHtml = fs.readFileSync(dashTemplatePath, "utf-8");
    dashHtml = injectData(dashHtml, 'DATA_PLACEHOLDER', relatorioFinal);
    fs.writeFileSync("index.html", dashHtml, "utf-8");
    console.log("✓ index.html compilado com sucesso.");

    // ── 2. Compila insights.html (segunda página: alertas e projeções) ────────
    const insightsTemplatePath = "devices/helpers/insights_template.html";
    if (!fs.existsSync(insightsTemplatePath)) {
        console.error(`Erro: Arquivo ${insightsTemplatePath} não foi encontrado!`);
        process.exit(1);
    }
    let insightsHtml = fs.readFileSync(insightsTemplatePath, "utf-8");
    insightsHtml = injectData(insightsHtml, 'DATA_PLACEHOLDER', relatorioFinal);
    insightsHtml = injectData(insightsHtml, 'HISTORICO_PLACEHOLDER', historico);
    fs.writeFileSync("insights.html", insightsHtml, "utf-8");
    console.log(`✓ insights.html compilado com sucesso.${historico.length > 0 ? ` (${historico.length} mês(es) histórico injetado)` : ' (sem histórico ainda)'}`);

    // ── 3. Gera slack_payload.json ────────────────────────────────────────────
    execSync('node generate_slack.js', { stdio: 'inherit' });

} catch (error) {
    console.error("Erro durante a compilação:", error);
    process.exit(1);
}
