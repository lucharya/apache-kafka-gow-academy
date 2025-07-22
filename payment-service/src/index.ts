import { Kafka, logLevel, Partitioners } from "kafkajs";
import { setupTopics } from "./kafkaSetup";

const kafka = new Kafka({
    clientId: "payment-service",
    brokers: process.env.KAFKA_BROKERS?.split(",") || ["localhost:9092"],
    logLevel: logLevel.INFO,
});

const consumer = kafka.consumer({ groupId: "payment-group" });
const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
});

const processPayment = async (order: any) => {
    const success = Math.random() > 0.3;

    const baseResponse = {
        paymentId: `pay_${order.orderId}_${Date.now()}`,
        orderId: order.orderId,
        amount: order.amount,
        timestamp: new Date().toISOString(),
        customerEmail: order.customerEmail,
        customerName: order.customerName,
    };

    if (success) {
        return {
            ...baseResponse,
            status: "SUCCESS",
        };
    } else {
        return {
            ...baseResponse,
            status: "FAILED",
            failureReason: "Cartão recusado",
        };
    }
};

async function run() {
    await setupTopics();

    await consumer.connect();
    await producer.connect();

    await consumer.subscribe({ topic: "order-created", fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const order = JSON.parse(message.value!.toString());
            console.log("Recebido order-created:", order);

            const paymentResult = await processPayment(order);

            const topicToSend = paymentResult.status === "SUCCESS" ? "payment-confirmed" : "payment-failed";

            await producer.send({
                topic: topicToSend,
                messages: [{ value: JSON.stringify(paymentResult) }],
            });

            console.log(`Pagamento processado, evento enviado para ${topicToSend}:`, paymentResult);
        },
    });
}

run().catch((error) => {
    console.error("Erro no serviço payment:", error);
    process.exit(1);
});
