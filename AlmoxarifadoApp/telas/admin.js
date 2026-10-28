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
  Image,
  StyleSheet,
} from "react-native";

// Mesmo endereço das outras telas (sem a barra no final)
const API_URL = "http://172.20.208.1:5000";

export default function CadastroUsuario() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [carregandoLista, setCarregandoLista] = useState(true);

  // Equivale ao {% for item in consulta_banco %} do HTML
  async function carregarUsuarios() {
    setCarregandoLista(true);
    try {
      const resposta = await fetch(`${API_URL}/listar_usuarios`);
      const dados = await resposta.json();
      setUsuarios(dados);
    } catch (e) {
      Alert.alert("Erro de conexão", "Não foi possível carregar os usuários.");
    } finally {
      setCarregandoLista(false);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function cadastrar() {
    // Equivale ao "required" e type="email" do HTML
    if (!email.trim() || !senha) {
      Alert.alert("Erro", "Preencha o usuário e a senha.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      Alert.alert("Erro", "Informe um e-mail válido.");
      return;
    }

    setCarregando(true);
    try {
      const corpo =
        `email=${encodeURIComponent(email.trim())}` +
        `&senha=${encodeURIComponent(senha)}`;

      const resposta = await fetch(`${API_URL}/cadastrar_usuario`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: corpo,
      });

      if (resposta.ok) {
        Alert.alert("Sucesso!", "Usuário cadastrado.");
        setEmail("");
        setSenha("");
        carregarUsuarios();
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
        <Text style={styles.titulo}>Cadastre Novos Usuários</Text>

        <View style={styles.imagens}>
          <Image
            source={{ uri: `${API_URL}/static/image.png` }}
            style={styles.imagem}
            resizeMode="contain"
          />
          <Image
            source={{ uri: `${API_URL}/static/sub_roger.png` }}
            style={styles.imagem}
            resizeMode="contain"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Usuário</Text>
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Digite seu usuário"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
            placeholder="Digite sua senha"
            placeholderTextColor="#888"
            value={senha}
            onChangeText={setSenha}
          />

          <TouchableOpacity
            style={[styles.botao, carregando && styles.botaoDesativado]}
            onPress={cadastrar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botaoTexto}>Cadastrar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Tabela escura listrada (table-dark table-striped) */}
        <View style={styles.tabela}>
          <View style={[styles.linha, styles.cabecalho]}>
            <Text style={[styles.celula, styles.colId, styles.cabecalhoTexto]}>ID</Text>
            <Text style={[styles.celula, styles.colEmail, styles.cabecalhoTexto]}>Email</Text>
            <Text style={[styles.celula, styles.colTipo, styles.cabecalhoTexto]}>Tipo</Text>
          </View>

          {carregandoLista ? (
            <ActivityIndicator color="#fff" style={{ margin: 16 }} />
          ) : (
            usuarios.map((u, i) => (
              <View
                key={u.id}
                style={[styles.linha, i % 2 === 0 && styles.linhaListrada]}
              >
                <Text style={[styles.celula, styles.colId]}>{u.id}</Text>
                <Text style={[styles.celula, styles.colEmail]}>{u.email}</Text>
                <Text style={[styles.celula, styles.colTipo]}>{u.tipo}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: "#003584" },
  container: { flexGrow: 1, padding: 20, alignItems: "center" },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 16,
    textAlign: "center",
  },
  imagens: { width: "100%", alignItems: "center", marginBottom: 16 },
  imagem: { width: 280, height: 120 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    width: "100%",
    maxWidth: 500,
    elevation: 4,
  },
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
  botao: {
    backgroundColor: "#6c757d",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
  },
  botaoDesativado: { opacity: 0.6 },
  botaoTexto: { color: "#fff", fontSize: 18 },

  tabela: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#212529",
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 24,
    marginBottom: 40,
  },
  linha: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 8 },
  cabecalho: { borderBottomWidth: 2, borderBottomColor: "#495057" },
  cabecalhoTexto: { fontWeight: "bold" },
  linhaListrada: { backgroundColor: "#2c3034" },
  celula: { color: "#fff", fontSize: 14 },
  colId: { width: 40 },
  colEmail: { flex: 1 },
  colTipo: { width: 80 },
});