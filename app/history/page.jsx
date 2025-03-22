
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, Trash2 } from 'lucide-react'
import VideoCard from '@/components/VideoCard'

export default function HistoryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchHistory = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/history`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        )
        setHistory(response.data)
      } catch (error) {
        console.error('Error fetching history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [user, router])

  const clearHistory = async () => {
    if (!confirm('Are you sure you want to clear your watch history?')) return
    
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/history`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      setHistory([])
    } catch (error) {
      console.error('Error clearing history:', error)
    }
  }

  if (!user) {
    return null // Handled by the redirect in useEffect
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-tube-red" />
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Watch History</h1>
        
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="flex items-center text-sm bg-tube-gray hover:bg-red-900/50 text-red-400 px-4 py-2 rounded-full"
          >
            <Trash2 size={16} className="mr-2" />
            Clear all watch history
          </button>
        )}
      </div>

      {history.length > 0 ? (
        <div className="space-y-4">
          {history.map(item => (
            <VideoCard 
              key={`${item.video._id}-${item.watchedAt}`} 
              video={item.video}
              timestamp={new Date(item.watchedAt).toISOString()}
              horizontal={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-xl font-bold mb-4">No watch history</h2>
          <p className="text-tube-light-gray">Videos you watch will appear here</p>
        </div>
      )}
    </div>
  )
}
