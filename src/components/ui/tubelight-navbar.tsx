"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
  category?: string
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  onCategoryChange?: (category: string) => void
  activeCategory?: string
}

export function NavBar({ items, className, onCategoryChange, activeCategory }: NavBarProps) {
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleItemClick = (item: NavItem) => {
    if (onCategoryChange && item.category) {
      onCategoryChange(item.category)
    }
  }

  return (
    <div
      className={cn(
        "relative flex justify-center items-center z-50",
        className,
      )}
    >
      <div className="flex items-center gap-2 glass-card border border-card-border/50 backdrop-blur-lg py-2 px-3 rounded-full shadow-[var(--shadow-glass)] max-w-fit">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeCategory === item.category || 
                          (item.url === location.pathname && !item.category)

          return (
            <Link
              key={item.name}
              to={item.url}
              onClick={() => handleItemClick(item)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-4 py-2 rounded-full transition-colors smooth-transition whitespace-nowrap",
                "text-foreground/80 hover:text-primary hover-float",
                isActive && "bg-muted text-primary",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
