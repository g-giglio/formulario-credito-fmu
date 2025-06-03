// script.js

document.addEventListener("DOMContentLoaded", function () {
  const sociosRadios = document.getElementsByName("outros-socios");
  const sociosCollapse = document.getElementById("socios-collapse");
  const cpfContainer = document.getElementById("cpf-socios-container");
  const addCpfBtn = document.getElementById("add-cpf-socio");

  const empresasRadios = document.getElementsByName("outras-empresas");
  const empresasCollapse = document.getElementById("empresas-collapse");
  const cnpjContainer = document.getElementById("cnpj-empresas-container");
  const addCnpjBtn = document.getElementById("add-cnpj-empresa");

  const form = document.getElementById("credito-form");
  const modal = document.getElementById("modal");
  const modalContent = modal.querySelector(".modal-content");

  const camposComValidacao = [
    { id: "cpf-td", nome: "CPF do Tomador", validacao: validarCPF },
    { id: "cnpj", nome: "CNPJ do Cliente", validacao: validarCNPJ },
    { id: "indicador-celular", nome: "Celular do Indicador", validacao: validarTelefone },
    { id: "celular-td", nome: "Celular do Tomador", validacao: validarTelefone },
    { id: "email-td", nome: "E-mail do Tomador", validacao: validarEmail },
    { id: "valor", nome: "Valor Solicitado", validacao: validarValor }
  ];

  // Adiciona o listener de 'input' para os campos já existentes no HTML
  camposComValidacao.forEach(campoConfig => {
    const inputElement = document.getElementById(campoConfig.id);
    if (inputElement) {
      inputElement.addEventListener("input", () => {
        validarCampo(campoConfig.id, campoConfig.validacao(inputElement.value), `${campoConfig.nome} inválido(a).`);
      });
    }
  });


  if (sociosRadios.length && sociosCollapse && cpfContainer && addCpfBtn) {
    sociosRadios.forEach((radio) =>
      radio.addEventListener("change", function () {
        sociosCollapse.classList.toggle("hidden", this.value !== "sim");
        if (this.value === "sim" && cpfContainer.children.length === 0) {
          addCpfInput(cpfContainer, true); // Passa true para o primeiro input
        } else if (this.value !== "sim") {
          cpfContainer.innerHTML = ''; // Limpa os inputs de CPF se não for 'sim'
        }
      })
    );
    addCpfBtn.addEventListener("click", () => addCpfInput(cpfContainer, false));
  }


  if (empresasRadios.length && empresasCollapse && cnpjContainer && addCnpjBtn) {
    empresasRadios.forEach((radio) =>
      radio.addEventListener("change", function () {
        empresasCollapse.classList.toggle("hidden", this.value !== "sim");
        if (this.value === "sim" && cnpjContainer.children.length === 0) {
          addCnpjInput(cnpjContainer, true); // Passa true para o primeiro input
        } else if (this.value !== "sim") {
          cnpjContainer.innerHTML = ''; // Limpa os inputs de CNPJ se não for 'sim'
        }
      })
    );
    addCnpjBtn.addEventListener("click", () => addCnpjInput(cnpjContainer, false));
  }


  function addDynamicInput(container, type, placeholder, maxLength, validationFn, formatFn, isFirst) {
    const div = document.createElement("div");
    div.className = "dynamic-input";

    const input = document.createElement("input");
    input.type = "text"; // CPF e CNPJ são textos devido à máscara
    input.name = type === 'cpf' ? 'cpf_socio[]' : 'cnpj_empresa[]'; // Para o PHP receber como array
    input.placeholder = placeholder;
    if (maxLength) input.maxLength = maxLength;

    // Adiciona validação em tempo real
    input.addEventListener("input", () => {
        const spanErro = div.querySelector('.erro'); // Encontra o span de erro dentro do 'div'
        if (validationFn(input.value)) {
            if(spanErro) spanErro.textContent = "";
        } else {
            if(spanErro && input.value.length > 0) spanErro.textContent = `${type.toUpperCase()} inválido.`;
            else if(spanErro) spanErro.textContent = "";
        }
    });

    div.appendChild(input);
    if (formatFn) formatFn(input); // Aplica a formatação/máscara

    const spanErro = document.createElement("span"); // Cria o span de erro
    spanErro.className = "erro";
    div.appendChild(spanErro); // Adiciona o span de erro ao lado do input

    // Botão de remover só é adicionado se não for o primeiro input ou se já houver outros
    if (!isFirst || container.children.length > 0) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "–"; // Símbolo de menos
      btn.onclick = () => div.remove();
      div.appendChild(btn);
    }
    container.appendChild(div);
  }

  function addCpfInput(container, isFirst = false) {
    addDynamicInput(container, 'cpf', 'CPF do Sócio (somente números)', 14, validarCPF, formatarCPFouCNPJ, isFirst);
  }

  function addCnpjInput(container, isFirst = false) {
    addDynamicInput(container, 'cnpj', 'CNPJ da Empresa (somente números)', 18, validarCNPJ, formatarCPFouCNPJ, isFirst);
  }

  const cnpjField = document.getElementById("cnpj");
  if (cnpjField) {
    cnpjField.addEventListener("blur", consultarCNPJ);
    cnpjField.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        consultarCNPJ.call(cnpjField); // Garante o contexto correto para 'this' se necessário
      }
    });
  }


  function consultarCNPJ() {
    const inputCnpj = this || document.getElementById("cnpj"); // Garante que temos o elemento input
    const rawCnpj = inputCnpj.value.replace(/\D/g, "");

    const divDadosEmpresa = document.getElementById("dados-empresa");
    const razaoSocialInput = document.getElementById("razao-social");
    const nomeFantasiaInput = document.getElementById("nome-fantasia");
    const ufInput = document.getElementById("uf");
    const municipioInput = document.getElementById("municipio");

    // Limpa campos e esconde dados da empresa antes de nova consulta
    if(razaoSocialInput) razaoSocialInput.value = "";
    if(nomeFantasiaInput) nomeFantasiaInput.value = "";
    if(ufInput) ufInput.value = "";
    if(municipioInput) municipioInput.value = "";
    if(divDadosEmpresa) divDadosEmpresa.classList.add("hidden");


    if (!validarCNPJ(inputCnpj.value)) { // Valida o CNPJ formatado antes de prosseguir
      validarCampo("cnpj", false, "CNPJ inválido.");
      return;
    }

    // Se o CNPJ for válido mas não completo (14 dígitos numéricos), não busca ainda
    if (rawCnpj.length !== 14) {
        validarCampo("cnpj", true); // Limpa erro se formato estiver ok mas não completo
        return;
    }
    
    // Mostra um feedback de carregamento (opcional)
    validarCampo("cnpj", true, "Consultando CNPJ..."); // Limpa erro anterior e mostra "Consultando"

    fetch(`https://brasilapi.com.br/api/cnpj/v1/${rawCnpj}`)
      .then((res) => {
        if (!res.ok) {
            // Se a API retornar erro (404, 500, etc.)
            let errorMsg = "CNPJ não encontrado ou erro na consulta.";
            if (res.status === 404) errorMsg = "CNPJ não encontrado na base da Receita.";
            if (res.status === 400) errorMsg = "CNPJ inválido para consulta (formato incorreto).";
            throw new Error(errorMsg);
        }
        return res.json();
      })
      .then((data) => {
        if (razaoSocialInput) razaoSocialInput.value = data.razao_social || "";
        if (nomeFantasiaInput) nomeFantasiaInput.value = data.nome_fantasia || "";
        if (ufInput) ufInput.value = data.uf || "";
        if (municipioInput) municipioInput.value = data.municipio || "";
        if (divDadosEmpresa) divDadosEmpresa.classList.remove("hidden");
        validarCampo("cnpj", true); // CNPJ consultado com sucesso, limpa mensagem "Consultando"
      })
      .catch((error) => {
        validarCampo("cnpj", false, error.message || "Erro ao consultar CNPJ.");
        // Limpa os campos da empresa em caso de erro
        if(razaoSocialInput) razaoSocialInput.value = "";
        if(nomeFantasiaInput) nomeFantasiaInput.value = "";
        if(ufInput) ufInput.value = "";
        if(municipioInput) municipioInput.value = "";
        if(divDadosEmpresa) divDadosEmpresa.classList.add("hidden");
      });
  }

  // Aplica máscaras aos campos existentes
  document.querySelectorAll("input[type='text'], input[type='tel'], input[type='email']").forEach((input) => {
    const inputId = input.id;
    if (inputId) { // Garante que o input tem um ID
        if (inputId.includes("cpf") || inputId === "cnpj") { // Aplica ao CNPJ principal e CPF do tomador
            formatarCPFouCNPJ(input);
        }
        if (inputId.includes("valor")) {
            formatarMoeda(input);
        }
    }
    if (input.type === "tel") { // Aplica a todos os inputs type="tel"
        formatarTelefone(input);
    }
  });


  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      let errosEncontrados = []; // Renomeado para evitar conflito com a variável global 'erros' se houver

      // Valida campos principais listados em camposComValidacao
      camposComValidacao.forEach((campoConfig) => {
        const inputElement = document.getElementById(campoConfig.id);
        if (inputElement) {
          const ehValido = campoConfig.validacao(inputElement.value);
          if (!validarCampo(campoConfig.id, ehValido, `${campoConfig.nome} inválido(a).`)) {
            errosEncontrados.push(`${campoConfig.nome} inválido(a).`);
          }
        }
      });

      // Validação para campos required padrão que não estão em camposComValidacao
      form.querySelectorAll("[required]:not([disabled])").forEach((el) => {
        if (!el.value.trim()) {
          let nomeCampo = el.name || el.id;
          const label = form.querySelector(`label[for='${el.id}']`);
          if (label) {
            nomeCampo = label.textContent.replace(':', '').trim();
          }
          // Adiciona erro apenas se ainda não foi listado pela validação específica
          if (!errosEncontrados.some(err => err.toLowerCase().includes(nomeCampo.toLowerCase()))) {
             errosEncontrados.push(`Campo "${nomeCampo}" é obrigatório.`);
          }
          // Tenta exibir erro no span associado, se houver
          validarCampo(el.id, false, `Campo "${nomeCampo}" é obrigatório.`);
        } else {
           // Se o campo tem valor, e não foi validado especificamente, limpa o erro de obrigatoriedade
           if (!camposComValidacao.some(c => c.id === el.id)) {
             validarCampo(el.id, true);
           }
        }
      });


      // Validação para CPFs de sócios adicionados dinamicamente
      document.querySelectorAll("#cpf-socios-container .dynamic-input input").forEach((input, index) => {
        const spanErro = input.parentElement.querySelector('.erro');
        if (input.value.trim() !== "" && !validarCPF(input.value)) { // Valida apenas se preenchido
          if(spanErro) spanErro.textContent = "CPF de Sócio inválido.";
          errosEncontrados.push(`CPF do Sócio ${index + 1} inválido.`);
        } else if (input.value.trim() === "" && document.getElementsByName("outros-socios")[0].checked) {
          // Considerar se o campo dinâmico é obrigatório caso a opção "Sim" esteja marcada
          // if(spanErro) spanErro.textContent = "CPF do Sócio é obrigatório.";
          // errosEncontrados.push(`CPF do Sócio ${index + 1} é obrigatório.`);
        }
         else {
          if(spanErro) spanErro.textContent = "";
        }
      });

      // Validação para CNPJs de empresas do grupo adicionados dinamicamente
      document.querySelectorAll("#cnpj-empresas-container .dynamic-input input").forEach((input, index) => {
        const spanErro = input.parentElement.querySelector('.erro');
        if (input.value.trim() !== "" && !validarCNPJ(input.value)) { // Valida apenas se preenchido
          if(spanErro) spanErro.textContent = "CNPJ da Empresa inválido.";
          errosEncontrados.push(`CNPJ da Empresa ${index + 1} inválido.`);
        } else if (input.value.trim() === "" && document.getElementsByName("outras-empresas")[0].checked) {
           // Considerar se o campo dinâmico é obrigatório
        } else {
          if(spanErro) spanErro.textContent = "";
        }
      });

      // Remove duplicatas da lista de erros (opcional, mas melhora a apresentação)
      errosEncontrados = [...new Set(errosEncontrados)];

      if (errosEncontrados.length > 0) {
        modalContent.innerHTML = `<p>Por favor, corrija os seguintes erros:</p><ul>${errosEncontrados.map(e => `<li>${e}</li>`).join('')}</ul><button onclick="fecharModal()">Fechar</button>`;
        modal.classList.remove("hidden");
      } else {
        // Se não houver erros, pode prosseguir com o envio do formulário
        // modalContent.innerHTML = `<p>Formulário enviado com sucesso!</p><button onclick="fecharModal()">OK</button>`;
        // modal.classList.remove("hidden");
        // setTimeout(fecharModal, 3000);
        form.submit(); // Descomente para enviar o formulário para submit.php
        
        // Apenas para demonstração sem backend:
         modalContent.innerHTML = `<p>Validação OK! (Em um cenário real, o formulário seria enviado agora)</p><button onclick="fecharModal()">OK</button>`;
         modal.classList.remove("hidden");
         console.log("Formulário pronto para ser enviado.");
         // form.reset(); // Opcional: limpar o formulário após "envio"
      }
    });
  } // fim do if(form)
}); // fim do DOMContentLoaded

function validarCampoDireto(inputElement, validFn, msg) {
  // Esta função é para validação em tempo real de inputs dinâmicos.
  // Ela espera o próprio elemento input, não seu ID.
  const span = inputElement.nextElementSibling; // Assume que o span de erro é o próximo irmão
  if (span && span.classList.contains('erro')) {
    if (!validFn(inputElement.value)) {
      span.textContent = msg;
      return false;
    } else {
      span.textContent = "";
      return true;
    }
  }
  return true; // Retorna true se não houver span de erro configurado corretamente
}


function formatarCPFouCNPJ(input) {
  input.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    const isCnpj = val.length > 11 || e.target.id.toLowerCase().includes('cnpj') || (e.target.placeholder && e.target.placeholder.toLowerCase().includes('cnpj'));

    if (isCnpj) {
        val = val.substring(0, 14);
        val = val.replace(/^(\d{2})(\d)/, '$1.$2');
        val = val.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        val = val.replace(/\.(\d{3})(\d)/, '.$1/$2');
        val = val.replace(/(\d{4})(\d)/, '$1-$2');
    } else { // CPF
        val = val.substring(0, 11);
        val = val.replace(/(\d{3})(\d)/, '$1.$2');
        val = val.replace(/(\d{3})(\d)/, '$1.$2');
        val = val.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    e.target.value = val;
  });
}

function formatarMoeda(input) {
  input.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val === "") {
        e.target.value = ""; // Permite limpar o campo
        return;
    }
    val = (parseInt(val, 10) / 100).toFixed(2) + '';
    val = val.replace('.', ',');
    val = val.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    e.target.value = 'R$ ' + val;
  });
}

function formatarTelefone(input) {
  input.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    val = val.substring(0, 11); // Limita a 11 dígitos (DDD + 9 dígitos)
    if (val.length > 10) { // Celular com 9 dígitos + DDD
      val = val.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (val.length > 6) { // Telefone fixo ou celular com 8 dígitos (parcial) + DDD
      val = val.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (val.length > 2) { // DDD + início do número
      val = val.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    } else if (val.length > 0) { // Início do DDD
      val = `(${val}`;
    }
    e.target.value = val;
  });
}

function validarCampo(id, condicao, msg = '') {
  // Esta função é para os campos principais, usando o ID do input para encontrar o span de erro.
  const erroSpan = document.getElementById(`erro-${id}`);
  if (erroSpan) { // Verifica se o span de erro existe
    if (!condicao) {
      erroSpan.textContent = msg;
      return false;
    } else {
      erroSpan.textContent = '';
      return true;
    }
  }
  // Se não houver span de erro, não pode exibir a mensagem, mas a condição de validade ainda é retornada.
  return condicao;
}

function validarCPF(strCPF) {
  strCPF = String(strCPF).replace(/[^\d]+/g, '');
  if (strCPF.length !== 11 || /^(\d)\1+$/.test(strCPF)) return false;
  let sum = 0;
  let remainder;
  for (let i = 1; i <= 9; i++) sum = sum + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== parseInt(strCPF.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum = sum + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;
  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== parseInt(strCPF.substring(10, 11))) return false;
  return true;
}

function validarCNPJ(cnpj) {
  cnpj = String(cnpj).replace(/[^\d]+/g, '');
  if (cnpj === '') return true; // Considera campo vazio como válido para não travar digitação inicial
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false; // Verifica sequências repetidas como "00000000000000"

  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
}

function validarTelefone(telefone) {
  telefone = String(telefone).replace(/[^\d]+/g, '');
   // Permite campo vazio ou valida formato completo (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  return telefone === '' || telefone.length === 10 || telefone.length === 11;
}


function validarEmail(email) {
  email = String(email);
  if (email === '') return true; // Permite campo vazio
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validarValor(valor) {
  valor = String(valor);
  if (valor === '' || valor === 'R$ ') return true; // Permite campo vazio ou só o prefixo
  // Verifica se o formato é R$ seguido de números, pontos e vírgula no lugar certo.
  // Ex: R$ 1.234,56
  return /^R\$ \d{1,3}(\.\d{3})*,\d{2}$/.test(valor);
}

// Função global para fechar o modal
window.fecharModal = function() {
  if(modal) modal.classList.add("hidden");
}