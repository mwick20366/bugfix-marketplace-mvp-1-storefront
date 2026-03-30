"use client";

import { Bug } from "@lib/data/bugs";
import { useClaimBug } from "@lib/hooks/use-claim-bug";
import { toast } from "@medusajs/ui";
import Modal from "@modules/common/components/modal";
import { useQueryClient } from "@tanstack/react-query";

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
}: ClaimBugModalProps) {
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

  const handleConfirm = () => {
    handleClaim();
    onConfirm();
    onClose(); // Close the modal after confirming
  }

  return (
    <Modal
      size="small"
      isOpen={isOpen}
      close={onClose} // Handles 'Esc' key naturally
    >
      <Modal.Title>Claim Bug</Modal.Title>
        <Modal.Body>
          <p>Are you sure you want to claim: <strong>{bug?.title}</strong>?</p>
          <p>Others won't be able to work on it once claimed.</p>
        </Modal.Body>
        <Modal.Footer>
          <button 
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
          >
            Claim Bug
          </button>
        </Modal.Footer>
    </Modal>
  );
}