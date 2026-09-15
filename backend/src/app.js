import express from "express";
import cors from "cors";
import negociosRoutes from "./routes/negocios.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
	res.json({
		message: "API CodeFix Express funcionando",
	});
});

app.use("/api/negocios", negociosRoutes);
app.use("/api/auth", authRoutes);

// Debe ir al final: captura los errores que `next(err)` propaga desde
// cualquier ruta o middleware anterior.
app.use(errorHandler);

export default app;
