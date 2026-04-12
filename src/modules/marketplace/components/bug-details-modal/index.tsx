"use client";

import { Bug } from "@lib/data/bugs";
import { useClaimBug } from "@lib/hooks/use-claim-bug";
import { toast, Button } from "@medusajs/ui";
import Modal from "@modules/common/components/modal";
import { StatusBadge, DifficultyBadge } from "@modules/common/components/bug-badges";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface MarketplaceBugDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bug: Bug;
  isDeveloper?: boolean;
}

export const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[120px_1fr] items-start gap-x-4">
    <span className="text-right font-semibold text-sm leading-compact">{label}</span>
    <span className="text-sm leading-compact">{children}</span>
  </div>
)

export default function MarketplaceBugDetailsModal({
  isOpen,
  onClose,
  bug,
}: MarketplaceBugDetailsModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  // const { mutate: claimBug, isPending: isClaiming } = useClaimBug(bug?.id);

  const queryClient = useQueryClient()

  // const handleClaimBug = () => {
  //   claimBug(undefined, {
  //     onSuccess: () => {
  //       toast.success("Bug claimed successfully");
  //       setIsConfirming(false);

  //       queryClient.invalidateQueries({ queryKey: ["bugs"] })
  //       queryClient.invalidateQueries({ queryKey: ["my-bugs"] })
  //       queryClient.invalidateQueries({ queryKey: ["my-submissions"] })
  //       queryClient.invalidateQueries({ queryKey: ["developer-me"] })

  //       onClose();
  //     },
  //     onError: (error) => {
  //       toast.error(`Failed to claim bug: ${error.message}`);
  //     },
  //   });
  // };

  const handleClaimClick = () => {
    const redirect = encodeURIComponent("/developer/account/bug-marketplace?status=open&bugId=" + bug.id)
    window.location.href = `/developer/account?redirect=${redirect}`
  }

  const handleClose = () => {
    setIsConfirming(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} close={handleClose} size="medium">
      <Modal.Title>Bug Details</Modal.Title>
      <Modal.Body>
        <div className="flex flex-col gap-y-2">
          <DetailRow label="Title">{bug?.title}</DetailRow>
          <DetailRow label="Description">{bug?.description}</DetailRow>
          <DetailRow label="Bounty">${bug?.bounty}</DetailRow>
          <DetailRow label="Difficulty">
            <DifficultyBadge difficulty={bug?.difficulty ?? ""} />
          </DetailRow>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          onClick={handleClaimClick}
        >
          Login or Register to Claim!
        </Button>
      </Modal.Footer>
    </Modal>
  );
}