'use client'

import React from 'react'
import type { NotificationItem } from '@/types'
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'

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
        return <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-sky-400 flex-shrink-0" />
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
      {notifications.map((item) => (
        <div
          key={item.id}
          className="pointer-events-auto p-4 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md flex items-start space-x-3 transition-all transform animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {getIcon(item.type)}
          <div className="flex-1">
            <p className="text-xs font-bold text-white tracking-wide">
              {item.title}
            </p>
            <p className="text-xs text-slate-300 mt-0.5">{item.message}</p>
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">
              {item.timestamp}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
