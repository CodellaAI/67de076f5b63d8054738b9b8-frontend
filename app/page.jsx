
'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import VideoGrid from '@/components/VideoGrid'
import { Loader2 } from 'lucide-react'
import CategoryPills from '@/components/CategoryPills'

export default function Home() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  const categories = [
    'All', 'Music', 'Gaming', 'Sports', 'News', 'Comedy', 'Education', 'Science', 'Technology'
  ]

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/videos`, {
          params: {
            category: selectedCategory !== 'All' ? selectedCategory : undefined
          }
        })
        setVideos(response.data)
      } catch (error) {
        console.error('Error fetching videos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [selectedCategory])

  return (
    <div className="container mx-auto">
      <CategoryPills 
        categories={categories} 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-tube-red" />
        </div>
      ) : videos.length > 0 ? (
        <VideoGrid videos={videos} />
      ) : (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">No videos found</h2>
          <p className="text-tube-light-gray">
            {selectedCategory !== 'All' 
              ? `No videos found in the ${selectedCategory} category` 
              : 'No videos have been uploaded yet'}
          </p>
        </div>
      )}
    </div>
  )
}
