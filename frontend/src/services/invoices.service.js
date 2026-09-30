import api from "./api";

export async function listarFacturas(filtros = {}) {
  const { data } = await api.get("/facturas", {
    params: filtros,
  });

  return data;
}

export async function obtenerFactura(id) {
  const { data } = await api.get(`/facturas/${id}`);

  return data;
}

export async function crearFactura(datos) {
  const { data } = await api.post("/facturas", datos);

  return data;
}