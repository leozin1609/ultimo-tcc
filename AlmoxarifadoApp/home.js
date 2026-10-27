// home.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, ScrollView } from 'react-native';

export default function Home({ onLogout, onNavegarOperacao, onNavegarEstoque, onNavegarCadastro }) {
  const [secaoAtiva, setSecaoAtiva] = useState(null);

  const historico = [
    { id: '1', item: 'Capacete de Segurança', acao: 'Retirada', data: '05/10/2026' },
    { id: '2', item: 'Cinto de Segurança', acao: 'Devolução', data: '04/10/2026' },
  ];

  return (
    <ImageBackground
      source={require('./assets/trabalhador.png')}
      style={styles.background}
      resizeMode="cover"
      imageStyle={{ objectPosition: 'center' }}
    >
      <View style={styles.overlay}>
        <View style={styles.conteudoCentralizado}>
          <Text style={styles.titulo}>Painel do Trabalhador</Text>

          <View style={styles.menuBotoes}>
            <TouchableOpacity 
              style={styles.botao} 
              onPress={() => onNavegarOperacao('Retirada')}
            >
              <Text style={styles.textoBotao}>Retirada/Devolução</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.botao} 
              onPress={onNavegarEstoque}
            >
              <Text style={styles.textoBotao}>Estoque Geral</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.botao, secaoAtiva === 'historico' && styles.botaoAtivo]} 
              onPress={() => setSecaoAtiva(secaoAtiva === 'historico' ? null : 'historico')}
            >
              <Text style={styles.textoBotao}>Histórico</Text>
            </TouchableOpacity>
          </View>

          {/* Botão de Cadastro de Usuários em destaque */}
          <TouchableOpacity 
            style={styles.botaoCadastro} 
            onPress={onNavegarCadastro}
          >
            <Text style={styles.textoBotaoCadastro}>Cadastrar Usuários</Text>
          </TouchableOpacity>

          <ScrollView style={styles.conteudo}>
            {secaoAtiva === 'historico' && (
              <View style={styles.cardInfo}>
                <Text style={styles.subtitulo}>Tabela de Histórico</Text>
                <View style={styles.tabelaCabecalho}>
                  <Text style={[styles.coluna, styles.textoNegrito]}>Item</Text>
                  <Text style={[styles.coluna, styles.textoNegrito]}>Ação</Text>
                  <Text style={[styles.coluna, styles.textoNegrito]}>Data</Text>
                </View>
                {historico.map((row) => (
                  <View key={row.id} style={styles.tabelaLinha}>
                    <Text style={styles.coluna}>{row.item}</Text>
                    <Text style={styles.coluna}>{row.acao}</Text>
                    <Text style={styles.coluna}>{row.data}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {onLogout && (
            <TouchableOpacity style={styles.botaoSair} onPress={onLogout}>
              <Text style={styles.textoBotaoSair}>Sair</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.45)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 40 },
  conteudoCentralizado: { width: '100%', maxWidth: 450, flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 24, fontWeight: '700', color: '#ffffff', marginBottom: 20, textAlign: 'center' },
  menuBotoes: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 12 },
  botao: { flex: 1, backgroundColor: '#0056B3', paddingVertical: 12, marginHorizontal: 3, borderRadius: 8, alignItems: 'center' },
  botaoAtivo: { backgroundColor: '#003366' },
  textoBotao: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
  botaoCadastro: { backgroundColor: '#28A745', paddingVertical: 12, borderRadius: 8, alignItems: 'center', width: '100%', marginBottom: 15 },
  textoBotaoCadastro: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  conteudo: { flex: 1, width: '100%' },
  cardInfo: { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 12, padding: 16, elevation: 3 },
  subtitulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333333' },
  tabelaCabecalho: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#0056B3', paddingBottom: 8, marginBottom: 8 },
  tabelaLinha: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  coluna: { flex: 1, fontSize: 12, color: '#333333' },
  textoNegrito: { fontWeight: 'bold' },
  botaoSair: { backgroundColor: '#D9534F', paddingVertical: 12, borderRadius: 8, alignItems: 'center', width: '100%', marginTop: 10 },
  textoBotaoSair: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
});