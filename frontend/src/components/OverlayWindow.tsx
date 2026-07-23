import { useEffect, type ReactNode } from "react";
import "./OverlayWindow.css";

interface OverlayWindowProps {
  onClose: () => void;
  children: ReactNode;
  maxWidth?: number;
}

export default function OverlayWindow({ onClose, children, maxWidth = 380 }: OverlayWindowProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="overlay-modal" style={{ maxWidth }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
