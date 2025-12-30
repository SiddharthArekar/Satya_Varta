"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/ThemeContext"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Determine if current theme is dark
    const isCurrentlyDark = theme === 'dark' || 
      (theme === 'system' && window.matchMedia("(prefers-color-scheme: dark)").matches)
    setIsDark(isCurrentlyDark)
  }, [theme])

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('light')
    } else { // theme is 'system'
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      if (isSystemDark) {
        setTheme('light')
      } else {
        setTheme('dark')
      }
    }
  }

  return (
    <div
      className={cn(
        "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300 hover-float glass-card border border-card-border/50",
        isDark 
          ? "bg-card border-card-border" 
          : "bg-card border-card-border",
        className
      )}
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          toggleTheme()
        }
      }}
    >
      <div className="flex justify-between items-center w-full">
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
            isDark 
              ? "transform translate-x-0 bg-primary" 
              : "transform translate-x-8 bg-muted"
          )}
        >
          {isDark ? (
            <Moon 
              className="w-4 h-4 text-primary-foreground" 
              strokeWidth={1.5}
            />
          ) : (
            <Sun 
              className="w-4 h-4 text-foreground" 
              strokeWidth={1.5}
            />
          )}
        </div>
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
            isDark 
              ? "bg-transparent" 
              : "transform -translate-x-8"
          )}
        >
          {isDark ? (
            <Sun 
              className="w-4 h-4 text-muted-foreground" 
              strokeWidth={1.5}
            />
          ) : (
            <Moon 
              className="w-4 h-4 text-muted-foreground" 
              strokeWidth={1.5}
            />
          )}
        </div>
      </div>
    </div>
  )
}
