import { test } from '@playwright/test';
import fs from 'fs';
import { CONFIG } from '../helpers/config/config.js';
import { gerenciarLogin } from '../helpers/login/gerenciarLogin.js';
import { extrairLimitesEmDolar } from '../helpers/billing/extrairLimitesEmDolar.js';
import { extrairVisaoGeralEModelos } from '../helpers/billing/extrairVisaoGeralEModelos.js';
import { extrairUsoDetalhadoUsuarios } from '../helpers/billing/extrairUsoDetalhadoUsuarios.js';

test('Extrair faturamento do Copilot - Rentcars', async ({ page, context }) => {
    try {
        // Navega para a página de login primeiro para verificar a sessão de forma segura
        await page.goto("https://github.com/login");
        if (page.url().includes("github.com/login")) {
            await gerenciarLogin(page, context);
        }

        // Agora que temos certeza de estar autenticados, extraímos os orçamentos
        const orcamentoGeral = await extrairLimitesEmDolar(page);
        
        // Extraímos a visão geral da organização e o resumo consolidado por modelos
        const { visaoGeralOrganizacao, resumoConsolidadoModelos } = await extrairVisaoGeralEModelos(page);

        // Extraímos os detalhes granulares de cada usuário e seus respectivos modelos
        const detalheUsuarios = await extrairUsoDetalhadoUsuarios(page);

        const relatorioFinal = {
            dataGeracao: new Date().toISOString(),
            orcamentoGeral: orcamentoGeral,
            visaoGeralOrganizacao: visaoGeralOrganizacao,
            resumoConsolidadoModelos: resumoConsolidadoModelos,
            detalheUsuarios: detalheUsuarios
        };

        fs.writeFileSync("relatorio_final_copilot.json", JSON.stringify(relatorioFinal, null, 4), "utf-8");
        console.log("Sucesso! Relatório gerado.");

        // Gera/Atualiza o dashboard HTML interativo com os novos dados
        const templatePath = "devices/helpers/dashboard_template.html";
        if (fs.existsSync(templatePath)) {
            let html = fs.readFileSync(templatePath, "utf-8");
            // Substitui o bloco de fallback pela carga real de dados
            html = html.replace(/\/\* DATA_PLACEHOLDER_START \*\/[\s\S]*?\/\* DATA_PLACEHOLDER_END \*\//g, `/* DATA_PLACEHOLDER_START */ ${JSON.stringify(relatorioFinal, null, 4)} /* DATA_PLACEHOLDER_END */`);
            fs.writeFileSync("dashboard.html", html, "utf-8");
            console.log("Sucesso! Dashboard HTML gerado/atualizado.");
        }
    } catch (erro) {
        console.error("Erro na execução:", erro);
        throw erro;
    }
});
