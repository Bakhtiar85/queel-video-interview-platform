// app/dashboard/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiResponse } from '@/types'

interface Job {
    id: string
    title: string
    description: string
    linkId: string
    createdAt: string
    questions: Array<{ questionText: string; timeLimit: number }>
    _count: { applications: number }
}

export default function DashboardPage() {
    const router = useRouter()
    const { recruiter, isAuthenticated, logout } = useAuthStore()
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        fetchJobs()
    }, [isAuthenticated, router])

    const fetchJobs = async () => {
        if (!recruiter) return

        try {
            const res = await fetch(`/api/recruiter/jobs?recruiterId=${recruiter.id}`)
            const data: ApiResponse<Job[]> = await res.json()
            if (data.status && data.data) {
                setJobs(data.data)
            }
        } catch (error: unknown) {
            console.error('Failed to fetch jobs:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        logout()
        router.push('/login')
    }

    const copyLink = (linkId: string) => {
        const url = `${window.location.origin}/interview/${linkId}`
        navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!')
    }

    if (!isAuthenticated || !recruiter) return null

    return (
        <div className="min-h-screen p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-gray-600">Welcome back, {recruiter.name}</p>
                    </div>
                    <Button variant="outline" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>

                <Button
                    className="mb-6"
                    onClick={() => router.push('/dashboard/jobs/create')}
                >
                    Create New Job
                </Button>

                {loading ? (
                    <p>Loading jobs...</p>
                ) : jobs.length === 0 ? (
                    <p className="text-gray-500">No jobs created yet. Create your first job!</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {jobs.map((job) => (
                            <Card key={job.id}>
                                <CardHeader>
                                    <CardTitle>{job.title}</CardTitle>
                                    <CardDescription>{job.description.substring(0, 100)}...</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        {job._count.applications} application(s)
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => copyLink(job.linkId)}
                                                className="flex-1"
                                            >
                                                Copy Link
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => router.push(`/dashboard/jobs/${job.id}/submissions`)}
                                                className="flex-1"
                                            >
                                                View Submissions
                                            </Button>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => {
                                                sessionStorage.setItem('demoQuestions', JSON.stringify(job.questions))
                                                router.push('/dashboard/jobs/demo')
                                            }}
                                            className="w-full"
                                        >
                                            Test Interview
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}