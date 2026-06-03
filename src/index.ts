import "dotenv/config";
import express from "express";
import cors from "cors";
import usersRouter from "./routes/users";
import servicesRouter from "./routes/services";
import contractsRouter from "./routes/contracts";
import schedulesRouter from "./routes/schedules";
import messagesRouter from "./routes/messages";
import availabilityRouter from "./routes/availability";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/users", usersRouter);
app.use("/services", servicesRouter);
app.use("/contracts", contractsRouter);
app.use("/schedules", schedulesRouter);
app.use("/messages", messagesRouter);
app.use("/availability", availabilityRouter);

// Vercel exporta o app; localmente sobe o servidor
if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT ?? 3000;
  app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
  });
}

export default app;
