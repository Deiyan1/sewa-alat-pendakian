'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

interface Category {
  id: string | number
  name: string
  slug: string
}

interface CatalogFiltersProps {
  categories: Category[]
  currentCategory: string
  currentQuery: string
}

export default function CatalogFilters({ categories, currentCategory, currentQuery }: CatalogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentQuery)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (search) {
      params.set('query', search)
    } else {
      params.delete('query')
    }
    router.push(`/?${params.toString()}`)
  }

  const handleCategorySelect = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set('category', slug)
    } else {
      params.delete('category')
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari tenda, carrier, sepatu gunung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-2xl py-3.5 pl-12 pr-4 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Cari
          </button>
        </div>
      </form>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <button
          onClick={() => handleCategorySelect(null)}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border cursor-pointer ${
            !currentCategory
              ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10'
              : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground'
          }`}
        >
          Semua Alat
        </button>
        
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategorySelect(cat.slug)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border cursor-pointer ${
              currentCategory === cat.slug
                ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10'
                : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  )
}
