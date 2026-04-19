// src/modules/client/components/profile/index.tsx
"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import Input from "@modules/common/components/input"
import ErrorMessage from "@modules/checkout/components/error-message"
import { Button, Label, toast } from "@medusajs/ui"
import { useDropzone } from "react-dropzone"
import { useUploadAvatar } from "@lib/hooks/use-upload-avatar"
import { Developer, updateDeveloper } from "@lib/data/developer"
import { useQueryClient } from "@tanstack/react-query"
import { Client, updateClient } from "@lib/data/client"

type Props = {
  client: Client
}

type ProfileFormValues = {
  contact_first_name: string
  contact_last_name: string
  company_name: string
}

export default function ClientProfile({ client }: Props) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    client.avatar_url || null
  )
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const queryClient = useQueryClient()
  const { mutateAsync: uploadAvatar } = useUploadAvatar()

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      contact_first_name: client.contact_first_name || "",
      contact_last_name: client.contact_last_name || "",
      company_name: client.company_name || "",
    },
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true)
    setError(null)

    try {
      let avatarUrl: string | undefined

      // Step 1: Upload new avatar if one was selected
      if (avatarFile) {
        const result = await uploadAvatar({ file: avatarFile })
        avatarUrl = result.files?.[0]?.url
      }

      // Step 2: Update client profile
      await updateClient({
        contact_first_name: data.contact_first_name,
        contact_last_name: data.contact_last_name,
        company_name: data.company_name,
        ...(avatarUrl && { avatar_url: avatarUrl }),
      })

      toast.success("Profile updated successfully")
      queryClient.invalidateQueries({ queryKey: ["client-me"] })
    } catch (e: any) {
      setError(e.message || "Failed to update profile.")
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <div className="max-w-sm flex flex-col gap-y-6">
      <h1 className="text-large-semi uppercase">My Profile</h1>

      <form className="w-full flex flex-col gap-y-4" onSubmit={handleSubmit}>

        {/* Avatar */}
        <div className="flex flex-col gap-y-2">
          <Label>Profile Avatar</Label>
          {avatarPreview && (
            <div className="flex items-center gap-x-3 mb-2">
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-16 h-16 rounded-full object-cover border border-ui-border-strong"
              />
              <button
                type="button"
                onClick={() => {
                  setAvatarFile(null)
                  setAvatarPreview(null)
                }}
                className="text-xs text-ui-fg-muted hover:text-ui-fg-base"
              >
                Remove
              </button>
            </div>
          )}
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
                ? "Drop your avatar here..."
                : "Drag and drop an image, or click to select"}
            </p>
          </div>
        </div>

        {/* Name Fields */}
        <Input
          label="First name"
          {...form.register("contact_first_name", { required: true })}
          autoComplete="given-name"
        />
        <Input
          label="Last name"
          {...form.register("contact_last_name", { required: true })}
          autoComplete="family-name"
        />
        <Input
          label="Company name"
          {...form.register("company_name", { required: true })}
          autoComplete="organization"
        />

        <ErrorMessage error={error} />

        <Button
          type="submit"
          className="w-full mt-2"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Save Changes
        </Button>
      </form>
    </div>
  )
}