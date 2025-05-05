import { Schema } from 'mongoose';
import LogService from '../services/LogService';
import { getNamespaceData } from '../utils/namespaceData';
import registerCreateLog from './createLogHook';
import registerUpdateLog from './updateLogHook';
import registerDeleteLog from './destroyLogHook';
import registerRestoreLog from './restoreLogHook';
import registerBulkCreateLog from './bulkCreateLogHook';

/**
 * Classe de utilitários para registrar hooks de log em schemas do Mongoose
 */
export class MongooseLogHooks {
  /**
   * Registra todos os hooks para um schema do Mongoose
   * @param schema O schema do Mongoose
   * @param collectionName Nome da coleção (opcional, usa o modelName por padrão)
   */
  static registerLogHooks(schema: Schema, collectionName?: string) {
    // Registra os hooks para diferentes operações
    registerCreateLog(schema, collectionName);
    registerBulkCreateLog(schema, collectionName);
    registerUpdateLog(schema, collectionName);
    registerDeleteLog(schema, collectionName);
    registerRestoreLog(schema, collectionName);
  }
}

export default MongooseLogHooks;