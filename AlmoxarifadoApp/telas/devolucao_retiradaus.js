import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";

// Mesmo endereço das outras telas (sem a barra no final)
const API_URL = "http://172.20.208.1:5000";

// Equivale às <option> do primeiro <select> do HTML
const OPERACOES = [
  { valor: "Retirada", rotulo: "Retirada" },
  { valor: "Devolucao", rotulo: "Devolução" },
];

export default function RetiradaDevolucao({ navigation }) {
  const [tipo, setTipo] = useState("Retirada");
  const [produtos, setProdutos] = useState([]);
  const [produtoId, setProdutoId] = useState(null);
  const [quantidade, setQuantidade] = useState("1");
  const [emailUsuario, setEmailUsuario] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [carregandoLista, setCarregandoLista] = useState(true);

  // Equivale ao {% for item in consulta_banco %} do HTML
  async function carregarProdutos() {
    setCarregandoLista(true);
    try {
      const resposta = await fetch(`${API_URL}/listar_produtos`);
      const dados = await resposta.json();
      setProdutos(dados);
      // Como no <select>, o primeiro produto já vem selecionado
      setProdutoId((atual) => atual ?? (dados.length > 0 ? dados[0].id : null));
    } catch (e) {
      Alert.alert("Erro de conexão", "Não foi possível carregar os produtos.");
    } finally {
      setCarregandoLista(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function confirmar() {
    // Equivale ao "required", min="1" e type="email" do HTML
    if (produtoId === null) {
      Alert.alert("Erro", "Selecione um produto.");
      return;
    }

    const qtd = parseInt(quantidade, 10);
    if (isNaN(qtd) || qtd < 1) {
      Alert.alert("Erro", "Informe uma quantidade válida (1 ou mais).");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(emailUsuario.trim())) {
      Alert.alert("Erro", "Informe um e-mail válido.");
      return;
    }

    setCarregando(true);
    try {
      const corpo =
        `tipo=${encodeURIComponent(tipo)}` +
        `&produto_id=${encodeURIComponent(produtoId)}` +
        `&quantidade=${qtd}` +
        `&email_usuario=${encodeURIComponent(emailUsuario.trim())}`;

      const resposta = await fetch(`${API_URL}/devolucao_retirada`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: corpo,
      });

      if (resposta.ok) {
        Alert.alert("Sucesso!", `${tipo === "Retirada" ? "Retirada" : "Devolução"} registrada.`);
        setQuantidade("1");
        setEmailUsuario("");
        carregarProdutos(); // atualiza o estoque mostrado na lista
      } else {
        Alert.alert("Erro", "O servidor recusou o registro.");
      }
    } catch (e) {
      Alert.alert("Erro de conexão", "Não foi possível falar com o servidor.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.titulo}>Retirada e Devolução (Admin)</Text>

          <Text style={styles.label}>Tipo de Operação:</Text>
          <View style={styles.operacoes}>
            {OPERACOES.map((o) => {
              const selecionado = tipo === o.valor;
              return (
                <TouchableOpacity
                  key={o.valor}
                  style={[styles.opcao, selecionado && styles.opcaoSelecionada]}
                  onPress={() => setTipo(o.valor)}
                >
                  <Text
                    style={[
                      styles.opcaoTexto,
                      selecionado && styles.opcaoTextoSelecionado,
                    ]}
                  >
                    {o.rotulo}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Produto:</Text>
          <View style={styles.listaProdutos}>
            {carregandoLista ? (
              <ActivityIndicator color="#0d6efd" style={{ margin: 16 }} />
            ) : produtos.length === 0 ? (
              <Text style={styles.vazio}>Nenhum produto cadastrado.</Text>
            ) : (
              <ScrollView nestedScrollEnabled>
                {produtos.map((p) => {
                  const selecionado = produtoId === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.produto,
                        selecionado && styles.produtoSelecionado,
                      ]}
                      onPress={() => setProdutoId(p.id)}
                    >
                      <Text
                        style={[
                          styles.produtoTexto,
                          selecionado && styles.produtoTextoSelecionado,
                        ]}
                      >
                        {p.nome} (Estoque: {p.estoque})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          <Text style={styles.label}>Quantidade:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={quantidade}
            onChangeText={setQuantidade}
          />

          <Text style={styles.label}>Email do Usuário:</Text>
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Digite seu email"
            placeholderTextColor="#888"
            value={emailUsuario}
            onChangeText={setEmailUsuario}
          />

          <TouchableOpacity
            style={[styles.botaoConfirmar, carregando && styles.botaoDesativado]}
            onPress={confirmar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botaoTexto}>Confirmar Registro</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoAdicionar}
            onPress={() => navigation.navigate("AdicionarItem")}
          >
            <Text style={styles.botaoTexto}>Adicionar Item</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.botaoTexto}>Voltar para Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    maxWidth: 500,
    alignSelf: "center",
    elevation: 4,
  },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: "#000" },
  label: { fontSize: 14, color: "#212529", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    color: "#000",
    backgroundColor: "#fff",
  },

  operacoes: { flexDirection: "row", gap: 8, marginBottom: 16 },
  opcao: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  opcaoSelecionada: { backgroundColor: "#0d6efd", borderColor: "#0d6efd" },
  opcaoTexto: { color: "#212529", fontSize: 14 },
  opcaoTextoSelecionado: { color: "#fff", fontWeight: "bold" },

  listaProdutos: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 6,
    maxHeight: 180,
    marginBottom: 16,
    overflow: "hidden",
  },
  produto: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  produtoSelecionado: { backgroundColor: "#0d6efd" },
  produtoTexto: { color: "#212529", fontSize: 14 },
  produtoTextoSelecionado: { color: "#fff", fontWeight: "bold" },
  vazio: { color: "#6c757d", padding: 12 },

  botaoConfirmar: {
    backgroundColor: "#0d6efd",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  botaoAdicionar: {
    backgroundColor: "#198754",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  botaoVoltar: {
    backgroundColor: "#6c757d",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
  },
  botaoDesativado: { opacity: 0.6 },
  botaoTexto: { color: "#fff", fontSize: 16 },
});