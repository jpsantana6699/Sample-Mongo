import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/database';
import routes from './routes/index';

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

routes(app);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});