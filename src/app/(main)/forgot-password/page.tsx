// src/app/(main)/forgot-password/page.tsx
"use client"

import { useForm } from "react-hook-form"
import * as zod from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { sdk } from "@lib/config"

const schema = zod.object({
  email: zod.string().email("Please enter a valid email"),
})

type ForgotPasswordForm = zod.infer<typeof schema>

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  })

  const onSubmit = async ({ email }: ForgotPasswordForm) => {
    await sdk.auth.resetPassword("customer", "emailpass", {
      identifier: email,
    })
    .then(() => {
      alert("If an account exists with that email, you'll receive reset instructions.")
    })
    .catch((error: { message: any }) => {
      alert(error.message)
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          {...register("email")}
        />
        {errors.email && <span>{errors.email.message}</span>}
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Reset Instructions"}
      </button>
    </form>
  )
}