// components/ui/header.tsx

"use client"

import { ThemeToggle } from "@/components/ui/theme-toggle"

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between px-4">
                <h2 className="text-lg font-semibold">Video Interview Platform</h2>
                <ThemeToggle />
            </div>
        </header>
    )
}