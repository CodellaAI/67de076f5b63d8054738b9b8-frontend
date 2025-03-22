
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Loader2, Search as SearchIcon } from 'lucide-react'
import VideoCard from '@/components/VideoCard'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!query) return
    
    const fetchResults = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/search`, {
          params: { q: query }
        })
        setResults(response.data)
        setSearched(true)
      } catch (error) {
        console.error('Error searching:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchResults()
  }, [query])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="container mx-auto">
      <form onSubmit={handleSearch} className="flex items-center mb-6">
        <div className="relative w-full max-w-2xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-tube-gray border border-gray-700 rounded-l-full py-2 px-4 focus:outline-none focus:border-gray-500"
          />
          <button
            type="submit"
            className="absolute right-0 top-0 h-full bg-tube-gray hover:bg-gray-700 rounded-r-full px-4 border border-gray-700 border-l-0"
          >
            <SearchIcon className="w-5 h-5" />
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-tube-red" />
        </div>
      ) : searched ? (
        results.length > 0 ? (
          <div className="space-y-4">
            {results.map(video => (
              <VideoCard 
                key={video._id} 
                video={video}
                horizontal={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-xl font-bold mb-4">No results found</h2>
            <p className="text-tube-light-gray">
              Try different keywords or check your spelling
            </p>
          </div>
        )
      ) : null}
    </div>
  )
}
