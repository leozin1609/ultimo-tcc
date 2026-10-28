import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

// Mesmo endereço do login (sem a barra no final)
const API_URL = "http://172.20.208.1:5000";

// Aceita tanto lista [id, nome, ...] quanto objeto {id, nome, ...}
function normalizar(item) {
  if (Array.isArray(item)) {
    return {
      id: item[0],
      nome: item[1],
      estoque: item[2],
      descricao: item[3],
      preco: item[4],
      foto: item[5],
      categoria: item[6],
    };
  }
  return {
    id: item.id,
    nome: item.nome,
    estoque: item.estoque ?? item.qtde_estoque ?? item.quantidade,
    descricao: item.descricao,
    preco: item.preco,
    foto: item.foto,
    categoria: item.categoria,
  };
}

function urlDaFoto(foto) {
  if (!foto) return null;
  if (foto.startsWith("http")) return foto;
  return `${API_URL}/${foto.replace(/^\//, "")}`;
}

export default function Home({ navigation, route }) {
  const usuario = route.params?.usuario;

  const [tabelaAberta, setTabelaAberta] = useState(false);
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erroTabela, setErroTabela] = useState(false);
  const [fotoAberta, setFotoAberta] = useState(null);

  async function alternarTabela() {
    if (tabelaAberta) {
      setTabelaAberta(false);
      return;
    }

    setTabelaAberta(true);
    setCarregando(true);
    setErroTabela(false);
    try {
      const resposta = await fetch(`${API_URL}/produtos`);
      if (!resposta.ok) throw new Error("Erro no servidor");
      const dados = await resposta.json();
      setItens(dados.map(normalizar));
    } catch (e) {
      setErroTabela(true);
    } finally {
      setCarregando(false);
    }
  }

  return (
   <ImageBackground
  source={require("../assents/trabalhador.png")}
  style={styles.fundo}
  resizeMode="cover"
>
  <View style={styles.pelicula}>
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require("../assents/senaicanto.png")}
        style={styles.logo}
        resizeMode="contain"
      />

   


          {usuario ? <Text style={styles.usuario}>Olá, {usuario}</Text> : null}

          <TouchableOpacity
            style={styles.botao}
            onPress={() => navigation.navigate("Retirada", { usuario })}
          >
            <Text style={styles.botaoTexto}>Registrar Retirada/Devolução</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botao} onPress={alternarTabela}>
            <Text style={styles.botaoTexto}>
              {tabelaAberta ? "Fechar Estoque" : "Estoque Geral"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botao}
            onPress={() => navigation.navigate("Historico")}
          >
            <Text style={styles.botaoTexto}>Histórico Estoque</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botao}
            onPress={() => navigation.navigate("Admin")}
          >
            <Text style={styles.botaoTexto}>Cadastrar Usuários</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botao, styles.sair]}
            onPress={() => navigation.replace("Login")}
          >
            <Text style={styles.botaoTexto}>Sair</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Tabela de estoque (equivale ao div #tabelaEstoque) */}
      <Modal
        visible={tabelaAberta}
        transparent
        animationType="fade"
        onRequestClose={() => setTabelaAberta(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.tabelaCaixa}>
            <ScrollView horizontal>
              <View>
                <View style={[styles.linha, styles.cabecalho]}>
                  <Text style={[styles.cel, styles.cIdx, styles.cabTexto]}>ID</Text>
                  <Text style={[styles.cel, styles.cNome, styles.cabTexto]}>Nome</Text>
                  <Text style={[styles.cel, styles.cQtd, styles.cabTexto]}>Qtde Estoque</Text>
                  <Text style={[styles.cel, styles.cDesc, styles.cabTexto]}>Descrição</Text>
                  <Text style={[styles.cel, styles.cPreco, styles.cabTexto]}>Preço</Text>
                  <Text style={[styles.cel, styles.cCat, styles.cabTexto]}>Categoria</Text>
                  <Text style={[styles.cel, styles.cFoto, styles.cabTexto]}>Foto</Text>
                </View>

                <ScrollView style={{ maxHeight: 360 }}>
                  {carregando && (
                    <ActivityIndicator style={{ margin: 20 }} color="#1a3a5c" />
                  )}

                  {erroTabela && (
                    <Text style={styles.msgErro}>
                      Não foi possível carregar o estoque.
                    </Text>
                  )}

                  {itens.map((item, i) => (
                    <View
                      key={String(item.id) + i}
                      style={[styles.linha, i % 2 === 1 && styles.linhaZebra]}
                    >
                      <Text style={[styles.cel, styles.cIdx]}>{item.id}</Text>
                      <Text style={[styles.cel, styles.cNome]}>{item.nome}</Text>
                      <Text style={[styles.cel, styles.cQtd]}>{item.estoque}</Text>
                      <Text style={[styles.cel, styles.cDesc]}>{item.descricao}</Text>
                      <Text style={[styles.cel, styles.cPreco]}>{item.preco}</Text>
                      <Text style={[styles.cel, styles.cCat]}>{item.categoria}</Text>
                      <View style={[styles.cel, styles.cFoto]}>
                        <TouchableOpacity
                          style={styles.botaoFoto}
                          onPress={() => setFotoAberta(urlDaFoto(item.foto))}
                        >
                          <Text style={styles.botaoFotoTexto}>Foto</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.botaoFechar}
              onPress={() => setTabelaAberta(false)}
            >
              <Text style={styles.botaoTexto}>Fechar Estoque</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Foto do item (equivale ao Swal.fire) */}
      <Modal
        visible={!!fotoAberta}
        transparent
        animationType="fade"
        onRequestClose={() => setFotoAberta(null)}
      >
        <TouchableOpacity
          style={styles.modalFundo}
          activeOpacity={1}
          onPress={() => setFotoAberta(null)}
        >
          <View style={styles.fotoCaixa}>
            {fotoAberta ? (
              <Image
                source={{ uri: fotoAberta }}
                style={styles.fotoImagem}
                resizeMode="contain"
              />
            ) : (
              <Text>Sem foto</Text>
            )}
            <Text style={styles.toqueFechar}>Toque para fechar</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1 },
  pelicula: { flex: 1, backgroundColor: "rgba(0, 80, 132, 0.6)" },
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logo: { width: 220, height: 120, marginBottom: 10 },
  usuario: { color: "#fff", marginBottom: 20 },

  botao: {
    alignSelf: "stretch",
    maxWidth: 400,
    width: "100%",
    backgroundColor: "#005084",
    borderWidth: 1,
    borderColor: "#fff",
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 14,
    alignItems: "center",
  },
  sair: { backgroundColor: "#6c757d" },
  botaoTexto: { color: "#fff", fontSize: 16, textAlign: "center" },

  modalFundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  tabelaCaixa: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    maxWidth: "100%",
  },
  linha: { flexDirection: "row", alignItems: "center" },
  linhaZebra: { backgroundColor: "#f2f5f9" },
  cabecalho: { backgroundColor: "#1a3a5c" },
  cabTexto: { color: "#fff", fontWeight: "bold" },
  cel: { padding: 10, fontSize: 14, color: "#000" },
  cIdx: { width: 50 },
  cNome: { width: 160 },
  cQtd: { width: 110 },
  cDesc: { width: 180 },
  cPreco: { width: 80 },
  cCat: { width: 120 },
  cFoto: { width: 80 },
  botaoFoto: {
    backgroundColor: "#0d6efd",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  botaoFotoTexto: { color: "#fff", fontSize: 13 },
  botaoFechar: {
    backgroundColor: "#1a3a5c",
    paddingVertical: 12,
    alignItems: "center",
  },
  msgErro: { color: "red", padding: 16 },

  fotoCaixa: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  fotoImagem: { width: 300, height: 300 },
  toqueFechar: { color: "#666", marginTop: 8, fontSize: 12 },
});