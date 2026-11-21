'use client'

import React from 'react'
import type { NotificationItem } from '@/types'
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'

export interface NotificationToastProps {
  notifications: NotificationItem[]
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
}) => {
  if (notifications.length === 0) return null

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
      case 'error':
        return <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
      {notifications.map((item) => (
        <div
          key={item.id}
          className="pointer-events-auto p-3.5 rounded-lg bg-white border border-slate-200 shadow-lg flex items-start space-x-3 transition-all transform animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <div className="mt-0.5">{getIcon(item.type)}</div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-900">{item.title}</p>
            <p className="text-xs text-slate-600 mt-0.5">{item.message}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
