
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  Home, 
  Compass, 
  Clock, 
  ThumbsUp, 
  History, 
  PlaySquare, 
  Users, 
  Flame, 
  Music, 
  Gamepad2, 
  Film, 
  Newspaper, 
  Lightbulb, 
  Trophy, 
  Shirt 
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  
  const isActive = (path) => pathname === path

  return (
    <aside className="hidden md:block w-64 shrink-0 h-[calc(100vh-64px)] overflow-y-auto sticky top-16 bg-tube-black">
      <div className="p-3">
        <nav className="space-y-2">
          <div className="mb-4">
            <Link 
              href="/" 
              className={`flex items-center px-3 py-2 rounded-lg ${
                isActive('/') ? 'bg-tube-gray' : 'hover:bg-tube-gray/50'
              }`}
            >
              <Home className="w-5 h-5 mr-3" />
              <span>Home</span>
            </Link>
            
            <Link 
              href="/explore" 
              className={`flex items-center px-3 py-2 rounded-lg ${
                isActive('/explore') ? 'bg-tube-gray' : 'hover:bg-tube-gray/50'
              }`}
            >
              <Compass className="w-5 h-5 mr-3" />
              <span>Explore</span>
            </Link>
            
            <Link 
              href="/subscriptions" 
              className={`flex items-center px-3 py-2 rounded-lg ${
                isActive('/subscriptions') ? 'bg-tube-gray' : 'hover:bg-tube-gray/50'
              }`}
            >
              <Users className="w-5 h-5 mr-3" />
              <span>Subscriptions</span>
            </Link>
          </div>
          
          {user && (
            <div className="mb-4 pt-4 border-t border-gray-800">
              <h3 className="px-3 mb-1 text-sm font-medium">You</h3>
              
              <Link 
                href={`/channel/${user._id}`} 
                className={`flex items-center px-3 py-2 rounded-lg ${
                  pathname.startsWith(`/channel/${user._id}`) ? 'bg-tube-gray' : 'hover:bg-tube-gray/50'
                }`}
              >
                <PlaySquare className="w-5 h-5 mr-3" />
                <span>Your channel</span>
              </Link>
              
              <Link 
                href="/history" 
                className={`flex items-center px-3 py-2 rounded-lg ${
                  isActive('/history') ? 'bg-tube-gray' : 'hover:bg-tube-gray/50'
                }`}
              >
                <History className="w-5 h-5 mr-3" />
                <span>History</span>
              </Link>
              
              <Link 
                href="/liked" 
                className={`flex items-center px-3 py-2 rounded-lg ${
                  isActive('/liked') ? 'bg-tube-gray' : 'hover:bg-tube-gray/50'
                }`}
              >
                <ThumbsUp className="w-5 h-5 mr-3" />
                <span>Liked videos</span>
              </Link>
              
              <Link 
                href="/watch-later" 
                className={`flex items-center px-3 py-2 rounded-lg ${
                  isActive('/watch-later') ? 'bg-tube-gray' : 'hover:bg-tube-gray/50'
                }`}
              >
                <Clock className="w-5 h-5 mr-3" />
                <span>Watch later</span>
              </Link>
            </div>
          )}
          
          <div className="mb-4 pt-4 border-t border-gray-800">
            <h3 className="px-3 mb-1 text-sm font-medium">Explore</h3>
            
            <Link 
              href="/trending" 
              className={`flex items-center px-3 py-2 rounded-lg hover:bg-tube-gray/50`}
            >
              <Flame className="w-5 h-5 mr-3" />
              <span>Trending</span>
            </Link>
            
            <Link 
              href="/music" 
              className={`flex items-center px-3 py-2 rounded-lg hover:bg-tube-gray/50`}
            >
              <Music className="w-5 h-5 mr-3" />
              <span>Music</span>
            </Link>
            
            <Link 
              href="/gaming" 
              className={`flex items-center px-3 py-2 rounded-lg hover:bg-tube-gray/50`}
            >
              <Gamepad2 className="w-5 h-5 mr-3" />
              <span>Gaming</span>
            </Link>
            
            <Link 
              href="/movies" 
              className={`flex items-center px-3 py-2 rounded-lg hover:bg-tube-gray/50`}
            >
              <Film className="w-5 h-5 mr-3" />
              <span>Movies & TV</span>
            </Link>
            
            <Link 
              href="/news" 
              className={`flex items-center px-3 py-2 rounded-lg hover:bg-tube-gray/50`}
            >
              <Newspaper className="w-5 h-5 mr-3" />
              <span>News</span>
            </Link>
            
            <Link 
              href="/learning" 
              className={`flex items-center px-3 py-2 rounded-lg hover:bg-tube-gray/50`}
            >
              <Lightbulb className="w-5 h-5 mr-3" />
              <span>Learning</span>
            </Link>
            
            <Link 
              href="/sports" 
              className={`flex items-center px-3 py-2 rounded-lg hover:bg-tube-gray/50`}
            >
              <Trophy className="w-5 h-5 mr-3" />
              <span>Sports</span>
            </Link>
            
            <Link 
              href="/fashion" 
              className={`flex items-center px-3 py-2 rounded-lg hover:bg-tube-gray/50`}
            >
              <Shirt className="w-5 h-5 mr-3" />
              <span>Fashion</span>
            </Link>
          </div>
          
          <div className="pt-4 border-t border-gray-800 text-xs text-tube-light-gray">
            <div className="px-3 space-y-2">
              <p>© 2023 TubeClone</p>
              <p>This is a YouTube clone created for educational purposes.</p>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  )
}
