CREATE DATABASE IF NOT EXISTS banco_de_dados;
USE banco_de_dados;

-- Apagar as tabelas, se já existirem
DROP TABLE IF EXISTS HISTORICO;
DROP TABLE IF EXISTS PRODUTOSS;
DROP TABLE IF EXISTS usuarios;

-- Criar tabela de produtos
CREATE TABLE PRODUTOSS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(167) NOT NULL,
    quantidade_estoque INT NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    foto VARCHAR(267),
    categoria VARCHAR(267)
);

-- Criar tabela de histórico
CREATE TABLE HISTORICO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    email_usuario VARCHAR(167) NOT NULL
        DEFAULT 'sistema@senai.com',
    data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de usuários
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(167) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'comum'
);

-- Inserir produtos
INSERT INTO PRODUTOSS
    (nome, quantidade_estoque, descricao, preco, foto, categoria)
VALUES
    ('Fios(Kit)', 18, 'Cortar', 20.00, 'static/foto2.png', 'Eletrica'),
    ('Makita', 5, 'Serra Mármore / Esmerilhadeira', 350.00, 'static/foto.png', 'Ferramentas');

-- Inserir usuários
INSERT INTO usuarios (email, senha, tipo)
VALUES
    ('naopodebrigar@gmail.com',
     '$2a$12$g.xV0pT9ieVt2u0Mx4QDD.vAWN8fgTNhwhwJL0/A7D7P6WWdrmdVu',
     'admin'),
    ('leozin@gmail.com',
     '$2a$12$DCt0izcs8Hpc2lctrplO/uQvQWOfXLVTZcxJDpEzM4J8sbRGN/AYa',
     'comum');

-- Consultar usuários
SELECT * FROM usuarios;

-- Consultar produtos
SELECT * FROM PRODUTOSS;