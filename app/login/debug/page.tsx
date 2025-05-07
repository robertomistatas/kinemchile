"use client"

import FirebaseDebug from "@/components/firebase-debug"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function FirebaseDebugPage() {
  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link href="/login">Volver al login</Link>
        </Button>
      </div>
      <h1 className="text-3xl font-bold mb-6">Depuración de Firebase</h1>
      <FirebaseDebug />
    </div>
  )
}
