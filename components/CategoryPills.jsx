
'use client'

import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CategoryPills({ categories, selectedCategory, onSelectCategory }) {
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)
  const containerRef = useRef(null)

  // Check if arrows should be shown
  useEffect(() => {
    if (!containerRef.current) return
    
    const checkArrows = () => {
      const container = containerRef.current
      setShowLeftArrow(container.scrollLeft > 0)
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      )
    }
    
    checkArrows()
    container.addEventListener('scroll', checkArrows)
    window.addEventListener('resize', checkArrows)
    
    return () => {
      container.removeEventListener('scroll', checkArrows)
      window.removeEventListener('resize', checkArrows)
    }
  }, [])

  const scroll = (direction) => {
    if (!containerRef.current) return
    
    const container = containerRef.current
    const scrollAmount = direction === 'left' ? -200 : 200
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  return (
    <div className="relative mb-6">
      {showLeftArrow && (
        <button 
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-tube-black from-50% to-transparent h-full z-10 flex items-center justify-center pr-4"
          onClick={() => scroll('left')}
        >
          <div className="bg-tube-gray p-1.5 rounded-full">
            <ChevronLeft className="w-4 h-4" />
          </div>
        </button>
      )}
      
      <div 
        ref={containerRef}
        className="flex overflow-x-auto gap-3 py-2 no-scrollbar scroll-smooth"
      >
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium ${
              selectedCategory === category 
                ? 'bg-white text-black' 
                : 'bg-tube-gray hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      
      {showRightArrow && (
        <button 
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-tube-black from-50% to-transparent h-full z-10 flex items-center justify-center pl-4"
          onClick={() => scroll('right')}
        >
          <div className="bg-tube-gray p-1.5 rounded-full">
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      )}
    </div>
  )
}
