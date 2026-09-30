import { useCallback, useEffect, useState } from "react";
import {
  listarClientes,
  crearCliente,
  actualizarCliente,
} from "../services/clients.service";

export const useClients = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarClientes = useCallback(async (filtros = {}) => {
    try {
      setLoading(true);
      setError(null);

      const data = await listarClientes(filtros);
      setClientes(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const crear = async (datos) => {
    await crearCliente(datos);
    await cargarClientes();
  };

  const actualizar = async (id, cambios) => {
    await actualizarCliente(id, cambios);
    await cargarClientes();
  };

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  return {
    clientes,
    loading,
    error,
    cargarClientes,
    crear,
    actualizar,
  };
};