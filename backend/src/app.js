import express from "express";
import cors from "cors";
import negociosRoutes from "./routes/negocios.routes.js";
import authRoutes from "./routes/auth.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import categoriasRoutes from "./routes/categorias.routes.js";
import productosRoutes from "./routes/productos.routes.js";
import inventarioRoutes from "./routes/inventario.routes.js";
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
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/inventario", inventarioRoutes);

// Debe ir al final: captura los errores que `next(err)` propaga desde
// cualquier ruta o middleware anterior.
app.use(errorHandler);

export default app;
