export function pick(objeto, campos) {
	const resultado = {};
	for (const campo of campos) {
		if (objeto?.[campo] !== undefined) {
			resultado[campo] = objeto[campo];
		}
	}
	return resultado;
}
