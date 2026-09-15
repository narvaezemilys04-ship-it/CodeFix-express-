import express from "express";
import cors from "cors";
import negociosRoutes from "./routes/negocios.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
	res.json({
		message: "API CodeFix Express funcionando",
	});
});

app.use("/api/negocios", negociosRoutes);

export default app;
