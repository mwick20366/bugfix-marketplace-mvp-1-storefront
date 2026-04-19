"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button, Label } from "@medusajs/ui"
import { useDropzone } from "react-dropzone"
import { useUploadAvatar } from "@lib/hooks/use-upload-avatar"
import { signupClient } from "@lib/data/client"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

type RegisterFormValues = {
  contact_first_name: string
  contact_last_name: string
  company_name: string
  email: string
  password: string
}

const Register = ({ setCurrentView }: Props) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<RegisterFormValues>({
    defaultValues: {
      contact_first_name: "",
      contact_last_name: "",
      company_name: "",
      email: "",
      password: "",
    },
  })

  const { mutateAsync: uploadAvatar } = useUploadAvatar()

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

      // Step 1: Upload avatar if provided
      if (avatarFile) {
        const result = await uploadAvatar({ file: avatarFile })
        avatarUrl = result.files[0]?.url
      }

      // Step 2: Build a FormData or plain object to pass to signupClient
      const formData = new FormData()
      formData.append("contact_first_name", data.contact_first_name)
      formData.append("contact_last_name", data.contact_last_name)
      formData.append("company_name", data.company_name)
      formData.append("email", data.email)
      formData.append("password", data.password)
      if (avatarUrl) {
        formData.append("avatar_url", avatarUrl)
      }

      console.log("Submitting registration with form data:")
      for (const [key, value] of Array.from(formData.entries())) {
        console.log(`${key}: ${value}`)
      }

      const result = await signupClient(null, formData)
      if (result) {
        setError(result)
      }
    } catch (e: any) {
      setError(e.message || "An error occurred during registration.")
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">
        Become a BugZapper Member!
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        Create your BugZapper Developer profile, and earn money zapping bugs.
      </p>
      <form className="w-full flex flex-col" onSubmit={handleSubmit}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="First name"
            {...form.register("contact_first_name", { required: true })}
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
            {...form.register("contact_last_name", { required: true })}
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="Company name"
            {...form.register("company_name", { required: true })}
            autoComplete="organization"
            data-testid="company-name-input"
          />
          <Input
            label="Email"
            {...form.register("email", { required: true })}
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Password"
            {...form.register("password", { required: true })}
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />

          {/* Avatar Upload */}
          <div className="flex flex-col gap-y-2">
            <Label>Profile Avatar (optional)</Label>
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
        </div>

        <ErrorMessage error={error} data-testid="register-error" />

        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          By creating an account, you agree to Bugzapper Marketplace&apos;s{" "}
          <LocalizedClientLink href="/content/privacy-policy" className="underline">
            Privacy Policy
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink href="/content/terms-of-use" className="underline">
            Terms of Use
          </LocalizedClientLink>
          .
        </span>

        <Button
          type="submit"
          className="w-full mt-6"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          data-testid="register-button"
        >
          Join
        </Button>
      </form>

      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Already a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Sign in
        </button>
        .
      </span>
    </div>
  )
}

export default Register