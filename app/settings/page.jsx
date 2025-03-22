
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuth } from '@/hooks/useAuth'
import { useDropzone } from 'react-dropzone'
import { Loader2, Upload, Camera } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // Load user profile data
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        )
        
        const userData = response.data
        setUsername(userData.username)
        setEmail(userData.email)
        setBio(userData.bio || '')
        setAvatarPreview(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userData._id}/avatar?${Date.now()}`)
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfile()
  }, [user, router])

  const onAvatarDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0]
    if (file && file.type.startsWith('image/')) {
      setAvatar(file)
      setAvatarPreview(URL.createObjectURL(file))
    } else {
      toast({
        title: 'Invalid file',
        description: 'Please upload a valid image file',
        variant: 'destructive'
      })
    }
  }, [toast])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onAvatarDrop,
    accept: {
      'image/*': []
    },
    maxFiles: 1
  })

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    
    if (!username.trim()) {
      toast({
        title: 'Username required',
        description: 'Please enter a username',
        variant: 'destructive'
      })
      return
    }
    
    try {
      setLoading(true)
      
      const formData = new FormData()
      formData.append('username', username)
      formData.append('bio', bio)
      if (avatar) formData.append('avatar', avatar)
      
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${user.token}`
          }
        }
      )
      
      // Update user context with new username
      updateUser({
        ...user,
        username: response.data.username
      })
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully'
      })
      
      // Update avatar preview with timestamp to force refresh
      if (avatar) {
        setAvatarPreview(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user._id}/avatar?${Date.now()}`)
        setAvatar(null)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Update failed',
        description: error.response?.data?.message || 'An error occurred while updating your profile',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'All fields required',
        description: 'Please fill in all password fields',
        variant: 'destructive'
      })
      return
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'New password and confirmation must match',
        variant: 'destructive'
      })
      return
    }
    
    if (newPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'New password must be at least 6 characters long',
        variant: 'destructive'
      })
      return
    }
    
    try {
      setLoading(true)
      
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/password`,
        {
          currentPassword,
          newPassword
        },
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      )
      
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully'
      })
      
      // Clear password fields
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Error updating password:', error)
      toast({
        title: 'Update failed',
        description: error.response?.data?.message || 'An error occurred while updating your password',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }
    
    try {
      setLoading(true)
      
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/account`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      
      toast({
        title: 'Account deleted',
        description: 'Your account has been deleted successfully'
      })
      
      logout()
      router.push('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        title: 'Delete failed',
        description: error.response?.data?.message || 'An error occurred while deleting your account',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Clean up avatar preview URL
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  if (!user) {
    return null // Handled by the redirect in useEffect
  }

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-tube-red" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <Tabs defaultValue="profile">
        <TabsList className="bg-tube-gray mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <div className="bg-tube-gray rounded-lg p-6">
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <div 
                  {...getRootProps()} 
                  className="relative cursor-pointer group"
                >
                  <input {...getInputProps()} />
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/default-avatar.png' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-tube-red p-2 rounded-full">
                    <Camera size={16} className="text-white" />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-xs font-medium">Change</span>
                  </div>
                </div>
                <p className="text-sm text-tube-light-gray mt-2">Click to upload new avatar</p>
              </div>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  className="input-field bg-gray-800"
                  disabled
                />
                <p className="text-xs text-tube-light-gray mt-1">Email cannot be changed</p>
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input-field min-h-[100px]"
                  placeholder="Tell viewers about yourself"
                  maxLength={1000}
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn-primary flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </TabsContent>
        
        <TabsContent value="password">
          <div className="bg-tube-gray rounded-lg p-6">
            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn-primary flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </TabsContent>
        
        <TabsContent value="account">
          <div className="bg-tube-gray rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Danger Zone</h2>
            <p className="text-tube-light-gray mb-6">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            
            <button
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : 'Delete Account'}
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
