import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";

// Mesmo endereço das outras telas (sem a barra no final)
const API_URL = "http://10.134.50.100:5000";

// Larguras fixas das colunas (a tabela rola na horizontal)
const COLUNAS = [
  { chave: "id", titulo: "ID", largura: 50 },
  { chave: "nome", titulo: "Nome", largura: 140 },
  { chave: "quantidade", titulo: "Qtde Estoque", largura: 110 },
  { chave: "descricao", titulo: "Descricao", largura: 200 },
  { chave: "preco", titulo: "Preço", largura: 90 },
  { chave: "categoria", titulo: "Categoria", largura: 120 },
  { chave: "foto", titulo: "Foto", largura: 90 },
];

export default function Home({ navigation }) {
  const [estoqueAberto, setEstoqueAberto] = useState(false);
  const [estoque, setEstoque] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [fotoAberta, setFotoAberta] = useState(null); // equivale ao Swal.fire

  // Equivale ao toggleTabela() + {% for item in consulta_banco %}
  async function abrirEstoque() {
    setEstoqueAberto(true);
    setCarregando(true);
    try {
      const resposta = await fetch(`${API_URL}/listar_estoque`);
      const dados = await resposta.json();
      setEstoque(dados);
    } catch (e) {
      Alert.alert("Erro de conexão", "Não foi possível carregar o estoque.");
      setEstoqueAberto(false);
    } finally {
      setCarregando(false);
    }
  }

  function fecharEstoque() {
    setFotoAberta(null);
    setEstoqueAberto(false);
  }

  function formatarPreco(valor) {
    const numero = parseFloat(valor);
    return isNaN(numero) ? String(valor) : `R$ ${numero.toFixed(2).replace(".", ",")}`;
  }

  return (
    <View style={styles.tela}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={{ uri: `${API_URL}/static/senaicanto.png` }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Image
          source={{ uri: `${API_URL}/static/trabalhador.png` }}
          style={styles.trabalhador}
          resizeMode="cover"
        />

        <View style={styles.opcoes}>
          <TouchableOpacity
            style={styles.botao}
            onPress={() => navigation.navigate("RetiradaDevolucao")}
          >
            <Text style={styles.botaoTexto}>Registrar Retirada/Devolução</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botao}
            onPress={estoqueAberto ? fecharEstoque : abrirEstoque}
          >
            <Text style={styles.botaoTexto}>
              {estoqueAberto ? "Fechar Estoque" : "Estoque Geral"}
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
            <Text style={styles.botaoTexto}>Cadastrar Usuarios</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Tabela flutuante do estoque (div #tabelaEstoque) */}
      <Modal
        visible={estoqueAberto}
        transparent
        animationType="fade"
        onRequestClose={fecharEstoque}
      >
        <View style={styles.fundoModal}>
          <View style={styles.tabelaCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View>
                <View style={[styles.linha, styles.cabecalho]}>
                  {COLUNAS.map((c) => (
                    <Text
                      key={c.chave}
                      style={[styles.celula, styles.cabecalhoTexto, { width: c.largura }]}
                    >
                      {c.titulo}
                    </Text>
                  ))}
                </View>

                <ScrollView style={styles.corpoTabela} nestedScrollEnabled>
                  {carregando ? (
                    <ActivityIndicator color="#1a3a5c" style={{ margin: 20 }} />
                  ) : estoque.length === 0 ? (
                    <Text style={styles.vazio}>Nenhum item no estoque.</Text>
                  ) : (
                    estoque.map((item) => (
                      <View key={item.id} style={styles.linha}>
                        <Text style={[styles.celula, { width: COLUNAS[0].largura }]}>
                          {item.id}
                        </Text>
                        <Text style={[styles.celula, { width: COLUNAS[1].largura }]}>
                          {item.nome}
                        </Text>
                        <Text style={[styles.celula, { width: COLUNAS[2].largura }]}>
                          {item.quantidade}
                        </Text>
                        <Text style={[styles.celula, { width: COLUNAS[3].largura }]}>
                          {item.descricao}
                        </Text>
                        <Text style={[styles.celula, { width: COLUNAS[4].largura }]}>
                          {formatarPreco(item.preco)}
                        </Text>
                        <Text style={[styles.celula, { width: COLUNAS[5].largura }]}>
                          {item.categoria}
                        </Text>
                        <View style={[styles.celulaBotao, { width: COLUNAS[6].largura }]}>
                          <TouchableOpacity
                            style={styles.botaoFoto}
                            onPress={() => setFotoAberta(item.foto)}
                          >
                            <Text style={styles.botaoFotoTexto}>Foto</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.botaoFechar} onPress={fecharEstoque}>
              <Text style={styles.botaoTexto}>Fechar Estoque</Text>
            </TouchableOpacity>
          </View>

          {/* Foto do produto (equivale ao Swal.fire com imageUrl) */}
          {fotoAberta && (
            <TouchableOpacity
              style={styles.fundoFoto}
              activeOpacity={1}
              onPress={() => setFotoAberta(null)}
            >
              <View style={styles.cartaoFoto}>
                <Image
                  source={{ uri: fotoAberta }}
                  style={styles.foto}
                  resizeMode="contain"
                />
                <Text style={styles.toqueFechar}>Toque para fechar</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: "#003584" },
  container: { flexGrow: 1, alignItems: "center", padding: 20 },
  logo: { width: 220, height: 90, marginTop: 20 },
  trabalhador: {
    width: "100%",
    maxWidth: 500,
    height: 180,
    borderRadius: 8,
    marginVertical: 16,
  },
  opcoes: { width: "100%", maxWidth: 500, gap: 12 },
  botao: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    elevation: 3,
  },
  botaoTexto: { color: "#1a3a5c", fontSize: 17, fontWeight: "bold" },

  fundoModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 16,
  },
  tabelaCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    maxHeight: "80%",
  },
  corpoTabela: { maxHeight: 380 },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
  },
  cabecalho: { backgroundColor: "#1a3a5c", borderBottomWidth: 0 },
  cabecalhoTexto: { color: "#fff", fontWeight: "bold" },
  celula: { paddingHorizontal: 8, fontSize: 14, color: "#212529" },
  celulaBotao: { paddingHorizontal: 8, alignItems: "flex-start" },
  vazio: { padding: 16, color: "#212529", minWidth: 800 },
  botaoFoto: {
    backgroundColor: "#0d6efd",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  botaoFotoTexto: { color: "#fff", fontSize: 14 },
  botaoFechar: {
    backgroundColor: "#e9ecef",
    paddingVertical: 14,
    alignItems: "center",
  },

  fundoFoto: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  cartaoFoto: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  foto: { width: 300, height: 300 },
  toqueFechar: { color: "#6c757d", marginTop: 10, fontSize: 13 },
});