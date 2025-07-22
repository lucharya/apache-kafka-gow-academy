import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectKafkaProducer } from './lib/kafka';
import { createOrder } from './controllers/orderController';
import { setupSwagger } from './config/swagger';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

setupSwagger(app);

app.post('/orders', createOrder);

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await connectKafkaProducer();
        app.listen(PORT, () => {
            console.log(`🚀 Order service rodando em http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Falha ao iniciar serviço:', error);
        process.exit(1);
    }
}

start();
