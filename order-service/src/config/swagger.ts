import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Order Service API',
            version: '1.0.0',
        },
    },
    apis: ['./src/server.ts', './src/controllers/*.ts'],
};


const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
