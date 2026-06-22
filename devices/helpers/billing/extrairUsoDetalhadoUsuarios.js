import { CONFIG } from '../config/config.js';

async function extrairUsoDetalhadoUsuarios(page) {
    await page.goto(CONFIG.urlAiUsage);
    await page.waitForTimeout(3000); // Wait for the page state to settle

    const dadosUsuarios = [];
    let hasNext = true;
    let pageNum = 1;

    while (hasNext) {
        // Wait for the rows/details to load on the current page
        await page.waitForSelector("summary[data-testid='usage-details']");

        const userBlocks = await page.locator("[data-testid='usage-table-rows'] > div").all();
        
        for (const block of userBlocks) {
            // Extrai os dados principais do usuário usando data-testid robustos do GitHub
            const nomeUsuario = (await block.locator("[data-testid='identifier-td'] a").first().innerText()).trim();
            const totalIncludedCredits = (await block.locator("[data-testid='included-requests-td'] span").first().innerText()).trim();
            const totalAdditionalCredits = (await block.locator("[data-testid='billing-requests-td'] span").first().innerText()).trim();
            const totalGrossAmount = (await block.locator("[data-testid='gross-amount-td'] span").first().innerText()).trim();
            const totalAdditionalUsage = (await block.locator("[data-testid='billed-amount-td'] span").first().innerText()).trim();

            // Clica no botão de expansão do usuário
            const botaoExpandir = block.locator("summary[data-testid='usage-details']");
            await botaoExpandir.click();
            
            // Espera a sub-tabela carregar para este usuário específico
            const subTabela = block.locator("[data-testid='usage-sub-table']");
            await subTabela.waitFor({ state: 'visible' });

            const subLinhas = await subTabela.locator("div.shared-module__trStyle___Iz85").all();
            const modelosUtilizados = [];

            for (const subLinha of subLinhas) {
                const modelo = (await subLinha.locator("[data-testid='identifier-td'] span").innerText()).trim();
                const includedCredits = (await subLinha.locator("[data-testid='included-requests-td'] span").innerText()).trim();
                const additionalCredits = (await subLinha.locator("[data-testid='billing-requests-td'] span").innerText()).trim();
                const grossAmount = (await subLinha.locator("[data-testid='gross-amount-td'] span").innerText()).trim();
                const additionalUsage = (await subLinha.locator("[data-testid='billed-amount-td'] span").innerText()).trim();

                modelosUtilizados.push({
                    modelo,
                    includedCredits,
                    additionalCredits,
                    grossAmount,
                    additionalUsage
                });
            }

            dadosUsuarios.push({
                usuario: nomeUsuario,
                totalIncludedCredits,
                totalAdditionalCredits,
                totalGrossAmount,
                totalAdditionalUsage,
                modelos: modelosUtilizados
            });

            // Clica novamente para fechar o expandido (evita excesso de elementos renderizados simultâneos)
            await botaoExpandir.click();
            await page.waitForTimeout(100);
        }

        // Checar paginação (se há botão de avançar e se ele não está desabilitado)
        const nextButton = page.locator("a:has-text('Next')").first();
        if (await nextButton.count() > 0) {
            const ariaDisabled = await nextButton.getAttribute("aria-disabled");
            const isClickable = ariaDisabled !== "true" && await nextButton.isVisible();
            
            if (isClickable) {
                console.log(`Avançando para a página ${pageNum + 1} de desenvolvedores...`);
                await nextButton.click();
                await page.waitForTimeout(4000); // Aguarda o carregamento da próxima página
                pageNum++;
            } else {
                hasNext = false; // Reclicou até o fim (aria-disabled="true")
            }
        } else {
            hasNext = false; // Sem botão de paginação
        }
    }

    return dadosUsuarios;
}

export { extrairUsoDetalhadoUsuarios };
