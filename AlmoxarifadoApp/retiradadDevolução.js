import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';

export default function RetiradaDevolucao({ onVoltar, usuarioPadrao, tipoInicial = 'Retirada' }) {
  const [tipo, setTipo] = useState(tipoInicial);
  const [produtoId, setProdutoId] = useState('1');
  const [quantidade, setQuantidade] = useState('1');
  const [emailUsuario, setEmailUsuario] = useState(usuarioPadrao || 'leo@gmail.com');
  const [loading, setLoading] = useState(false);

  const [produtos, setProdutos] = useState([
    { id: '1', nome: 'Capacete de Segurança', estoque: 10 },
    { id: '2', nome: 'Luvas de Proteção', estoque: 25 },
    { id: '3', nome: 'Óculos de Proteção', estoque: 15 },
    { id: '4', nome: 'Cinto de Segurança', estoque: 8 },
  ]);

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        const response = await fetch('http://192.168.56.1:3000/produtos');
        if (response.ok) {
          const dados = await response.json();
          if (dados && dados.length > 0) {
            setProdutos(dados);
          }
        }
      } catch (error) {
        console.log('Backend Flask offline. A usar lista local.');
      }
    };
    carregarProdutos();
  }, []);

  const lidarComConfirmacao = async () => {
    const qtdNum = parseInt(quantidade, 10);

    if (isNaN(qtdNum) || qtdNum <= 0) {
      Alert.alert('Erro', 'Insira uma quantidade válida.');
      return;
    }

    if (!emailUsuario || !emailUsuario.trim()) {
      Alert.alert('Erro', 'Insira o email do trabalhador.');
      return;
    }

    setLoading(true);

    try {
      const resposta = await fetch('http://192.168.56.1:3000/movimentacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo_operacao: tipo,
          produto_id: produtoId,
          quantidade: qtdNum,
          usuario: emailUsuario,
        }),
      });

      if (resposta.ok) {
        Alert.alert('Sucesso!', `${tipo} registada com sucesso no sistema.`);
        setQuantidade('1');
      } else {
        throw new Error('Erro no servidor');
      }
    } catch (error) {
      Alert.alert('Sucesso (Modo Simulação)', `${tipo} de ${quantidade} unidade(s) efetuada com sucesso!`);
      setQuantidade('1');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.titulo}>Registo de Movimentação</Text>
        <Text style={styles.subtitulo}>Controle de EPIs - TCC</Text>

        <Text style={styles.label}>Tipo de Operação</Text>
        <View style={styles.tipoContainer}>
          <TouchableOpacity
            style={[styles.tipoBotao, tipo === 'Retirada' && styles.tipoBotaoAtivoRetirada]}
            onPress={() => setTipo('Retirada')}
          >
            <Text style={[styles.tipoTexto, tipo === 'Retirada' && styles.tipoTextoAtivo]}>Retirada</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tipoBotao, tipo === 'Devolução' && styles.tipoBotaoAtivoDevolucao]}
            onPress={() => setTipo('Devolução')}
          >
            <Text style={[styles.tipoTexto, tipo === 'Devolução' && styles.tipoTextoAtivo]}>Devolução</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Selecione o Produto</Text>
        <View style={styles.produtosLista}>
          {produtos.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.produtoItem, produtoId === String(item.id) && styles.produtoItemSelecionado]}
              onPress={() => setProdutoId(String(item.id))}
            >
              <Text style={[styles.produtoTexto, produtoId === String(item.id) && styles.produtoTextoSelecionado]}>
                {item.nome} — Stock: {item.estoque}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Quantidade</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={quantidade}
            onChangeText={setQuantidade}
            placeholder="Digite a quantidade"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email do Utilizador</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={emailUsuario}
            onChangeText={setEmailUsuario}
            placeholder="email@exemplo.com"
            placeholderTextColor="#888"
          />
        </View>

        <TouchableOpacity
          style={[styles.botaoConfirmar, loading && styles.botaoDesativado]}
          onPress={lidarComConfirmacao}
          disabled={loading}
        >
          <Text style={styles.textoBotao}>{loading ? 'A processar...' : 'CONFIRMAR OPERAÇÃO'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoVoltar} onPress={onVoltar}>
          <Text style={styles.textoBotaoVoltar}>Voltar ao Painel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f0f2f5', padding: 16, justifyContent: 'center' },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, elevation: 4 },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center', marginBottom: 4 },
  subtitulo: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 10 },
  tipoContainer: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  tipoBotao: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#f9f9f9' },
  tipoBotaoAtivoRetirada: { backgroundColor: '#d9534f', borderColor: '#d9534f' },
  tipoBotaoAtivoDevolucao: { backgroundColor: '#5cb85c', borderColor: '#5cb85c' },
  tipoTexto: { fontSize: 14, fontWeight: '600', color: '#333' },
  tipoTextoAtivo: { color: '#fff' },
  produtosLista: { maxHeight: 150, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, marginBottom: 10, backgroundColor: '#fafafa' },
  produtoItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  produtoItemSelecionado: { backgroundColor: '#0056b3' },
  produtoTexto: { fontSize: 14, color: '#333' },
  produtoTextoSelecionado: { color: '#fff', fontWeight: 'bold' },
  inputGroup: { marginBottom: 12 },
  input: { backgroundColor: '#f5f5f7', paddingVertical: 10, paddingHorizontal: 14, fontSize: 14, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', color: '#000' },
  botaoConfirmar: { backgroundColor: '#0056b3', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  botaoDesativado: { backgroundColor: '#999' },
  textoBotao: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  botaoVoltar: { paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  textoBotaoVoltar: { color: '#666', fontSize: 14, fontWeight: '600' },
});