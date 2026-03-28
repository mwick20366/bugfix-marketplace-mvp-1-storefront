"use client"

import React, { useEffect, useMemo, useActionState } from "react"

import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"

// import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { addClientBug, updateClientBug, Bug } from "@lib/data/bugs"
import { Client, retrieveClient } from "@lib/data/client"
import BugInfo from "../bug-info"

type MyInformationProps = {
  client: Client
  bug?: Bug
}

const BugForm: React.FC<MyInformationProps> = async ({
  bug,
  client
}) => {
  const [successState, setSuccessState] = React.useState(false)

  const initialState: Record<string, any> = {
    error: false,
    success: false,
  }

  const [state, formAction] = useActionState(
    addClientBug,
    initialState
  )

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  return (
    <form action={formAction} onReset={() => clearState()} className="w-full">
      <input type="hidden" name="bugId" value={bug?.id} />
      <input type="hidden" name="clientId" value={client?.id} />
      <BugInfo
        label="Bug information"
        isSuccess={successState}
        isError={!!state.error}
        clearState={clearState}
        data-testid="client-bug-editor"
      >
        <div className="grid grid-cols-1 gap-y-2">
          <div className="grid grid-cols-2 gap-x-2">
            <Input
              label="Title"
              name="title"
              defaultValue={bug?.title || undefined}
              // required
              data-testid="bug-title-input"
            />
            <Input
              label="Description"
              name="description"
              defaultValue={bug?.description || undefined}
              // required
              data-testid="bug-description-input"
            />
          </div>
          <Input
            label="Tech Stack"
            name="techStack"
            defaultValue={bug?.techStack || undefined}
            data-testid="bug-tech-stack-input"
          />
          <Input
            label="Repository link"
            name="repoLink"
            type="url"
            autoComplete="url"
            //required
            defaultValue={bug?.repoLink || undefined}
            data-testid="bug-repo-link-input"
          />
          <Input
            label="Bounty"
            name="bounty"
            type="number"
            step="0.01"
            defaultValue={bug?.bounty || undefined}
            //required
            data-testid="bug-bounty-input"
          />
        </div>
      </BugInfo>
    </form>
  )
}

export default BugForm
