import { useEffect, useState } from "react";
import { useClients } from "../../hooks/useClients";

import Table from "../../components/Table/Table";
import Card from "../../components/Card/Card";
import Modal from "../../components/Modal/Modal";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";

import "./ClientsPage.css";

const estadoInicial = {
  nombre: "",
  documento: "",
  telefono: "",
  email: "",
  direccion: "",
};

const ClientsPage = () => {
  const { clientes, loading, crear, actualizar } = useClients();

  const [modalOpen, setModalOpen] = useState(false);
  const [clienteActual, setClienteActual] = useState(null);
  const [formulario, setFormulario] = useState(estadoInicial);

  useEffect(() => {
    if (clienteActual) {
      setFormulario({
        nombre: clienteActual.nombre || "",
        documento: clienteActual.documento || "",
        telefono: clienteActual.telefono || "",
        email: clienteActual.email || "",
        direccion: clienteActual.direccion || "",
      });
    } else {
      setFormulario(estadoInicial);
    }
  }, [clienteActual]);

  const abrirCrear = () => {
    setClienteActual(null);
    setFormulario(estadoInicial);
    setModalOpen(true);
  };

  const abrirEditar = (cliente) => {
    setClienteActual(cliente);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setClienteActual(null);
    setFormulario(estadoInicial);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (clienteActual) {
        await actualizar(clienteActual.id, formulario);
      } else {
        await crear(formulario);
      }

      cerrarModal();
    } catch (error) {
      console.error(error);
    }
  };

  const columnas = [
    {
      header: "Nombre",
      accessor: "nombre",
    },
    {
      header: "Documento",
      accessor: "documento",
    },
    {
      header: "Teléfono",
      accessor: "telefono",
    },
    {
      header: "Correo",
      accessor: "email",
    },
    {
      header: "Dirección",
      accessor: "direccion",
    },
    {
      header: "Acciones",
      cell: (cliente) => (
        <Button onClick={() => abrirEditar(cliente)}>
          Editar
        </Button>
      ),
    },
  ];

  return (
    <div className="clients-page">
      <div className="clients-toolbar">
        <h1>Clientes</h1>

        <Button onClick={abrirCrear}>
          + Nuevo cliente
        </Button>
      </div>

      <Card>
        <Table
          columns={columnas}
          data={clientes}
          loading={loading}
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={cerrarModal}
        title={
          clienteActual
            ? "Editar cliente"
            : "Nuevo cliente"
        }
      >
        <form
          className="clients-form"
          onSubmit={handleSubmit}
        >
          <Input
            label="Nombre"
            name="nombre"
            value={formulario.nombre}
            onChange={handleChange}
            required
          />

          <Input
            label="Documento"
            name="documento"
            value={formulario.documento}
            onChange={handleChange}
            required
          />

          <Input
            label="Teléfono"
            name="telefono"
            value={formulario.telefono}
            onChange={handleChange}
          />

          <Input
            label="Correo"
            name="email"
            type="email"
            value={formulario.email}
            onChange={handleChange}
          />

          <Input
            label="Dirección"
            name="direccion"
            value={formulario.direccion}
            onChange={handleChange}
          />

          <div className="clients-form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={cerrarModal}
            >
              Cancelar
            </Button>

            <Button type="submit">
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientsPage;