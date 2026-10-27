// 1. Configura as informações da página (head)
document.title = "Retirada e Devolução - Usuário";

// 2. Configura o corpo da página (body)
const body = document.body;
body.id = "fundoadm";
body.className = "p-5";

// 3. Cria o container principal centralizado do formulário
const container = document.createElement("div");
container.className = "container bg-white p-4 rounded shadow";
container.style.maxWidth = "500px";

// Título da seção
const titulo = document.createElement("h2");
titulo.className = "mb-4";
titulo.textContent = "Retirada e Devolução";
container.appendChild(titulo);

// 4. Cria o formulário e configura seus atributos de destino
const form = document.createElement("form");
form.action = "/devolucao_retiradaus";
form.method = "POST";

// --- Campo 1: Tipo de Operação (Select) ---
const divOperacao = document.createElement("div");
divOperacao.className = "mb-3";

const labelOperacao = document.createElement("label");
labelOperacao.className = "form-label";
labelOperacao.textContent = "Tipo de Operação:";
divOperacao.appendChild(labelOperacao);

const selectOperacao = document.createElement("select");
selectOperacao.className = "form-control";
selectOperacao.name = "tipo";

const optRetirada = document.createElement("option");
optRetirada.value = "Retirada";
optRetirada.textContent = "Retirada";
selectOperacao.appendChild(optRetirada);

const optDevolucao = document.createElement("option");
optDevolucao.value = "Devolucao";
optDevolucao.textContent = "Devolução";
selectOperacao.appendChild(optDevolucao);

divOperacao.appendChild(selectOperacao);
form.appendChild(divOperacao);

// --- Campo 2: Produto (Select Dinâmico) ---
const divProduto = document.createElement("div");
divProduto.className = "mb-3";

const labelProduto = document.createElement("label");
labelProduto.className = "form-label";
labelProduto.textContent = "Produto:";
divProduto.appendChild(labelProduto);

const selectProduto = document.createElement("select");
selectProduto.className = "form-control";
selectProduto.name = "produto_id";
divProduto.appendChild(selectProduto);
form.appendChild(divProduto);

// --- Campo 3: Quantidade (Input Number) ---
const divQuantidade = document.createElement("div");
divQuantidade.className = "mb-3";

const labelQuantidade = document.createElement("label");
labelQuantidade.className = "form-label";
labelQuantidade.textContent = "Quantidade:";
divQuantidade.appendChild(labelQuantidade);

const inputQuantidade = document.createElement("input");
inputQuantidade.type = "number";
inputQuantidade.className = "form-control";
inputQuantidade.name = "quantidade";
inputQuantidade.value = "1";
inputQuantidade.min = "1";
inputQuantidade.required = true;
divQuantidade.appendChild(inputQuantidade);
form.appendChild(divQuantidade);

// --- Campo 4: Email do Usuário (Input Email) ---
const divEmail = document.createElement("div");
divEmail.className = "mb-3";

const labelEmail = document.createElement("label");
labelEmail.className = "form-label";
labelEmail.textContent = "Email do Usuário:";
divEmail.appendChild(labelEmail);

const inputEmail = document.createElement("input");
inputEmail.type = "email";
inputEmail.className = "form-control";
inputEmail.name = "email_usuario";
inputEmail.placeholder = "Digite seu email";
inputEmail.required = true;
divEmail.appendChild(inputEmail);
form.appendChild(divEmail);

// 5. Criação das ações inferiores (Botões)
const btnConfirmar = document.createElement("button");
btnConfirmar.type = "submit";
btnConfirmar.className = "btn btn-primary w-100 mb-2";
btnConfirmar.textContent = "Confirmar Registro";
form.appendChild(btnConfirmar);

const btnVoltar = document.createElement("a");
btnVoltar.href = "/homeus";
btnVoltar.className = "btn btn-secondary w-100";
btnVoltar.textContent = "Voltar para Home";
form.appendChild(btnVoltar);

// Injeta o formulário completo dentro do container
container.appendChild(form);
body.appendChild(container);

// 6. Função para preencher dinamicamente a lista de produtos (Substitui o {% for %})
function renderizarProdutos(listaProdutos) {
    // Limpa opções pré-existentes
    selectProduto.innerHTML = "";

    listaProdutos.forEach(item => {
        const option = document.createElement("option");
        option.value = item[0]; // ID do Produto
        option.textContent = `${item[1]} (Estoque: ${item[2]})`; // Nome do Produto + Estoque
        selectProduto.appendChild(option);
    });
}

// --- CONFIGURAÇÃO COM O JINJA / FLASK ---
// Para conectar esta função aos dados do banco retornados pelo Python,
// adicione no topo do seu HTML base as linhas comentadas abaixo:
/*
<script>
    const dadosProdutos = {{ consulta_banco | tojson }};
    renderizarProdutos(dadosProdutos);
</script>
*/
