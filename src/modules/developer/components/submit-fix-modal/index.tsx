"use client";
import { FormProvider, Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Bug } from "@lib/data/bugs";
import { sdk } from "@lib/config";
import {
  Button,
  Heading,
  Text as BugzapperText,
  Textarea,
  toast
} from "@medusajs/ui";
import Input from "@modules/common/components/input"
import { useSubmitFix } from "@lib/hooks/use-submit-fix";
import Modal from "@modules/common/components/modal";
import { submitFixSchema, SubmitFixSchema } from "./validators";
import { useQueryClient, useQuery } from "@tanstack/react-query";

interface SubmitFixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFixSubmitted?: () => void;
  bug?: Bug;      // optional — used when opened with a full bug object
  bugId?: string; // optional — used when opened with only an ID
}

export default function SubmitFixModal({ 
  isOpen, 
  onClose,
  bug: bugProp,
  bugId,
  onFixSubmitted,
}: SubmitFixModalProps) {
  const form = useForm<SubmitFixSchema>({
    resolver: zodResolver(submitFixSchema),
    mode: "onChange",
    defaultValues: {
      notes: "",
      file_url: "",
    },
  })

  const queryClient = useQueryClient();

  // Fetch bug by ID only if no bug object was passed directly
  const { data: fetchedBugData, isLoading } = useQuery<{ bug: Bug }>({
    queryFn: () =>
      sdk.client.fetch(`/marketplace/bugs/${bugId}`, {
        method: "GET",
      }),
    queryKey: ["bug", bugId],
    enabled: !!bugId && !bugProp,
  });

  const bug = bugProp ?? fetchedBugData?.bug;

  const { mutate: submitFix, isPending } = useSubmitFix(bug?.id || "", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bugs"] })
      queryClient.invalidateQueries({ queryKey: ["my-submissions"] })
      queryClient.invalidateQueries({ queryKey: ["developer-me"] })
      toast.success("Fix submitted successfully")
      onFixSubmitted?.()
      onClose()
    },
    onError: (error) => {
      toast.error(`Failed to submit fix: ${error.message}`)
    },
  })

  const handleSubmit = form.handleSubmit((data) => {
    submitFix(data)
  })

  return (
    <Modal isOpen={isOpen} close={onClose}>
      <Modal.Title>Submit Bug Fix</Modal.Title>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit} className="flex h-full flex-col overflow-hidden">
          <Modal.Body>
            {isLoading ? (
              <span className="text-sm">Loading...</span>
            ) : (
              <>
                <Heading level="h2">{bug?.title}</Heading>
                <BugzapperText>{bug?.description}</BugzapperText>
                <BugzapperText>Bounty: {bug?.bounty}</BugzapperText>
              </>
            )}
            <Controller
              control={form.control}
              name="notes"
              render={({ field, fieldState: { error } }) => (
                <div className="flex flex-col gap-y-2">
                  <Textarea placeholder={"Notes"} {...field} rows={5} />
                  {error && <span className="text-red-500 text-sm">{error.message}</span>}
                </div>
              )}
            />
            <Controller
              control={form.control}
              name="file_url"
              render={({ field, fieldState: { error } }) => (
                <div className="flex flex-col gap-y-2">
                  <Input label={"File URL"} {...field} />
                  {error && <span className="text-red-500 text-sm">{error.message}</span>}
                </div>
              )}
            />
          </Modal.Body>
          <Modal.Footer>
            <div className="flex items-center gap-x-2">
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={isPending}
                disabled={!form.formState.isValid || isPending || isLoading || !bug}
              >
                Submit Fix
              </Button>
            </div>
          </Modal.Footer>
        </form>
      </FormProvider>
    </Modal>
  )
}