import os
import bcrypt
import mysql.connector
from flask import Flask, render_template, render_template_string, request, redirect, url_for
from werkzeug.utils import secure_filename

app = Flask(__name__)

UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",        
        password="123456",
        database="banco_de_dados",
        port=3306
    )

@app.route('/', methods=['GET', 'POST'])
def cadastro():
    if request.method == 'POST':
        email = request.form.get('email')
        senha = request.form.get('senha')

        conexao = get_db_connection()
        cursor = conexao.cursor(dictionary=True)
        cursor.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
        usuario = cursor.fetchone()
        cursor.close()
        conexao.close()

        senha_ok = False
        if usuario:
            senha_hash = usuario['senha'].encode('utf-8')
            senha_digitada = senha.encode('utf-8')
            senha_ok = bcrypt.checkpw(senha_digitada, senha_hash)

        if usuario and senha_ok:
            if usuario.get('tipo') == 'comum':
                return redirect(url_for('homeus'))
            elif usuario.get('tipo') == 'admin':
                return redirect(url_for('home'))
        else:
            return render_template('cadastro.html', erro=True)

    return render_template('cadastro.html')

@app.route('/admin')
def admin():
    conexao = get_db_connection()
    cursor = conexao.cursor()
    cursor.execute("SELECT id, email, senha, tipo FROM usuarios")
    consulta_banco = cursor.fetchall()
    cursor.close()
    conexao.close()
    return render_template('admin.html', consulta_banco=consulta_banco)

@app.route('/cadastrar_usuario', methods=['POST'])
def cadastrar_usuario():
    email = request.form.get('email')
    senha = request.form.get('senha')

    senha_hash = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    conexao = get_db_connection()
    cursor = conexao.cursor()
    cursor.execute(
        "INSERT INTO usuarios (email, senha, tipo) VALUES (%s, %s, %s)",
        (email, senha_hash, 'comum')
    )
    conexao.commit()
    cursor.close()
    conexao.close()

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
def home():
    conexao = get_db_connection()
    cursor = conexao.cursor()
    cursor.execute("SELECT * FROM PRODUTOSS")
    consulta_banco = cursor.fetchall()
    cursor.close()
    conexao.close()
    return render_template('home.html', consulta_banco=consulta_banco)

@app.route('/adicionar_item')
def adicionar_item():
    return render_template('adicionaritem.html')

@app.route('/salvar_item', methods=['POST'])
def salvar_item():
    nome = request.form.get('nome')
    quantidade = request.form.get('quantidade_estoque')
    descricao = request.form.get('descricao')
    preco = request.form.get('preco')
    categoria = request.form.get('categoria')
    foto = request.form.get('foto')

    conexao = get_db_connection()
    cursor = conexao.cursor()
    cursor.execute(
        "INSERT INTO PRODUTOSS (nome, quantidade_estoque, descricao, preco, foto, categoria) VALUES (%s, %s, %s, %s, %s, %s)",
        (nome, quantidade, descricao, preco, foto, categoria)
    )
    conexao.commit()
    cursor.close()
    conexao.close()
    return redirect(url_for('home'))

@app.route('/devolucao_retirada', methods=['GET', 'POST'])
def devolucao_retirada():
    conexao = get_db_connection()
    cursor = conexao.cursor()

    if request.method == 'POST':
        tipo = request.form['tipo']
        produto_id = request.form['produto_id']
        quantidade = int(request.form['quantidade'])
        
        # Garante que 'email_usuario' não fique NULO
        email_usuario = request.form.get('email_usuario') or request.form.get('email') or 'sistema@senai.com'

        if tipo == 'Retirada':
            cursor.execute("UPDATE PRODUTOSS SET quantidade_estoque = quantidade_estoque - %s WHERE id = %s", (quantidade, produto_id))
        else:
            cursor.execute("UPDATE PRODUTOSS SET quantidade_estoque = quantidade_estoque + %s WHERE id = %s", (quantidade, produto_id))

        cursor.execute("INSERT INTO HISTORICO (tipo, produto_id, quantidade, email_usuario) VALUES (%s, %s, %s, %s)", (tipo, produto_id, quantidade, email_usuario))
        conexao.commit()
        cursor.close()
        conexao.close()
        return redirect(url_for('home'))

    cursor.execute("SELECT * FROM PRODUTOSS")
    consulta_banco = cursor.fetchall()
    cursor.close()
    conexao.close()
    return render_template('devolucao_retirada.html', consulta_banco=consulta_banco)

@app.route('/historico')
def historico():
    conexao = get_db_connection()
    cursor = conexao.cursor()
    cursor.execute("""
        SELECT h.id, h.tipo, p.nome, h.quantidade, h.email_usuario, h.data_movimentacao 
        FROM HISTORICO h 
        JOIN PRODUTOSS p ON h.produto_id = p.id 
        ORDER BY h.id DESC
    """)
    historico_dados = cursor.fetchall()
    cursor.close()
    conexao.close()
    return render_template('historico.html', historico=historico_dados)

@app.route('/homeus')
def homeus():
    conexao = get_db_connection()
    cursor = conexao.cursor()
    cursor.execute("SELECT * FROM PRODUTOSS")
    consulta_banco = cursor.fetchall()
    cursor.close()
    conexao.close()
    return render_template('homeus.html', consulta_banco=consulta_banco)

@app.route('/devolucao_retiradaus', methods=['GET', 'POST'])
def devolucao_retiradaus():
    conexao = get_db_connection()
    cursor = conexao.cursor()

    if request.method == 'POST':
        tipo = request.form['tipo']
        produto_id = request.form['produto_id']
        quantidade = int(request.form['quantidade'])
        
        # Garante que 'email_usuario' não fique NULO
        email_usuario = request.form.get('email_usuario') or request.form.get('email') or 'sistema@senai.com'

        if tipo == 'Retirada':
            cursor.execute("UPDATE PRODUTOSS SET quantidade_estoque = quantidade_estoque - %s WHERE id = %s", (quantidade, produto_id))
        else:
            cursor.execute("UPDATE PRODUTOSS SET quantidade_estoque = quantidade_estoque + %s WHERE id = %s", (quantidade, produto_id))

        cursor.execute("INSERT INTO HISTORICO (tipo, produto_id, quantidade, email_usuario) VALUES (%s, %s, %s, %s)", (tipo, produto_id, quantidade, email_usuario))
        conexao.commit()
        cursor.close()
        conexao.close()
        return redirect(url_for('homeus'))

    cursor.execute("SELECT * FROM PRODUTOSS")
    consulta_banco = cursor.fetchall()
    cursor.close()
    conexao.close()
    return render_template('devolucao_retiradaus.html', consulta_banco=consulta_banco)

if __name__ == '__main__':
    app.run(debug=True)