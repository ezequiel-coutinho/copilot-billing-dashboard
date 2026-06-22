# 🚀 Como Manter o Copilot Billing Dashboard Sempre Atualizado com n8n

Este guia explica como automatizar a atualização de dados do seu dashboard utilizando o **n8n** como orquestrador, mantendo o processo seguro e estável.

---

## 📋 Arquitetura Recomendada
Para manter o dashboard atualizado de forma segura, dividimos as responsabilidades em duas partes:
1. **n8n (O Orquestrador):** Controla o agendamento (cron) e gerencia notificações (ex: Slack/Teams).
2. **Playwright (O Executor):** O script local que faz o trabalho pesado de login e raspagem de dados do GitHub.

Esta abordagem híbrida é a mais segura porque mantém suas senhas, chaves de MFA e cookies de sessão (`auth.json`) guardados localmente no seu computador, evitando bloqueios de segurança do GitHub por tentativas de login de IPs de datacenters de nuvem.

---

## 🛠️ Configurando no n8n

### Cenário A: Se o seu n8n rodar Localmente (Docker / Desktop)
Se o seu n8n estiver rodando no mesmo ambiente ou rede onde o projeto está localizado:

1. **Crie um novo Workflow** no seu n8n.
2. Adicione um nó **Schedule / Cron Trigger**:
   - Configure a frequência que desejar (ex: todos os dias às 08:00 AM, ou toda segunda-feira).
3. Conecte ao nó **Execute Command** (Executar Comando):
   - Configure o comando para navegar até a pasta e iniciar o scraper:
     ```bash
     cd C:\Users\ezequ\Documents\PROJETOS\Copilot && npm start
     ```
4. *(Opcional)* Conecte um nó do **Slack / Teams / Discord** ao final para receber um aviso de sucesso:
   - *"Dashboard do Copilot atualizado com sucesso!"*

---

### Cenário B: Se o seu n8n estiver na Nuvem (n8n Cloud)
Se o seu n8n rodar na nuvem, ele não pode rodar comandos locais diretamente. Para resolver isso:

1. Adicione um nó **Schedule / Cron Trigger** no seu n8n.
2. Adicione um nó **SSH**:
   - Configure a conexão SSH com a máquina onde o scraper está instalado.
   - Configure o comando SSH para disparar a execução remota:
     ```bash
     cd C:\Users\ezequ\Documents\PROJETOS\Copilot && npm start
     ```

---

## 🌐 Visualizando o Dashboard Online (GitHub Pages)

Toda vez que o comando `npm start` for executado (seja manualmente ou pelo n8n), ele irá atualizar o arquivo **`index.html`** localmente e você pode configurar o script do Playwright para subir essa atualização automaticamente ou fazer o push via n8n.

Para acessar o dashboard de qualquer lugar de graça:
1. Vá nas **Settings** (Configurações) do seu repositório no GitHub.
2. No menu lateral esquerdo, clique em **Pages**.
3. Em **Build and deployment**:
   - Defina a branch como `main` e a pasta `/ (root)`.
4. Clique em **Save**.

O seu dashboard estará acessível online em:
👉 **`https://ezequiel-coutinho.github.io/copilot-billing-dashboard/`**
