import { Kafka, logLevel } from "kafkajs";

const kafka = new Kafka({
    clientId: "payment-service-setup",
    brokers: process.env.KAFKA_BROKERS?.split(",") || ["localhost:9092"],
    logLevel: logLevel.INFO,
});

const admin = kafka.admin();

export async function setupTopics() {
    await admin.connect();
    const topics = [
        {
            topic: "payment-confirmed",
            numPartitions: 3,
            replicationFactor: 3,
        },
        {
            topic: "payment-failed",
            numPartitions: 3,
            replicationFactor: 3,
        },
    ];

    const existingTopics = await admin.listTopics();

    for (const topic of topics) {
        if (!existingTopics.includes(topic.topic)) {
            console.log(`Criando tópico: ${topic.topic}`);
            await admin.createTopics({
                topics: [topic],
            });
        } else {
            console.log(`Tópico já existe: ${topic.topic}`);
        }
    }

    await admin.disconnect();
}
