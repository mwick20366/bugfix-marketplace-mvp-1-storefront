import { Disclosure } from "@headlessui/react"
import { Badge, Button, clx } from "@medusajs/ui"
import { useEffect } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import { useFormStatus } from "react-dom"

type SubmissionInfoProps = {
  label: string
  // currentInfo: string | React.ReactNode
  isSuccess?: boolean
  isError?: boolean
  errorMessage?: string
  clearState: () => void
  onCancel?: () => void
  children?: React.ReactNode
  'data-testid'?: string
}

const SubmissionInfo = ({
  label,
  // currentInfo,
  isSuccess,
  isError,
  clearState,
  onCancel,
  errorMessage = "An error occurred, please try again",
  children,
  'data-testid': dataTestid
}: SubmissionInfoProps) => {
  const { state, close, toggle } = useToggleState()

  const { pending } = useFormStatus()

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  return (
    <div className="text-small-regular" data-testid={dataTestid}>
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="uppercase text-ui-fg-base">{label}</span>
        </div>
      </div>

      {/* Success state */}
      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
            {
              "max-h-[1000px] opacity-100": isSuccess,
              "max-h-0 opacity-0": !isSuccess,
            }
          )}
          data-testid="success-message"
        >
          <Badge className="p-2 my-4" color="green">
            <span>{label} updated successfully</span>
          </Badge>
        </Disclosure.Panel>
      </Disclosure>

      {/* Error state  */}
      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
            {
              "max-h-[1000px] opacity-100": isError,
              "max-h-0 opacity-0": !isError,
            }
          )}
          data-testid="error-message"
        >
          <Badge className="p-2 my-4" color="red">
            <span>{errorMessage}</span>
          </Badge>
        </Disclosure.Panel>
      </Disclosure>
        <div className="flex flex-col gap-y-2 py-4">
          <div>{children}</div>
          <div className="flex items-center justify-end mt-2">
            <Button
              variant="secondary"
              className="w-full small:max-w-[140px]"
              type="button"
              onClick={onCancel}
              data-testid="cancel-button"
            >
              Cancel
            </Button>            
            <Button
              isLoading={pending}
              className="w-full small:max-w-[140px]"
              type="submit"
              data-testid="save-button"
            >
              Submit Fix
            </Button>
          </div>
        </div>
    </div>
  )
}

export default SubmissionInfo
