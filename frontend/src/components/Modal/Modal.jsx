import "./Modal.css";

// Componente controlado y genérico — no acoplado a ningún dominio, para
// poder reusarse en cualquier formulario de creación/edición de la app.
export default function Modal({ open, onClose, title, children }) {
	if (!open) return null;

	function manejarClickOverlay(evento) {
		if (evento.target === evento.currentTarget) {
			onClose();
		}
	}

	return (
		<div className="modal-overlay" onClick={manejarClickOverlay}>
			<div className="modal-content">
				{title && <h2>{title}</h2>}
				{children}
			</div>
		</div>
	);
}
