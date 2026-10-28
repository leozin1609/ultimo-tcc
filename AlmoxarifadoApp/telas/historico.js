import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
} from "react-native";

// Mesmo endereço das outras telas (sem a barra no final)
const API_URL = "http://172.20.208.1:5000";

// Larguras fixas das colunas (a tabela rola na horizontal, como .table-responsive)
const COLUNAS = [
  { chave: "id", titulo: "ID", largura: 50 },
  { chave: "tipo", titulo: "Tipo", largura: 110 },
  { chave: "produto", titulo: "Produto", largura: 150 },
  { chave: "quantidade", titulo: "Quantidade", largura: 100 },
  { chave: "usuario", titulo: "Usuário", largura: 200 },
  { chave: "data", titulo: "Data e Hora", largura: 160 },
];

// Equivale aos badges bg-danger / bg-success / bg-primary do HTML
function Badge({ tipo }) {
  let cor = "#0d6efd";
  let texto = tipo;
  if (tipo === "Retirada") {
    cor = "#dc3545";
  } else if (tipo === "Devolucao") {
    cor = "#198754";
    texto = "Devolução";
  }
  return (
    <View style={[styles.badge, { backgroundColor: cor }]}>
      <Text style={styles.badgeTexto}>{texto}</Text>
    </View>
  );
}

export default function Historico({ navigation }) {
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  // Equivale ao {% for item in historico %} do HTML
  async function carregarHistorico() {
    try {
      const resposta = await fetch(`${API_URL}/listar_historico`);
      const dados = await resposta.json();
      setHistorico(dados);
    } catch (e) {
      Alert.alert("Erro de conexão", "Não foi possível carregar o histórico.");
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useEffect(() => {
    carregarHistorico();
  }, []);

  function aoPuxar() {
    setAtualizando(true);
    carregarHistorico();
  }

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={atualizando}
          onRefresh={aoPuxar}
          tintColor="#fff"
          colors={["#0d6efd"]}
        />
      }
    >
      <View style={styles.card}>
        <Text style={styles.titulo}>Histórico de Movimentações do Estoque</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            {/* Cabeçalho (table-dark) */}
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

            {carregando ? (
              <ActivityIndicator color="#0d6efd" style={{ margin: 20 }} />
            ) : historico.length === 0 ? (
              <Text style={styles.vazio}>
                Nenhuma movimentação registrada no histórico.
              </Text>
            ) : (
              historico.map((item, i) => (
                <View
                  key={item.id}
                  style={[styles.linha, i % 2 === 0 && styles.linhaListrada]}
                >
                  <Text style={[styles.celula, { width: COLUNAS[0].largura }]}>
                    {item.id}
                  </Text>
                  <View style={[styles.celulaBadge, { width: COLUNAS[1].largura }]}>
                    <Badge tipo={item.tipo} />
                  </View>
                  <Text style={[styles.celula, { width: COLUNAS[2].largura }]}>
                    {item.produto}
                  </Text>
                  <Text style={[styles.celula, { width: COLUNAS[3].largura }]}>
                    {item.quantidade}
                  </Text>
                  <Text style={[styles.celula, { width: COLUNAS[4].largura }]}>
                    {item.usuario}
                  </Text>
                  <Text style={[styles.celula, { width: COLUNAS[5].largura }]}>
                    {item.data}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.botaoVoltarTexto}>Voltar para Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: "#003584" },
  container: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    width: "100%",
    alignSelf: "center",
    elevation: 4,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0d6efd",
    textAlign: "center",
    marginBottom: 16,
  },

  linha: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
  },
  cabecalho: { backgroundColor: "#212529", borderBottomWidth: 0 },
  cabecalhoTexto: { color: "#fff", fontWeight: "bold" },
  linhaListrada: { backgroundColor: "#f2f2f2" },
  celula: { paddingHorizontal: 8, fontSize: 14, color: "#212529" },
  celulaBadge: { paddingHorizontal: 8, alignItems: "flex-start" },
  vazio: {
    textAlign: "center",
    color: "#212529",
    padding: 16,
    minWidth: 770,
  },

  badge: { borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8 },
  badgeTexto: { color: "#fff", fontSize: 12, fontWeight: "bold" },

  botaoVoltar: {
    marginTop: 16,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#6c757d",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  botaoVoltarTexto: { color: "#6c757d", fontSize: 16 },
});