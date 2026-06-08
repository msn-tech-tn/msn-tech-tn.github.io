import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const companyKnowledge = {
  name: "MSN Technologies",
  about:
    "MSN Technologies helps organizations accelerate growth through software engineering, AI innovation, cloud adoption, website development, and digital transformation.",
  contact: {
    email: "hr@msn-tech.com",
    address: "Collierville, Tennessee",
  },
  services: [
    {
      title: "Application Development",
      description:
        "Custom web and mobile applications built with modern technologies.",
    },
    {
      title: "AI & Machine Learning",
      description:
        "Intelligent automation, chatbots, analytics and AI solutions.",
    },
    {
      title: "Web Design",
      description:
        "Modern websites that convert visitors into customers.",
    },
    {
      title: "Digital Marketing",
      description:
        "SEO, social media marketing, analytics and growth strategies.",
    },
    {
      title: "Cloud Solutions",
      description:
        "Scalable cloud infrastructure and DevOps implementation.",
    },
    {
      title: "Cyber Security",
      description:
        "Security assessments and protection for your digital assets.",
    },
  ],
};

function buildCompanyPrompt(question) {
  const serviceLines = companyKnowledge.services
    .map((service) => `- ${service.title}: ${service.description}`)
    .join("\n");

  return `You are a virtual assistant for MSN Technologies. Answer all questions only using the company information below. If the user asks anything unrelated to MSN Technologies, respond with: "I can only answer questions about MSN Technologies, including our services, contact details, and company overview." Do not hallucinate or invent facts.

Company name: ${companyKnowledge.name}
About: ${companyKnowledge.about}
Contact email: ${companyKnowledge.contact.email}
Contact address: ${companyKnowledge.contact.address}
Services:
${serviceLines}

Question: ${question}`;
}

app.post("/api/chat", async (req, res) => {
  const { question } = req.body;
  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Question is required." });
  }

  try {
    const prompt = buildCompanyPrompt(question);
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant answering only from the MSN Technologies company knowledge base.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 500,
    });

    const answer = completion.choices?.[0]?.message?.content?.trim();
    return res.json({ answer: answer || "I'm sorry, I couldn't generate an answer." });
  } catch (error) {
    console.error("/api/chat error:", error);
    return res.status(500).json({
      error: "Chat backend failed. Please try again later.",
    });
  }
});

app.use(express.static(path.resolve(__dirname, "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
