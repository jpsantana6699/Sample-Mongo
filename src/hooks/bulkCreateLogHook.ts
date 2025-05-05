import { Schema } from 'mongoose';
import LogService from '../services/LogService';
import { getNamespaceData } from '../utils/namespaceData';

/**
 * Registra hooks para log de criação em massa de documentos
 * @param schema Schema do Mongoose para adicionar o hook
 * @param collectionName Nome da coleção (opcional)
 */
const registerBulkCreateLog = (schema: Schema, collectionName?: string) => {
  schema.post('insertMany', async function(this: any, docs) {
    const { requestId, userId, userIp } = getNamespaceData();
    
    const modelName = this.constructor?.modelName || (Array.isArray(docs) && docs.length > 0 ? docs[0]?.constructor?.modelName : undefined);
    const actualCollectionName = collectionName || modelName;
    
    const logData = {
      requestId,
      userId,
      userIp,
      action: 'BULK CREATE',
      collectionName: actualCollectionName,
      valuesOld: JSON.stringify({}),
      valuesNew: JSON.stringify(docs),
      createdAt: new Date(),
    };
    
    await LogService.create(logData);
  });
};

export default registerBulkCreateLog;