import { clx, FocusModal, Heading, Button } from "@medusajs/ui"
import React from "react"

import { ModalProvider } from "@lib/context/modal-context"
import X from "@modules/common/icons/x"

type ModalProps = {
  isOpen: boolean
  close: () => void
  size?: "small" | "medium" | "large"
  children: React.ReactNode
}

const Modal = ({
  isOpen,
  close,
  size = "medium",
  children,
}: ModalProps) => {
  return (
    <FocusModal
      open={isOpen}
      onOpenChange={close}
    >
      <FocusModal.Content
        style={{ margin: "auto" }}
        className={clx(
          "flex flex-col justify-start w-full transform text-left align-middle transition-all max-h-[75vh] h-fit z-[60]",
          {
            "max-w-md": size === "small",
            "max-w-xl": size === "medium",
            "max-w-3xl": size === "large",
          }
        )}
        overlayProps={{
          className: clx("z-[60] !transition-none !animate-none"),
        }}
      >
        <ModalProvider close={close}>{children}</ModalProvider>
      </FocusModal.Content>      
    </FocusModal>
  )
}

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b">
      <Heading level="h1">{children}</Heading>
      <FocusModal.Close asChild>
        <button className="bg-transparent border-none p-0">
          <X size={20} />
        </button>
      </FocusModal.Close>
    </div>
  )
}

const Trigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // const { open } = useModal()

  return (
    <FocusModal.Trigger asChild>
      {children}
    </FocusModal.Trigger>
  )
}

const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FocusModal.Body className="flex flex-col gap-4 p-6">
      {children}
    </FocusModal.Body>
  )
}

const Footer: React.FC<{ 
  children: React.ReactNode
  cancelLabel?: string
  showCancel?: boolean
}> = ({ 
  children,
  cancelLabel = "Cancel",
  showCancel = true,
}) => {
  return (
    <FocusModal.Footer>
      <div className="flex items-center gap-x-2">
        {showCancel && (
          <FocusModal.Close asChild>
            <Button variant="secondary">{cancelLabel}</Button>
          </FocusModal.Close>
        )}
        {children}
      </div>
    </FocusModal.Footer>    
  )
}

Modal.Title = Title
Modal.Trigger = Trigger
Modal.Body = Body
Modal.Footer = Footer

export default Modal
