"use client"
import { FormProvider, Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createBugSchema, CreateBugSchema } from "./validators"
import Modal from "@modules/common/components/modal"
import { Button, Label, Select, Textarea, toast } from "@medusajs/ui"
import Input from "@modules/common/components/input"
import { useCreateBug } from "@lib/hooks/use-create-bug"
import { useCreateBugAttachment } from "@lib/hooks/use-create-bug-attachment"
import { Client } from "@lib/data/client"
import { useState, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useDropzone } from "react-dropzone"

type CreateBugProps = {
  client: Client
  onCreate?: () => void
  // Optional external control
  isOpen?: boolean
  onClose?: () => void
}

export const difficultyOptions = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
]

export const CreateBug = ({ client, onCreate, isOpen: isOpenProp, onClose }: CreateBugProps) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  // If isOpen prop is provided, use it (controlled); otherwise use internal state
  const isControlled = isOpenProp !== undefined
  const open = isControlled ? isOpenProp : internalOpen

  const handleClose = () => {
    setPendingFiles([])
    if (isControlled) {
      onClose?.()
    } else {
      setInternalOpen(false)
    }
  }

  const form = useForm<CreateBugSchema>({
    resolver: zodResolver(createBugSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      repo_link: "",
      tech_stack: "",
      bounty: 0,
      difficulty: "easy",
    },
  })

  const queryClient = useQueryClient()
  const { mutateAsync: uploadAttachments } = useCreateBugAttachment()

  const { mutateAsync: createBug, isPending } = useCreateBug(client.id, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bugs"] })
      toast.success("Bug created successfully")
      form.reset()
      setPendingFiles([])
      handleClose()
      onCreate?.()
    },
    onError: (error) => {
      toast.error(`Failed to create bug: ${error.message}`)
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
    const result = await createBug(data)
    const bugId = result?.bug?.id

    if (bugId && pendingFiles.length > 0) {
      await uploadAttachments({ bugId, files: pendingFiles })
    }
  })

  return (
    <div>
      {/* Only show the trigger button when not externally controlled */}
      {!isControlled && (
        <Button variant="primary" onClick={() => setInternalOpen(true)}>
          Create Bug
        </Button>
      )}
      <Modal isOpen={open} close={handleClose}>
        <Modal.Title>Create a New Bug</Modal.Title>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex h-full flex-col overflow-hidden">
            <Modal.Body>
              <Controller
                control={form.control}
                name="title"
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col gap-y-2">
                    <Input label={"Title"} {...field} />
                    {error && <span className="text-red-500 text-sm">{error.message}</span>}
                  </div>
                )}
              />
              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col gap-y-2">
                    <Textarea placeholder="Description" {...field} rows={5} />
                    {error && <span className="text-red-500 text-sm">{error.message}</span>}
                  </div>
                )}
              />
              <Controller
                control={form.control}
                name="tech_stack"
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col gap-y-2">
                    <Input label={"Tech Stack"} {...field} />
                    {error && <span className="text-red-500 text-sm">{error.message}</span>}
                  </div>
                )}
              />
              <Controller
                control={form.control}
                name="repo_link"
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col gap-y-2">
                    <Input label={"Repository Link"} {...field} />
                    {error && <span className="text-red-500 text-sm">{error.message}</span>}
                  </div>
                )}
              />
              <Controller
                control={form.control}
                name="bounty"
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col gap-y-2">
                    <Input
                      type="number"
                      label={"Bounty"}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                    {error && <span className="text-red-500 text-sm">{error.message}</span>}
                  </div>
                )}
              />
              <Controller
                control={form.control}
                name="difficulty"
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col gap-y-2">
                    <Label>Difficulty</Label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value placeholder="Select difficulty" />
                      </Select.Trigger>
                      <Select.Content className="z-[100]">
                        {difficultyOptions.map((option) => (
                          <Select.Item key={option.value} value={option.value}>
                            {option.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
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
            <Modal.Footer>
              <div className="flex items-center gap-x-2">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isPending}
                  disabled={!form.formState.isValid || isPending}
                >
                  Create Bug
                </Button>
              </div>
            </Modal.Footer>
          </form>
        </FormProvider>
      </Modal>
    </div>
  )
}