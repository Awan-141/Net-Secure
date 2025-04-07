"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// This is a mock implementation. In a real app, you would use a proper auth provider
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const pathname = usePathname()

  // Check if user is logged in on component mount
  useEffect(() => {
    // In a real app, you would check for a token in localStorage or cookies
    const checkAuth = () => {
      const fakeAuthStatus = localStorage.getItem("isAuthenticated") === "true"
      setIsAuthenticated(fakeAuthStatus)

      if (fakeAuthStatus) {
        // In a real app, you would decode the JWT or fetch user data
        setUser({
          name: "Demo User",
          email: "demo@example.com",
        })
      } else {
        setUser(null)
      }
    }

    checkAuth()
  }, [pathname])

  const login = () => {
    // In a real app, this would be handled by your auth service
    localStorage.setItem("isAuthenticated", "true")
    setIsAuthenticated(true)
    setUser({
      name: "Demo User",
      email: "demo@example.com",
    })
  }

  const logout = () => {
    // In a real app, this would be handled by your auth service
    localStorage.removeItem("isAuthenticated")
    setIsAuthenticated(false)
    setUser(null)
  }

  return { isAuthenticated, user, login, logout }
}

export function AuthStatus() {
  const { isAuthenticated, user, logout } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/auth/login">Login</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/auth/signup">Sign up</Link>
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary">
              {user?.name.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex flex-col">
          <span>{user?.name}</span>
          <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

