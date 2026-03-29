import { Dialog, Transition } from "@headlessui/react"
import { clx, FocusModal, Heading, Button } from "@medusajs/ui"
import React, { Fragment } from "react"

import { ModalProvider, useModal } from "@lib/context/modal-context"
import X from "@modules/common/icons/x"
import { Focus } from "@medusajs/icons"

type ModalProps = {
  isOpen: boolean
  close: () => void
  size?: "small" | "medium" | "large"
  // search?: boolean
  children: React.ReactNode
  //'data-testid'?: string
}

const Modal = ({
  isOpen,
  close,
  size = "medium",
  // search = false,
  children,
  // 'data-testid': dataTestId
}: ModalProps) => {
  return (
    <FocusModal
      open={isOpen}
      onOpenChange={close}
    >
      <FocusModal.Content
        style={{ margin: "auto" }}
        className={clx(
          "flex flex-col justify-start w-full transform text-left align-middle transition-all max-h-[75vh] h-fit",
          {
            "max-w-md": size === "small",
            "max-w-xl": size === "medium",
            "max-w-3xl": size === "large",
            // "bg-transparent shadow-none": search,
            // "bg-white shadow-xl border rounded-rounded": !search,
          }
        )}
        // className="w-[50vw] max-w-[50vw] h-[70vh] max-h-[70vh] m-auto flex flex-col"
      >
        <ModalProvider close={close}>{children}</ModalProvider>
      </FocusModal.Content>      
    </FocusModal>
    // <Transition appear show={isOpen} as={Fragment}>
    //   <Dialog as="div" className="relative z-[75]" onClose={close}>
    //     <Transition.Child
    //       as={Fragment}
    //       enter="ease-out duration-300"
    //       enterFrom="opacity-0"
    //       enterTo="opacity-100"
    //       leave="ease-in duration-200"
    //       leaveFrom="opacity-100"
    //       leaveTo="opacity-0"
    //     >
    //       <div className="fixed inset-0 bg-opacity-75 backdrop-blur-md  h-screen" />
    //     </Transition.Child>

    //     <div className="fixed inset-0 overflow-y-hidden">
    //       <div
    //         className={clx(
    //           "flex min-h-full h-full justify-center p-4 text-center",
    //           {
    //             "items-center": !search,
    //             "items-start": search,
    //           }
    //         )}
    //       >
    //         <Transition.Child
    //           as={Fragment}
    //           enter="ease-out duration-300"
    //           enterFrom="opacity-0 scale-95"
    //           enterTo="opacity-100 scale-100"
    //           leave="ease-in duration-200"
    //           leaveFrom="opacity-100 scale-100"
    //           leaveTo="opacity-0 scale-95"
    //         >
    //           <Dialog.Panel
    //             data-testid={dataTestId}
    //             className={clx(
    //               "flex flex-col justify-start w-full transform p-5 text-left align-middle transition-all max-h-[75vh] h-fit",
    //               {
    //                 "max-w-md": size === "small",
    //                 "max-w-xl": size === "medium",
    //                 "max-w-3xl": size === "large",
    //                 "bg-transparent shadow-none": search,
    //                 "bg-white shadow-xl border rounded-rounded": !search,
    //               }
    //             )}
    //           >
    //             <ModalProvider close={close}>{children}</ModalProvider>
    //           </Dialog.Panel>
    //         </Transition.Child>
    //       </div>
    //     </div>
    //   </Dialog>
    // </Transition>
  )
}

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { close } = useModal()

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

const Description: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Dialog.Description className="flex text-small-regular text-ui-fg-base items-center justify-center pt-2 pb-4 h-full">
      {children}
    </Dialog.Description>
  )
}

const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FocusModal.Body className="flex flex-col gap-4 p-6">
      {children}
    </FocusModal.Body>
  )
  // return <div className="flex justify-center">{children}</div>
}

const Footer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FocusModal.Footer>
      <div className="flex items-center gap-x-2">
        <FocusModal.Close asChild>
          <Button variant="secondary">Cancel</Button>
        </FocusModal.Close>
        {children}
      </div>
    </FocusModal.Footer>    
  )
}

Modal.Title = Title
Modal.Description = Description
Modal.Body = Body
Modal.Footer = Footer

export default Modal
