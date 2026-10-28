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
  Image,
  StyleSheet,
} from "react-native";

// Troque pelo IPv4 do Wi-Fi do seu PC (rode "ipconfig"), sem a barra no final
const API_URL = "http://172.20.208.1:5000";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false); // equivale ao {% if erro %}
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    // Equivale ao "required" e type="email" do HTML
    if (!email.trim() || !senha) {
      Alert.alert("Erro", "Preencha o usuário e a senha.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      Alert.alert("Erro", "Informe um e-mail válido.");
      return;
    }

    setErro(false);
    setCarregando(true);

    // Se o servidor não responder em 8 segundos, cancela e avisa
    const controle = new AbortController();
    const limite = setTimeout(() => controle.abort(), 8000);

    try {
      const corpo =
        `email=${encodeURIComponent(email.trim())}` +
        `&senha=${encodeURIComponent(senha)}`;

      const resposta = await fetch(`${API_URL}/login_app`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: corpo,
        signal: controle.signal,
      });

      if (resposta.ok) {
        const dados = await resposta.json();
        const usuario = email.trim();
        setSenha("");
        // Admin vai para o painel, os demais para a Home
        navigation.replace(dados.tipo === "admin" ? "Admin" : "Home", {
          usuario,
        });
      } else {
        setErro(true);
      }
    } catch (e) {
      if (e.name === "AbortError") {
        Alert.alert(
          "Tempo esgotado",
          "O servidor não respondeu. Confira o IP e se o celular está na mesma rede do PC."
        );
      } else {
        Alert.alert("Erro de conexão", "Não foi possível falar com o servidor.");
      }
    } finally {
      clearTimeout(limite);
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
        <Text style={styles.titulo}>Coloque suas credenciais</Text>

        <View style={styles.imagens}>
          <Image
            source={require("../assents/image.png")}
            style={styles.imagem}
            resizeMode="contain"
          />
          <Image
            source={require("../assents/roger.png")}
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

          {erro && (
            <Text style={styles.erro}>Usuário ou senha inválidos!</Text>
          )}

          <TouchableOpacity
            style={[styles.botao, carregando && styles.botaoDesativado]}
            onPress={entrar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botaoTexto}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: "#003584" },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
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
  erro: { color: "red", marginBottom: 10 },

  botao: {
    backgroundColor: "#6c757d",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",

  },
  botaoDesativado: { opacity: 0.6 },
  botaoTexto: { color: "#fff", fontSize: 18 },
});