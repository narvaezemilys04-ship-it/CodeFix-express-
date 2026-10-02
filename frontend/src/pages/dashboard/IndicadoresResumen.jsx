import { useEffect, useState } from "react";
import "./IndicadoresResumen.css";

import StatCard from "../../components/StatCard/StatCard";
import { obtenerIndicadores } from "../../services/dashboard.service";

function IndicadoresResumen() {
  const [indicadores, setIndicadores] = useState({
    ventasPeriodo: 0,
    facturasEmitidas: 0,
    alertasStock: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarIndicadores();
  }, []);

  const cargarIndicadores = async () => {
    try {
      setLoading(true);

      const data = await obtenerIndicadores();

      setIndicadores({
        ventasPeriodo:
          data.ventasPeriodo ?? 0,
        facturasEmitidas:
          data.facturasEmitidas ?? 0,
        alertasStock:
          data.alertasStock ?? 0,
      });
    } catch (error) {
      console.error(
        "Error cargando indicadores",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="indicadores-resumen">
        Cargando indicadores...
      </div>
    );
  }

  return (
    <div className="indicadores-resumen">
      <StatCard
        title="Ventas del período"
        value={`$${Number(
          indicadores.ventasPeriodo
        ).toLocaleString()}`}
      />

      <StatCard
        title="Facturas emitidas"
        value={
          indicadores.facturasEmitidas
        }
      />

      <StatCard
        title="Alertas de stock"
        value={indicadores.alertasStock}
      />
    </div>
  );
}

export default IndicadoresResumen;