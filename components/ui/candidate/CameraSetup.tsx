// components/ui/candidate/CameraSetup.tsx

'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Smartphone } from 'lucide-react'

interface CameraSetupProps {
    onComplete: () => void
}

const MOCK_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === "true" || false;

// Detect if user is on mobile device
const isMobileDevice = () => {
    if (typeof window === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768
}

export default function CameraSetup({ onComplete }: CameraSetupProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [permissionGranted, setPermissionGranted] = useState(false)
    const [error, setError] = useState('')
    const [isRecordingDemo, setIsRecordingDemo] = useState(false)
    const [demoCountdown, setDemoCountdown] = useState<number | null>(null)
    const [demoRecordedUrl, setDemoRecordedUrl] = useState<string | null>(null)
    const [demoTimeLeft, setDemoTimeLeft] = useState(30)
    const [isMobile] = useState(isMobileDevice)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const requestPermission = async () => {
        if (MOCK_MODE) {
            // Mock mode - create dummy stream
            const canvas = document.createElement('canvas')
            canvas.width = 480  // Portrait dimensions
            canvas.height = 640
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.fillStyle = '#000'
                ctx.fillRect(0, 0, 480, 640)
                ctx.fillStyle = '#fff'
                ctx.font = '24px Arial'
                ctx.fillText('MOCK CAMERA', 150, 320)
            }
            const mockStream = canvas.captureStream(30)
            setStream(mockStream)
            if (videoRef.current) {
                videoRef.current.srcObject = mockStream
            }
            setPermissionGranted(true)
            setError('')
            return
        }

        try {
            // Request portrait/mobile format video
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 480 },
                    height: { ideal: 640 },
                    aspectRatio: { ideal: 0.75 }, // 3:4 portrait ratio
                    facingMode: 'user'
                },
                audio: true
            })
            setStream(mediaStream)
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
            }
            setPermissionGranted(true)
            setError('')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to access camera/microphone. Please allow permissions.')
        }
    }

    const startDemoRecording = () => {
        let count = 3
        setDemoCountdown(count)

        const countdownInterval = setInterval(() => {
            count--
            if (count > 0) {
                setDemoCountdown(count)
            } else {
                clearInterval(countdownInterval)
                setDemoCountdown(null)
                recordDemo()
            }
        }, 1000)
    }

    const recordDemo = () => {
        if (!stream) return

        chunksRef.current = []
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' })

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunksRef.current.push(e.data)
            }
        }

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' })
            const url = URL.createObjectURL(blob)
            setDemoRecordedUrl(url)
            if (videoRef.current) {
                videoRef.current.srcObject = null
                videoRef.current.src = url
                videoRef.current.controls = true
            }
        }

        mediaRecorder.start()
        mediaRecorderRef.current = mediaRecorder
        setIsRecordingDemo(true)
        setDemoTimeLeft(30)

        // Start timer
        let timeRemaining = 30
        timerRef.current = setInterval(() => {
            timeRemaining--
            setDemoTimeLeft(timeRemaining)

            if (timeRemaining <= 0) {
                stopDemoRecording()
            }
        }, 1000)
    }

    const stopDemoRecording = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
            setIsRecordingDemo(false)
        }
    }

    const retryDemo = () => {
        setDemoRecordedUrl(null)
        if (videoRef.current) {
            videoRef.current.controls = false
            videoRef.current.src = ''
            videoRef.current.srcObject = stream
        }
    }

    const handleSkip = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
        }
        onComplete()
    }

    const handleContinue = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
        }
        onComplete()
    }

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [stream])

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle>Camera & Microphone Setup</CardTitle>
                    <CardDescription>
                        Let&apos;s make sure your camera and microphone are working properly
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                            {error}
                        </div>
                    )}

                    {!permissionGranted ? (
                        <div className="space-y-4">
                            <p className="text-muted-foreground">
                                We need access to your camera and microphone to record your interview responses.
                                Click the button below to grant permissions.
                            </p>

                            {/* Desktop user notice about portrait format */}
                            {!isMobile && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                        <div className="space-y-2">
                                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                                📱 Portrait Mode Recording
                                            </p>
                                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                                Your video will be recorded in <strong>mobile/portrait format</strong> (vertical orientation).
                                                This ensures consistency across all candidates and provides the best viewing experience for recruiters.
                                            </p>
                                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                                Don&apos;t worry - you don&apos;t need to rotate your screen. We&apos;ll automatically format your video correctly!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button onClick={requestPermission} size="lg" className="w-full">
                                Allow Camera & Microphone
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Demo Text - Always visible during recording */}
                            {(isRecordingDemo || demoCountdown !== null) && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <p className="text-sm font-medium mb-2">Say this text:</p>
                                    <p className="text-lg font-semibold text-center">
                                        &quot;Hello, this is a demo test and I am ready for the interview.&quot;
                                    </p>
                                </div>
                            )}

                            {/* Portrait aspect ratio video container */}
                            <div className="relative mx-auto bg-black rounded-lg overflow-hidden" style={{ maxWidth: '480px', aspectRatio: '3/4' }}>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    style={{ transform: demoRecordedUrl ? 'none' : 'scaleX(-1)' }}
                                    muted={!demoRecordedUrl}
                                    playsInline
                                    className="w-full h-full object-cover"
                                />

                                {demoCountdown !== null && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                        <span className="text-white text-6xl font-bold">{demoCountdown}</span>
                                    </div>
                                )}

                                {isRecordingDemo && (
                                    <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2">
                                        <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                                        {demoTimeLeft}s
                                    </div>
                                )}
                            </div>

                            {!isRecordingDemo && demoCountdown === null && !demoRecordedUrl && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <p className="text-sm font-medium mb-2">Demo Test (Optional):</p>
                                        <p className="text-sm text-muted-foreground italic">
                                            &quot;Hello, this is a demo test and I am ready for the interview.&quot;
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button onClick={startDemoRecording} className="flex-1">
                                            Record Demo
                                        </Button>
                                        <Button onClick={handleSkip} variant="outline" className="flex-1">
                                            Skip Demo
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {isRecordingDemo && (
                                <Button onClick={stopDemoRecording} variant="destructive" className="w-full" size="lg">
                                    Finish Demo Recording
                                </Button>
                            )}

                            {demoRecordedUrl && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                            ✓ Demo recorded! You can replay it above.
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button onClick={retryDemo} variant="outline" className="flex-1">
                                            Record Again
                                        </Button>
                                        <Button onClick={handleContinue} className="flex-1" size="lg">
                                            Continue to Interview
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}