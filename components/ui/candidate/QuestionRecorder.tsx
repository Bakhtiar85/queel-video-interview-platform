// components/ui/candidate/QuestionRecorder.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Trash2, Eye, Video } from 'lucide-react'

const MAX_ATTEMPTS = 3

interface Recording {
    blob: Blob
    url: string
    timestamp: Date
}

interface QuestionRecorderProps {
    questionText: string
    timeLimit: number
    questionNumber: number
    totalQuestions: number
    onNext: (selectedBlob: Blob, attemptsUsed: number) => void
    onProgressUpdate?: (attemptsUsed: number, hasSelected: boolean) => void
}

export default function QuestionRecorder({
    questionText,
    timeLimit,
    questionNumber,
    totalQuestions,
    onNext,
    onProgressUpdate
}: QuestionRecorderProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const [stream, setStream] = useState<MediaStream | null>(null)
    const [recordings, setRecordings] = useState<Recording[]>([])
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const [viewingRecording, setViewingRecording] = useState<number | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [countdown, setCountdown] = useState<number | null>(null)
    const [timeLeft, setTimeLeft] = useState(timeLimit)
    const [error, setError] = useState('')

    useEffect(() => {
        startCamera()
        return () => {
            stopCamera()
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [])

    // Notify parent about progress changes
    useEffect(() => {
        if (onProgressUpdate) {
            onProgressUpdate(recordings.length, selectedIndex !== null)
        }
    }, [recordings.length, selectedIndex, onProgressUpdate])

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 480 },
                    height: { ideal: 640 },
                    aspectRatio: { ideal: 0.75 },
                    facingMode: 'user'
                },
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
            const url = URL.createObjectURL(blob)
            setRecordings(prev => [...prev, { blob, url, timestamp: new Date() }])

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
        const url = URL.createObjectURL(recordings[index].blob)
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

    const handleSelectRecording = (index: number) => {
        setSelectedIndex(index)
        // Immediately notify parent about the selection change
        if (onProgressUpdate) {
            onProgressUpdate(recordings.length, true)
        }
    }

    const handleDeleteRecording = (index: number) => {
        URL.revokeObjectURL(recordings[index].url)
        const newRecordings = recordings.filter((_, i) => i !== index)
        setRecordings(newRecordings)

        // Handle selected index adjustment
        if (selectedIndex === index) {
            setSelectedIndex(null)
            // Notify parent that no video is selected now
            if (onProgressUpdate) {
                onProgressUpdate(newRecordings.length, false)
            }
        } else if (selectedIndex !== null && selectedIndex > index) {
            // Adjust selectedIndex if we deleted a recording before it
            setSelectedIndex(selectedIndex - 1)
        }

        if (viewingRecording === index) {
            backToLive()
        }
    }

    const handleNext = () => {
        if (selectedIndex === null) {
            setError('Please select a recording to continue')
            return
        }
        onNext(recordings[selectedIndex].blob, recordings.length)
    }

    const canRecord = recordings.length < MAX_ATTEMPTS
    const hasRecordings = recordings.length > 0

    return (
        <Card className="w-full max-w-3xl">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Question {questionNumber} of {totalQuestions}</CardTitle>
                    <span className="text-sm text-muted-foreground">
                        {recordings.length}/{MAX_ATTEMPTS} takes
                    </span>
                </div>
                <p className="text-muted-foreground mt-2">{questionText}</p>
                <p className="text-sm text-muted-foreground">Time Limit: {timeLimit} seconds</p>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && <p className="text-sm text-red-600">{error}</p>}

                {/* Video Preview */}
                <div className="relative mx-auto bg-black rounded-lg overflow-hidden" style={{ maxWidth: '480px', aspectRatio: '3/4' }}>
                    <video
                        ref={videoRef}
                        autoPlay
                        muted={viewingRecording === null}
                        playsInline
                        className="w-full h-full object-cover"
                        style={{ transform: viewingRecording === null ? 'scaleX(-1)' : 'none' }}
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
                {!isRecording && countdown === null && viewingRecording === null && canRecord && (
                    <Button onClick={startCountdown} size="lg" className="w-full">
                        {hasRecordings ? `Record Attempt ${recordings.length + 1}` : 'Start Recording'}
                    </Button>
                )}

                {isRecording && (
                    <Button onClick={stopRecording} variant="destructive" size="lg" className="w-full">
                        Stop Recording
                    </Button>
                )}

                {viewingRecording !== null && (
                    <Button onClick={backToLive} variant="outline" className="w-full">
                        Back to Camera
                    </Button>
                )}

                {/* Recordings List */}
                {hasRecordings && (
                    <div className="space-y-2">
                        <h3 className="font-semibold">Your Recordings</h3>
                        {recordings.map((recording, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center justify-between p-3 rounded-lg border-2 ${selectedIndex === idx
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : 'border-border'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    {selectedIndex === idx && (
                                        <Check className="w-5 h-5 text-green-600" />
                                    )}
                                    <Video className="w-4 h-4" />
                                    <span className="text-sm font-medium">Attempt {idx + 1}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => playRecording(idx)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        onClick={() => handleSelectRecording(idx)}
                                        variant={selectedIndex === idx ? 'default' : 'outline'}
                                        size="sm"
                                    >
                                        {selectedIndex === idx ? 'Selected' : 'Select'}
                                    </Button>
                                    <Button
                                        onClick={() => handleDeleteRecording(idx)}
                                        variant="ghost"
                                        size="sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Next Button */}
                {hasRecordings && selectedIndex !== null && (
                    <Button onClick={handleNext} className="w-full" size="lg">
                        Continue to Next Question
                    </Button>
                )}

                {!canRecord && selectedIndex === null && (
                    <p className="text-center text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                        You&apos;ve used all {MAX_ATTEMPTS} attempts. Please select one recording to continue.
                    </p>
                )}
            </CardContent>
        </Card>
    )
}