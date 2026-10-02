import { useMemo, useState } from "react";
import "./InvoicesPage.css";

import useInvoices from "../../hooks/useInvoices";
import { anularFactura } from "../../services/invoices.service";

import Table from "../../components/Table/Table";
import Badge from "../../components/Badge/Badge";
import Button from "../../components/Button/Button";
import Modal from "../../components/Modal/Modal";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";

import { useAuth } from "../../hooks/useAuth";

function InvoicesPage() {
  const { usuario } = useAuth();

  const {
    facturas,
    loading,
    error,
    recargar,
  } = useInvoices();

  const [filtros, setFiltros] = useState({
    cliente: "",
    estado: "",
    fechaInicio: "",
    fechaFin: "",
  });

  const [facturaSeleccionada, setFacturaSeleccionada] =
    useState(null);

  const [modalDetalle, setModalDetalle] =
    useState(false);

  const facturasFiltradas = useMemo(() => {
    return facturas.filter((factura) => {
      const coincideCliente =
        !filtros.cliente ||
        factura.cliente?.nombre
          ?.toLowerCase()
          .includes(filtros.cliente.toLowerCase());

      const coincideEstado =
        !filtros.estado ||
        factura.estado === filtros.estado;

      const fechaFactura = factura.fecha
        ? new Date(factura.fecha)
        : null;

      const coincideInicio =
        !filtros.fechaInicio ||
        (fechaFactura &&
          fechaFactura >=
            new Date(filtros.fechaInicio));

      const coincideFin =
        !filtros.fechaFin ||
        (fechaFactura &&
          fechaFactura <=
            new Date(filtros.fechaFin));

      return (
        coincideCliente &&
        coincideEstado &&
        coincideInicio &&
        coincideFin
      );
    });
  }, [facturas, filtros]);

  const abrirDetalle = (factura) => {
    setFacturaSeleccionada(factura);
    setModalDetalle(true);
  };

  const cerrarDetalle = () => {
    setFacturaSeleccionada(null);
    setModalDetalle(false);
  };

  const handleAnular = async (factura) => {
    const motivo = window.prompt(
      "Ingrese el motivo de anulación"
    );

    if (!motivo) return;

    try {
      await anularFactura(
        factura.id,
        motivo
      );

      await recargar();
      cerrarDetalle();
    } catch (error) {
      console.error(error);
      alert(
        "No fue posible anular la factura"
      );
    }
  };

  const columnas = [
    {
      header: "Factura",
      accessor: "numero",
    },
    {
      header: "Cliente",
      accessor: (row) =>
        row.cliente?.nombre || "-",
    },
    {
      header: "Fecha",
      accessor: (row) =>
        new Date(
          row.fecha
        ).toLocaleDateString(),
    },
    {
      header: "Total",
      accessor: (row) =>
        `$${Number(
          row.total || 0
        ).toLocaleString()}`,
    },
    {
      header: "Estado",
      accessor: (row) => (
        <Badge
          variant={
            row.estado === "EMITIDA"
              ? "success"
              : "neutral"
          }
        >
          {row.estado}
        </Badge>
      ),
    },
  ];

  return (
    <div className="invoices-page">
      <div className="page-header">
        <h1>Facturas</h1>
      </div>

      <div className="filters-card">
        <Input
          label="Cliente"
          value={filtros.cliente}
          onChange={(e) =>
            setFiltros((prev) => ({
              ...prev,
              cliente: e.target.value,
            }))
          }
        />

        <Select
          label="Estado"
          value={filtros.estado}
          onChange={(e) =>
            setFiltros((prev) => ({
              ...prev,
              estado: e.target.value,
            }))
          }
          options={[
            {
              label: "Todos",
              value: "",
            },
            {
              label: "Emitida",
              value: "EMITIDA",
            },
            {
              label: "Anulada",
              value: "ANULADA",
            },
          ]}
        />

        <Input
          type="date"
          label="Desde"
          value={filtros.fechaInicio}
          onChange={(e) =>
            setFiltros((prev) => ({
              ...prev,
              fechaInicio:
                e.target.value,
            }))
          }
        />

        <Input
          type="date"
          label="Hasta"
          value={filtros.fechaFin}
          onChange={(e) =>
            setFiltros((prev) => ({
              ...prev,
              fechaFin:
                e.target.value,
            }))
          }
        />
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <Table
        columns={columnas}
        data={facturasFiltradas}
        loading={loading}
        onRowClick={abrirDetalle}
      />

      <Modal
        isOpen={modalDetalle}
        onClose={cerrarDetalle}
        title="Detalle de factura"
      >
        {facturaSeleccionada && (
          <div className="invoice-detail">
            <div className="invoice-info">
              <p>
                <strong>Número:</strong>{" "}
                {
                  facturaSeleccionada.numero
                }
              </p>

              <p>
                <strong>Estado:</strong>{" "}
                {
                  facturaSeleccionada.estado
                }
              </p>

              <p>
                <strong>Total:</strong>{" "}
                $
                {Number(
                  facturaSeleccionada.total ||
                    0
                ).toLocaleString()}
              </p>
            </div>

            <h3>Productos</h3>

            <Table
              columns={[
                {
                  header: "Producto",
                  accessor: "nombre",
                },
                {
                  header: "Cantidad",
                  accessor: "cantidad",
                },
                {
                  header: "Precio",
                  accessor: (row) =>
                    `$${Number(
                      row.precio
                    ).toLocaleString()}`,
                },
                {
                  header: "Subtotal",
                  accessor: (row) =>
                    `$${Number(
                      row.subtotal
                    ).toLocaleString()}`,
                },
              ]}
              data={
                facturaSeleccionada.lineas ||
                []
              }
            />

            {usuario?.rol === "ADMIN" &&
              facturaSeleccionada.estado ===
                "EMITIDA" && (
                <div className="invoice-actions">
                  <Button
                    variant="danger"
                    onClick={() =>
                      handleAnular(
                        facturaSeleccionada
                      )
                    }
                  >
                    Anular factura
                  </Button>
                </div>
              )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default InvoicesPage;