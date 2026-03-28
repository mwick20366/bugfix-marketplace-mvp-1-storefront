"use client";

import { Bug } from "@lib/data/bugs";
import { toast } from "@medusajs/ui";
import SubmitFixForm from "@modules/submissions/components/form";
import { useEffect, useRef, useState } from "react";

interface SubmitFixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bug: Bug; // Optional: show which bug is being fixed
}

export default function SubmitFixModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  bug,
}: SubmitFixModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [successState, setSuccessState] = useState(false);

  // Sync the native dialog state with the isOpen prop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen) {
      dialog?.showModal();
    } else {
      dialog?.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSuccessState(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (successState) {
      toast.success("Bug fix submitted successfully");
      const timer = setTimeout(() => {
        setSuccessState(false);
      }, 3000); // Clear success state after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [successState]);

  const handleSuccess = () => {
    setSuccessState(true);
  }

  const handleError = (error: Error) => {
    toast.error(`Failed to submit bug fix: ${error.message}`)
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose} // Handles 'Esc' key naturally
      className="rounded-xl p-0 backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm shadow-2xl border-none outline-none"
    >
      <div className="w-full max-w-sm p-6 bg-white flex flex-col gap-4">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-lg font-semibold text-slate-900">
            Submit Your Fix
          </h3>
          <div className="text-sm text-slate-500">
            <SubmitFixForm
              bug={bug}
              onCancel={onClose}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </div>
        </div>
      </div>
    </dialog>
  );
}
