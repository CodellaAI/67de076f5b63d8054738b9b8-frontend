
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { useAuth } from '@/hooks/useAuth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import VideoGrid from '@/components/VideoGrid'
import { Bell, Loader2 } from 'lucide-react'

export default function ChannelPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [channel, setChannel] = useState(null)
  const [videos, setVideos] = useState([])
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true)
        const [channelRes, videosRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/user/${id}`)
        ])
        
        setChannel(channelRes.data)
        setVideos(videosRes.data)
        
        // Check if user is subscribed to this channel
        if (user) {
          const subscriptionRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/check/${id}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
          )
          setIsSubscribed(subscriptionRes.data.isSubscribed)
        }
      } catch (error) {
        console.error('Error fetching channel data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChannelData()
  }, [id, user])

  const handleSubscribe = async () => {
    if (!user) return
    
    try {
      if (isSubscribed) {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions`, 
          { creatorId: id },
          { headers: { Authorization: `Bearer ${user.token}` } }
        )
      }
      
      setIsSubscribed(!isSubscribed)
      
      // Update subscriber count
      setChannel(prev => ({
        ...prev,
        subscribersCount: isSubscribed 
          ? prev.subscribersCount - 1 
          : prev.subscribersCount + 1
      }))
    } catch (error) {
      console.error('Error updating subscription:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-tube-red" />
      </div>
    )
  }

  if (!channel) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Channel not found</h2>
        <p className="text-tube-light-gray">The channel you're looking for doesn't exist</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="relative">
        <div className="h-32 md:h-48 bg-gradient-to-r from-tube-red to-purple-600 rounded-lg"></div>
        
        <div className="flex flex-col md:flex-row md:items-end -mt-12 md:-mt-16 mb-6 px-4">
          <img 
            src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}/avatar`}
            alt={channel.username}
            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-tube-black"
            onError={(e) => { e.target.src = '/default-avatar.png' }}
          />
          
          <div className="mt-4 md:mt-0 md:ml-6 mb-2 flex-grow">
            <h1 className="text-2xl font-bold">{channel.username}</h1>
            <p className="text-tube-light-gray">
              {channel.subscribersCount || 0} subscribers • {videos.length} videos
            </p>
            {channel.bio && (
              <p className="text-sm text-tube-light-gray mt-1 line-clamp-1">{channel.bio}</p>
            )}
          </div>
          
          {user && user._id !== id && (
            <button 
              onClick={handleSubscribe}
              className={`mt-4 md:mt-0 px-6 py-2 rounded-full text-sm font-medium ${
                isSubscribed 
                  ? 'bg-tube-gray text-white hover:bg-gray-700 flex items-center gap-1' 
                  : 'bg-tube-red text-white hover:bg-red-700'
              }`}
            >
              {isSubscribed ? (
                <>
                  <Bell size={16} />
                  Subscribed
                </>
              ) : 'Subscribe'}
            </button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="videos">
        <TabsList className="bg-tube-gray mb-6">
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        
        <TabsContent value="videos">
          {videos.length > 0 ? (
            <VideoGrid videos={videos} />
          ) : (
            <div className="text-center py-20">
              <h2 className="text-xl font-bold mb-4">No videos yet</h2>
              <p className="text-tube-light-gray">This channel hasn't uploaded any videos</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="about">
          <div className="bg-tube-gray rounded-lg p-6 max-w-3xl">
            <h2 className="text-xl font-bold mb-4">About</h2>
            
            <div className="mb-6">
              <h3 className="text-sm text-tube-light-gray mb-2">Description</h3>
              <p className="whitespace-pre-line">{channel.bio || 'No description provided.'}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm text-tube-light-gray mb-2">Stats</h3>
              <p>Joined: {new Date(channel.createdAt).toLocaleDateString()}</p>
              <p>{channel.subscribersCount || 0} subscribers</p>
              <p>{videos.length} videos</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
