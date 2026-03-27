"use client"

import React, { useEffect, useMemo, useActionState } from "react"

import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"

// import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { addClientBug, updateClientBug, Bug } from "@lib/data/bugs"
import { Client, retrieveClient } from "@lib/data/client"
import BugInfo from "../submission-info"

type MyInformationProps = {
  client: Client
  bug?: Bug
}

const BugForm: React.FC<MyInformationProps> = async ({
  bug,
  client
}) => {
  const [successState, setSuccessState] = React.useState(false)

  // const client = 
  // const billingAddress = customer.addresses?.find(
  //   (addr) => addr.is_default_billing
  // )

  const initialState: Record<string, any> = {
    // isDefaultBilling: true,
    // isDefaultShipping: false,
    error: false,
    success: false,
  }

  // if (billingAddress) {
  //   initialState.addressId = billingAddress.id
  // }

  const [state, formAction] = useActionState(
    addClientBug,
    // billingAddress ? updateCustomerAddress : addCustomerAddress,
    initialState
  )

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  // const currentInfo = useMemo(() => {
  //   if (!billingAddress) {
  //     return "No billing address"
  //   }

  //   const country =
  //     regionOptions?.find(
  //       (country) => country?.value === billingAddress.country_code
  //     )?.label || billingAddress.country_code?.toUpperCase()

  //   return (
  //     <div className="flex flex-col font-semibold" data-testid="current-info">
  //       <span>
  //         {billingAddress.first_name} {billingAddress.last_name}
  //       </span>
  //       <span>{billingAddress.company}</span>
  //       <span>
  //         {billingAddress.address_1}
  //         {billingAddress.address_2 ? `, ${billingAddress.address_2}` : ""}
  //       </span>
  //       <span>
  //         {billingAddress.postal_code}, {billingAddress.city}
  //       </span>
  //       <span>{country}</span>
  //     </div>
  //   )
  // }, [billingAddress, regionOptions])

  return (
    <form action={formAction} onReset={() => clearState()} className="w-full">
      <input type="hidden" name="bugId" value={bug?.id} />
      <input type="hidden" name="clientId" value={client?.id} />
      <BugInfo
        label="Bug information"
        // currentInfo={currentInfo}
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
          {/* <Input
            label="Apartment, suite, etc."
            name="address_2"
            defaultValue={billingAddress?.address_2 || undefined}
            data-testid="billing-address-2-input"
          />
          <div className="grid grid-cols-[144px_1fr] gap-x-2">
            <Input
              label="Postal code"
              name="postal_code"
              defaultValue={billingAddress?.postal_code || undefined}
              required
              data-testid="billing-postcal-code-input"
            />
            <Input
              label="City"
              name="city"
              defaultValue={billingAddress?.city || undefined}
              required
              data-testid="billing-city-input"
            />
          </div>
          <Input
            label="Province"
            name="province"
            defaultValue={billingAddress?.province || undefined}
            data-testid="billing-province-input"
          />
          <NativeSelect
            name="country_code"
            defaultValue={billingAddress?.country_code || undefined}
            required
            data-testid="billing-country-code-select"
          >
            <option value="">-</option>
            {regionOptions.map((option, i) => {
              return (
                <option key={i} value={option?.value}>
                  {option?.label}
                </option>
              )
            })}
          </NativeSelect> */}
        </div>
      </BugInfo>
    </form>
  )
}

export default BugForm
