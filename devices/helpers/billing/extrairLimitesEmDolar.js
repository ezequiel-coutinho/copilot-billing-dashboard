import { CONFIG } from '../config/config.js';

async function extrairLimitesEmDolar(page) {
    await page.goto(CONFIG.urlBudgets);
    await page.waitForSelector("text=All AI Credit SKUs");

    const tr = page.locator("tr").filter({ hasText: "All AI Credit SKUs" }).first();
    const textoBruto = await tr.innerText();
    const linhas = textoBruto.split("\n");
    
    let dadosBudget = { spent: "", budget: "" };
    linhas.forEach(linha => {
        const linhaMin = linha.toLowerCase();
        if (linhaMin.includes("spent")) dadosBudget.spent = linha.trim();
        if (linhaMin.includes("budget")) dadosBudget.budget = linha.trim();
    });
    return dadosBudget;
}

export { extrairLimitesEmDolar };
