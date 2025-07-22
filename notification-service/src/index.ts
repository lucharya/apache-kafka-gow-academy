import { Kafka } from "kafkajs";
import dotenv from "dotenv";

dotenv.config();

const kafka = new Kafka({
    clientId: "notification-service",
    brokers: process.env.KAFKA_BROKERS!.split(",")
});

const consumer = kafka.consumer({ groupId: "notification-group" });

async function run() {
    await consumer.connect();

    await consumer.subscribe({ topic: "payment-confirmed", fromBeginning: true });
    await consumer.subscribe({ topic: "payment-failed", fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            const value = message.value?.toString();
            if (!value) return;

            const data = JSON.parse(value);

            if (topic === "payment-confirmed") {
                console.log(`📬 Email de pagamento confirmado para ${data.orderId} - ${data.amount}R$`);
            }

            if (topic === "payment-failed") {
                console.log(`⚠️ Email de falha no pagamento do pedido ${data.orderId} - Motivo: ${data.failureReason}`);
            }
        }
    });
}

run().catch(console.error);
