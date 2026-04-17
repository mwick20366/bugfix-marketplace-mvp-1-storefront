"use client";

import { Bug, retrieveBug } from "@lib/data/bugs";
import { sdk } from "@lib/config";
import { useClaimBug } from "@lib/hooks/use-claim-bug";
import { toast, Button } from "@medusajs/ui";
import Modal from "@modules/common/components/modal";
import { StatusBadge, DifficultyBadge } from "@modules/common/components/bug-badges";
import React, { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";

interface OpenBugsDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bug?: Bug;         // optional — used when opened via row click
  bugId?: string;    // optional — used when opened via URL param
  isDeveloper?: boolean;
}

export const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[120px_1fr] items-start gap-x-4">
    <span className="text-right font-semibold text-sm leading-compact">{label}</span>
    <span className="text-sm leading-compact">{children}</span>
  </div>
)

export default function OpenBugsDetailsModal({
  isOpen,
  onClose,
  bug: bugProp,
  bugId,
  isDeveloper = false,
}: OpenBugsDetailsModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const queryClient = useQueryClient();

  // Fetch bug by ID only if no bug object was passed directly
  const { data: fetchedBugData, isLoading } = useQuery<{ bug: Bug }>({
    queryFn: async () => {
      const result = await retrieveBug(bugId || "");
      if (!result) {
        throw new Error("Bug not found");
      }
      return { bug: result };
    },
    queryKey: ["bug", bugId],
    enabled: !!bugId && !bugProp,
  });

  const bug = bugProp ?? fetchedBugData?.bug;

  const { mutate: claimBug, isPending: isClaiming } = useClaimBug(bug?.id || "");

  const handleClaimBug = () => {
    claimBug(undefined, {
      onSuccess: () => {
        toast.success("Bug claimed successfully");
        setIsConfirming(false);
        queryClient.invalidateQueries({ queryKey: ["bugs"] });
        queryClient.invalidateQueries({ queryKey: ["my-bugs"] });
        queryClient.invalidateQueries({ queryKey: ["my-submissions"] });
        queryClient.invalidateQueries({ queryKey: ["developer-me"] });
        onClose();
      },
      onError: (error) => {
        toast.error(`Failed to claim bug: ${error.message}`);
      },
    });
  };

  const handleClose = () => {
    setIsConfirming(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen && !!bug} close={handleClose} size="medium">
      <Modal.Title>Bug Details</Modal.Title>
      <Modal.Body>
        {isLoading ? (
          <span className="text-sm">Loading...</span>
        ) : isConfirming ? (
          <div className="flex flex-col gap-y-2">
            <p className="text-sm font-semibold">Claim this bug?</p>
            <p className="text-sm text-ui-fg-subtle">
              You are about to claim this bug. Once claimed, it will be removed
              from the marketplace and assigned to you.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-y-2">
            <DetailRow label="Title">{bug?.title}</DetailRow>
            <DetailRow label="Description">{bug?.description}</DetailRow>
            <DetailRow label="Repo">
              <a href={bug?.repo_link} className="text-blue-600 underline" target="_blank" rel="noreferrer">
                {bug?.repo_link}
              </a>
            </DetailRow>
            <DetailRow label="Bounty">${bug?.bounty}</DetailRow>
            <DetailRow label="Difficulty">
              <DifficultyBadge difficulty={bug?.difficulty ?? ""} />
            </DetailRow>
            <DetailRow label="Status">
              <StatusBadge status={bug?.status ?? ""} />
            </DetailRow>
          </div>
        )}
      </Modal.Body>

      {isDeveloper && (
        <Modal.Footer>
          {isConfirming ? (
            <Button variant="primary" onClick={handleClaimBug} isLoading={isClaiming}>
              Continue
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setIsConfirming(true)}>
              Claim Bug
            </Button>
          )}
        </Modal.Footer>
      )}
    </Modal>
  );
}