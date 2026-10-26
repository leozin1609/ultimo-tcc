import os
import base64
import uuid
from functools import wraps

import bcrypt
import mysql.connector
from flask import (Flask, render_template, render_template_string, request,
                   redirect, url_for, session, jsonify)
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'troque-esta-chave')

UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def get_db_connection():
    return mysql.connector.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        user=os.environ.get('DB_USER', 'root'),
        password=os.environ.get('DB_PASSWORD', ''),
        database=os.environ.get('DB_NAME', 'banco_de_dados'),
        port=int(os.environ.get('DB_PORT', 3306)),
        charset='utf8mb4'
    )


# ---------------------------------------------------------------
# Proteção das páginas (ideia do projeto do seu amigo)
# ---------------------------------------------------------------
def login_obrigatorio(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if 'usuario_id' not in session:
            return redirect(url_for('cadastro'))
        return func(*args, **kwargs)
    return wrapper


def admin_obrigatorio(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if 'usuario_id' not in session:
            return redirect(url_for('cadastro'))
        if session.get('usuario_tipo') != 'admin':
            return redirect(url_for('homeus'))
        return func(*args, **kwargs)
    return wrapper


def pagina_erro(mensagem, voltar, status=400):
    html = """
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <title>Erro</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>body { background-color: #00558a; }</style>
    </head>
    <body class="d-flex align-items-center justify-content-center vh-100 text-white">
        <div class="text-center">
            <h2>{{ mensagem }}</h2>
            <div class="mt-3"><a href="{{ voltar }}" class="btn btn-outline-light">Voltar</a></div>
        </div>
    </body>
    </html>
    """
    return render_template_string(html, mensagem=mensagem, voltar=voltar), status


# ---------------------------------------------------------------
# Funções reutilizadas pelas páginas e pela API
# ---------------------------------------------------------------
def verificar_login(email, senha):
    """Retorna o usuário (dict) se email/senha estiverem certos, senão None."""
    if not email or not senha:
        return None
    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    cur.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
    usuario = cur.fetchone()
    cur.close()
    con.close()

    if usuario and bcrypt.checkpw(senha.encode('utf-8'), usuario['senha'].encode('utf-8')):
        return usuario
    return None


def iniciar_sessao(usuario):
    session['usuario_id'] = usuario['id']
    session['usuario_email'] = usuario['email']
    session['usuario_tipo'] = usuario['tipo']


def listar_produtos():
    con = get_db_connection()
    cur = con.cursor()
    cur.execute("SELECT * FROM PRODUTOSS")
    produtos = cur.fetchall()
    cur.close()
    con.close()
    return produtos


def movimentar_estoque(tipo, produto_id, quantidade, email):
    """
    Retirada / Devolução com transação.
    Retorna (ok, mensagem, status_http).
    Não deixa o estoque ficar negativo.
    """
    if quantidade <= 0:
        return False, 'A quantidade deve ser maior que zero.', 400

    con = get_db_connection()
    cur = con.cursor()
    try:
        cur.execute("SELECT quantidade_estoque FROM PRODUTOSS WHERE id = %s FOR UPDATE",
                    (produto_id,))
        linha = cur.fetchone()
        if not linha:
            return False, 'Produto não encontrado.', 404

        if tipo == 'Retirada':
            if linha[0] < quantidade:
                return False, f'Estoque insuficiente (disponível: {linha[0]}).', 409
            cur.execute("UPDATE PRODUTOSS SET quantidade_estoque = quantidade_estoque - %s WHERE id = %s",
                        (quantidade, produto_id))
        else:
            cur.execute("UPDATE PRODUTOSS SET quantidade_estoque = quantidade_estoque + %s WHERE id = %s",
                        (quantidade, produto_id))

        cur.execute(
            "INSERT INTO HISTORICO (tipo, produto_id, quantidade, email_usuario) VALUES (%s, %s, %s, %s)",
            (tipo, produto_id, quantidade, email)
        )
        con.commit()
        return True, 'Movimentação registrada.', 201
    except mysql.connector.Error:
        con.rollback()
        raise
    finally:
        cur.close()
        con.close()


def tela_movimentacao(template, destino):
    """Lógica das duas telas de devolução/retirada (admin e usuário comum)."""
    if request.method == 'POST':
        tipo = request.form.get('tipo')
        try:
            produto_id = int(request.form['produto_id'])
            quantidade = int(request.form['quantidade'])
        except (KeyError, ValueError):
            return pagina_erro('Produto ou quantidade inválidos.', request.path)

        # O email vem da sessão (quem está logado), não do formulário
        ok, msg, status = movimentar_estoque(tipo, produto_id, quantidade,
                                             session['usuario_email'])
        if not ok:
            return pagina_erro(msg, request.path, status)
        return redirect(url_for(destino))

    return render_template(template, consulta_banco=listar_produtos())


# ---------------------------------------------------------------
# PÁGINAS (nomes das suas rotas e templates mantidos)
# ---------------------------------------------------------------
@app.route('/', methods=['GET', 'POST'])
def cadastro():
    if request.method == 'POST':
        usuario = verificar_login(request.form.get('email'), request.form.get('senha'))

        if usuario and usuario.get('tipo') in ('comum', 'admin'):
            iniciar_sessao(usuario)
            if usuario['tipo'] == 'admin':
                return redirect(url_for('home'))
            return redirect(url_for('homeus'))

        return render_template('cadastro.html', erro=True)

    return render_template('cadastro.html')


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('cadastro'))


@app.route('/admin')
@admin_obrigatorio
def admin():
    con = get_db_connection()
    cur = con.cursor()
    # A coluna senha continua na mesma posição para não quebrar o admin.html,
    # mas o hash não é mais enviado para a tela.
    cur.execute("SELECT id, email, '********' AS senha, tipo FROM usuarios")
    consulta_banco = cur.fetchall()
    cur.close()
    con.close()
    return render_template('admin.html', consulta_banco=consulta_banco)


@app.route('/cadastrar_usuario', methods=['POST'])
@admin_obrigatorio
def cadastrar_usuario():
    email = request.form.get('email')
    senha = request.form.get('senha')
    if not email or not senha:
        return pagina_erro('Informe email e senha.', url_for('admin'))

    senha_hash = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    con = get_db_connection()
    cur = con.cursor()
    try:
        cur.execute("INSERT INTO usuarios (email, senha, tipo) VALUES (%s, %s, %s)",
                    (email, senha_hash, 'comum'))
        con.commit()
    except mysql.connector.IntegrityError:
        con.rollback()
        return pagina_erro('Esse email já está cadastrado.', url_for('admin'), 409)
    finally:
        cur.close()
        con.close()

    html_sucesso = """
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <title>Usuário Cadastrado</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            body {
                background-color: #00558a;
            }
        </style>
    </head>
    <body class="d-flex align-items-center justify-content-center vh-100 text-white">
        <div class="text-center">
            <h2>Usuário cadastrado com sucesso!</h2>
            <div class="mt-3">
                <a href="/home" class="btn btn-outline-light">Voltar para Home</a>
            </div>
        </div>
    </body>
    </html>
    """
    return render_template_string(html_sucesso)


@app.route('/home')
@admin_obrigatorio
def home():
    return render_template('home.html', consulta_banco=listar_produtos())


@app.route('/adicionar_item')
@admin_obrigatorio
def adicionar_item():
    return render_template('adicionaritem.html')


@app.route('/salvar_item', methods=['POST'])
@admin_obrigatorio
def salvar_item():
    nome = request.form.get('nome')
    descricao = request.form.get('descrição')
    categoria = request.form.get('categoria')
    foto = request.form.get('foto')

    try:
        quantidade = int(request.form.get('quantidade_estoque') or 0)
        preco = float(str(request.form.get('preco') or 0).replace(',', '.'))
    except ValueError:
        return pagina_erro('Quantidade ou preço inválido.', url_for('adicionar_item'))

    if not nome or quantidade < 0 or preco < 0:
        return pagina_erro('Informe o nome; quantidade e preço não podem ser negativos.',
                           url_for('adicionar_item'))

    con = get_db_connection()
    cur = con.cursor()
    cur.execute(
        "INSERT INTO PRODUTOSS (nome, quantidade_estoque, descricao, preco, foto, categoria) "
        "VALUES (%s, %s, %s, %s, %s, %s)",
        (nome, quantidade, descricao, preco, foto, categoria)
    )
    con.commit()
    cur.close()
    con.close()
    return redirect(url_for('home'))


@app.route('/devolucao_retirada', methods=['GET', 'POST'])
@admin_obrigatorio
def devolucao_retirada():
    return tela_movimentacao('devolucao_retirada.html', 'home')


@app.route('/historico')
@admin_obrigatorio
def historico():
    con = get_db_connection()
    cur = con.cursor()
    cur.execute("""
        SELECT h.id, h.tipo, p.nome, h.quantidade, h.email_usuario, h.data_movimentacao
        FROM HISTORICO h
        JOIN PRODUTOSS p ON h.produto_id = p.id
        ORDER BY h.id DESC
    """)
    historico_dados = cur.fetchall()
    cur.close()
    con.close()
    return render_template('historico.html', historico=historico_dados)


@app.route('/homeus')
@login_obrigatorio
def homeus():
    return render_template('homeus.html', consulta_banco=listar_produtos())


@app.route('/devolucao_retiradaus', methods=['GET', 'POST'])
@login_obrigatorio
def devolucao_retiradaus():
    return tela_movimentacao('devolucao_retiradaus.html', 'homeus')


# ---------------------------------------------------------------
# API JSON (ideia do projeto do seu amigo, com os SEUS nomes de tabela)
# ---------------------------------------------------------------
API_SO_ADMIN = ('/api/usuarios', '/api/historico')


@app.before_request
def proteger_api():
    if not request.path.startswith('/api/') or request.path == '/api/login':
        return None
    if 'usuario_id' not in session:
        return jsonify(erro='Não autenticado'), 401

    so_admin = (request.path.startswith(API_SO_ADMIN)
                or (request.path == '/api/produtos' and request.method == 'POST'))
    if so_admin and session.get('usuario_tipo') != 'admin':
        return jsonify(erro='Apenas administradores'), 403
    return None


@app.errorhandler(mysql.connector.Error)
def erro_banco(erro):
    if not request.path.startswith('/api/'):
        raise erro
    return jsonify(erro=f'Erro no banco de dados: {erro}'), 500


# POST /api/login {"email": "...", "senha": "..."}
@app.route('/api/login', methods=['POST'])
def api_login():
    dados = request.get_json(silent=True) or request.form
    usuario = verificar_login(dados.get('email'), dados.get('senha'))
    if not usuario:
        return jsonify(erro='Email ou senha incorretos'), 401
    iniciar_sessao(usuario)
    return jsonify(id=usuario['id'], email=usuario['email'], tipo=usuario['tipo'])


@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify(mensagem='Sessão encerrada')


# GET /api/produtos  (opcional: ?q=texto para buscar por nome ou categoria)
@app.route('/api/produtos', methods=['GET'])
def api_listar_produtos():
    busca = '%' + request.args.get('q', '').strip() + '%'
    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    cur.execute("SELECT * FROM PRODUTOSS WHERE nome LIKE %s OR categoria LIKE %s ORDER BY id ASC",
                (busca, busca))
    produtos = cur.fetchall()
    cur.close()
    con.close()
    return jsonify(produtos)


@app.route('/api/produtos/<int:produto_id>', methods=['GET'])
def api_buscar_produto(produto_id):
    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    cur.execute("SELECT * FROM PRODUTOSS WHERE id = %s", (produto_id,))
    produto = cur.fetchone()
    cur.close()
    con.close()
    if not produto:
        return jsonify(erro='Produto não encontrado'), 404
    return jsonify(produto)


# POST /api/produtos (só admin)
# Aceita foto em base64: {"foto_base64": "...", "foto_nome": "foto.png"}
@app.route('/api/produtos', methods=['POST'])
def api_criar_produto():
    d = request.get_json(silent=True) or request.form
    nome = d.get('nome')
    try:
        quantidade = int(d.get('quantidade_estoque') or 0)
        preco = float(str(d.get('preco') or 0).replace(',', '.'))
    except (ValueError, TypeError):
        return jsonify(erro='Quantidade ou preço inválido'), 400
    if not nome or quantidade < 0 or preco < 0:
        return jsonify(erro='Informe o nome; quantidade e preço não podem ser negativos'), 400

    foto = d.get('foto') or ''
    if d.get('foto_base64'):
        extensao = os.path.splitext(secure_filename(d.get('foto_nome') or ''))[1].lower()
        if extensao not in ('.jpg', '.jpeg', '.png', '.webp', '.gif'):
            extensao = '.jpg'
        nome_arquivo = uuid.uuid4().hex + extensao
        try:
            conteudo = base64.b64decode(d['foto_base64'])
        except ValueError:
            return jsonify(erro='Foto inválida'), 400
        with open(os.path.join(UPLOAD_FOLDER, nome_arquivo), 'wb') as arq:
            arq.write(conteudo)
        foto = f'{UPLOAD_FOLDER}/{nome_arquivo}'

    con = get_db_connection()
    cur = con.cursor()
    cur.execute(
        "INSERT INTO PRODUTOSS (nome, quantidade_estoque, descricao, preco, foto, categoria) "
        "VALUES (%s, %s, %s, %s, %s, %s)",
        (nome, quantidade, d.get('descricao'), preco, foto, d.get('categoria'))
    )
    con.commit()
    novo_id = cur.lastrowid
    cur.close()
    con.close()
    return jsonify(id=novo_id), 201


# POST /api/movimentacoes {"tipo": "Retirada" ou "Devolucao", "produto_id": 1, "quantidade": 2}
@app.route('/api/movimentacoes', methods=['POST'])
def api_movimentar():
    d = request.get_json(silent=True) or request.form
    tipo = d.get('tipo')
    if tipo not in ('Retirada', 'Devolucao', 'Devolução'):
        return jsonify(erro='Tipo inválido. Use "Retirada" ou "Devolucao"'), 400
    try:
        produto_id = int(d.get('produto_id'))
        quantidade = int(d.get('quantidade'))
    except (ValueError, TypeError):
        return jsonify(erro='produto_id e quantidade devem ser números inteiros'), 400

    ok, msg, status = movimentar_estoque(tipo, produto_id, quantidade, session['usuario_email'])
    if not ok:
        return jsonify(erro=msg), status
    return jsonify(mensagem=msg), status


# GET /api/historico (só admin)
@app.route('/api/historico', methods=['GET'])
def api_historico():
    limite = min(max(request.args.get('limit', 100, type=int), 1), 500)
    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    cur.execute(
        "SELECT h.id, h.tipo, p.nome AS produto, h.quantidade, h.email_usuario, "
        "DATE_FORMAT(h.data_movimentacao, '%d/%m/%Y %H:%i:%s') AS data_formatada "
        "FROM HISTORICO h JOIN PRODUTOSS p ON h.produto_id = p.id "
        f"ORDER BY h.id DESC LIMIT {limite}"
    )
    dados = cur.fetchall()
    cur.close()
    con.close()
    return jsonify(dados)


# GET /api/usuarios (só admin)
@app.route('/api/usuarios', methods=['GET'])
def api_listar_usuarios():
    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    cur.execute("SELECT id, email, tipo FROM usuarios ORDER BY email")
    lista = cur.fetchall()
    cur.close()
    con.close()
    return jsonify(lista)


# POST /api/usuarios (só admin) {"email": "...", "senha": "...", "tipo": "comum"}
@app.route('/api/usuarios', methods=['POST'])
def api_criar_usuario():
    d = request.get_json(silent=True) or request.form
    email, senha = d.get('email'), d.get('senha')
    tipo = d.get('tipo') or 'comum'
    if not email or not senha or tipo not in ('admin', 'comum'):
        return jsonify(erro='Informe email, senha e um tipo válido ("admin" ou "comum")'), 400

    senha_hash = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    con = get_db_connection()
    cur = con.cursor()
    try:
        cur.execute("INSERT INTO usuarios (email, senha, tipo) VALUES (%s, %s, %s)",
                    (email, senha_hash, tipo))
        con.commit()
        novo_id = cur.lastrowid
    except mysql.connector.IntegrityError:
        con.rollback()
        return jsonify(erro='Email já cadastrado'), 409
    finally:
        cur.close()
        con.close()
    return jsonify(id=novo_id), 201


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')