import "./Select.css";

// Mismo patrón que components/Input/Input.jsx — usa .form-field/.form-field-error
// de styles/global.css (compartido entre Input y Select, no duplicado acá).
export default function Select({ label, id, options = [], error, ...props }) {
	return (
		<div className="form-field">
			{label && <label htmlFor={id}>{label}</label>}
			<select id={id} className={error ? "select select-error" : "select"} {...props}>
				{options.map((opcion) => (
					<option key={opcion.value} value={opcion.value}>
						{opcion.label}
					</option>
				))}
			</select>
			{error && <span className="form-field-error">{error}</span>}
		</div>
	);
}
