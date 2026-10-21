"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { annonceApi } from "@/lib/annonce-api"
import { useAuth } from "@/contexts/auth-context"

interface Announcement {
  _id: string
  title: string
  price?: number
  category?: string
  images?: string[]
}

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<Announcement[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { token } = useAuth()

  // Fetch announcements whenever search query changes
  useEffect(() => {
    if (searchQuery.trim().length < 1) {
      setResults([])
      setIsOpen(false)
      return
    }

    const fetchResults = async () => {
      setIsLoading(true)
      try {
        const response = await annonceApi.getAll({}, token || undefined)
        
        // Handle different response structures
        let allAnnouncements: Announcement[] = []
        if (response.data?.annonces && Array.isArray(response.data.annonces)) {
          allAnnouncements = response.data.annonces
        } else if (Array.isArray(response.data)) {
          allAnnouncements = response.data
        }

        // Filter by search query
        const filtered = allAnnouncements
          .filter((ann: any) => ann && ann._id && ann.title)
          .filter((ann: Announcement) =>
            ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ann.category?.toLowerCase().includes(searchQuery.toLowerCase())
          )

        console.log("[SEARCH] Filtered results:", filtered.length)
        setResults(filtered.slice(0, 10))
      } catch (error) {
        console.error("[SEARCH] Error fetching announcements:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchResults, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, token])

  const handleSelectAnnouncement = (id: string) => {
    setSearchQuery("")
    setResults([])
    setIsOpen(false)
    router.push(`/announcements/${id}`)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setIsOpen(value.trim().length > 0)
  }

  const handleInputFocus = () => {
    if (searchQuery.trim().length > 0) {
      setIsOpen(true)
    }
  }

  const handleClickOutside = () => {
    setIsOpen(false)
  }

  return (
    <div className="w-full max-w-sm mx-auto relative">
      <div className="relative">
        <Input
          type="text"
          placeholder="Rechercher une annonce..."
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="w-full pr-12 rounded-xl border border-gray-300 shadow-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all px-4 py-2"
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 text-gray-400 hover:text-rose-500"
        >
          <Search className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <>
          {/* Overlay to close dropdown */}
          <div
            className="fixed inset-0 z-40"
            onClick={handleClickOutside}
          />

          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {isLoading && (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                Chargement...
              </div>
            )}

            {!isLoading && results.length === 0 && searchQuery.trim() && (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                Aucune annonce trouvée
              </div>
            )}

            {!isLoading &&
              results.length > 0 &&
              results.map((announcement) => (
                <button
                  key={announcement._id}
                  onClick={() => handleSelectAnnouncement(announcement._id)}
                  className="w-full px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-left transition-colors flex gap-3 items-start"
                >
                  {announcement.images && announcement.images[0] && (
                    <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                      <img
                        src={announcement.images[0]}
                        alt={announcement.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 line-clamp-1">
                      {announcement.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {announcement.category && (
                        <span className="text-xs text-gray-500 capitalize">
                          {announcement.category}
                        </span>
                      )}
                      {announcement.price && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs font-semibold text-rose-500">
                            {announcement.price}€
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </>
      )}
    </div>
  )
}