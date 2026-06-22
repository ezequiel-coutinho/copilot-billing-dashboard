import fs from 'fs';

function parseF(val) {
    if (!val) return 0;
    return parseFloat(val.toString().replace(/[^\d.\-]/g, '').replace(/,/g, '')) || 0;
}

function fmtInt(n) {
    return Math.round(n).toLocaleString('pt-BR');
}

function calcular(data) {
    const dataGeracao = new Date(data.dataGeracao);
    const diaDoMes    = dataGeracao.getDate();
    const diasNoMes   = new Date(dataGeracao.getFullYear(), dataGeracao.getMonth() + 1, 0).getDate();
    const diasRestantes = diasNoMes - diaDoMes;

    const credUsed  = parseF(data.visaoGeralOrganizacao?.creditosInclusosConsumidos);
    const credTotal = parseF(data.visaoGeralOrganizacao?.creditosInclusosTotal) || 1;
    const spent     = parseF(data.orcamentoGeral?.spent);
    const budget    = parseF(data.orcamentoGeral?.budget) || 1;

    const pctCred   = (credUsed / credTotal) * 100;
    const pctBudget = (spent / budget) * 100;
    const burnCred  = diaDoMes > 0 ? credUsed / diaDoMes : 0;
    const burnDol   = diaDoMes > 0 ? spent / diaDoMes : 0;
    const projCred  = credUsed + burnCred * diasRestantes;
    const projDol   = spent + burnDol * diasRestantes;

    return { diaDoMes, diasNoMes, diasRestantes, credUsed, credTotal, spent, budget, pctCred, pctBudget, burnCred, burnDol, projCred, projDol };
}

function nivelCreditos(pct) {
    if (pct >= 95) return { emoji: ':rotating_light:', label: 'CRÍTICO',  color: '#ef4444' };
    if (pct >= 80) return { emoji: ':warning:',         label: 'ATENÇÃO', color: '#ffa800' };
    return             { emoji: ':white_check_mark:',   label: 'OK',      color: '#108c54' };
}

function gerarPayload(data) {
    const p      = calcular(data);
    const nivel  = nivelCreditos(p.pctCred);
    const users  = [...(data.detalheUsuarios || [])].sort((a, b) =>
        (parseF(b.totalIncludedCredits) + parseF(b.totalAdditionalCredits)) -
        (parseF(a.totalIncludedCredits) + parseF(a.totalAdditionalCredits))
    ).slice(0, 5);

    const totalOrg = (data.detalheUsuarios || []).reduce((s, u) =>
        s + parseF(u.totalIncludedCredits) + parseF(u.totalAdditionalCredits), 0);

    const dataStr = new Date(data.dataGeracao).toLocaleString('pt-BR');
    const mesNome = new Date(data.dataGeracao).toLocaleDateString('pt-BR', { month: 'long' });

    const topUsersText = users.map((u, i) => {
        const total   = parseF(u.totalIncludedCredits) + parseF(u.totalAdditionalCredits);
        const pct     = totalOrg > 0 ? (total / totalOrg) * 100 : 0;
        const addCost = parseF(u.totalAdditionalUsage);
        const medals  = ['🥇','🥈','🥉','4.','5.'];
        const extra   = addCost > 0 ? ` · _$${addCost.toFixed(2)} extra_` : '';
        return `${medals[i]} \`${u.usuario}\` — *${fmtInt(total)} cr* (${pct.toFixed(1)}%)${extra}`;
    }).join('\n');

    const deficitCred = Math.max(0, p.projCred - p.credTotal);
    const deficitDol  = Math.max(0, p.projDol - p.budget);

    const projecaoCredLine = deficitCred > 0
        ? `:red_circle: *~${fmtInt(p.projCred)} cr* projetados — déficit de ~${fmtInt(deficitCred)} cr`
        : `:large_green_circle: *~${fmtInt(p.projCred)} cr* projetados — dentro do limite`;

    const projecaoDolLine = deficitDol > 0
        ? `:red_circle: *~$${p.projDol.toFixed(2)}* projetados — ultrapassa o budget em $${deficitDol.toFixed(2)}`
        : `:large_green_circle: *~$${p.projDol.toFixed(2)}* projetados — dentro do orçamento`;

    return {
        text: `${nivel.emoji} Copilot AI — Relatório do ciclo (${dataStr})`,
        attachments: [
            {
                color: nivel.color,
                blocks: [
                    {
                        type: 'header',
                        text: { type: 'plain_text', text: `${nivel.emoji} Copilot AI Rentcars — ${nivel.label}`, emoji: true }
                    },
                    {
                        type: 'context',
                        elements: [{ type: 'mrkdwn', text: `📅 Ciclo de ${mesNome} · Dia *${p.diaDoMes}* de *${p.diasNoMes}* · Gerado em ${dataStr}` }]
                    },
                    { type: 'divider' },
                    {
                        type: 'section',
                        fields: [
                            {
                                type: 'mrkdwn',
                                text: `*📊 Créditos Inclusos*\n${fmtInt(p.credUsed)} / ${fmtInt(p.credTotal)}\n*${p.pctCred.toFixed(1)}%* utilizado`
                            },
                            {
                                type: 'mrkdwn',
                                text: `*💵 Orçamento (USD)*\n$${p.spent.toFixed(2)} / $${p.budget.toFixed(2)}\n*${p.pctBudget.toFixed(1)}%* utilizado`
                            }
                        ]
                    },
                    {
                        type: 'section',
                        fields: [
                            {
                                type: 'mrkdwn',
                                text: `*⚡ Ritmo de Créditos*\n~${fmtInt(p.burnCred)} cr/dia\n_(base: ${p.diaDoMes} dias)_`
                            },
                            {
                                type: 'mrkdwn',
                                text: `*💸 Ritmo de Gastos*\n~$${p.burnDol.toFixed(2)}/dia\n_(${p.diasRestantes} dias restantes)_`
                            }
                        ]
                    },
                    { type: 'divider' },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*📈 Projeção — Fim de ${mesNome}*\n${projecaoCredLine}\n${projecaoDolLine}`
                        }
                    },
                    { type: 'divider' },
                    {
                        type: 'section',
                        text: { type: 'mrkdwn', text: `*🔥 Top 5 Consumidores*\n${topUsersText}` }
                    },
                    { type: 'divider' },
                    {
                        type: 'context',
                        elements: [{ type: 'mrkdwn', text: `<http://172.16.254.207:8080/insights.html|🔗 Ver Dashboard Completo>` }]
                    }
                ]
            }
        ]
    };
}

try {
    const data = JSON.parse(fs.readFileSync('relatorio_final_copilot.json', 'utf-8'));
    const payload = gerarPayload(data);
    fs.writeFileSync('slack_payload.json', JSON.stringify(payload, null, 2), 'utf-8');
    console.log('✓ slack_payload.json gerado com sucesso.');
} catch (err) {
    console.error('Erro ao gerar slack_payload.json:', err);
    process.exit(1);
}
