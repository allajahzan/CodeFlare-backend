import express from "express";

// Create express app
const app = express(); 

// Middlewares
app.use(express.json()); 

// Export app
export default app;
