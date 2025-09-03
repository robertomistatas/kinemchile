"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Layout } from "@/components/layout"

export default function TestComponent() {
  const [test, setTest] = useState(false)

  return (
    <Layout>
      <div>Test</div>
    </Layout>
  )
}
