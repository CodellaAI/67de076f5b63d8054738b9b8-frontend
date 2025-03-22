
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  Search, 
  Menu, 
  Bell, 
  Upload, 
  User, 
  LogOut, 
  Settings 
} from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Dialog from '@radix-ui/react-dialog'
import MobileMenu from './MobileMenu'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-tube-black border-b border-gray-800 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Dialog.Root open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <Dialog.Trigger asChild>
              <button className="mr-4 md:hidden">
                <Menu className="w-6 h-6" />
              </button>
            </Dialog.Trigger>
            <MobileMenu user={user} />
          </Dialog.Root>

          <Link href="/" className="flex items-center">
            <div className="bg-tube-red rounded p-1 mr-1">
              <div className="w-6 h-4 bg-white rounded-sm flex items-center justify-center">
                <div className="w-2 h-2 bg-tube-red rounded-sm"></div>
              </div>
            </div>
            <span className="text-xl font-bold hidden sm:block">TubeClone</span>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="hidden md:flex items-center flex-grow max-w-2xl mx-4">
          <div className="relative w-full">
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
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>

        <div className="flex items-center">
          <button 
            onClick={() => router.push('/search')}
            className="p-2 md:hidden"
          >
            <Search className="w-6 h-6" />
          </button>

          {user ? (
            <>
              <Link href="/studio/upload" className="p-2">
                <Upload className="w-6 h-6" />
              </Link>
              
              <Link href="/notifications" className="p-2 relative">
                <Bell className="w-6 h-6" />
                {/* Notification badge */}
                <span className="absolute top-1 right-1 bg-tube-red text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  2
                </span>
              </Link>
              
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="ml-2 rounded-full overflow-hidden">
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user._id}/avatar`}
                      alt={user.username}
                      className="w-8 h-8 object-cover"
                      onError={(e) => { e.target.src = '/default-avatar.png' }}
                    />
                  </button>
                </DropdownMenu.Trigger>
                
                <DropdownMenu.Portal>
                  <DropdownMenu.Content 
                    className="bg-tube-gray rounded-md shadow-lg p-2 min-w-[200px]"
                    sideOffset={5}
                    align="end"
                  >
                    <DropdownMenu.Item className="outline-none">
                      <Link 
                        href={`/channel/${user._id}`}
                        className="flex items-center px-3 py-2 rounded hover:bg-gray-700 w-full"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Your channel
                      </Link>
                    </DropdownMenu.Item>
                    
                    <DropdownMenu.Item className="outline-none">
                      <Link 
                        href="/settings"
                        className="flex items-center px-3 py-2 rounded hover:bg-gray-700 w-full"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenu.Item>
                    
                    <DropdownMenu.Separator className="h-px bg-gray-700 my-1" />
                    
                    <DropdownMenu.Item className="outline-none">
                      <button 
                        onClick={logout}
                        className="flex items-center px-3 py-2 rounded hover:bg-gray-700 w-full text-left"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </button>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </>
          ) : (
            <Link 
              href="/login" 
              className="flex items-center text-tube-red border border-tube-red rounded-full px-3 py-1 hover:bg-tube-red/10"
            >
              <User className="w-5 h-5 mr-1" />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
