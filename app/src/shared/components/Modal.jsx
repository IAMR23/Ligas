import { X } from "lucide-react";

export function Modal({ children, title, open, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button className="icon-button bordered" type="button" onClick={onClose} title="Cerrar">
            <X size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
