"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { annonceApi } from "@/lib/annonce-api"

export default function TestEditForm() {
  const { token } = useAuth()
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function testApi() {
      if (!token) {
        setError("No token available")
        setLoading(false)
        return
      }

      try {
        // Test with a known announcement ID
        const announcementId = "69b580be8673524d1a0bec9f"
        console.log("Testing API with ID:", announcementId)
        const response = await annonceApi.getById(announcementId, token)
        console.log("Full response:", response)
        console.log("response.data:", response.data)
        console.log("response.data?.annonce:", response.data?.annonce)
        console.log("response.annonce:", (response as any).annonce)
        console.log("response.title:", (response as any).title)
        
        setData(response)
      } catch (err) {
        console.error("API Error:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    testApi()
  }, [token])

  if (loading) return <p>Loading...</p>
  if (error) return <p className="text-red-500">Error: {error}</p>
  if (!data) return <p>No data</p>

  return (
    <pre className="p-4 bg-gray-100 rounded overflow-auto max-h-96">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}
