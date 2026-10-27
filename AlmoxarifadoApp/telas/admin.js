// 1. Configura as informações da página (head)
document.title = "Cadastro Senai";

// Configura o Favicon dinamicamente
let favicon = document.querySelector("link[rel*='icon']");
if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
}
favicon.href = "static/cantinho.png";

// 2. Configura o corpo da página (body)
const body = document.body;
body.id = "fundoadm";

// 3. Cria o título da página
const titulo = document.createElement("p");
titulo.id = "titulo";
titulo.textContent = "Cadastre Novos Usuários";
body.appendChild(titulo);

// 4. Cria e adiciona as imagens
const imgSenai = document.createElement("img");
imgSenai.id = "Senai";
imgSenai.src = "static/image.png";
imgSenai.width = 400;
imgSenai.height = 250;
body.appendChild(imgSenai);

const imgRoger = document.createElement("img");
imgRoger.id = "roger";
imgRoger.src = "static/sub_roger.png";
imgRoger.width = 400;
imgRoger.height = 250;
body.appendChild(imgRoger);

// 5. Cria o container do formulário
const divEmail1 = document.createElement("div");
divEmail1.id = "email1";

// Cria o elemento Form
const form = document.createElement("form");
form.action = "/cadastrar_usuario";
form.method = "POST";

// Função utilitária para criar campos do formulário
function criarCampoForm(idInput, labelTexto, tipo, name, placeholder) {
    const divGrupo = document.createElement("div");
    divGrupo.className = "mb-3";

    const label = document.createElement("label");
    label.htmlFor = idInput;
    label.className = "form-label";
    label.textContent = labelTexto;

    const input = document.createElement("input");
    input.type = tipo;
    input.className = "form-control";
    input.id = idInput;
    input.name = name;
    input.placeholder = placeholder;
    input.required = true;

    divGrupo.appendChild(label);
    divGrupo.appendChild(input);
    return divGrupo;
}

// Adiciona os campos de Usuário e Senha
form.appendChild(criarCampoForm("emailInput", "Usuário", "email", "email", "Digite seu usuário"));
form.appendChild(criarCampoForm("senhaInput", "Senha", "password", "senha", "Digite sua senha"));

// Cria o botão de cadastro
const btnCadastrar = document.createElement("button");
btnCadastrar.type = "submit";
btnCadastrar.className = "btn btn-secondary btn-lg";
btnCadastrar.textContent = "Cadastrar";
form.appendChild(btnCadastrar);

// Monta o formulário na tela
divEmail1.appendChild(form);
body.appendChild(divEmail1);

// 6. Cria o container posicionado da Tabela
const divTabela = document.createElement("div");
divTabela.style.position = "absolute";
divTabela.style.top = "1100px";
divTabela.style.left = "75%";
divTabela.style.transform = "translateX(-50%)";
divTabela.style.width = "350px";
divTabela.style.paddingBottom = "80px";

// Cria a estrutura da tabela Bootstrap
const tabela = document.createElement("table");
tabela.className = "table table-dark table-striped";

const thead = document.createElement("thead");
const trHead = document.createElement("tr");

["ID", "Email", "Tipo"].forEach(texto => {
    const th = document.createElement("th");
    th.textContent = texto;
    trHead.appendChild(th);
});
thead.appendChild(trHead);
tabela.appendChild(thead);

const tbody = document.createElement("tbody");
tabela.appendChild(tbody);
divTabela.appendChild(tabela);
body.appendChild(divTabela);

// 7. Função para renderizar as linhas da tabela (Substitui o laço {% for %})
function atualizarTabela(dadosBanco) {
    // Limpa registros anteriores antes de renderizar
    tbody.innerHTML = "";

    dadosBanco.forEach(item => {
        const tr = document.createElement("tr");

        // Cria as colunas baseadas nos índices do Python: item[0], item[1] e item[3]
        const tdId = document.createElement("td");
        tdId.textContent = item[0]; // ID

        const tdEmail = document.createElement("td");
        tdEmail.textContent = item[1]; // Email

        const tdTipo = document.createElement("td");
        tdTipo.textContent = item[3]; // Tipo

        tr.appendChild(tdId);
        tr.appendChild(tdEmail);
        tr.appendChild(tdTipo);
        tbody.appendChild(tr);
    });
}

// --- EXEMPLO DE USO ---
// Quando seu backend enviar os dados para o Frontend, basta chamar a função passando a lista:
// const meusDados = [[1, "admin@senai.com", "senha hash", "Administrador"]];
// atualizarTabela(meusDados);
