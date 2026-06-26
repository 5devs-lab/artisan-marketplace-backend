const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Artisan Service Marketplace API',
      version: '1.0.0',
      description: 'API documentation for the Artisan Service Backend (MVP)',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    path.resolve(process.cwd(), 'src/features/**/*.swagger.ts'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

// Write to swagger.json file
fs.writeFileSync(
  path.resolve(process.cwd(), 'swagger.json'),
  JSON.stringify(swaggerSpec, null, 2),
  'utf8'
);

console.log('swagger.json generated successfully!');
