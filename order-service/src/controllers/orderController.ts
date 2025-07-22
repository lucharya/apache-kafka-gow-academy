import { Request, Response } from "express";
import { kafkaProducer } from "../lib/kafka";
import { randomUUID } from "crypto";
/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Cria uma nova ordem
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Nome:
 *                 type: string
 *                 example: Lucas
 *               Email:
 *                 type: string
 *                 example: lucas@gmail.com
 *               amount:
 *                 type: number
 *                 example: 250.00
 *               Order:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                       example: Manutenção Elétrica
 *                     quantity:
 *                       type: integer
 *                       example: 1
 *               PaymentMethod:
 *                 type: object
 *                 properties:
 *                   number:
 *                     type: string
 *                     example: '1234567890123456'
 *                   cvv:
 *                     type: string
 *                     example: '123'
 *                   expiration:
 *                     type: string
 *                     example: '12/25'
 *     responses:
 *       201:
 *         description: Ordem criada com sucesso
 *       500:
 *         description: Erro ao criar ordem
 */
export const createOrder = async (req: Request, res: Response) => {
    try {
        const { Nome, Email, Amount, Order, PaymentMethod } = req.body;
        debugger;
        var result = await kafkaProducer.send({
            topic: "order-created",
            messages: [
                {
                    key: randomUUID(),
                    value: JSON.stringify({
                        orderId: randomUUID(),
                        customerEmail: Email,
                        customerName: Nome,
                        amount: Amount,
                        items: Order.map((item: any) => ({
                            name: item.description,
                            quantity: item.quantity,
                        })),
                        timestamp: new Date().toISOString(),
                        paymentMethod: {
                            number: PaymentMethod.number,
                            cvv: PaymentMethod.cvv,
                            expiration: PaymentMethod.expiration,
                        },
                    }),
                },
            ],
        });

        console.log("Mensagem enviada para o Kafka:", result);

        return res.status(201).json({ message: "Ordem criada com sucesso." });
    } catch (error) {
        console.error("Erro ao criar ordem:", error);
        return res.status(500).json({ error: "Erro ao criar ordem" });
    }
};
