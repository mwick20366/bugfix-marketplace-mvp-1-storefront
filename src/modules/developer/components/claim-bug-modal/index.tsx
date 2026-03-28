"use client";

import { Bug } from "@lib/data/bugs";
import { useClaimBug } from "@lib/hooks/use-claim-bug";
import { toast } from "@medusajs/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

interface ClaimBugModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bug: Bug; // Optional: show which bug is being claimed
}

export default function ClaimBugModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  bug,
  // bugTitle = "this bug" 
}: ClaimBugModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const queryClient = useQueryClient()

  const { mutate: claimBug } = useClaimBug(bug?.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["bugs"] })
        queryClient.invalidateQueries({ queryKey: ["developer-me"] })
        toast.success("Bug claimed successfully")
        onClose()
      },
      onError: (error) => {
        console.error("Failed to claim bug from claim bug modal:", error)
        toast.error(`Failed to claim bug: ${error.message}`)
      },    
  })

  const handleClaim = () => {
    claimBug(undefined);
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
            Claim Bug Report
          </h3>
          <p className="text-sm text-slate-500">
            Are you sure you want to assign <strong>{bug.title}</strong> to yourself? 
            Others won't be able to work on it once claimed.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
          >
            Claim Bug
          </button>
        </div>
      </div>
    </dialog>
  );
}
// import { Bug } from "@lib/data/bugs"
// import { Button } from "@medusajs/ui"
// import Modal from "@modules/common/components/modal"
// import { useState } from "react"

// type ClaimBugModalProps = {
//   open: boolean
//   onOpenChange: () => void
//   onSubmit: (bugId: string) => Promise<void>
//   bug: Bug | null
// }

// export const ClaimBugModal = ({ open, onOpenChange, onSubmit, bug }: ClaimBugModalProps) => {
//   const [isLoading, setIsLoading] = useState(false)

//   const handleSubmit = async () => {
//     if (!bug) return
//     setIsLoading(true)
//     try {
//       await onSubmit(bug.id)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <Modal isOpen={open} close={onOpenChange}>
//       <Modal.Title>Claim Bug</Modal.Title>
//       <Modal.Body>
//         <p>Are you sure you want to claim: <strong>{bug?.title}</strong>?</p>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={onOpenChange}>
//           Cancel
//         </Button>
//         <Button variant="primary" isLoading={isLoading} onClick={handleSubmit}>
//           Claim Bug
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   )
// }