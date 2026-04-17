import { Metadata } from "next"

import LoginTemplate from "@modules/client/account/templates/login-template"

// export const metadata: Metadata = {
//   title: "Sign in",
//   description: "Sign in to your BugZapper Client account.",
// }

export default function Login() {
  return <LoginTemplate />
}
