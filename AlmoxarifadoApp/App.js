import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  StyleSheet,
  ScrollView,
} from "react-native";

// No celular, 127.0.0.1 é o próprio celular.
// Troque pelo IP do seu PC na rede (ex.: http://192.168.0.10:5000)
const API_URL = "http://192.168.0.10:5000/";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false);

  async function entrar() {
    try {
      const resposta = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`,
      });

      // Ajuste conforme o que o seu Flask devolve em caso de sucesso/erro
      if (resposta.ok) {
        setErro(false);
        // navegar para a próxima tela aqui
      } else {
        setErro(true);
      }
    } catch (e) {
      setErro(true);
    }
  }

  return (
    <ImageBackground
      source={require("./assets/roger.png")}
      style={styles.fundo}
      resizeMode="cover"
    >
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require("./assets/image.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.titulo}>Coloque suas credenciais</Text>

      <Text style={styles.label}>Usuário</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite seu usuário"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite sua senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      {erro && <Text style={styles.erro}>Usuário ou senha inválidos!</Text>}

      <TouchableOpacity style={styles.botao} onPress={entrar}>
        <Text style={styles.botaoTexto}>Entrar</Text>
      </TouchableOpacity>
    </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1 },
  container: {
    flexGrow: 1,
    backgroundColor: "rgba(0, 80, 132, 0.45)", // película azul para dar leitura
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logo: { width: 260, height: 160, marginBottom: 24 },
  titulo: {
    backgroundColor: "#fff",
    color: "#000",
    fontWeight: "bold",
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  label: { alignSelf: "flex-start", color: "#fff", marginBottom: 4 },
  input: {
    alignSelf: "stretch",
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },
  erro: { color: "red", marginBottom: 10 },
  botao: {
    alignSelf: "flex-start",
    backgroundColor: "#6c757d",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  botaoTexto: { color: "#fff", fontSize: 18 },
});