"use client"
import { FormProvider, Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createBugSchema, CreateBugSchema } from "./validators"
import Modal from "@modules/common/components/modal"
import { Button, Label, toast } from "@medusajs/ui"
import Input from "@modules/common/components/input"
import { useCreateBug } from "@lib/hooks/use-create-bug"
import { Client } from "@lib/data/client"
import { useState } from "react"
import { QueryClient, useQueryClient } from "@tanstack/react-query"

type CreateBugProps = {
  client: Client,
  onCreate?: () => void,
}

export const CreateBug = ({ client, onCreate }: CreateBugProps) => {
  const [open, setOpen] = useState(false)
  
  const form = useForm<CreateBugSchema>({
    resolver: zodResolver(createBugSchema),
    mode: "onChange",
    defaultValues: {
        title: "",
        description: "",
        repoLink: "",
        techStack: "",
        bounty: 0
    },
  })

  const queryClient = useQueryClient();
  
  const { mutate: createBug, isPending } = useCreateBug(client.id, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bugs"] })
      toast.success("Bug created successfully")
      form.reset()
      setOpen(false)
      onCreate?.()
    },
    onError: (error) => {
      toast.error(`Failed to create bug: ${error.message}`)
    },
  })

  const handleSubmit = form.handleSubmit((data) => {
    createBug(data)
  })

  return (
    <div>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Create Bug
      </Button>
      <Modal isOpen={open} close={() => setOpen(false) }>
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
                    <Input label={"Description"} {...field} />
                    {error && <span className="text-red-500 text-sm">{error.message}</span>}
                  </div>
                )}
              />
              <Controller
                control={form.control}
                name="techStack"
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col gap-y-2">
                    <Input label={"Tech Stack"} {...field} />
                    {error && <span className="text-red-500 text-sm">{error.message}</span>}
                  </div>
                )}
              />
              <Controller
                control={form.control}
                name="repoLink"
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
                    <Input type="number" label={"Bounty"} {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                    {error && <span className="text-red-500 text-sm">{error.message}</span>}
                  </div>
                )}
              />
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