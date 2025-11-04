// app/interview/[linkId]/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ApiResponse } from '@/types'
import VideoRecorder from '@/components/ui/candidate/VideoRecorder'

interface Job {
    id: string
    title: string
    description: string
    questions: Question[]
}

interface Question {
    id: string
    questionText: string
    timeLimit: number
    orderIndex: number
}

export default function InterviewPage() {
    const params = useParams()
    const linkId = params.linkId as string

    const [step, setStep] = useState<'intro' | 'interview' | 'complete'>('intro')
    const [job, setJob] = useState<Job | null>(null)
    const [candidateName, setCandidateName] = useState('')
    const [candidateEmail, setCandidateEmail] = useState('')
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [recordedVideos, setRecordedVideos] = useState<Blob[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchJob()
    }, [])

    const fetchJob = async () => {
        try {
            const res = await fetch(`/api/candidate/job?linkId=${linkId}`)
            const data: ApiResponse<Job> = await res.json()

            if (data.status && data.data) {
                setJob(data.data)
            } else {
                setError('Job not found or link expired')
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load job')
        } finally {
            setLoading(false)
        }
    }

    const handleStart = () => {
        if (!candidateName.trim() || !candidateEmail.trim()) {
            setError('Please enter your name and email')
            return
        }
        setError('')
        setStep('interview')
    }

    const handleRecordingComplete = (blob: Blob) => {
        const newVideos = [...recordedVideos, blob]
        setRecordedVideos(newVideos)

        if (job && currentQuestionIndex < job.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        } else {
            submitAllVideos(newVideos)
        }
    }

    const submitAllVideos = async (videos: Blob[]) => {
        setUploading(true)

        try {
            if (!job) return

            // Upload all videos
            for (let i = 0; i < videos.length; i++) {
                const formData = new FormData()
                formData.append('video', videos[i], `question-${i}.webm`)
                formData.append('jobId', job.id)
                formData.append('candidateName', candidateName)
                formData.append('candidateEmail', candidateEmail)
                formData.append('questionId', job.questions[i].id)
                formData.append('duration', job.questions[i].timeLimit.toString())

                const res = await fetch('/api/candidate/submit', {
                    method: 'POST',
                    body: formData
                })

                const data: ApiResponse = await res.json()
                if (!data.status) {
                    throw new Error(`Failed to upload video ${i + 1}`)
                }
            }

            // Mark as complete
            await fetch('/api/candidate/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidateEmail,
                    jobId: job.id
                })
            })

            setStep('complete')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to submit videos')
            setUploading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Loading interview...</p>
            </div>
        )
    }

    if (error && !job) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-red-600">{error}</p>
            </div>
        )
    }

    if (!job) return null

    if (step === 'intro') {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>{job.title}</CardTitle>
                        <CardDescription>{job.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600">
                            This interview has {job.questions.length} question(s). You&apos;ll record a video response for each.
                        </p>
                        <div className="space-y-2">
                            <Label htmlFor="name">Your Name</Label>
                            <Input
                                id="name"
                                required
                                value={candidateName}
                                onChange={(e) => setCandidateName(e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Your Email</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={candidateEmail}
                                onChange={(e) => setCandidateEmail(e.target.value)}
                                placeholder="john@example.com"
                            />
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <Button onClick={handleStart} className="w-full">
                            Start Interview
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (step === 'interview') {
        const currentQuestion = job.questions[currentQuestionIndex]

        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="w-full max-w-3xl space-y-4">
                    <p className="text-center text-gray-600">
                        Question {currentQuestionIndex + 1} of {job.questions.length}
                    </p>
                    <VideoRecorder
                        key={currentQuestionIndex}
                        questionText={currentQuestion.questionText}
                        timeLimit={currentQuestion.timeLimit}
                        onRecordingComplete={handleRecordingComplete}
                    />
                </div>
            </div>
        )
    }

    if (step === 'complete') {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>Interview Complete!</CardTitle>
                        <CardDescription>Thank you for completing the interview</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">
                            Your responses have been submitted successfully. The recruiter will review them and get back to you.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return null
}