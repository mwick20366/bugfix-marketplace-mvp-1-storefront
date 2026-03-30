"use client";

import { Bug } from "@lib/data/bugs";
import { useClaimBug } from "@lib/hooks/use-claim-bug";
import { toast } from "@medusajs/ui";
import Modal from "@modules/common/components/modal";
import { useEffect, useRef } from "react";

interface BugDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bug: Bug; // Optional: show which bug is being claimed
}

export default function ClientBugDetailsModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  bug,
  // bugTitle = "this bug" 
}: BugDetailsModalProps) {
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

  const handleConfirm = () => {
    handleClaim();
    onConfirm();
    onClose(); // Close the modal after confirming
  }

  return (
    <Modal
      // size="small"
      isOpen={isOpen}
      close={onClose} // Handles 'Esc' key naturally
    >
      <Modal.Title>Bug Details</Modal.Title>
      <Modal.Body>
        <p>Here is where the client's bug details will be, along with the ability to unpublish open bugs, review submitted fixes, etc.</p>
      </Modal.Body>
      {/* <Modal.Footer>
        <button 
          onClick={handleConfirm}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
        >
          Claim Bug
        </button>
        <button 
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
        >
          Cancel
        </button>
      </Modal.Footer> */}
  </Modal>
  );
}