// app/dashboard/jobs/[jobId]/submissions/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiResponse } from '@/types'

interface VideoResponse {
    id: string
    questionId: string
    filePath: string
    duration: number
    recordedAt: string
}

interface Candidate {
    id: string
    name: string
    email: string
}

interface Application {
    id: string
    candidate: Candidate
    startedAt: string
    completedAt: string | null
    videoResponses: VideoResponse[]
}

export default function SubmissionsPage() {
    const router = useRouter()
    const params = useParams()
    const jobId = params.jobId as string
    const { isAuthenticated } = useAuthStore()

    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        fetchSubmissions()
    }, [isAuthenticated, jobId])

    const fetchSubmissions = async () => {
        try {
            const res = await fetch(`/api/recruiter/submissions?jobId=${jobId}`)
            const data: ApiResponse<Application[]> = await res.json()

            if (data.status && data.data) {
                setApplications(data.data)
            } else {
                setError(typeof data.error === 'string' ? data.error : 'Failed to load submissions')
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load submissions')
        } finally {
            setLoading(false)
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="min-h-screen p-8">
                <div className="mx-auto max-w-7xl">
                    <p>Loading submissions...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Candidate Submissions</h1>
                        <p className="text-gray-600">View all candidate responses for this job</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push('/dashboard')}>
                        Back to Dashboard
                    </Button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                        {error}
                    </div>
                )}

                {applications.length === 0 ? (
                    <p className="text-gray-500">No submissions yet.</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {applications.map((app) => (
                            <Card
                                key={app.id}
                                className="cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => router.push(`/dashboard/jobs/${jobId}/submissions/${app.candidate.id}`)}
                            >
                                <CardHeader>
                                    <CardTitle>{app.candidate.name}</CardTitle>
                                    <CardDescription>{app.candidate.email}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="text-sm text-gray-600">
                                        Videos: {app.videoResponses.length}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Status: {app.completedAt ? '✅ Completed' : '⏳ In Progress'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Started: {new Date(app.startedAt).toLocaleDateString()}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}