// src/components/bugs/edit-bug.tsx
"use client"

import { useForm, FormProvider, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Drawer, Heading, Label, Input, Textarea, Button, toast, Select } from "@medusajs/ui"
import { editBugSchema, EditBugSchema } from "./validators"
import { Bug, retrieveBug, updateBug as saveBugChanges } from "@lib/data/bugs"
import { createBugAttachment, deleteBugAttachment } from "@lib/data/bug-attachments"
import { useEffect, useState, useCallback } from "react"
import { difficultyOptions } from "../create-bug"
import { useDropzone } from "react-dropzone"

type Attachment = {
  id: string
  file_id: string
  file_url: string
  filename: string
}

type EditBugDrawerProps = {
  bug?: Bug
  bugId?: string
  isOpen: boolean
  onClose: (open: boolean) => void
}

export const EditBugDrawer = ({ bug: bugProp, bugId, isOpen, onClose }: EditBugDrawerProps) => {
  const queryClient = useQueryClient()
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [attachmentsToDelete, setAttachmentsToDelete] = useState<Set<string>>(new Set())
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false)

  const form = useForm<EditBugSchema>({
    resolver: zodResolver(editBugSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      tech_stack: "",
      repo_link: "",
      bounty: 0,
      difficulty: "easy",
    },
  })

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

  const retrievedBug = bugProp || fetchedBugData?.bug;

  useEffect(() => {
  if (retrievedBug && isOpen) {
    console.log("Setting form values with retrieved bug data:", retrievedBug)
    form.reset({
      title: retrievedBug.title,
      description: retrievedBug.description,
      tech_stack: retrievedBug.tech_stack || "",
      repo_link: retrievedBug.repo_link || "",
      bounty: retrievedBug.bounty ?? 0,
      difficulty: (retrievedBug.difficulty as "easy" | "medium" | "hard") || "medium",
    })
    setPendingFiles([])
    setAttachmentsToDelete(new Set())
  }
}, [retrievedBug, isOpen, form])

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

  const markForDeletion = (attachmentId: string) => {
    setAttachmentsToDelete((prev) => new Set(prev).add(attachmentId))
  }

  const unmarkForDeletion = (attachmentId: string) => {
    setAttachmentsToDelete((prev) => {
      const next = new Set(prev)
      next.delete(attachmentId)
      return next
    })
  }

  const { mutate: updateBug, isPending } = useMutation({
    mutationFn: (data: EditBugSchema) => saveBugChanges({ ...data, bugId: retrievedBug?.id || "" }),
    onSuccess: async () => {
      // Upload new attachments
      if (pendingFiles.length > 0) {
        setIsUploadingAttachments(true)
        try {
          await createBugAttachment({ bugId: retrievedBug?.id || "", files: pendingFiles })
        } catch {
          toast.error("Bug saved but failed to upload attachments")
        } finally {
          setIsUploadingAttachments(false)
        }
      }

      // Delete marked attachments
      if (attachmentsToDelete.size > 0) {
        await Promise.all(
          Array.from(attachmentsToDelete).map((id) => deleteBugAttachment(id))
        )
      }

      queryClient.invalidateQueries({ queryKey: ["bugs"] })
      queryClient.invalidateQueries({ queryKey: ["bug", retrievedBug?.id || ""] })
      toast.success("Bug updated successfully")
      onClose(false)
    },
    onError: (error) => {
      toast.error(`Failed to update bug: ${error.message}`)
    },
  })

  const handleSubmit = form.handleSubmit((data) => {
    updateBug(data)
  })

  const existingAttachments: Attachment[] = (retrievedBug as any)?.attachments || []
  const visibleAttachments = existingAttachments.filter(
    (a) => !attachmentsToDelete.has(a.id)
  )

  return (
    <Drawer open={isOpen} onOpenChange={() => onClose(false)}>
      <Drawer.Content
        className="z-[60]"
        overlayProps={{
          className: "z-[60] !transition-none !animate-none",
        }}
      >
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <Drawer.Header>
              <Heading>Edit Bug</Heading>
            </Drawer.Header>
            <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-6 overflow-y-auto p-6">
              <Controller
                control={form.control}
                name="title"
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col gap-y-2">
                    <Label size="small" weight="plus">Title</Label>
                    <Input {...field} placeholder="Bug title" />
                    {error && <span className="text-red-500 text-sm">{error.message}</span>}
                  </div>
                )}
              />
              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col gap-y-2">
                    <Label size="small" weight="plus">Description</Label>
                    <Textarea {...field} rows={4} placeholder="Describe the bug..." />
                    {error && <span className="text-red-500 text-sm">{error.message}</span>}
                  </div>
                )}
              />
              <Controller
                control={form.control}
                name="tech_stack"
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col gap-y-2">
                    <Label size="small" weight="plus">Tech Stack</Label>
                    <Input {...field} placeholder="Enter the tech stack..." />
                    {error && <span className="text-red-500 text-sm">{error.message}</span>}
                  </div>
                )}
              />
              <Controller
                control={form.control}
                name="repo_link"
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col gap-y-2">
                    <Label size="small" weight="plus">Repository Link</Label>
                    <Input {...field} placeholder="Enter the repository link..." />
                    {error && <span className="text-red-500 text-sm">{error.message}</span>}
                  </div>
                )}
              />
              <Controller
                control={form.control}
                name="bounty"
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col gap-y-2">
                    <Label size="small" weight="plus">Bounty ($)</Label>
                    <Input
                      {...field}
                      type="number"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                    <Label size="small" weight="plus">Difficulty</Label>
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

              {/* Attachments Section */}
              <div className="flex flex-col gap-y-2">
                <Label size="small" weight="plus">Attachments</Label>

                {/* Existing attachments */}
                {!isLoading && visibleAttachments.length > 0 && (
                  <ul className="flex flex-col gap-y-1 mb-2">
                    {visibleAttachments.map((attachment) => (
                      <li key={attachment.id} className="flex items-center justify-between">
                        <a
                          href={attachment.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-ui-fg-interactive underline"
                        >
                          {attachment.filename || attachment.file_url.split("/").pop()}
                        </a>
                        <button
                          type="button"
                          onClick={() => markForDeletion(attachment.id)}
                          className="text-xs text-red-500 hover:text-red-700 ml-2"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Show attachments marked for deletion with undo option */}
                {attachmentsToDelete.size > 0 && (
                  <ul className="flex flex-col gap-y-1 mb-2">
                    {existingAttachments
                      .filter((a) => attachmentsToDelete.has(a.id))
                      .map((attachment) => (
                        <li key={attachment.id} className="flex items-center justify-between opacity-50">
                          <span className="text-xs text-ui-fg-muted line-through">
                            {attachment.filename || attachment.file_url.split("/").pop()}
                          </span>
                          <button
                            type="button"
                            onClick={() => unmarkForDeletion(attachment.id)}
                            className="text-xs text-ui-fg-muted hover:text-ui-fg-base ml-2"
                          >
                            Undo
                          </button>
                        </li>
                      ))}
                  </ul>)}
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

                {/* Pending new files */}
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
            </Drawer.Body>
            <Drawer.Footer>
              <div className="flex items-center justify-end gap-x-2">
                <Drawer.Close asChild>
                  <Button size="small" variant="secondary">Cancel</Button>
                </Drawer.Close>
                <Button
                  size="small"
                  type="submit"
                  isLoading={isPending || isUploadingAttachments}
                  disabled={!form.formState.isValid || isPending || isUploadingAttachments}
                >
                  Save
                </Button>
              </div>
            </Drawer.Footer>
          </form>
        </FormProvider>
      </Drawer.Content>
    </Drawer>
  )
}