import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Usa a variável de ambiente MONGO_URI do arquivo .env
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/lev-auth';
    
    console.log(`Conectando ao MongoDB em: ${mongoUri}`);
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Erro na conexão com MongoDB: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    process.exit(1);
  }
};

export default connectDB;