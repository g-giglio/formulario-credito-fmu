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
    { id: "indicador-celular", nome: "Telefone do Indicador", validacao: validarTelefone },
    { id: "celular-td", nome: "Telefone do Tomador", validacao: validarTelefone },
    { id: "email-td", nome: "E-mail do Tomador", validacao: validarEmail },
    { id: "valor", nome: "Valor Solicitado", validacao: validarValor }
  ];

  sociosRadios.forEach((radio) =>
    radio.addEventListener("change", function () {
      sociosCollapse.classList.toggle("hidden", this.value !== "sim");
      if (this.value === "sim" && cpfContainer.children.length === 0) {
        addCpfInput(cpfContainer);
      }
    })
  );

  empresasRadios.forEach((radio) =>
    radio.addEventListener("change", function () {
      empresasCollapse.classList.toggle("hidden", this.value !== "sim");
      if (this.value === "sim" && cnpjContainer.children.length === 0) {
        addCnpjInput(cnpjContainer);
      }
    })
  );

  addCpfBtn.addEventListener("click", () => addCpfInput(cpfContainer));
  addCnpjBtn.addEventListener("click", () => addCnpjInput(cnpjContainer));

  function addCpfInput(container) {
    const div = document.createElement("div");
    div.className = "dynamic-input";
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "CPF (somente números)";
    input.maxLength = 14;
    input.addEventListener("input", () => validarCampoDireto(input, validarCPF, "CPF inválido."));
    div.appendChild(input);
    formatarCPFouCNPJ(input);
    const span = document.createElement("span");
    span.className = "erro";
    div.appendChild(span);
    if (container.children.length > 0) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "–";
      btn.onclick = () => div.remove();
      div.appendChild(btn);
    }
    container.appendChild(div);
  }

  function addCnpjInput(container) {
    const div = document.createElement("div");
    div.className = "dynamic-input";
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "CNPJ (somente números)";
    input.maxLength = 18;
    input.addEventListener("input", () => validarCampoDireto(input, validarCNPJ, "CNPJ inválido."));
    div.appendChild(input);
    formatarCPFouCNPJ(input);
    const span = document.createElement("span");
    span.className = "erro";
    div.appendChild(span);
    if (container.children.length > 0) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "–";
      btn.onclick = () => div.remove();
      div.appendChild(btn);
    }
    container.appendChild(div);
  }

  document.getElementById("cnpj").addEventListener("blur", consultarCNPJ);
  document.getElementById("cnpj").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      consultarCNPJ();
    }
  });

  function consultarCNPJ() {
    const raw = document.getElementById("cnpj").value.replace(/\D/g, "");
    if (raw.length !== 14) {
      validarCampo("cnpj", false, "CNPJ inválido.");
      return;
    }

    fetch(`https://brasilapi.com.br/api/cnpj/v1/${raw}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        document.getElementById("razao-social").value = data.razao_social;
        document.getElementById("nome-fantasia").value = data.nome_fantasia || "";
        document.getElementById("uf").value = data.uf;
        document.getElementById("municipio").value = data.municipio;
        document.getElementById("dados-empresa").classList.remove("hidden");
        validarCampo("cnpj", true);
      })
      .catch(() => {
        validarCampo("cnpj", false, "CNPJ não encontrado na base da Receita.");
      });
  }

  document.querySelectorAll("input[type='text'], input[type='tel'], input[type='email']").forEach((input) => {
    if (input.id.includes("cpf") || input.id.includes("cnpj")) {
      formatarCPFouCNPJ(input);
    }
    if (input.id.includes("valor")) {
      formatarMoeda(input);
    }
    if (input.type === "tel") {
      formatarTelefone(input);
    }

    const campo = camposComValidacao.find((c) => c.id === input.id);
    if (campo) {
      input.addEventListener("input", () => validarCampo(input.id, campo.validacao(input.value), campo.nome + " inválido."));
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const erros = [];

    camposComValidacao.forEach((campo) => {
      const valor = document.getElementById(campo.id).value;
      const valido = campo.validacao(valor);
      if (!validarCampo(campo.id, valido, campo.nome + " inválido.")) {
        erros.push(campo.nome);
      }
    });

    // Verificação adicional para campos required padrão
    document.querySelectorAll("#credito-form [required]").forEach((el) => {
      if (!el.value) {
        const label = document.querySelector(`label[for='${el.id}']`);
        const nomeCampo = label ? label.innerText.replace(':', '') : el.name || el.id;
        if (!erros.includes(nomeCampo)) {
          erros.push(nomeCampo);
        }
      }
    });

    document.querySelectorAll("#cpf-socios-container input").forEach((input) => {
      const span = input.nextElementSibling;
      if (input.value && !validarCPF(input.value)) {
        span.textContent = "CPF inválido.";
        erros.push("CPF de Sócio");
      } else {
        span.textContent = "";
      }
    });

    document.querySelectorAll("#cnpj-empresas-container input").forEach((input) => {
      const span = input.nextElementSibling;
      if (input.value && !validarCNPJ(input.value)) {
        span.textContent = "CNPJ inválido.";
        erros.push("CNPJ de Empresa do Grupo");
      } else {
        span.textContent = "";
      }
    });

    if (erros.length > 0) {
      modalContent.innerHTML = `<p>Faltam campos obrigatórios ou com erros:</p><ul>${erros.map(e => `<li>${e}</li>`).join('')}</ul><button onclick="fecharModal()">Fechar</button>`;
      modal.classList.remove("hidden");
    } else {
      modalContent.innerHTML = `<p>Formulário enviado com sucesso!</p><button onclick="fecharModal()">OK</button>`;
      modal.classList.remove("hidden");
      setTimeout(fecharModal, 5000);
    }
  });
}); // fim do DOMContentLoaded

function validarCampoDireto(input, validFn, msg) {
  const span = input.nextElementSibling;
  if (!validFn(input.value)) {
    span.textContent = msg;
  } else {
    span.textContent = "";
  }
}

function formatarCPFouCNPJ(input) {
  input.addEventListener('input', () => {
    let val = input.value.replace(/\D/g, '');
    val = val.substring(0, 14);
    if (val.length <= 11) {
      val = val.replace(/(\d{3})(\d)/, '$1.$2')
               .replace(/(\d{3})(\d)/, '$1.$2')
               .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      val = val.replace(/^(\d{2})(\d)/, '$1.$2')
               .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
               .replace(/\.(\d{3})(\d)/, '.$1/$2')
               .replace(/(\d{4})(\d)/, '$1-$2');
    }
    input.value = val;
  });
}

function formatarMoeda(input) {
  input.addEventListener('input', () => {
    let val = input.value.replace(/\D/g, '');
    val = (parseInt(val) / 100).toFixed(2) + '';
    val = val.replace('.', ',');
    val = val.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    input.value = 'R$ ' + val;
  });
}

function formatarTelefone(input) {
  input.addEventListener('input', () => {
    let val = input.value.replace(/\D/g, '');
    val = val.substring(0, 11);
    if (val.length > 10) {
      val = val.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (val.length > 5) {
      val = val.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (val.length > 2) {
      val = val.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    } else {
      val = val.replace(/(\d{0,2})/, '($1');
    }
    input.value = val;
  });
}

function validarCampo(id, condicao, msg = '') {
  const erroSpan = document.getElementById(`erro-${id}`);
  if (!condicao) {
    erroSpan.textContent = msg;
    return false;
  } else {
    erroSpan.textContent = '';
    return true;
  }
}

function validarCPF(strCPF) {
  strCPF = strCPF.replace(/[^\d]+/g, '');
  if (strCPF.length !== 11 || /^(\d)\1+$/.test(strCPF)) return false;
  let sum = 0;
  for (let i = 1; i <= 9; i++) sum += parseInt(strCPF.charAt(i - 1)) * (11 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(strCPF.charAt(9))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(strCPF.charAt(i - 1)) * (12 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(strCPF.charAt(10));
}

function validarCNPJ(cnpj) {
  cnpj = cnpj.replace(/[^\d]+/g, '');
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  let digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(0))) return false;
  length += 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  return result === parseInt(digits.charAt(1));
}

function validarTelefone(val) {
  return /^\(\d{2}\) \d{4,5}-\d{4}$/.test(val);
}

function validarEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function validarValor(val) {
  return /^R\$ \d{1,3}(\.\d{3})*,\d{2}$/.test(val);
}

function fecharModal() {
  document.getElementById("modal").classList.add("hidden");
}
