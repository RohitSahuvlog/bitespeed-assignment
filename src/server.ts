// src/index.ts
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import identifyRouter from './Router/Identity';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT: number = 3000;

const mongoUri = process.env.MONGO_URI ?? 'mongodb+srv://RohitSahu:XJVghAl8GaBtnriK@cluster0.iepjb1n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as mongoose.ConnectOptions);



app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Node.js + Express!');
});

app.use('/api', identifyRouter);

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});