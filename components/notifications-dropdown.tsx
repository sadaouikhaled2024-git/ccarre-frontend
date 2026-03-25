"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function NotificationsDropdown() {
  // Mock notifications data - can be connected to real API later
  const notifications: any[] = []

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex flex-col items-center gap-0.5 transition-colors">
          <Bell strokeWidth={2} className="size-6 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
            Notifications
          </span>
          <div className="h-0.5 w-10 bg-rose-500 origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-64">
        <div className="px-2 py-1.5">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
        </div>
        <DropdownMenuSeparator />
        <div className="px-2 py-2 text-sm text-muted-foreground text-center">
          {notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-2 rounded-md bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
                >
                  <p className="text-sm font-medium text-foreground">{notification.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>Aucune notification pour le moment</p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
