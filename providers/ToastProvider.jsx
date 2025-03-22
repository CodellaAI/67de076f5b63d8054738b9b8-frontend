
'use client'

import { createContext, useState } from 'react'
import * as Toast from '@radix-ui/react-toast'
import { X } from 'lucide-react'

export const ToastContext = createContext()

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = ({ title, description, variant = 'default', duration = 5000 }) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { id, title, description, variant, duration }])
    
    // Auto remove toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      <Toast.Provider swipeDirection="right">
        {children}
        
        {toasts.map(({ id, title, description, variant, duration }) => (
          <Toast.Root
            key={id}
            className={`fixed bottom-4 right-4 z-50 flex items-start gap-3 rounded-lg border p-4 shadow-lg ${
              variant === 'destructive' 
                ? 'border-red-600 bg-red-950 text-red-50' 
                : 'border-gray-700 bg-tube-gray text-white'
            }`}
            duration={duration}
            onOpenChange={(open) => {
              if (!open) removeToast(id)
            }}
          >
            <div className="flex-1">
              {title && <Toast.Title className="font-semibold">{title}</Toast.Title>}
              {description && (
                <Toast.Description className="mt-1 text-sm opacity-90">
                  {description}
                </Toast.Description>
              )}
            </div>
            
            <Toast.Close asChild>
              <button className="h-6 w-6 rounded-md p-1 hover:bg-gray-700">
                <X className="h-4 w-4" />
              </button>
            </Toast.Close>
          </Toast.Root>
        ))}
        
        <Toast.Viewport />
      </Toast.Provider>
    </ToastContext.Provider>
  )
}
