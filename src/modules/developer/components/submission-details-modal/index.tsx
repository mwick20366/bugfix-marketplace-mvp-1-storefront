"use client";

import { Submission } from "@lib/data/submissions";
import { useEffect, useRef } from "react";

interface SubmissionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  submission: Submission; // Optional: show which submission is being claimed
}

export default function SubmissionDetailsModal({ 
  isOpen, 
  onClose = () => {}, 
  onConfirm = () => {},
  submission,
  // submissionTitle = "this submission" 
}: SubmissionDetailsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Sync the native dialog state with the isOpen prop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen) {
      dialog?.showModal();
    } else {
      dialog?.close();
    }
  }, [isOpen]);

  // const handleConfirm = () => {
  //   handleClaim();
  //   onConfirm();
  //   onClose(); // Close the modal after confirming
  // }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose} // Handles 'Esc' key naturally
      className="rounded-xl p-0 backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm shadow-2xl border-none outline-none"
    >
      <div className="w-full max-w-sm p-6 bg-white flex flex-col gap-4">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-lg font-semibold text-slate-900">
            Submission Details
          </h3>
          <p className="text-sm text-slate-500">
            Here is where the submission's details will be displayed.
          </p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          {/* <button 
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
          >
            Claim Submission
          </button> */}
        </div>
      </div>
    </dialog>
  );
}
