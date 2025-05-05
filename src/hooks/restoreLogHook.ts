import { Schema } from 'mongoose';
import LogService from '../services/LogService';
import { getNamespaceData } from '../utils/namespaceData';

/**
 * Registra hooks para log de restauração de documentos
 * @param schema Schema do Mongoose para adicionar o hook
 * @param collectionName Nome da coleção (opcional)
 */
const registerRestoreLog = (schema: Schema, collectionName?: string) => {
  // Para restore (quando deletedAt é definido como null)
  schema.pre('save', async function() {
    // @ts-ignore
    const isRestore = this.isModified('deletedAt') && !this.deletedAt && this._id;
    
    if (isRestore) {
      // @ts-ignore
      this._oldDoc = await this.constructor.findById(this._id);
    }
  });

  schema.post('save', async function(doc) {
    // @ts-ignore
    const isRestore = this.isModified('deletedAt') && !this.deletedAt && this._oldDoc;
    
    if (isRestore) {
      const { requestId, userId, userIp } = getNamespaceData();
      
      const modelName = (this.constructor as any).modelName;
      const actualCollectionName = collectionName || modelName;
      
      const logData = {
        requestId,
        userId,
        userIp,
        action: 'RESTORE',
        collectionName: actualCollectionName,
        // @ts-ignore
        valuesOld: JSON.stringify(this._oldDoc?.toJSON()),
        valuesNew: JSON.stringify(doc.toJSON()),
        createdAt: new Date(),
      };
      
      await LogService.create(logData);
    }
  });
};

export default registerRestoreLog;