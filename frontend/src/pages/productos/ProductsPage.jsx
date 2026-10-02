import { useEffect, useState } from "react";
import useProducts from "../../hooks/useProducts";

import Input from "../../components/Input/Input";
import Table from "../../components/Table/Table";

import "./ProductsPage.css";

function ProductsPage() {
  const [busqueda, setBusqueda] = useState("");

  const {
    productos,
    loading,
    error,
    recargar,
  } = useProducts();

  useEffect(() => {
    const timeout = setTimeout(() => {
      recargar({
        nombre: busqueda,
      });
    }, 400);

    return () => clearTimeout(timeout);
  }, [busqueda, recargar]);

  const columnas = [
    {
      header: "Código",
      accessor: "codigo",
    },
    {
      header: "Nombre",
      accessor: "nombre",
    },
    {
      header: "Categoría",
      accessor: (row) =>
        row.categoria?.nombre || "-",
    },
    {
      header: "Precio",
      accessor: (row) =>
        `$${Number(
          row.precio || 0
        ).toLocaleString()}`,
    },
    {
      header: "Stock",
      accessor: "stock",
    },
  ];

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Productos</h1>
      </div>

      <div className="products-search">
        <Input
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) =>
            setBusqueda(e.target.value)
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
        data={productos}
        loading={loading}
      />
    </div>
  );
}

export default ProductsPage;