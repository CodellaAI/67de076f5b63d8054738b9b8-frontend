
'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '@/hooks/useAuth'
import { Upload, X, Image, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import * as Progress from '@radix-ui/react-progress'

export default function UploadPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [video, setVideo] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const categories = [
    'Music', 'Gaming', 'Sports', 'News', 'Comedy', 'Education', 'Science', 'Technology'
  ]

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const onVideoDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0]
    if (file && file.type.startsWith('video/')) {
      setVideo(file)
    } else {
      toast({
        title: 'Invalid file',
        description: 'Please upload a valid video file',
        variant: 'destructive'
      })
    }
  }, [toast])

  const onThumbnailDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0]
    if (file && file.type.startsWith('image/')) {
      setThumbnail(file)
      setThumbnailPreview(URL.createObjectURL(file))
    } else {
      toast({
        title: 'Invalid file',
        description: 'Please upload a valid image file',
        variant: 'destructive'
      })
    }
  }, [toast])

  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps } = useDropzone({
    onDrop: onVideoDrop,
    accept: {
      'video/*': []
    },
    maxFiles: 1
  })

  const { getRootProps: getThumbnailRootProps, getInputProps: getThumbnailInputProps } = useDropzone({
    onDrop: onThumbnailDrop,
    accept: {
      'image/*': []
    },
    maxFiles: 1
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!video) {
      toast({
        title: 'Video required',
        description: 'Please upload a video file',
        variant: 'destructive'
      })
      return
    }
    
    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your video',
        variant: 'destructive'
      })
      return
    }
    
    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('video', video)
      if (thumbnail) formData.append('thumbnail', thumbnail)
      formData.append('title', title)
      formData.append('description', description)
      if (category) formData.append('category', category)
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/videos/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${user.token}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percentCompleted)
          }
        }
      )
      
      toast({
        title: 'Upload successful',
        description: 'Your video has been uploaded successfully',
      })
      
      router.push(`/watch/${response.data._id}`)
    } catch (error) {
      console.error('Error uploading video:', error)
      toast({
        title: 'Upload failed',
        description: error.response?.data?.message || 'An error occurred while uploading your video',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  // Clean up thumbnail preview URL
  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview)
      }
    }
  }, [thumbnailPreview])

  if (!user) {
    return null // Handled by the redirect in useEffect
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload Video</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Video File</label>
            <div 
              {...getVideoRootProps()} 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-tube-gray/30 transition-colors ${
                video ? 'border-green-500' : 'border-gray-600'
              }`}
            >
              <input {...getVideoInputProps()} />
              {video ? (
                <div className="flex flex-col items-center">
                  <p className="font-medium text-green-500 mb-1">Video selected</p>
                  <p className="text-sm text-tube-light-gray">{video.name}</p>
                  <p className="text-xs text-tube-light-gray mt-1">
                    {(video.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setVideo(null)
                    }}
                    className="mt-2 text-red-500 flex items-center text-sm"
                  >
                    <X size={16} className="mr-1" />
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-tube-light-gray mb-2" />
                  <p className="font-medium">Drag and drop your video file here</p>
                  <p className="text-sm text-tube-light-gray mt-1">or click to browse files</p>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Thumbnail (Optional)</label>
            <div 
              {...getThumbnailRootProps()} 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-tube-gray/30 transition-colors ${
                thumbnail ? 'border-green-500' : 'border-gray-600'
              }`}
            >
              <input {...getThumbnailInputProps()} />
              {thumbnail ? (
                <div className="flex flex-col items-center">
                  <img 
                    src={thumbnailPreview} 
                    alt="Thumbnail preview" 
                    className="max-h-32 mb-2 rounded"
                  />
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setThumbnail(null)
                      setThumbnailPreview('')
                    }}
                    className="mt-2 text-red-500 flex items-center text-sm"
                  >
                    <X size={16} className="mr-1" />
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Image className="w-12 h-12 text-tube-light-gray mb-2" />
                  <p className="font-medium">Drag and drop your thumbnail here</p>
                  <p className="text-sm text-tube-light-gray mt-1">or click to browse files</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="Enter video title"
            maxLength={100}
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">Description (Optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field min-h-[100px]"
            placeholder="Enter video description"
            maxLength={5000}
          ></textarea>
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-2">Category (Optional)</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field"
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress.Root 
              className="h-2 overflow-hidden bg-tube-gray rounded-full"
              value={uploadProgress}
            >
              <Progress.Indicator
                className="h-full bg-tube-red transition-all duration-500"
                style={{ width: `${uploadProgress}%` }}
              />
            </Progress.Root>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary mr-4"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center"
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : 'Upload Video'}
          </button>
        </div>
      </form>
    </div>
  )
}
