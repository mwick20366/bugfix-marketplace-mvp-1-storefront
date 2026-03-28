"use client";

import { Bug } from "@lib/data/bugs";
import { useClaimBug } from "@lib/hooks/use-claim-bug";
import { toast } from "@medusajs/ui";
import { useEffect, useRef } from "react";

interface BugDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bug: Bug; // Optional: show which bug is being claimed
}

export default function BugDetailsModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  bug,
  // bugTitle = "this bug" 
}: BugDetailsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const { mutate: claimBug } = useClaimBug(bug?.id)

  const handleClaim = () => {
    console.log("Attempting to claim bug with ID from modal:", bug?.id) 
    claimBug(undefined, {
      onSuccess: () => {
        console.log("Bug claimed successfully from handleClaim function")
        toast.success("Bug claimed successfully")
        onClose()
      },
      onError: (error) => {
        console.error("Failed to claim bug from handleClaim function:", error)
        toast.error(`Failed to claim bug: ${error.message}`)
      },
    })
  }

  // Sync the native dialog state with the isOpen prop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen) {
      dialog?.showModal();
    } else {
      dialog?.close();
    }
  }, [isOpen]);

  const handleConfirm = () => {
    handleClaim();
    onConfirm();
    onClose(); // Close the modal after confirming
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
            Bug Details
          </h3>
          <p className="text-sm text-slate-500">
            Here is where the client's bug details will be, along with the ability to unpublish open bugs, review submitted fixes, etc.
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
            Claim Bug
          </button> */}
        </div>
      </div>
    </dialog>
  );
}
