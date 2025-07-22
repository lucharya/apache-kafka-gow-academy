import { Kafka, logLevel } from "kafkajs";

const kafka = new Kafka({
    clientId: "order-service",
    brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
    logLevel: logLevel.INFO,
});

export const kafkaProducer = kafka.producer();
const admin = kafka.admin();

export const connectKafkaProducer = async () => {

    await admin.connect();

    const topics = await admin.listTopics();
    if (!topics.includes("order-created")) {
        await admin.createTopics({
            topics: [
                {
                    topic: "order-created",
                    numPartitions: 3,
                    replicationFactor: 3,
                },
            ],
        });
        console.log("Tópico 'order-created' criado com sucesso");
    } else {
        console.log("Tópico 'order-created' já existe");
    }

    await admin.disconnect();

    await kafkaProducer.connect();
    console.log("✅ Kafka producer conectado (order-service)");
};
