"use client"

import type React from "react"

import { FirebaseAuthProvider } from "@/components/firebase-auth-provider"

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
}
