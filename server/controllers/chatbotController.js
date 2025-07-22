// backend/controllers/chatbotController.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// --- Static Farm Data ---
const farmData = `
Our farm is named 'FarmConnect'. We are a platform connecting customers directly with farmers.
- Product Offerings: We list seasonal vegetables, fruits, dairy products, and fresh meats from local partner farms.
- How it Works: Customers can browse products, place an order, and choose home delivery or pickup.
- Delivery: We deliver on Wednesdays and Saturdays. Delivery fees vary.
- Our Mission: To support local agriculture and make fresh food accessible.
`;

// Initialize the Gemini Pro model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const chatWithBot = async (req, res) => {
    try {
        // --- NEW: Destructure message AND context from the request body ---
        const { message, context } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // --- NEW: Dynamically build context for the AI ---
        let dynamicContext = farmData;

        if (context && context.purchases && context.purchases.length > 0) {
            // Simplify the purchase data for the AI prompt to save tokens and improve clarity
            const simplifiedPurchases = context.purchases.map(p => ({
                crop: p.cropName,
                quantity: `${p.quantity} ${p.unit}`,
                price: `₹${p.totalPrice.toFixed(2)}`,
                status: p.status,
                date: new Date(p.createdAt).toLocaleDateString()
            }));

            dynamicContext += `\n\n--- USER'S PERSONAL ORDER HISTORY ---
            Here is the user's personal order history. Use this information to answer questions about their specific orders.
            ${JSON.stringify(simplifiedPurchases, null, 2)}
            `;
        } else {
            dynamicContext += "\n\nThe user has not made any purchases yet.";
        }


        // --- NEW: Updated Prompt ---
        const prompt = `
        You are a friendly and helpful customer support chatbot for an online farm marketplace called 'FarmConnect'.
        Your primary goal is to answer user questions based ONLY on the information provided below. This includes general info and the user's personal order history.
        If a question cannot be answered from the information, you must say: "I'm sorry, I don't have that information. Please contact our support team for more details."

        --- INFORMATION ---
        ${dynamicContext}
        ---

        Now, please answer the following customer question concisely and in a friendly tone:
        Customer: "${message}"
        Chatbot:
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error('Error in chatWithBot controller:', error);
        res.status(500).json({ error: 'Failed to get a response from the chatbot.' });
    }
};

module.exports = { chatWithBot };