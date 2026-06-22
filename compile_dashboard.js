import fs from 'fs';
import path from 'path';

try {
    const jsonPath = "relatorio_final_copilot.json";
    const templatePath = "devices/helpers/dashboard_template.html";
    const outputPath = "dashboard.html";

    if (!fs.existsSync(jsonPath)) {
        console.error(`Erro: Arquivo ${jsonPath} não foi encontrado!`);
        process.exit(1);
    }

    if (!fs.existsSync(templatePath)) {
        console.error(`Erro: Arquivo ${templatePath} não foi encontrado!`);
        process.exit(1);
    }

    const relatorioFinal = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    let html = fs.readFileSync(templatePath, "utf-8");

    // Replace the default data block in the template with the real scraped JSON content
    html = html.replace(/\/\* DATA_PLACEHOLDER_START \*\/[\s\S]*?\/\* DATA_PLACEHOLDER_END \*\//g, `/* DATA_PLACEHOLDER_START */ ${JSON.stringify(relatorioFinal, null, 4)} /* DATA_PLACEHOLDER_END */`);

    fs.writeFileSync(outputPath, html, "utf-8");
    console.log("Sucesso! O arquivo 'dashboard.html' foi compilado e atualizado perfeitamente com os dados mais recentes.");
} catch (error) {
    console.error("Erro durante a compilação do dashboard:", error);
    process.exit(1);
}
