import { Schema } from 'mongoose';
import LogService from '../services/LogService';
import { getNamespaceData } from '../utils/namespaceData';

/**
 * Registra hooks para log de criação de documentos
 * @param schema Schema do Mongoose para adicionar o hook
 * @param collectionName Nome da coleção (opcional)
 */
const registerCreateLog = (schema: Schema, collectionName?: string) => {
  schema.post('save', async function(doc) {
    if (this.isNew) {
      const { requestId, userId, userIp } = getNamespaceData();
      
      const modelName = (this.constructor as any).modelName;
      const actualCollectionName = collectionName || modelName;
      
      const logData = {
        requestId,
        userId,
        userIp,
        action: 'CREATE',
        collectionName: actualCollectionName,
        valuesOld: JSON.stringify({}),
        valuesNew: JSON.stringify(doc.toJSON()),
        createdAt: new Date(),
      };
      
      await LogService.create(logData);
    }
  });
};

export default registerCreateLog;