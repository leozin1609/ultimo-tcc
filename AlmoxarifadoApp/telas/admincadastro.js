// 1. Configura as informações da página (head)
document.title = "Cadastro Admin";

// Configura o Favicon de forma dinâmica
let favicon = document.querySelector("link[rel*='icon']");
if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
}
favicon.href = "static/cantinho.png";

// 2. Configura o corpo da página (body)
const body = document.body;
body.id = "fundodev";

// 3. Cria a estrutura de Grid do Bootstrap (Container > Row > Col)
const container = document.createElement("div");
container.className = "container mt-5";

const row = document.createElement("div");
row.className = "row justify-content-center";

const col = document.createElement("div");
col.className = "col-md-6";

// 4. Cria o Card que envelopa o formulário
const card = document.createElement("div");
card.className = "card shadow p-4";

// Título do painel
const titulo = document.createElement("h3");
titulo.className = "text-center mb-4 text-primary";
titulo.textContent = "Painel de Cadastro Admin";
card.appendChild(titulo);

// 5. Cria o formulário e configura seus atributos
const form = document.createElement("form");
form.method = "POST";
form.action = "/admincadastro";

// Função utilitária para criar os grupos de entrada de texto (Email e Senha)
function criarGrupoInput(id, labelTexto, tipo, name, placeholder) {
    const divGrupo = document.createElement("div");
    divGrupo.className = "mb-3";

    const label = document.createElement("label");
    label.htmlFor = id;
    label.className = "form-label";
    label.textContent = labelTexto;

    const input = document.createElement("input");
    input.type = tipo;
    input.className = "form-control";
    input.id = id;
    input.name = name;
    input.placeholder = placeholder;
    input.required = true;

    divGrupo.appendChild(label);
    divGrupo.appendChild(input);
    return divGrupo;
}

// Adiciona o campo de Email
form.appendChild(criarGrupoInput("email", "Email do Usuário:", "email", "email", "Digite o email"));

// Adiciona o campo de Senha
form.appendChild(criarGrupoInput("senha", "Senha:", "password", "senha", "Digite a senha"));

// 6. Cria o campo de Seleção (Dropdown para o Tipo de Acesso)
const divSelectGrupo = document.createElement("div");
divSelectGrupo.className = "mb-3";

const labelSelect = document.createElement("label");
labelSelect.className = "form-label";
labelSelect.textContent = "Tipo de Acesso:";
divSelectGrupo.appendChild(labelSelect);

const select = document.createElement("select");
select.name = "tipo";
select.className = "form-select";
select.required = true;

// Opção padrão desabilitada
const optDefault = document.createElement("option");
optDefault.value = "";
optDefault.textContent = "Selecione...";
optDefault.selected = true;
optDefault.disabled = true;
select.appendChild(optDefault);

// Opção: Usuário Comum
const optUsuario = document.createElement("option");
optUsuario.value = "usuario";
optUsuario.textContent = "Usuário Comum";
select.appendChild(optUsuario);

// Opção: Administrador
const optAdmin = document.createElement("option");
optAdmin.value = "admin";
optAdmin.textContent = "Administrador";
select.appendChild(optAdmin);

divSelectGrupo.appendChild(select);
form.appendChild(divSelectGrupo);

// 7. Cria a seção de botões inferiores (Bloco de Grade)
const divBotoes = document.createElement("div");
divBotoes.className = "d-grid gap-2 mt-4";

// Botão submeter (Cadastrar)
const btnCadastrar = document.createElement("button");
btnCadastrar.type = "submit";
btnCadastrar.className = "btn btn-primary btn-lg";
btnCadastrar.textContent = "Cadastrar";
divBotoes.appendChild(btnCadastrar);

// Botão de navegação (Voltar)
const btnVoltar = document.createElement("a");
btnVoltar.href = "/admin";
btnVoltar.className = "btn btn-outline-secondary";
btnVoltar.textContent = "Voltar ao Painel Admin";
divBotoes.appendChild(btnVoltar);

form.appendChild(divBotoes);

// 8. Montagem final e inserção de todos os elementos na tela
card.appendChild(form);
col.appendChild(card);
row.appendChild(col);
container.appendChild(row);
body.appendChild(container);
