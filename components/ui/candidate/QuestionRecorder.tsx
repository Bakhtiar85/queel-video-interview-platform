// components/ui/candidate/QuestionRecorder.tsx

'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface QuestionRecorderProps {
    questionText: string
    timeLimit: number
    questionNumber: number
    totalQuestions: number
    onNext: (selectedVideo: Blob) => void
}

export default function QuestionRecorder({
    questionText,
    timeLimit,
    questionNumber,
    totalQuestions,
    onNext
}: QuestionRecorderProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const [stream, setStream] = useState<MediaStream | null>(null)
    const [recordings, setRecordings] = useState<Blob[]>([])
    const [selectedRecording, setSelectedRecording] = useState<number | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [countdown, setCountdown] = useState<number | null>(null)
    const [timeLeft, setTimeLeft] = useState(timeLimit)
    const [viewingRecording, setViewingRecording] = useState<number | null>(null)
    const [error, setError] = useState('')

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
            setRecordings([...recordings, blob])

            // Reset video to live stream
            if (videoRef.current && stream) {
                videoRef.current.srcObject = stream
                videoRef.current.src = ''
            }
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
                stopRecording()
            }
        }, 1000)
    }

    const stopRecording = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    const playRecording = (index: number) => {
        const url = URL.createObjectURL(recordings[index])
        if (videoRef.current) {
            videoRef.current.srcObject = null
            videoRef.current.src = url
            videoRef.current.controls = true
            videoRef.current.play()
        }
        setViewingRecording(index)
    }

    const backToLive = () => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream
            videoRef.current.src = ''
            videoRef.current.controls = false
        }
        setViewingRecording(null)
    }

    const handleNext = () => {
        if (selectedRecording === null) {
            setError('Please select a recording to continue')
            return
        }
        onNext(recordings[selectedRecording])
    }

    const canRecord = recordings.length < 3
    const hasRecordings = recordings.length > 0

    return (
        <Card className="w-full max-w-3xl">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Question {questionNumber} of {totalQuestions}</CardTitle>
                    <span className="text-sm text-muted-foreground">
                        {recordings.length}/3 takes
                    </span>
                </div>
                <CardDescription>{questionText}</CardDescription>
                <p className="text-sm text-muted-foreground">Time Limit: {timeLimit} seconds</p>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted={!viewingRecording && viewingRecording !== 0}
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
                </div>

                {/* Recording Controls */}
                {!isRecording && countdown === null && viewingRecording === null && (
                    <div className="flex gap-3">
                        <Button
                            onClick={startCountdown}
                            disabled={!canRecord}
                            className="flex-1"
                            size="lg"
                        >
                            {recordings.length === 0 ? 'Start Recording' : `Record Take ${recordings.length + 1}`}
                        </Button>
                        {!canRecord && (
                            <p className="text-sm text-muted-foreground self-center">
                                Maximum 3 takes reached
                            </p>
                        )}
                    </div>
                )}

                {isRecording && (
                    <Button onClick={stopRecording} variant="destructive" className="w-full" size="lg">
                        Stop Recording
                    </Button>
                )}

                {viewingRecording !== null && (
                    <Button onClick={backToLive} variant="outline" className="w-full">
                        Back to Camera
                    </Button>
                )}

                {/* Recorded Takes */}
                {hasRecordings && viewingRecording === null && (
                    <div className="space-y-3">
                        <p className="font-medium">Your Recordings:</p>
                        {recordings.map((_, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                                <input
                                    type="radio"
                                    name="selected-recording"
                                    checked={selectedRecording === index}
                                    onChange={() => setSelectedRecording(index)}
                                    className="w-4 h-4"
                                />
                                <span className="flex-1 font-medium">Take {index + 1}</span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => playRecording(index)}
                                >
                                    Play
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Next Button */}
                {/* Next/Submit Button */}
                {hasRecordings && !isRecording && countdown === null && (
                    <Button
                        onClick={handleNext}
                        disabled={selectedRecording === null}
                        className="w-full"
                        size="lg"
                    >
                        {questionNumber === totalQuestions ? 'Submit Interview' : 'Continue to Next Question'}
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}