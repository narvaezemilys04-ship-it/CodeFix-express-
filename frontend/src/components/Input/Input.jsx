import "./Input.css";

export default function Input({ label, id, error, ...props }) {
	return (
		<div className="form-field">
			{label && <label htmlFor={id}>{label}</label>}
			<input id={id} className={error ? "input input-error" : "input"} {...props} />
			{error && <span className="form-field-error">{error}</span>}
		</div>
	);
}
