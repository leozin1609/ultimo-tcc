import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";

// IP do PC que roda o Flask (o mesmo que aparece no navegador do seu print)
const API_URL = "http://10.134.50.100:5000/";

export default function Login({ navigation }) {
  const { width } = useWindowDimensions();
  const telaLarga = width >= 700; // navegador/tablet: imagem ao lado, como no site

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    if (!email.trim() || !senha) {
      setErro(true);
      return;
    }

    setCarregando(true);
    try {
      const resposta = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `email=${encodeURIComponent(email.trim())}&senha=${encodeURIComponent(senha)}`,
      });

      // O seu Flask devolve a página HTML (status 200) mesmo com senha errada.
      // Então olhamos o conteúdo: se tiver a mensagem de erro, o login falhou.
      const html = await resposta.text();
      const falhou = !resposta.ok || html.includes("Usuário ou senha inválidos");

      if (falhou) {
        setErro(true);
      } else {
        setErro(false);
        navigation.replace("Home", { usuario: email.trim() });
      }
    } catch (e) {
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }

  const formulario = (
    <ScrollView
      style={styles.painelDireito}
      contentContainerStyle={styles.formContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Image
        source={require("./assets/image.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.form}>
        <Text style={styles.titulo}>Coloque suas credenciais</Text>

        <Text style={styles.label}>Usuário</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu usuário"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
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
          onSubmitEditing={entrar}
        />

        {erro && <Text style={styles.erro}>Usuário ou senha inválidos!</Text>}

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
  );

  return (
    <View style={[styles.tela, telaLarga && styles.telaLarga]}>
      <Image
        source={require("./assets/roger.png")}
        style={telaLarga ? styles.imagemLateral : styles.imagemTopo}
        resizeMode="cover"
      />
      {formulario}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: "#005084" },
  telaLarga: { flexDirection: "row" },

  imagemLateral: { width: "55%", height: "100%" },
  imagemTopo: { width: "100%", height: 200 },

  painelDireito: { flex: 1, backgroundColor: "#005084" },
  formContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 24,
  },

  logo: { width: 260, height: 130, marginBottom: 24 },

  form: { width: "100%", maxWidth: 320 },
  titulo: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    color: "#000",
    fontWeight: "bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 12,
  },
  label: { color: "#fff", marginBottom: 4 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  erro: { color: "#ff4d4d", marginBottom: 10, fontWeight: "600" },
  botao: {
    alignSelf: "flex-start",
    backgroundColor: "#6c757d",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 90,
    alignItems: "center",
  },
  botaoDesativado: { opacity: 0.6 },
  botaoTexto: { color: "#fff", fontSize: 18 },
});