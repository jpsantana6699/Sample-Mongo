import { Schema } from 'mongoose';
import LogService from '../services/LogService';
import { getNamespaceData } from '../utils/namespaceData';

/**
 * Registra hooks para log de exclusão de documentos
 * @param schema Schema do Mongoose para adicionar o hook
 * @param collectionName Nome da coleção (opcional)
 */
const registerDestroyLog = (schema: Schema, collectionName?: string) => {
  // Para soft delete - assumindo que "deletedAt" é o campo usado para soft delete
  schema.pre('save', async function() {
    // @ts-ignore
    if (this.isModified('deletedAt') && this.deletedAt) {
      // @ts-ignore
      this._oldDoc = await this.constructor.findById(this._id);
    }
  });

  schema.post('save', async function(doc) {
    // @ts-ignore
    if (this.isModified('deletedAt') && this.deletedAt && this._oldDoc) {
      const { requestId, userId, userIp } = getNamespaceData();
      
      const modelName = (this.constructor as any).modelName;
      const actualCollectionName = collectionName || modelName;
      
      const logData = {
        requestId,
        userId,
        userIp,
        action: 'SOFT DELETE',
        collectionName: actualCollectionName,
        // @ts-ignore
        valuesOld: JSON.stringify(this._oldDoc?.toJSON()),
        valuesNew: JSON.stringify(doc.toJSON()),
        createdAt: new Date(),
      };
      
      await LogService.create(logData);
    }
  });

  // Para hard delete
  schema.pre('findOneAndDelete', async function() {
    const docToDelete = await this.model.findOne(this.getQuery());
    if (docToDelete) {
      // Assign to the query context with type assertion
      (this as any)._oldDoc = docToDelete.toJSON();
    }
  });

  schema.post('findOneAndDelete', async function() {
    if ((this as any)._oldDoc) {
      const { requestId, userId, userIp } = getNamespaceData();
      
      const modelName = this.model.modelName;
      const actualCollectionName = collectionName || modelName;
      
      const logData = {
        requestId,
        userId,
        userIp,
        action: 'DELETE',
        collectionName: actualCollectionName,
        valuesOld: JSON.stringify((this as any)._oldDoc),
        valuesNew: JSON.stringify({}),
        createdAt: new Date(),
      };
      
      await LogService.create(logData);
    }
  });
};

export default registerDestroyLog;