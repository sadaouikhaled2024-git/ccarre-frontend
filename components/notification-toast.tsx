"use client"

import { toast } from "sonner"
import { Check, AlertCircle, Info, X } from "lucide-react"

export type NotificationType = "success" | "error" | "info"

export function showNotification(message: string, type: NotificationType = "success") {
  const iconProps = { className: "h-5 w-5 flex-shrink-0" }

  const toastContent = (
    <div className="flex items-center gap-3">
      {type === "success" && <Check {...iconProps} />}
      {type === "error" && <AlertCircle {...iconProps} />}
      {type === "info" && <Info {...iconProps} />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  )

  toast(toastContent, {
    duration: 3000,
    position: "bottom-right",
    style: {
      background: "#EC7578",
      border: "none",
      color: "#FEFEFF",
      borderRadius: "8px",
      padding: "16px",
      boxShadow: "0 4px 12px rgba(236, 117, 120, 0.2)",
      overflow: "hidden",
    },
    className: "animate-fade-in sonner-toast-progress",
    closeButton: true,
  })
}

export const NotificationUtils = {
  success: (message: string) => showNotification(message, "success"),
  error: (message: string) => showNotification(message, "error"),
  info: (message: string) => showNotification(message, "info"),
}
