import "dotenv/config";
import express from "express";
import cors from "cors";
import usersRouter from "./routes/users";
import servicesRouter from "./routes/services";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", usersRouter);
app.use("/services", servicesRouter);

// Vercel exporta o app; localmente sobe o servidor
if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT ?? 3000;
  app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
  });
}

export default app;
