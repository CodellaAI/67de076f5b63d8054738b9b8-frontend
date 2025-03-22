
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'
import VideoGrid from '@/components/VideoGrid'
import Link from 'next/link'

export default function SubscriptionsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchSubscriptionsData = async () => {
      try {
        const [subsResponse, videosResponse] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions`,
            { headers: { Authorization: `Bearer ${user.token}` } }
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/videos/subscriptions`,
            { headers: { Authorization: `Bearer ${user.token}` } }
          )
        ])
        
        setSubscriptions(subsResponse.data)
        setVideos(videosResponse.data)
      } catch (error) {
        console.error('Error fetching subscriptions data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptionsData()
  }, [user, router])

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
      <h1 className="text-2xl font-bold mb-6">Subscriptions</h1>
      
      {subscriptions.length > 0 ? (
        <>
          <div className="flex overflow-x-auto gap-4 pb-4 mb-6 scrollbar-hide">
            {subscriptions.map(sub => (
              <Link 
                key={sub.creator._id} 
                href={`/channel/${sub.creator._id}`}
                className="flex flex-col items-center min-w-[100px]"
              >
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${sub.creator._id}/avatar`}
                  alt={sub.creator.username}
                  className="w-16 h-16 rounded-full mb-2"
                  onError={(e) => { e.target.src = '/default-avatar.png' }}
                />
                <span className="text-sm text-center truncate w-full">{sub.creator.username}</span>
              </Link>
            ))}
          </div>
          
          {videos.length > 0 ? (
            <VideoGrid videos={videos} />
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-bold mb-4">No videos from your subscriptions</h2>
              <p className="text-tube-light-gray">
                Channels you're subscribed to haven't uploaded any videos yet
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-xl font-bold mb-4">No subscriptions yet</h2>
          <p className="text-tube-light-gray mb-6">
            Subscribe to channels to see their latest videos here
          </p>
          <Link href="/" className="btn-primary">
            Discover channels
          </Link>
        </div>
      )}
    </div>
  )
}
