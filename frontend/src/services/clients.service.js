import api from "./api";

export const listarClientes = async (filtros = {}) => {
  const response = await api.get("/clientes", {
    params: filtros,
  });

  return response.data;
};

export const crearCliente = async (datos) => {
  const response = await api.post("/clientes", datos);

  return response.data;
};

export const actualizarCliente = async (id, cambios) => {
  const response = await api.put(`/clientes/${id}`, cambios);

  return response.data;
};