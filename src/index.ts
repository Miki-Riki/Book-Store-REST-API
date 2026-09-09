import express from "express";
import bookRoutes from "./routes/bookRoutes";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Book Store API is running" });
});

app.use("/books", bookRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
