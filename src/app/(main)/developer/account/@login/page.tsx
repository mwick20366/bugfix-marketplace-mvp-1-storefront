import { Metadata } from "next"

import LoginTemplate from "@modules/developer/account/templates/login-template"

// export const metadata: Metadata = {
//   title: "Sign in",
//   description: "Sign in to your BugZapper Developer account.",
// }

export default function Login() {
  return <LoginTemplate />
}
