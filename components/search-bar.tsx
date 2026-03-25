"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function SearchBar({ onSearch }: { onSearch?: (query: string) => void } = {}) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full max-w-sm mx-auto">
      <Input
        type="text"
        placeholder="Rechercher..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 rounded-xl border border-gray-300 shadow-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all px-4 py-2"
      />
      <button
        type="submit"
        className="flex items-center justify-center w-12 h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-md transition-colors"
      >
        <Search className="w-5 h-5" strokeWidth={2.5} />
      </button>
    </form>
  )
}