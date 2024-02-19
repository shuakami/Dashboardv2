import "@/styles/globals.css"
import { Metadata, Viewport } from "next"

import { siteConfig } from "@/config/site"
import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/providers"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Toaster as DefaultToaster } from "@/registry/default/ui/toaster"
import { Toaster as NewYorkSonner } from "@/registry/new-york/ui/sonner"
import { Toaster as NewYorkToaster } from "@/registry/new-york/ui/toaster"


interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          " font-sans",
          fontSans.className
        )}
      >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >

        <main className="flex w-full flex-1 items-center justify-center">
          <div className="w-full ">
            {children}
          </div>
        </main>

        <TailwindIndicator />
        <ThemeSwitcher />
        <NewYorkToaster />
        <DefaultToaster />
        <NewYorkSonner />
      </ThemeProvider>
      </body>
      </html>
    </>
  )
}
