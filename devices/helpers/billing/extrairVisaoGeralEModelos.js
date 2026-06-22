import { CONFIG } from '../config/config.js';

async function extrairVisaoGeralEModelos(page) {
    await page.goto(CONFIG.urlAiUsage);
    await page.waitForTimeout(5000); // Wait for page to fully load

    const bodyText = await page.locator("body").innerText();
    
    let visaoGeralOrganizacao = {
        creditosInclusosConsumidos: "",
        creditosInclusosTotal: "",
        usoAdicionalStatus: ""
    };

    // Extract Included Credits (e.g. 137.984 / 138.000)
    const matchInclusos = bodyText.match(/([\d\.,]+)\s*\n*\s*\/\s*([\d\.,]+)\s*AI\s+credits/i);
    if (matchInclusos) {
        visaoGeralOrganizacao.creditosInclusosConsumidos = matchInclusos[1].trim();
        visaoGeralOrganizacao.creditosInclusosTotal = matchInclusos[2].trim();
    }

    // Extract Additional Usage Status
    if (bodyText.includes("Not enabled")) {
        visaoGeralOrganizacao.usoAdicionalStatus = "Not enabled";
    } else if (bodyText.includes("Enabled")) {
        visaoGeralOrganizacao.usoAdicionalStatus = "Enabled";
    } else {
        visaoGeralOrganizacao.usoAdicionalStatus = "Not enabled"; // fallback
    }

    let resumoConsolidadoModelos = [];

    // Select the "Models" grouping from the dropdown
    const dropdown = page.locator("button:has-text('Group by:')").first();
    if (await dropdown.count() > 0) {
        const dropdownText = await dropdown.innerText();
        if (dropdownText.includes("Users")) {
            await dropdown.click();
            await page.waitForTimeout(1000);

            const modelsOption = page.locator("span:has-text('Models'), button:has-text('Models'), [role='menuitem']:has-text('Models')").first();
            if (await modelsOption.count() > 0) {
                await modelsOption.click();
                await page.waitForTimeout(4000); // Wait for the table to update
            }
        }

        // Now extract the consolidated model-level rows
        const tableRows = await page.locator("[data-testid='usage-table-rows'] > div").all();
        for (const row of tableRows) {
            const text = await row.innerText();
            const parts = text.split("\n").map(p => p.trim()).filter(Boolean);
            if (parts.length >= 5) {
                resumoConsolidadoModelos.push({
                    modelo: parts[0],
                    includedCredits: parts[1],
                    additionalCredits: parts[2],
                    grossAmount: parts[3],
                    additionalUsage: parts[4]
                });
            }
        }

        // Switch back to "Users" to ensure the user detailed scraper works flawlessly
        const dropdownUpdated = page.locator("button:has-text('Group by:')").first();
        const updatedText = await dropdownUpdated.innerText();
        if (updatedText.includes("Models")) {
            await dropdownUpdated.click();
            await page.waitForTimeout(1000);

            const usersOption = page.locator("span:has-text('Users'), button:has-text('Users'), [role='menuitem']:has-text('Users')").first();
            if (await usersOption.count() > 0) {
                await usersOption.click();
                await page.waitForTimeout(4000); // Wait for the table to update back to users
            }
        }
    }

    return {
        visaoGeralOrganizacao,
        resumoConsolidadoModelos
    };
}

export { extrairVisaoGeralEModelos };
