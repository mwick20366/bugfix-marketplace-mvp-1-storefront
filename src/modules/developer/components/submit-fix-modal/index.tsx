"use client";
import { FormProvider, Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Bug, createBug } from "@lib/data/bugs";
import {
  Button,
  Heading,
  Text as MedusaText,
  Textarea,
  toast
} from "@medusajs/ui";
import Input from "@modules/common/components/input"
import { useSubmitFix } from "@lib/hooks/use-submit-fix";
import Modal from "@modules/common/components/modal";
import { submitFixSchema, SubmitFixSchema } from "./validators";
import { useQueryClient } from "@tanstack/react-query";

interface SubmitFixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFixSubmitted?: () => void;
  bug: Bug; // Optional: show which bug is being claimed
}

export default function SubmitFixModal({ 
  isOpen, 
  onClose, 
  bug,
  onFixSubmitted,
}: SubmitFixModalProps) {
  const form = useForm<SubmitFixSchema>({
    resolver: zodResolver(submitFixSchema),
    mode: "onChange",
    defaultValues: {
        notes: "",
        fileUrl: "",
    },
  })

  const queryClient = useQueryClient();

  const { mutate: submitFix, isPending } = useSubmitFix(bug?.id, {
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

  // const handleSubmit = () => {
  //   const { notes, fileUrl } = form.getValues()

  //   submitFix({ notes, fileUrl }, {
  //     onSuccess: () => {
  //       toast.success("Fix submitted successfully")
  //       onFixSubmitted?.()
  //       onClose()
  //     },
  //     onError: (error) => {
  //       toast.error(`Failed to submit fix: ${error.message}`)
  //     },
  //   })
  // }

  return (
    <Modal isOpen={isOpen} close={onClose}>
      <Modal.Title>Submit Bug Fix</Modal.Title>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit} className="flex h-full flex-col overflow-hidden">
          <Modal.Body>
            <Heading level="h2">{bug?.title}</Heading>
            <MedusaText>{bug?.description}</MedusaText>
            <MedusaText>Bounty: {bug?.bounty}</MedusaText>
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
              name="fileUrl"
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
                disabled={!form.formState.isValid || isPending}
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
