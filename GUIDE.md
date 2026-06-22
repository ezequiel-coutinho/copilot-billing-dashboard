# 🚀 Como Manter o Copilot Billing Dashboard Sempre Atualizado

Este guia explica detalhadamente como automatizar a atualização de dados do seu dashboard e disponibilizá-lo online gratuitamente através do **GitHub Pages**.

---

## 📋 Sumário
1. [Mudança Importante: de `dashboard.html` para `index.html`](#1-mudança-importante-de-dashboardhtml-para-indexhtml)
2. [Hospedagem Gratuita com GitHub Pages](#2-hospedagem-gratuita-com-github-pages)
3. [Opção A: Atualização Manual com 1 Clique (Recomendado)](#3-opção-a-atualização-manual-com-1-clique-recomendado)
4. [Opção B: Atualização 100% Automática (Agendador de Tarefas do Windows)](#4-opção-b-atualização-100-automática-agendador-de-tarefas-do-windows)
5. [Por que essa abordagem local é mais segura?](#5-por-que-essa-abordagem-local-é-mais-segura)

---

## 1. Mudança Importante: de `dashboard.html` para `index.html`

Para facilitar a hospedagem automática no GitHub, renomeamos o arquivo gerado de `dashboard.html` para **`index.html`**. 
Isso permite que servidores web (como o GitHub Pages) reconheçam o dashboard automaticamente como a página principal do projeto.

---

## 2. Hospedagem Gratuita com GitHub Pages

Você pode publicar o seu dashboard na internet para acessá-lo de qualquer lugar (inclusive do celular) de forma segura:

1. Acesse o seu repositório no GitHub: [copilot-billing-dashboard](https://github.com/ezequiel-coutinho/copilot-billing-dashboard)
2. Vá na aba **Settings** (Configurações) no topo.
3. No menu lateral esquerdo, clique em **Pages**.
4. Na seção **Build and deployment**:
   - **Source**: Selecione `Deploy from a branch`.
   - **Branch**: Selecione `main` e a pasta `/ (root)`.
5. Clique em **Save**.

🎉 **Pronto!** Em cerca de 1 a 2 minutos, o GitHub disponibilizará o link do seu dashboard. O endereço será semelhante a:
👉 **[https://ezequiel-coutinho.github.io/copilot-billing-dashboard/](https://ezequiel-coutinho.github.io/copilot-billing-dashboard/)**

---

## 3. Opção A: Atualização Manual com 1 Clique (Recomendado)

Criamos o script executável **`atualizar_dashboard.bat`** na raiz do projeto. 

Sempre que você quiser atualizar o dashboard:
1. Vá até a pasta do projeto no Windows Explorer: `C:\Users\ezequ\Documents\PROJETOS\Copilot`
2. Dê um **duplo clique** em **`atualizar_dashboard.bat`**.

O script irá automaticamente:
- Rodar o scraper para extrair os dados mais recentes do GitHub.
- Compilar o novo dashboard (`index.html`).
- Fazer o commit e dar `git push` para enviar a atualização para o seu GitHub.
- Seu dashboard online (GitHub Pages) será atualizado automaticamente em instantes!

---

## 4. Opção B: Atualização 100% Automática (Agendador de Tarefas do Windows)

Você pode configurar o Windows para rodar o script de atualização de forma totalmente invisível e agendada (ex: todo dia às 08:00 AM, ou semanalmente).

### Passo a Passo de Configuração:
1. Pressione a tecla `Win` e digite **Agendador de Tarefas** (Task Scheduler) e abra-o.
2. No menu lateral direito, clique em **Criar Tarefa Básica...** (Create Basic Task...).
3. Escolha um nome para a tarefa (Ex: `Atualizar Copilot Dashboard`) e clique em Avançar.
4. Defina a frequência (Ex: **Diariamente** ou **Semanalmente**) e defina o horário de início (Ex: `08:00`). Clique em Avançar.
5. Em **Ação**, selecione **Iniciar um programa** e clique em Avançar.
6. No campo **Programa/script**, clique em **Procurar** e selecione o arquivo:
   `C:\Users\ezequ\Documents\PROJETOS\Copilot\atualizar_dashboard.bat`
7. No campo **Iniciar em (opcional)**, cole o caminho da pasta raiz do projeto:
   `C:\Users\ezequ\Documents\PROJETOS\Copilot`
   *(Isso é crucial para o script encontrar os arquivos de configuração local).*
8. Clique em Avançar e depois em **Concluir**.

Pronto! Agora o Windows executará o scraper no horário definido e atualizará o repositório remoto sem que você precise fazer nada.

---

## 5. Por que essa abordagem local é mais segura?

Automatizar scrapers de páginas que usam login e MFA (Autenticação de Dois Fatores) em servidores de nuvem (como GitHub Actions) é altamente instável por dois motivos:
1. **Bloqueios de Segurança:** O GitHub detecta tentativas de login de IPs desconhecidos de datacenters (como Azure ou AWS usados no GitHub Actions) e frequentemente bloqueia a conta temporariamente exigindo verificação extra.
2. **Exposição de Credenciais:** Guardar senhas e segredos de MFA na nuvem sempre traz riscos de vazamento acidental.

Executando o scraper no seu próprio computador através do arquivo `.bat`:
- **Cookies de Sessão Reutilizados:** O script usa o arquivo local `auth.json` para manter sua sessão conectada de forma idêntica ao seu navegador comum.
- **IP Seguro:** As requisições saem da sua rede normal de trabalho/casa, evitando qualquer bloqueio de segurança do GitHub.
- **Segurança Absoluta:** O seu arquivo `.env` com suas senhas e o `auth.json` com seus cookies de login estão protegidos na sua máquina local e listados no `.gitignore` (nunca sobem para a internet).
