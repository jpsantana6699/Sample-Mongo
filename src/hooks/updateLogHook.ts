import { Schema, HydratedDocument, Query } from 'mongoose';
import LogService from '../services/LogService';
import { getNamespaceData } from '../utils/namespaceData';

/**
 * Registra hooks para log de atualização de documentos
 * @param schema Schema do Mongoose para adicionar o hook
 * @param collectionName Nome da coleção (opcional)
 */
const registerUpdateLog = (schema: Schema, collectionName?: string) => {
  // Usando um Map para armazenar documentos originais
  // pois não podemos adicionar propriedades diretamente ao objeto de consulta
  const originalDocuments = new Map<string, any>();

  // Captura os dados originais antes da atualização
  schema.pre('findOneAndUpdate', async function() {
    const query = this.getQuery();
    const queryId = JSON.stringify(query);
    const originalDoc = await this.model.findOne(query).lean();
    
    if (originalDoc) {
      originalDocuments.set(queryId, originalDoc);
    }
  });

  // Hook para save (quando é uma atualização e não uma criação)
  schema.post('save', async function(doc) {
    if (!this.isNew) {
      const { requestId, userId, userIp } = getNamespaceData();
      
      const modelName = (this.constructor as any).modelName;
      const actualCollectionName = collectionName || modelName;
      
      // Aqui não podemos pegar os valores antigos, apenas os novos
      const logData = {
        requestId,
        userId,
        userIp,
        action: 'UPDATE',
        collectionName: actualCollectionName,
        valuesOld: JSON.stringify({}),
        valuesNew: JSON.stringify(doc.toJSON()),
        createdAt: new Date(),
      };
      
      await LogService.create(logData);
    }
  });

  // Log após findOneAndUpdate
  schema.post('findOneAndUpdate', async function(doc) {
    if (!doc) return;
    
    const { requestId, userId, userIp } = getNamespaceData();
    const modelName = doc.constructor ? (doc.constructor as any).modelName : this.model.modelName;
    const actualCollectionName = collectionName || modelName;
    
    // Recuperar o documento original do Map usando a consulta como chave
    const queryId = JSON.stringify(this.getQuery());
    const originalDoc = originalDocuments.get(queryId) || {};
    
    // Limpar o Map para evitar vazamento de memória
    originalDocuments.delete(queryId);

    const logData = {
      requestId,
      userId,
      userIp,
      action: 'UPDATE',
      collectionName: actualCollectionName,
      valuesOld: JSON.stringify(originalDoc),
      valuesNew: JSON.stringify(doc.toJSON ? doc.toJSON() : doc),
      createdAt: new Date(),
    };
    
    await LogService.create(logData);
  });

  // Modificado para usar interface de documento, evitando erros de tipagem
  schema.pre('updateOne', { document: true, query: false }, function(this: HydratedDocument<any>) {
    // Armazenar estado atual do documento antes da atualização
    // @ts-ignore _doc existe em documentos Mongoose mesmo que o TypeScript não o reconheça
    this._originalState = JSON.parse(JSON.stringify(this._doc || this.toObject()));
  });

  schema.post('updateOne', { document: true, query: false }, async function(this: HydratedDocument<any>) {
    const { requestId, userId, userIp } = getNamespaceData();
    
    const modelName = (this.constructor as any).modelName;
    const actualCollectionName = collectionName || modelName;
    
    const logData = {
      requestId,
      userId,
      userIp,
      action: 'UPDATE',
      collectionName: actualCollectionName,
      valuesOld: JSON.stringify(this._originalState || {}),
      valuesNew: JSON.stringify(this.toJSON()),
      createdAt: new Date(),
    };
    
    await LogService.create(logData);
  });
};

export default registerUpdateLog;