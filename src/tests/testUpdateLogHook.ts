import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../configs/database';
import UserModel from '../models/UserModel';
import LogModel from '../models/LogModel';
import { AsyncLocalStorage } from 'async_hooks';

// Simulação do namespace para teste
const asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

// Sobrescreve o módulo namespaceData para os testes
// @ts-ignore
import * as namespaceModule from '../utils/namespaceData';
// @ts-ignore
namespaceModule.getNamespaceData = () => {
  const store = asyncLocalStorage.getStore();
  if (!store) {
    return {
      requestId: 'test-request-id',
      userId: 'test-user-id',
      userIp: '127.0.0.1'
    };
  }
  
  return {
    requestId: store.get('requestId'),
    userId: store.get('userId'),
    userIp: store.get('userIp'),
  };
};

// Função para executar código dentro do namespace
const runWithNamespace = async (callback: () => Promise<any>) => {
  const store = new Map();
  store.set('requestId', `test-${Date.now()}`);
  store.set('userId', 'test-user-id');
  store.set('userIp', '127.0.0.1');
  
  return asyncLocalStorage.run(store, callback);
};

// Função principal para testar o hook de atualização
const testUpdateLogHook = async () => {
  try {
    // Conectar ao banco de dados
    await connectDB();
    console.log('Conectado ao MongoDB');

    // Criar um usuário de teste dentro do namespace
    console.log('Criando usuário de teste...');
    const user = await runWithNamespace(async () => {
      return UserModel.create({
        name: 'Usuário Teste',
        email: `teste-${Date.now()}@exemplo.com`,
        password: 'Teste123456'
      });
    });
    
    console.log(`Usuário criado com ID: ${user._id}`);
    
    // Aguardar um momento para garantir que o log de criação foi gerado
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Buscar logs antes da atualização
    const logsBefore = await LogModel.find({ action: 'CREATE' }).sort({ createdAt: -1 }).limit(1);
    console.log('Log de criação:', JSON.stringify(logsBefore[0], null, 2));
    
    // Atualizar o usuário usando save()
    console.log('\nAtualizando usuário com save()...');
    await runWithNamespace(async () => {
      user.name = 'Usuário Atualizado';
      await user.save();
    });
    
    // Aguardar um momento para garantir que o log de atualização foi gerado
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Testar usando findOneAndUpdate
    console.log('\nAtualizando usuário com findOneAndUpdate...');
    await runWithNamespace(async () => {
      await UserModel.findOneAndUpdate(
        { _id: user._id },
        { name: 'Usuário Atualizado via findOneAndUpdate' },
        { new: true }
      );
    });
    
    // Aguardar um momento para garantir que o log de atualização foi gerado
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Buscar logs de atualização
    const logsAfter = await LogModel.find({ action: 'UPDATE' }).sort({ createdAt: -1 }).limit(5);
    
    // Verificar se os logs foram registrados corretamente
    console.log('\nVerificando logs de atualização...');
    
    if (logsAfter.length > 0) {
      console.log('\n✅ Hooks de log de atualização funcionando corretamente!');
      console.log(`Total de logs de atualização: ${logsAfter.length}`);
      
      // Exibir detalhes dos logs
      logsAfter.forEach((log, index) => {
        console.log(`\nLog de atualização ${index + 1}:`);
        console.log('ID:', log._id);
        console.log('Tabela:', log.collection || log.collectionName);
        console.log('Valores antigos:', log.valuesOld);
        console.log('Valores novos:', log.valuesNew);
        console.log('Data:', log.createdAt);
      });
    } else {
      console.log('❌ Nenhum log de atualização encontrado!');
    }
    
  } catch (error) {
    console.error('Erro durante o teste:', error);
  } finally {
    // Desconectar do banco de dados
    await mongoose.disconnect();
    console.log('\nDesconectado do MongoDB');
  }
};

// Executar o teste
console.log('Iniciando teste do updateLogHook...');
testUpdateLogHook();