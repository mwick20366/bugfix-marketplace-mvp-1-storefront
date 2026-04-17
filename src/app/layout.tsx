import { Providers } from "./providers"
import { getBaseURL } from "@lib/util/env"
import { TooltipProvider, Toaster } from "@medusajs/ui"
import { Metadata } from "next"
import "../styles/globals.css"

export const metadata: Metadata = {
  title: {
    template: "%s | Bugzapper", // %s is replaced by the page's title
    default: "Bugzapper Home",
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <TooltipProvider>
          <Providers>
            <main className="relative">{props.children}</main>
          </Providers>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  )
}
