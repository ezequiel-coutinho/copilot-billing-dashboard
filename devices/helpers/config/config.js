import 'dotenv/config';

const CONFIG = {
    user: process.env.GH_USER,
    pass: process.env.GH_PASS,
    totpSecret: process.env.GH_TOTP_SECRET,
    urlBudgets: "https://github.com/organizations/Rentcars/settings/billing/budgets",
    urlAiUsage: "https://github.com/organizations/Rentcars/settings/billing/ai_usage?period=3&group=8&customer=506622&chart_selection=2&view=users",
    cookieFile: "auth.json"
};

export { CONFIG };
