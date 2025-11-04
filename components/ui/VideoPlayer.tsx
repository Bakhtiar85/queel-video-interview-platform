// components/ui/VideoPlayer.tsx

'use client'

import { useRef } from 'react'

interface VideoPlayerProps {
    src: string
    className?: string
}

export default function VideoPlayer({ src, className = '' }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)

    return (
        <div className={`relative aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
            <video
                ref={videoRef}
                controls
                className="w-full h-full object-contain"
                preload="metadata"
            >
                <source src={src} type="video/webm" />
                Your browser does not support video playback.
            </video>
        </div>
    )
}