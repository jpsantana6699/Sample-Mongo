import LogModel, { ILog } from '../models/LogModel';

class LogService {
  async create(logData: Partial<ILog>): Promise<ILog> {
    try {
      const log = await LogModel.create(logData);
      return log;
    } catch (error: any) {
      console.error(`Erro ao criar log: ${error.message}`);
      throw error;
    }
  }

  async getAll(
    page: number = 1,
    pageSize: number = 10,
    filters: any = {}
  ): Promise<ILog[]> {
    const skip = (page - 1) * pageSize;
    
    return await LogModel.find(filters)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });
  }
}

export default new LogService();