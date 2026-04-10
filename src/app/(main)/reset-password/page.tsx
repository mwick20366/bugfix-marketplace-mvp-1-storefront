// src/app/(main)/reset-password/page.tsx
"use client"

import { useMemo } from "react"
import { useForm } from "react-hook-form"
import * as zod from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { sdk } from "@lib/config"

const schema = zod.object({
  password: zod.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: zod.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type ResetPasswordForm = zod.infer<typeof schema>

export default function ResetPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  const searchParams = useMemo(() => {
    if (typeof window === "undefined") return
    return new URLSearchParams(window.location.search)
  }, [])

  const token = useMemo(() => searchParams?.get("token"), [searchParams])
  const email = useMemo(() => searchParams?.get("email"), [searchParams])

  const onSubmit = async ({ password }: ResetPasswordForm) => {
    if (!token) {
      alert("Invalid or missing reset token.")
      return
    }

    await sdk.auth.updateProvider("customer", "emailpass", {
      email,
      password,
    }, token)
    .then(() => {
      alert("Password reset successfully!")
    })
    .catch((error) => {
      alert(`Couldn't reset password: ${error.message}`)
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="password">New Password</label>
        <input
          id="password"
          type="password"
          placeholder="New password"
          {...register("password")}
        />
        {errors.password && <span>{errors.password.message}</span>}
      </div>
      <div>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  )
}