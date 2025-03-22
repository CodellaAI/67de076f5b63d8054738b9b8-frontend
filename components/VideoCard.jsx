
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { MoreVertical, Clock, PlayList, Share2 } from 'lucide-react'

export default function VideoCard({ video, horizontal = false, timestamp }) {
  const [isHovered, setIsHovered] = useState(false)
  
  const formattedDate = timestamp 
    ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    : formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })
  
  // Format view count
  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    } else {
      return count
    }
  }
  
  // Format duration (assuming duration is in seconds)
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    }
  }

  return (
    <div 
      className={`group ${horizontal ? 'flex space-x-3' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative ${horizontal ? 'w-40 flex-shrink-0' : 'w-full'}`}>
        <Link href={`/watch/${video._id}`}>
          <div className="relative aspect-video bg-tube-gray rounded-lg overflow-hidden">
            <img 
              src={`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${video._id}/thumbnail`}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            {video.duration && (
              <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                {formatDuration(video.duration)}
              </div>
            )}
          </div>
        </Link>
      </div>
      
      <div className={`flex mt-2 ${horizontal ? 'flex-1' : ''}`}>
        {!horizontal && (
          <Link href={`/channel/${video.creator._id}`} className="mr-2 flex-shrink-0">
            <img 
              src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${video.creator._id}/avatar`}
              alt={video.creator.username}
              className="w-9 h-9 rounded-full"
              onError={(e) => { e.target.src = '/default-avatar.png' }}
            />
          </Link>
        )}
        
        <div className="flex-1 min-w-0">
          <Link href={`/watch/${video._id}`} className="block">
            <h3 className={`font-medium ${horizontal ? 'text-sm line-clamp-1' : 'line-clamp-2'}`}>
              {video.title}
            </h3>
          </Link>
          
          <Link href={`/channel/${video.creator._id}`} className="block">
            <p className="text-tube-light-gray text-sm mt-1">{video.creator.username}</p>
          </Link>
          
          <div className="flex text-tube-light-gray text-xs mt-1">
            <span>{formatViewCount(video.views)} views</span>
            <span className="mx-1">•</span>
            <span>{formattedDate}</span>
          </div>
        </div>
        
        <div className="relative flex-shrink-0">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button 
                className={`p-1 rounded-full ${isHovered ? 'visible' : 'invisible group-hover:visible'}`}
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </DropdownMenu.Trigger>
            
            <DropdownMenu.Portal>
              <DropdownMenu.Content 
                className="bg-tube-gray rounded-md shadow-lg p-2 min-w-[200px] z-50"
                sideOffset={5}
                align="end"
              >
                <DropdownMenu.Item className="outline-none">
                  <button className="flex items-center px-3 py-2 rounded hover:bg-gray-700 w-full text-left">
                    <Clock className="w-4 h-4 mr-2" />
                    Save to Watch later
                  </button>
                </DropdownMenu.Item>
                
                <DropdownMenu.Item className="outline-none">
                  <button className="flex items-center px-3 py-2 rounded hover:bg-gray-700 w-full text-left">
                    <PlayList className="w-4 h-4 mr-2" />
                    Save to playlist
                  </button>
                </DropdownMenu.Item>
                
                <DropdownMenu.Item className="outline-none">
                  <button className="flex items-center px-3 py-2 rounded hover:bg-gray-700 w-full text-left">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </div>
  )
}
