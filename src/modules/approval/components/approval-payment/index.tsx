// src/modules/approval/components/approval-payment/index.tsx
"use client"

import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { Button } from "@medusajs/ui"
import { useState } from "react"
import { useForm, FormProvider, Controller } from "react-hook-form"
import * as zod from "zod"
import { useFinalizeSubmissionApproval } from "@lib/hooks/use-finalize-submission-approval"
import { useQueryClient } from "@tanstack/react-query"

const schema = zod.object({
  firstName: zod.string().min(1, "First name is required"),
  last_name: zod.string().min(1, "Last name is required"),
  email: zod.string().email("Invalid email address"),
  phone: zod.string().optional(),
})

type BillingFormValues = zod.infer<typeof schema>

export function PaymentForm({
  submissionId,
  clientSecret,
  paymentSession,
  clientNotes,
  bounty,
  onSuccess,
  onError,
}: {
  submissionId: string
  clientSecret: string
  paymentSession: any
  clientNotes: string
  bounty: number
  onSuccess: () => void
  onError: (msg: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isConfirming, setIsConfirming] = useState(false)

  const form = useForm<BillingFormValues>({
    defaultValues: {
      firstName: "",
      last_name: "",
      email: "",
      phone: "",
    },
    mode: "onChange",
  })

  const { formState: { isValid } } = form

  const queryClient = useQueryClient()

  const { mutate: finalizeApproval, isPending: isFinalizing } = useFinalizeSubmissionApproval(submissionId, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["developer-submissions"] })
      setIsConfirming(false)
      onSuccess()
    },
    onError: (err: any) => {
      setIsConfirming(false)
      onError(err.message || "Failed to finalize approval. Please contact support.")
    },
  })

  const formattedBounty = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(bounty)

  const handleConfirmAndPay = form.handleSubmit(async ({ firstName, last_name, email, phone }) => {
    const card = elements?.getElement(CardElement)

    if (!stripe || !elements || !card || !clientSecret) {
      return
    }

    setIsConfirming(true)

    stripe
      .confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: {
            name: `${firstName} ${last_name}`,
            email,
            phone: phone || undefined,
          },
        },
      })
      .then(({ error }) => {
        if (error) {
          onError(error.message || "Payment failed.")
          setIsConfirming(false)
          return
        }

        finalizeApproval({
          client_notes: clientNotes,
          payment_collection_id: paymentSession?.payment_collection_id,
        })
      })
      .catch(() => {
        onError("An unexpected error occurred during payment.")
        setIsConfirming(false)
      })
  })

  const isLoading = isConfirming || isFinalizing

  return (
    <FormProvider {...form}>
      <form onSubmit={handleConfirmAndPay} className="flex flex-col gap-4">
        <div className="p-3 bg-ui-bg-subtle rounded-md">
          <p className="text-sm text-ui-fg-muted">Amount to be charged</p>
          <p className="text-lg font-semibold text-ui-fg-base">{formattedBounty}</p>
        </div>

        <div className="border rounded px-3 py-3">
          <CardElement />
        </div>

        <div className="flex gap-2">
          <Controller
            control={form.control}
            name="firstName"
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1 w-full">
                <input
                  {...field}
                  type="text"
                  placeholder="First Name"
                  className="border rounded px-3 py-2 text-sm w-full"
                />
                {fieldState.error && (
                  <p className="text-red-500 text-xs">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="last_name"
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1 w-full">
                <input
                  {...field}
                  type="text"
                  placeholder="Last Name"
                  className="border rounded px-3 py-2 text-sm w-full"
                />
                {fieldState.error && (
                  <p className="text-red-500 text-xs">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />
        </div>

        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-1">
              <input
                {...field}
                type="email"
                placeholder="Email"
                className="border rounded px-3 py-2 text-sm w-full"
              />
              {fieldState.error && (
                <p className="text-red-500 text-xs">{fieldState.error.message}</p>
              )}
            </div>
          )}
        />

        <Controller
          control={form.control}
          name="phone"
          render={({ field }) => (
            <input
              {...field}
              type="tel"
              placeholder="Phone (optional)"
              className="border rounded px-3 py-2 text-sm w-full"
            />
          )}
        />

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={isLoading || !isValid}
          className="w-full"
        >
          Confirm and Pay {formattedBounty}
        </Button>
      </form>
    </FormProvider>
  )

}