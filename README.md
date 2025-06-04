# Formulário de Solicitação de Crédito — FMU

Este repositório contém o código-fonte de um sistema completo para solicitação e gerenciamento de crédito, desenvolvido para a disciplina de **Desenvolvimento de Software para Web — FMU**.

---

## 📄 Descrição do Projeto

O projeto consiste na criação de uma aplicação web full-stack que permite a empresas (**CNPJ**) solicitar propostas de crédito. A aplicação abrange desde a interface de usuário interativa para coleta de dados até o processamento backend e persistência em banco de dados, incluindo funcionalidades CRUD completas.

O sistema foi desenvolvido em fases:

* **Frontend Inicial**: Foco na interface do formulário, validações client-side e interatividade.
* **Desenvolvimento Backend e CRUD**: Implementação da lógica de servidor com PHP, integração com banco de dados MySQL (AWS RDS) para operações de Criar, Ler, Atualizar e Deletar (CRUD), e configuração de ambiente com Docker.

---

## 👨‍💻 Alunos Participantes

* **Gustavo Giglio Soares** — RA: 2099250
* **João Pedro Soares** — RA: 2893577
* **Nathan Moura Martins** — RA: 2548186

---

## ✨ Funcionalidades Implementadas

O sistema conta com um conjunto robusto de funcionalidades tanto no frontend quanto no backend:

### Frontend:

* **Formulário Interativo**: Interface amigável para preenchimento da solicitação de crédito.
* **Validações em Tempo Real**: Validação de CPF, CNPJ, telefone, e-mail e valores monetários diretamente no navegador.
* **Máscaras de Campo**: Aplicação de máscaras (CPF, CNPJ, telefone, moeda) durante a digitação para facilitar o preenchimento correto.
* **Campos Dinâmicos**: Seções "Quadro Societário" e "Grupo Econômico" permitem adicionar múltiplos CPFs e CNPJs de forma dinâmica.
* **Integração com BrasilAPI**: Consulta automática de dados empresariais a partir do CNPJ para preenchimento de campos como Razão Social e Endereço.
* **Feedback Visual**: Mensagens de erro e status para orientar o usuário.

### Backend e CRUD:

* **Processamento de Submissão**: Script PHP para receber, validar e limpar os dados do formulário de criação.
* **Persistência de Dados**: Integração com banco de dados MySQL (hospedado no AWS RDS) para armazenamento seguro das solicitações.
* **Operações CRUD Completas**:
    * **Create (Criar)**: Registro de novas solicitações de crédito.
    * **Read (Ler)**: Página para visualização de todas as solicitações cadastradas em formato de tabela, com os principais dados.
    * **Update (Atualizar)**: Formulário de edição pré-preenchido para modificar informações de uma solicitação existente.
    * **Delete (Deletar)**: Funcionalidade para remover solicitações do banco de dados, com confirmação.
* **Mensagens de Feedback**: Notificações de sucesso ou erro para o usuário após as operações CRUD.
* **Visualização dos Dados**: A página `view.php` é responsável por listar todas as solicitações de crédito armazenadas no banco. Ela realiza uma consulta SQL que busca os dados mais recentes e exibe essas informações em uma tabela organizada. Além de exibir os principais campos (como CNPJ, tomador, valor, data etc.), essa página também oferece ações de **edição** e **deleção**, com botões que redirecionam para os scripts apropriados (`edit_form.php` e `delete_script.php`). Também apresenta mensagens visuais de sucesso ou erro com base nas operações realizadas, contribuindo para o gerenciamento eficiente das solicitações.
* **Segurança**: Uso de `prepared statements` (PDO) para prevenir injeção de SQL e separação de arquivos de configuração.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend**: HTML5, CSS3, JavaScript (ES6+)
* **Backend**: PHP 8.2+
* **Banco de Dados**: MySQL (utilizado via AWS RDS)
* **Interação com Banco (PHP)**: PDO (PHP Data Objects)
* **API Externa**: BrasilAPI (para consulta de dados de CNPJ)
* **Ambiente de Desenvolvimento/Execução**: Docker, Docker Compose
* **Servidor Web (via Docker)**: Apache
* **Editor**: Visual Studio Code

---

## 📁 Estrutura do Projeto

O projeto foi organizado buscando clareza e separação de responsabilidades:

```
├── config/                 → Configurações da aplicação (ex: db_config.php)
├── public/                 → Raiz pública do servidor web (DocumentRoot do Apache)
│   ├── index.html          → Formulário principal de criação de solicitação
│   ├── css/                → Folhas de estilo (styles.css)
│   ├── images/             → Imagens (favicon, etc.)
│   ├── scripts/            → Scripts JavaScript (script.js)
│   ├── actions/            → Scripts PHP para processamento de dados (backend)
│   │   ├── submit.php      (Processa criação)
│   │   ├── update_script.php (Processa atualização)
│   │   └── delete_script.php (Processa deleção)
│   └── views/              → Scripts PHP para visualização de dados (telas/frontend)
│       ├── view.php        (Listagem das solicitações)
│       └── edit_form.php   (Formulário de edição)
├── Dockerfile              → Definição da imagem Docker para o ambiente PHP/Apache
├── docker-compose.yaml     → Orquestração do(s) container(s) Docker
└── README.md               → Este arquivo de documentação

```

## 🚀 Como Executar (Usando Docker)

1.  Certifique-se de ter o **Docker** e o **Docker Compose** instalados.
2.  Clone este repositório.
3.  Configure as credenciais do banco de dados no arquivo `config/db_config.php`.
4.  No terminal, na raiz do projeto, execute:

    ```bash
    docker-compose up --build -d
    ```

5.  Acesse `http://localhost:8080` (ou a porta configurada) no seu navegador.
