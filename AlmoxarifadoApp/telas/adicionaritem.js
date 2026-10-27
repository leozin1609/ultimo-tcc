import React, { useState } from "react";
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

// Mesmo endereço do login (sem a barra no final)
const API_URL = "http://10.134.50.100:5000";

export default function Admin({ navigation }) {
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [foto, setFoto] = useState("");
  const [carregando, setCarregando] = useState(false);

  function limpar() {
    setNome("");
    setQuantidade("1");
    setDescricao("");
    setPreco("");
    setCategoria("");
    setFoto("");
  }

  async function salvar() {
    // Equivale aos "required", type="number" e type="url" do HTML
    if (!nome.trim() || !categoria.trim() || !preco.trim() || !foto.trim()) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return;
    }

    const qtd = parseInt(quantidade, 10);
    if (isNaN(qtd) || qtd < 0) {
      Alert.alert("Erro", "Informe uma quantidade válida (0 ou mais).");
      return;
    }

    const precoNum = parseFloat(preco.replace(",", "."));
    if (isNaN(precoNum) || precoNum < 0) {
      Alert.alert("Erro", "Informe um preço válido.");
      return;
    }

    if (!/^https?:\/\//i.test(foto.trim())) {
      Alert.alert("Erro", "O link da foto deve começar com http:// ou https://");
      return;
    }

    setCarregando(true);
    try {
      const corpo = [
        ["nome", nome.trim()],
        ["quantidade_estoque", String(qtd)],
        ["descricao", descricao.trim()],
        ["preco", precoNum.toFixed(2)],
        ["categoria", categoria.trim()],
        ["foto", foto.trim()],
      ]
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join("&");

      const resposta = await fetch(`${API_URL}/salvar_item`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: corpo,
      });

      if (resposta.ok) {
        Alert.alert("Sucesso!", "Produto salvo no banco.");
        limpar();
      } else {
        Alert.alert("Erro", "O servidor recusou o cadastro.");
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
          <Text style={styles.titulo}>Adicionar Novo Produto</Text>

          <Text style={styles.label}>Nome do Produto:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Multímetro"
            placeholderTextColor="#888"
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.label}>Quantidade em Estoque:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={quantidade}
            onChangeText={setQuantidade}
          />

          <Text style={styles.label}>Descrição:</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Digite a descrição"
            placeholderTextColor="#888"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={descricao}
            onChangeText={setDescricao}
          />

          <Text style={styles.label}>Preço (R$):</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#888"
            value={preco}
            onChangeText={setPreco}
          />

          <Text style={styles.label}>Categoria:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Elétrica, Ferramentas"
            placeholderTextColor="#888"
            value={categoria}
            onChangeText={setCategoria}
          />

          <Text style={styles.label}>Link da Foto do Produto:</Text>
          <TextInput
            style={styles.input}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="https://exemplo.com/imagem.jpg"
            placeholderTextColor="#888"
            value={foto}
            onChangeText={setFoto}
          />

          <TouchableOpacity
            style={[styles.botaoSalvar, carregando && styles.botaoDesativado]}
            onPress={salvar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botaoTexto}>Salvar no Banco</Text>
            )}
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
  tela: { flex: 1, backgroundColor: "#005084" },
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
  textarea: { minHeight: 80 },
  botaoSalvar: {
    backgroundColor: "#0d6efd",
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