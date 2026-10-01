import './Toast.css'

export default function Toast({ title, detail, onClose }) {
  if (!title) return null

  return (
    <div className="toast" role="alert">
      <div className="toast-text">
        <strong>{title}</strong>
        {detail && <span>{detail}</span>}
      </div>

      <button className="toast-close" onClick={onClose} aria-label="Bezárás">
        &times;
      </button>
    </div>
  )
}
