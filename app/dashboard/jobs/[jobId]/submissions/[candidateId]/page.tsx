// app/dashboard/jobs/[jobId]/submissions/[candidateId]/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ApiResponse } from '@/types'
import VideoPlayer from '@/components/ui/VideoPlayer'

interface Question {
    id: string
    questionText: string
    timeLimit: number
    orderIndex: number
}

interface VideoResponse {
    id: string
    questionId: string
    filePath: string
    duration: number
    recordedAt: string
    question: Question
}

interface Candidate {
    id: string
    name: string
    email: string
}

interface Job {
    id: string
    title: string
    description: string
    questions: Question[]
}

interface ApplicationDetail {
    id: string
    candidate: Candidate
    job: Job
    startedAt: string
    completedAt: string | null
    videoResponses: VideoResponse[]
}

export default function CandidateDetailPage() {
    const router = useRouter()
    const params = useParams()
    const jobId = params.jobId as string
    const candidateId = params.candidateId as string
    const { isAuthenticated } = useAuthStore()

    const [application, setApplication] = useState<ApplicationDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        fetchSubmission()
    }, [isAuthenticated, candidateId, jobId])

    const fetchSubmission = async () => {
        try {
            const res = await fetch(`/api/recruiter/submissions/${candidateId}?jobId=${jobId}`)
            const data: ApiResponse<ApplicationDetail> = await res.json()

            if (data.status && data.data) {
                setApplication(data.data)
            } else {
                setError(typeof data.error === 'string' ? data.error : 'Failed to load submission')
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load submission')
        } finally {
            setLoading(false)
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="min-h-screen p-8">
                <div className="mx-auto max-w-7xl">
                    <p>Loading submission...</p>
                </div>
            </div>
        )
    }

    if (error || !application) {
        return (
            <div className="min-h-screen p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                        {error || 'Submission not found'}
                    </div>
                    <Button onClick={() => router.push(`/dashboard/jobs/${jobId}/submissions`)}>
                        Back to Submissions
                    </Button>
                </div>
            </div>
        )
    }

    // Create a map of video responses by question ID
    const videosByQuestion = application.videoResponses.reduce((acc, video) => {
        acc[video.questionId] = video
        return acc
    }, {} as Record<string, VideoResponse>)

    return (
        <div className="min-h-screen p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{application.candidate.name}</h1>
                        <p className="text-gray-600">{application.candidate.email}</p>
                        <p className="text-sm text-gray-500 mt-2">
                            {application.job.title} • {application.completedAt ? 'Completed' : 'In Progress'}
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => router.push(`/dashboard/jobs/${jobId}/submissions`)}>
                        Back to Submissions
                    </Button>
                </div>

                <div className="space-y-6">
                    {application.job.questions.map((question, index) => {
                        const video = videosByQuestion[question.id]

                        return (
                            <Card key={question.id}>
                                <CardHeader>
                                    <CardTitle>Question {index + 1}</CardTitle>
                                    <CardDescription>{question.questionText}</CardDescription>
                                    <p className="text-sm text-gray-500">Time Limit: {question.timeLimit}s</p>
                                </CardHeader>
                                <CardContent>
                                    {video ? (
                                        <div className="space-y-4">
                                            <VideoPlayer src={video.filePath} />
                                            <div className="flex items-center justify-between text-sm text-gray-600">
                                                <span>Duration: {video.duration}s</span>
                                                <span>Recorded: {new Date(video.recordedAt).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center bg-gray-50 rounded-lg">
                                            <p className="text-gray-500">No video response for this question</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {!application.completedAt && (
                    <div className="mt-8 p-4 bg-yellow-50 text-yellow-800 rounded-lg">
                        ⚠️ This application is still in progress. Some questions may not have responses yet.
                    </div>
                )}
            </div>
        </div>
    )
}