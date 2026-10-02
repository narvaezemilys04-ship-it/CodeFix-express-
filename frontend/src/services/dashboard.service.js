import api from "./api";

export async function obtenerIndicadores() {
  const { data } = await api.get(
    "/dashboard/indicadores"
  );

  return data;
}