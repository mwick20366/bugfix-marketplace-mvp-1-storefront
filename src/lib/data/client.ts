"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeAuthToken,
  removeCartId,
  setAuthToken,
} from "./cookies"
import { Member } from "./member"

export type Client = Member & {
  company: string
  // any client specific fields
}

export const retrieveClient =
  async (): Promise<Client | null> => {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return null

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("clients")),
    }

    return sdk.client
      .fetch<{ client: Client }>(`/clients/me`, {
        method: "GET",
        // query: {
        //   fields: "*orders",
        // },
        headers,
        next,
        cache: "force-cache",
      })
      .then(({ client }) => client)
      .catch(() => null)
  }

// TODO: Change below to updateClient and allow updating client specific fields as well, not just customer fields
// export const updateClient = async (body: HttpTypes.StoreUpdateCustomer) => {
//   const headers = {
//     ...(await getAuthHeaders()),
//   }
// export const updateMember = async (body: HttpTypes.StoreUpdateCustomer) => {
//   const headers = {
//     ...(await getAuthHeaders()),
//   }

//   const updateRes = await sdk.store.customer
//     .update(body, {}, headers)
//     .then(({ customer }) => customer)
//     .catch(medusaError)

//   const cacheTag = await getCacheTag("customers")
//   revalidateTag(cacheTag)

//   return updateRes
// }

export async function signupClient(_currentState: unknown, formData: FormData) {
  const password = formData.get("password") as string
  
  const clientForm = {
    email: formData.get("email") as string,
    companyName: formData.get("company") as string,
    contactFirstName: formData.get("first_name") as string,
    contactLastName: formData.get("last_name") as string,
  }

  try {
    const token = await sdk.auth.register("client", "emailpass", {
      email: clientForm.email,
      password: password,
    })

    await setAuthToken(token as string)

    const headers = {
      ...(await getAuthHeaders()),
    }

    const createdClient = await sdk.client.fetch("/client", {
      method: "POST",
      body: clientForm,
      headers
    })

    const loginToken = await sdk.auth.login("client", "emailpass", {
      email: clientForm.email,
      password,
    })

    await setAuthToken(loginToken as string)
    sdk.client.setToken(loginToken as string)

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    return createdClient
  } catch (error: any) {
    return error.toString()
  }
}

export async function loginClient(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await sdk.auth
      .login("client", "emailpass", { email, password })
      .then(async (token) => {
        await setAuthToken(token as string)
        sdk.client.setToken(token as string)

        const customerCacheTag = await getCacheTag("clients")
        revalidateTag(customerCacheTag)
      })
  } catch (error: any) {
    return error.toString()
  }
}

export async function signoutClient(countryCode: string) {
  await sdk.auth.logout()

  await removeAuthToken()

  const customerCacheTag = await getCacheTag("clients")
  revalidateTag(customerCacheTag)

  await removeCartId()

  const cartCacheTag = await getCacheTag("clients")
  revalidateTag(cartCacheTag)

  redirect(`/${countryCode}/client/account`)
}

// export async function transferCart() {
//   const cartId = await getCartId()

//   if (!cartId) {
//     return
//   }

//   const headers = await getAuthHeaders()

//   await sdk.store.cart.transferCart(cartId, {}, headers)

//   const cartCacheTag = await getCacheTag("carts")
//   revalidateTag(cartCacheTag)
// }

// export const addCustomerAddress = async (
//   currentState: Record<string, unknown>,
//   formData: FormData
// ): Promise<any> => {
//   const isDefaultBilling = (currentState.isDefaultBilling as boolean) || false
//   const isDefaultShipping = (currentState.isDefaultShipping as boolean) || false

//   const address = {
//     first_name: formData.get("first_name") as string,
//     last_name: formData.get("last_name") as string,
//     company: formData.get("company") as string,
//     address_1: formData.get("address_1") as string,
//     address_2: formData.get("address_2") as string,
//     city: formData.get("city") as string,
//     postal_code: formData.get("postal_code") as string,
//     province: formData.get("province") as string,
//     country_code: formData.get("country_code") as string,
//     phone: formData.get("phone") as string,
//     is_default_billing: isDefaultBilling,
//     is_default_shipping: isDefaultShipping,
//   }

//   const headers = {
//     ...(await getAuthHeaders()),
//   }

//   return sdk.store.customer
//     .createAddress(address, {}, headers)
//     .then(async ({ customer }) => {
//       const customerCacheTag = await getCacheTag("customers")
//       revalidateTag(customerCacheTag)
//       return { success: true, error: null }
//     })
//     .catch((err) => {
//       return { success: false, error: err.toString() }
//     })
// }

// export const deleteCustomerAddress = async (
//   addressId: string
// ): Promise<void> => {
//   const headers = {
//     ...(await getAuthHeaders()),
//   }

//   await sdk.store.customer
//     .deleteAddress(addressId, headers)
//     .then(async () => {
//       const customerCacheTag = await getCacheTag("customers")
//       revalidateTag(customerCacheTag)
//       return { success: true, error: null }
//     })
//     .catch((err) => {
//       return { success: false, error: err.toString() }
//     })
// }

// export const updateCustomerAddress = async (
//   currentState: Record<string, unknown>,
//   formData: FormData
// ): Promise<any> => {
//   const addressId =
//     (currentState.addressId as string) || (formData.get("addressId") as string)

//   if (!addressId) {
//     return { success: false, error: "Address ID is required" }
//   }

//   const address = {
//     first_name: formData.get("first_name") as string,
//     last_name: formData.get("last_name") as string,
//     company: formData.get("company") as string,
//     address_1: formData.get("address_1") as string,
//     address_2: formData.get("address_2") as string,
//     city: formData.get("city") as string,
//     postal_code: formData.get("postal_code") as string,
//     province: formData.get("province") as string,
//     country_code: formData.get("country_code") as string,
//   } as HttpTypes.StoreUpdateCustomerAddress

//   const phone = formData.get("phone") as string

//   if (phone) {
//     address.phone = phone
//   }

//   const headers = {
//     ...(await getAuthHeaders()),
//   }

//   return sdk.store.customer
//     .updateAddress(addressId, address, {}, headers)
//     .then(async () => {
//       const customerCacheTag = await getCacheTag("customers")
//       revalidateTag(customerCacheTag)
//       return { success: true, error: null }
//     })
//     .catch((err) => {
//       return { success: false, error: err.toString() }
//     })
// }
