"use client";
import { FormProvider, Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Bug } from "@lib/data/bugs";
import { sdk } from "@lib/config";
import {
  Button,
  Heading,
  Label,
  Text as BugzapperText,
  Textarea,
  toast
} from "@medusajs/ui";
import { useSubmitFix } from "@lib/hooks/use-submit-fix";
import { useCreateSubmissionAttachment } from "@lib/hooks/use-create-submission-attachment";
import Modal from "@modules/common/components/modal";
import { submitFixSchema, SubmitFixSchema } from "./validators";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Input from "@modules/common/components/input";

interface SubmitFixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFixSubmitted?: () => void;
  bug?: Bug;
  bugId?: string;
}

export default function SubmitFixModal({ 
  isOpen, 
  onClose,
  bug: bugProp,
  bugId,
  onFixSubmitted,
}: SubmitFixModalProps) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  const form = useForm<SubmitFixSchema>({
    resolver: zodResolver(submitFixSchema),
    mode: "onChange",
    defaultValues: {
      notes: "",
      file_url: "",
    },
  })

  const queryClient = useQueryClient();
  const { mutateAsync: uploadAttachments } = useCreateSubmissionAttachment()

  const { data: fetchedBugData, isLoading } = useQuery<{ bug: Bug }>({
    queryFn: () =>
      sdk.client.fetch(`/marketplace/bugs/${bugId}`, {
        method: "GET",
      }),
    queryKey: ["bug", bugId],
    enabled: !!bugId && !bugProp,
  });

  const bug = bugProp ?? fetchedBugData?.bug;

  const { mutateAsync: submitFix, isPending } = useSubmitFix(bug?.id || "", {
    onError: (error) => {
      toast.error(`Failed to submit fix: ${error.message}`)
    },
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setPendingFiles((prev) => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "application/pdf": [],
      "application/zip": [],
      "application/x-zip-compressed": [],
    },
    multiple: true,
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    const result = await submitFix(data)
    const submissionId = result?.submission?.id

    if (submissionId && pendingFiles.length > 0) {
      await uploadAttachments({ submissionId, files: pendingFiles })
    }

    queryClient.invalidateQueries({ queryKey: ["my-bugs"] })
    queryClient.invalidateQueries({ queryKey: ["my-submissions"] })
    queryClient.invalidateQueries({ queryKey: ["developer-me"] })

    toast.success("Fix submitted successfully")

    form.reset()
    setPendingFiles([])
    onFixSubmitted?.()
    onClose()
  })

  return (
    <Modal isOpen={isOpen} close={() => { onClose(); setPendingFiles([]) }}>
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
            {/* Attachment Dropzone */}
            <div className="flex flex-col gap-y-2">
              <Label>Attachments</Label>
              <div
                {...getRootProps()}
                className={`border border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-ui-border-interactive bg-ui-bg-subtle"
                    : "border-ui-border-strong bg-ui-bg-component"
                }`}
              >
                <input {...getInputProps()} />
                <p className="text-sm text-ui-fg-muted">
                  {isDragActive
                    ? "Drop files here..."
                    : "Drag and drop files here, or click to select"}
                </p>
              </div>

              {pendingFiles.length > 0 && (
                <ul className="mt-2 flex flex-col gap-y-1">
                  {pendingFiles.map((file, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <span className="text-xs text-ui-fg-muted">{file.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))
                        }
                        className="text-xs text-ui-fg-muted hover:text-ui-fg-base ml-2"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer cancelLabel="Cancel">
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