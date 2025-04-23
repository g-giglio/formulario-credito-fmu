# Formulário de Solicitação de Crédito — FMU

Este repositório contém o código-fonte da **Fase 1 (Frontend)** do trabalho da disciplina de **Desenvolvimento de Software para Web** — FMU.

## 📄 Descrição do Projeto

O projeto consiste na criação de um formulário online para **solicitação de crédito por empresas (CNPJ)**. Ele está dividido em etapas e validado com HTML, CSS e JavaScript puro (sem frameworks).

Nesta primeira fase, foi desenvolvida a interface do formulário com todos os campos necessários, validações de dados em tempo real, integração com a [BrasilAPI](https://brasilapi.com.br/) e comportamento interativo para adicionar sócios e empresas dinamicamente.

## 👨‍💻 Alunos Participantes

- Gustavo Giglio Soares — RA: 2099250  
- João Pedro Soares — RA: 2893577  
- Nathan Moura Martins — RA: 2548186  

## 📁 Estrutura de Pastas

```
formulario-credito/
├── css/         → folha de estilos (styles.css)
├── scripts/     → scripts JavaScript (script.js)
├── images/      → imagem de ícone/apoio (partnership_1.png)
├── resources/   → pasta reservada para mídia (vazia por enquanto)
└── index.html   → página principal do formulário
```

## ✨ Funcionalidades

- Validação de **CPF, CNPJ, telefone, e-mail e valores monetários**
- **Máscaras em tempo real** ao digitar os dados
- **Collapse dinâmico** para campos extras de sócios e grupo econômico
- **Feedback visual** com mensagens ao lado dos campos
- **Integração com a BrasilAPI** para autocompletar dados do CNPJ

## 📌 Tecnologias utilizadas

- HTML5 + CSS3
- JavaScript (ES6+)
- API pública: BrasilAPI
- Editor: Visual Studio Code

## 📦 Fase 2 (entre N1 e N2)

A próxima fase consistirá na implementação de **PHP com CRUD e integração com banco de dados**, além da submissão real dos dados preenchidos no formulário.

---

> Projeto desenvolvido com fins acadêmicos, orientado pelo professor da disciplina de Desenvolvimento Web — FMU.
