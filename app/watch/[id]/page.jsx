
'use client'

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Download, 
  MoreHorizontal, 
  Bell,
  Loader2
} from 'lucide-react'
import Comments from '@/components/Comments'
import VideoCard from '@/components/VideoCard'
import { useAuth } from '@/hooks/useAuth'

export default function WatchPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [video, setVideo] = useState(null)
  const [relatedVideos, setRelatedVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [likeStatus, setLikeStatus] = useState(null) // null, 'like', 'dislike'
  const [showDescription, setShowDescription] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true)
        const [videoRes, relatedRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${id}`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/related/${id}`)
        ])
        
        setVideo(videoRes.data)
        setRelatedVideos(relatedRes.data)
        
        // If user is logged in, check subscription and like status
        if (user) {
          const [subscriptionRes, likeRes] = await Promise.all([
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/check/${videoRes.data.creator._id}`, {
              headers: { Authorization: `Bearer ${user.token}` }
            }),
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${id}/like/status`, {
              headers: { Authorization: `Bearer ${user.token}` }
            })
          ])
          
          setIsSubscribed(subscriptionRes.data.isSubscribed)
          setLikeStatus(likeRes.data.status)
        }
        
        // Add to watch history if user is logged in
        if (user) {
          await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/history`, 
            { videoId: id },
            { headers: { Authorization: `Bearer ${user.token}` } }
          )
        }
      } catch (error) {
        console.error('Error fetching video data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchVideoData()
  }, [id, user])

  const handleLike = async () => {
    if (!user) return
    
    try {
      const newStatus = likeStatus === 'like' ? null : 'like'
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${id}/like`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      
      setLikeStatus(newStatus)
      
      // Update video like count
      setVideo(prev => ({
        ...prev,
        likes: newStatus === 'like' 
          ? prev.likes + 1 
          : prev.likes - 1
      }))
    } catch (error) {
      console.error('Error liking video:', error)
    }
  }
  
  const handleDislike = async () => {
    if (!user) return
    
    try {
      const newStatus = likeStatus === 'dislike' ? null : 'dislike'
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${id}/like`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      
      setLikeStatus(newStatus)
    } catch (error) {
      console.error('Error disliking video:', error)
    }
  }
  
  const handleSubscribe = async () => {
    if (!user) return
    
    try {
      if (isSubscribed) {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/${video.creator._id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions`, 
          { creatorId: video.creator._id },
          { headers: { Authorization: `Bearer ${user.token}` } }
        )
      }
      
      setIsSubscribed(!isSubscribed)
    } catch (error) {
      console.error('Error updating subscription:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-tube-red" />
      </div>
    )
  }

  if (!video) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Video not found</h2>
        <p className="text-tube-light-gray">The video you're looking for doesn't exist or has been removed</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="aspect-video bg-tube-gray rounded-lg overflow-hidden">
          <video 
            ref={videoRef}
            className="w-full h-full video-player"
            src={`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${id}/stream`}
            poster={`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${id}/thumbnail`}
            controls
            autoPlay
          ></video>
        </div>
        
        <div className="mt-4">
          <h1 className="text-xl font-bold">{video.title}</h1>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mt-4 gap-4">
            <div className="flex items-center">
              <img 
                src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${video.creator._id}/avatar`} 
                alt={video.creator.username}
                className="w-10 h-10 rounded-full mr-3"
                onError={(e) => { e.target.src = '/default-avatar.png' }}
              />
              <div>
                <h3 className="font-medium">{video.creator.username}</h3>
                <p className="text-sm text-tube-light-gray">{video.creator.subscribersCount || 0} subscribers</p>
              </div>
              
              <button 
                onClick={handleSubscribe}
                className={`ml-4 px-4 py-2 rounded-full text-sm font-medium ${
                  isSubscribed 
                    ? 'bg-tube-gray text-white hover:bg-gray-700 flex items-center gap-1' 
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
              >
                {isSubscribed ? (
                  <>
                    <Bell size={16} />
                    Subscribed
                  </>
                ) : 'Subscribe'}
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex bg-tube-gray rounded-full overflow-hidden">
                <button 
                  onClick={handleLike}
                  className={`flex items-center px-4 py-2 ${likeStatus === 'like' ? 'text-blue-400' : 'text-white'}`}
                >
                  <ThumbsUp size={18} className="mr-2" />
                  {video.likes}
                </button>
                <div className="w-px bg-gray-700"></div>
                <button 
                  onClick={handleDislike}
                  className={`flex items-center px-4 py-2 ${likeStatus === 'dislike' ? 'text-blue-400' : 'text-white'}`}
                >
                  <ThumbsDown size={18} />
                </button>
              </div>
              
              <button className="flex items-center bg-tube-gray rounded-full px-4 py-2">
                <Share2 size={18} className="mr-2" />
                Share
              </button>
              
              <button className="flex items-center bg-tube-gray rounded-full px-4 py-2">
                <Download size={18} className="mr-2" />
                Download
              </button>
              
              <button className="bg-tube-gray rounded-full p-2">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>
          
          <div 
            className={`mt-4 p-4 bg-tube-gray rounded-lg ${showDescription ? '' : 'cursor-pointer'}`}
            onClick={() => !showDescription && setShowDescription(true)}
          >
            <div className="flex items-center text-sm mb-2">
              <span className="mr-3">{video.views} views</span>
              <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
            </div>
            
            {showDescription ? (
              <div>
                <p className="whitespace-pre-line">{video.description}</p>
                <button 
                  className="text-sm text-tube-light-gray mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDescription(false);
                  }}
                >
                  Show less
                </button>
              </div>
            ) : (
              <p className="line-clamp-2 text-sm">{video.description}</p>
            )}
          </div>
          
          <Comments videoId={id} />
        </div>
      </div>
      
      <div className="lg:col-span-1">
        <h3 className="font-medium mb-4">Related videos</h3>
        <div className="space-y-3">
          {relatedVideos.map(video => (
            <VideoCard 
              key={video._id} 
              video={video} 
              horizontal={true}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
