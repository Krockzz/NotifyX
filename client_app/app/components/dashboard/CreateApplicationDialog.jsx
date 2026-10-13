import { useEffect, useRef, useState } from "react";
import { AppWindow, X } from "lucide-react";
import Button from "../ui/button.jsx";
import Input from "../ui/input.jsx";

export default function CreateApplicationDialog({ open, onClose, onCreate }) {
  const dialogRef = useRef(null);
  const nameRef = useRef(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      window.requestAnimationFrame(() => nameRef.current?.focus());
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function closeDialog() {
    setName("");
    setError("");
    onClose();
  }

  function handleSubmit(event) {
    event.preventDefault();
    const cleanedName = name.trim();
    if (!cleanedName) {
      setError("Enter an application name to continue.");
      nameRef.current?.focus();
      return;
    }
    onCreate(cleanedName);
    setName("");
    setError("");
    onClose();
  }

  return (
    <dialog ref={dialogRef} className="dash-dialog" aria-labelledby="create-app-title" aria-describedby="create-app-description" onCancel={(event) => { event.preventDefault(); closeDialog(); }} onClick={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
      <div className="dash-dialog-heading"><span className="dash-dialog-icon"><AppWindow size={18} /></span><button type="button" className="dash-dialog-close" onClick={closeDialog} aria-label="Close dialog"><X size={17} /></button></div>
      <h2 id="create-app-title">Create an application</h2>
      <p id="create-app-description" className="dash-dialog-description">An application represents a product or environment that sends events through NotifyX.</p>
      <form onSubmit={handleSubmit} noValidate>
        <label className="dash-dialog-label" htmlFor="application-name">Application name <span aria-hidden="true">*</span></label>
        <Input ref={nameRef} id="application-name" value={name} onChange={(event) => { setName(event.target.value); if (error) setError(""); }} placeholder="e.g. Acme Web App" required aria-invalid={Boolean(error)} aria-describedby={error ? "application-name-error" : "application-name-hint"} />
        {error ? <p className="dash-dialog-error" id="application-name-error" role="alert">{error}</p> : <p className="dash-dialog-hint" id="application-name-hint">Use a name your team will recognize. You can change it later.</p>}
        <div className="dash-demo-note"><span>LOCAL UI DEMO</span><p>This preview adds the application to the current page only. Nothing is sent to a server or saved.</p></div>
        <div className="dash-dialog-actions"><Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button><Button type="submit">Create application</Button></div>
      </form>
    </dialog>
  );
}
