
'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import { ThumbsUp, ThumbsDown, MoreVertical, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useToast } from '@/hooks/useToast'

export default function Comments({ videoId }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [editingComment, setEditingComment] = useState(null)
  const [editText, setEditText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}/comments`)
        setComments(response.data)
      } catch (error) {
        console.error('Error fetching comments:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchComments()
  }, [videoId])
  
  const handleSubmitComment = async (e) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'You need to sign in to comment',
        variant: 'destructive'
      })
      return
    }
    
    if (!newComment.trim()) return
    
    try {
      setSubmitting(true)
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      
      setComments([response.data, ...comments])
      setNewComment('')
    } catch (error) {
      console.error('Error posting comment:', error)
      toast({
        title: 'Comment failed',
        description: error.response?.data?.message || 'Failed to post your comment',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return
    
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`,
        { content: editText },
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      
      setComments(comments.map(comment => 
        comment._id === commentId ? response.data : comment
      ))
      
      setEditingComment(null)
      setEditText('')
    } catch (error) {
      console.error('Error editing comment:', error)
      toast({
        title: 'Edit failed',
        description: error.response?.data?.message || 'Failed to edit your comment',
        variant: 'destructive'
      })
    }
  }
  
  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      
      setComments(comments.filter(comment => comment._id !== commentId))
      
      toast({
        title: 'Comment deleted',
        description: 'Your comment has been deleted'
      })
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast({
        title: 'Delete failed',
        description: error.response?.data?.message || 'Failed to delete your comment',
        variant: 'destructive'
      })
    }
  }
  
  const handleLikeComment = async (commentId) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'You need to sign in to like comments',
        variant: 'destructive'
      })
      return
    }
    
    try {
      const comment = comments.find(c => c._id === commentId)
      const isLiked = comment.isLiked
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}/like`,
        { action: isLiked ? 'unlike' : 'like' },
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      
      setComments(comments.map(comment => 
        comment._id === commentId ? {
          ...comment,
          likes: response.data.likes,
          isLiked: !isLiked
        } : comment
      ))
    } catch (error) {
      console.error('Error liking comment:', error)
    }
  }

  return (
    <div className="mt-6">
      <h3 className="font-medium mb-4">{comments.length} Comments</h3>
      
      {user && (
        <form onSubmit={handleSubmitComment} className="mb-6 flex items-start">
          <img 
            src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user._id}/avatar`}
            alt={user.username}
            className="w-10 h-10 rounded-full mr-3"
            onError={(e) => { e.target.src = '/default-avatar.png' }}
          />
          <div className="flex-1">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-transparent border-b border-gray-700 focus:border-gray-500 outline-none pb-1"
            />
            
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => setNewComment('')}
                className="text-tube-light-gray hover:text-white px-3 py-1 rounded-full text-sm mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className={`bg-tube-red text-white px-3 py-1 rounded-full text-sm flex items-center ${
                  !newComment.trim() || submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                }`}
              >
                {submitting && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                Comment
              </button>
            </div>
          </div>
        </form>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-tube-red" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map(comment => (
            <div key={comment._id} className="flex">
              <img 
                src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${comment.user._id}/avatar`}
                alt={comment.user.username}
                className="w-10 h-10 rounded-full mr-3"
                onError={(e) => { e.target.src = '/default-avatar.png' }}
              />
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-medium">{comment.user.username}</span>
                  <span className="text-tube-light-gray text-sm ml-2">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                  
                  {comment.edited && (
                    <span className="text-tube-light-gray text-xs ml-2">(edited)</span>
                  )}
                </div>
                
                {editingComment === comment._id ? (
                  <div>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full bg-transparent border-b border-gray-700 focus:border-gray-500 outline-none pb-1 mt-1"
                      autoFocus
                    />
                    
                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingComment(null)
                          setEditText('')
                        }}
                        className="text-tube-light-gray hover:text-white px-3 py-1 rounded-full text-sm mr-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditComment(comment._id)}
                        disabled={!editText.trim()}
                        className={`bg-tube-red text-white px-3 py-1 rounded-full text-sm ${
                          !editText.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                        }`}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1">{comment.content}</p>
                )}
                
                <div className="flex items-center mt-2">
                  <button 
                    onClick={() => handleLikeComment(comment._id)}
                    className={`flex items-center mr-3 ${comment.isLiked ? 'text-blue-400' : 'text-tube-light-gray'}`}
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    {comment.likes > 0 && <span>{comment.likes}</span>}
                  </button>
                  
                  {user && user._id === comment.user._id && (
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button className="text-tube-light-gray hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenu.Trigger>
                      
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content 
                          className="bg-tube-gray rounded-md shadow-lg p-2 min-w-[150px] z-50"
                          sideOffset={5}
                          align="start"
                        >
                          <DropdownMenu.Item className="outline-none">
                            <button 
                              onClick={() => {
                                setEditingComment(comment._id)
                                setEditText(comment.content)
                              }}
                              className="flex items-center px-3 py-2 rounded hover:bg-gray-700 w-full text-left"
                            >
                              Edit
                            </button>
                          </DropdownMenu.Item>
                          
                          <DropdownMenu.Item className="outline-none">
                            <button 
                              onClick={() => handleDeleteComment(comment._id)}
                              className="flex items-center px-3 py-2 rounded hover:bg-gray-700 w-full text-left text-red-400"
                            >
                              Delete
                            </button>
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-tube-light-gray">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  )
}
