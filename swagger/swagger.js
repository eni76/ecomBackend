const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "My API Documentation",
            version: "1.0.0",
            description: "API documentation for my grandeur e-commerce backend",
        },
        servers: [
            {
                url: "https://ecombackend-ihay.onrender.com", // Changed to https
            },
        ],
    },

    // Path where your route files are located
    apis: ["./routers/*.js"], // Fixed: was ./routes/*.js
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };