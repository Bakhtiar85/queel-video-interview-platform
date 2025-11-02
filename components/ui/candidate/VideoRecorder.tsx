// components/candidate/VideoRecorder.tsx

'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface VideoRecorderProps {
    questionText: string
    timeLimit: number
    onRecordingComplete: (blob: Blob) => void
}

export default function VideoRecorder({ questionText, timeLimit, onRecordingComplete }: VideoRecorderProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const [stream, setStream] = useState<MediaStream | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [countdown, setCountdown] = useState<number | null>(null)
    const [timeLeft, setTimeLeft] = useState(timeLimit)
    const [error, setError] = useState('')
    const [cameraReady, setCameraReady] = useState(false)

    useEffect(() => {
        startCamera()
        return () => {
            stopCamera()
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [])

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            })
            setStream(mediaStream)
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
                videoRef.current.onloadedmetadata = () => {
                    setCameraReady(true)
                }
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to access camera/microphone')
        }
    }

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
        }
    }

    const startCountdown = () => {
        let count = 3
        setCountdown(count)

        const countdownInterval = setInterval(() => {
            count--
            if (count > 0) {
                setCountdown(count)
            } else {
                clearInterval(countdownInterval)
                setCountdown(null)
                startRecording()
            }
        }, 1000)
    }

    const startRecording = () => {
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
            stopCamera()
            onRecordingComplete(blob)
        }

        mediaRecorder.start()
        mediaRecorderRef.current = mediaRecorder
        setIsRecording(true)
        setTimeLeft(timeLimit)

        let timeRemaining = timeLimit
        timerRef.current = setInterval(() => {
            timeRemaining--
            setTimeLeft(timeRemaining)

            if (timeRemaining <= 0) {
                handleStop()
            }
        }, 1000)
    }

    const handleStop = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    return (
        <Card className="w-full max-w-3xl">
            <CardHeader>
                <CardTitle>{questionText}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && <p className="text-red-600">{error}</p>}

                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />

                    {countdown !== null && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <span className="text-white text-6xl font-bold">{countdown}</span>
                        </div>
                    )}

                    {isRecording && (
                        <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2">
                            <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                            {timeLeft}s
                        </div>
                    )}

                    {!cameraReady && !error && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white">Loading camera...</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 justify-center">
                    {!isRecording && countdown === null && cameraReady && (
                        <Button onClick={startCountdown} size="lg">
                            Start Recording
                        </Button>
                    )}

                    {isRecording && (
                        <Button onClick={handleStop} variant="destructive" size="lg">
                            Submit Answer
                        </Button>
                    )}
                </div>

                <p className="text-sm text-gray-600 text-center">
                    Time limit: {timeLimit} seconds
                </p>
            </CardContent>
        </Card>
    )
}