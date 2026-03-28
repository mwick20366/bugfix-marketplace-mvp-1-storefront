"use client"

import React, { useEffect, useActionState } from "react"
import Input from "@modules/common/components/input"

import { submitFix, Bug } from "@lib/data/bugs"
import BugInfo from "../submission-info"
import { Submission } from "@lib/data/submissions"
import { Textarea } from "@medusajs/ui"
import SubmissionInfo from "../submission-info"

type SubmitFixProps = {
  bug?: Bug
  submission?: Submission
  onCancel?: () => void
  onSuccess?: () => void
  onError?: (error: Error) => void
}

const SubmitFixForm: React.FC<SubmitFixProps> = ({
  bug,
  submission,
  onCancel,
  onSuccess,
  onError
}) => {
  const [successState, setSuccessState] = React.useState(false)

  const initialState: Record<string, any> = {
    error: false,
    success: false,
  }

  const [state, formAction] = useActionState(
    submitFix,
    initialState
  )

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(state.success)
    if (state.success && onSuccess) {
      onSuccess()
    }
    if (state.error && onError) {
      onError(new Error("An error occurred"))
    }
  }, [state, onSuccess, onError])

  return (
    <form action={formAction} onReset={() => clearState()} className="w-full">
      <input type="hidden" name="bugId" value={bug?.id} />
      <input type="hidden" name="submissionId" value={submission?.id} />
      <SubmissionInfo
        label={bug?.title || "Submit your fix"}
        isSuccess={successState}
        isError={!!state.error}
        clearState={clearState}
        onCancel={onCancel}
        data-testid="client-bug-editor"
      >
        <div className="grid grid-cols-1 gap-y-2">
          <Textarea
            placeholder="Add your notes here..."
            name="notes"
            rows={4}
            defaultValue={submission?.notes || undefined}
            // required
            data-testid="submission-notes-input"
          />
          <Input
            label="File URL"
            name="fileUrl"
            defaultValue={submission?.fileUrl || undefined}
            // required
            data-testid="submission-file-url-input"
          />
        </div>
      </SubmissionInfo>
    </form>
  )
}

export default SubmitFixForm
