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

// Mesmo endereço das outras telas (sem a barra no final)
const API_URL = "http://172.20.208.1:5000";

// Equivale às <option> do <select> do HTML
const TIPOS = [
  { valor: "usuario", rotulo: "Usuário Comum" },
  { valor: "admin", rotulo: "Administrador" },
];

export default function CadastroAdmin({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState(""); // começa em "Selecione..."
  const [carregando, setCarregando] = useState(false);

  async function cadastrar() {
    // Equivale ao "required" e type="email" do HTML
    if (!email.trim() || !senha || !tipo) {
      Alert.alert("Erro", "Preencha o email, a senha e o tipo de acesso.");
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
        `&senha=${encodeURIComponent(senha)}` +
        `&tipo=${encodeURIComponent(tipo)}`;

      const resposta = await fetch(`${API_URL}/admincadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: corpo,
      });

      if (resposta.ok) {
        Alert.alert("Sucesso!", "Usuário cadastrado.");
        setEmail("");
        setSenha("");
        setTipo("");
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
          <Text style={styles.titulo}>Painel de Cadastro Admin</Text>

          <Text style={styles.label}>Email do Usuário:</Text>
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Digite o email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Senha:</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
            placeholder="Digite a senha"
            placeholderTextColor="#888"
            value={senha}
            onChangeText={setSenha}
          />

          <Text style={styles.label}>Tipo de Acesso:</Text>
          <View style={styles.tipos}>
            {TIPOS.map((t) => {
              const selecionado = tipo === t.valor;
              return (
                <TouchableOpacity
                  key={t.valor}
                  style={[styles.tipo, selecionado && styles.tipoSelecionado]}
                  onPress={() => setTipo(t.valor)}
                >
                  <Text
                    style={[
                      styles.tipoTexto,
                      selecionado && styles.tipoTextoSelecionado,
                    ]}
                  >
                    {t.rotulo}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.botaoCadastrar, carregando && styles.botaoDesativado]}
            onPress={cadastrar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botaoTexto}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.botaoVoltarTexto}>Voltar ao Painel Admin</Text>
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
    padding: 24,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
    elevation: 4,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0d6efd",
    textAlign: "center",
    marginBottom: 20,
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
  tipos: { flexDirection: "row", gap: 8, marginBottom: 20 },
  tipo: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  tipoSelecionado: { backgroundColor: "#0d6efd", borderColor: "#0d6efd" },
  tipoTexto: { color: "#212529", fontSize: 14 },
  tipoTextoSelecionado: { color: "#fff", fontWeight: "bold" },
  botaoCadastrar: {
    backgroundColor: "#0d6efd",
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  botaoDesativado: { opacity: 0.6 },
  botaoTexto: { color: "#fff", fontSize: 18 },
  botaoVoltar: {
    borderWidth: 1,
    borderColor: "#6c757d",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
  },
  botaoVoltarTexto: { color: "#6c757d", fontSize: 16 },
});