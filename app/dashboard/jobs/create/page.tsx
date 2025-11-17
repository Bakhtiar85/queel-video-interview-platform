// app/dashboard/jobs/create/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ApiResponse } from '@/types'

interface Question {
    questionText: string
    timeLimit: number
}

export default function CreateJobPage() {
    const router = useRouter()
    const { recruiter, isAuthenticated } = useAuthStore()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [questions, setQuestions] = useState<Question[]>([{ questionText: '', timeLimit: 20 }])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, router])

    const addQuestion = () => {
        setQuestions([...questions, { questionText: '', timeLimit: 20 }])
    }

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index))
    }

    const updateQuestion = (index: number, field: keyof Question, value: string) => {
        const updated = [...questions]
        if (field === 'timeLimit') {
            const numValue = Number(value)
            // Clamp between 10 and 30
            const clampedValue = Math.max(10, Math.min(30, numValue || 20))
            updated[index] = { ...updated[index], timeLimit: clampedValue }
        } else {
            updated[index] = { ...updated[index], questionText: value }
        }
        setQuestions(updated)
    }

    const calculateTotalTime = () => {
        return questions.reduce((total, q) => total + q.timeLimit, 0)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (!recruiter) {
            setError('User session expired')
            setLoading(false)
            return
        }

        // Validate time limits
        const invalidQuestion = questions.find(q => q.timeLimit < 10 || q.timeLimit > 30)
        if (invalidQuestion) {
            setError('Each question must have a time limit between 10 and 30 seconds')
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/recruiter/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    recruiterId: recruiter.id,
                    questions: questions.map((q, idx) => ({ ...q, orderIndex: idx }))
                })
            })

            const data: ApiResponse = await res.json()

            if (data.status) {
                router.push('/dashboard')
            } else {
                setError(typeof data.error === 'string' ? data.error : 'Failed to create job')
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    if (!isAuthenticated || !recruiter) return null

    const totalTime = calculateTotalTime()
    const totalMinutes = Math.floor(totalTime / 60)
    const totalSeconds = totalTime % 60

    return (
        <div className="min-h-screen p-8 bg-background">
            <div className="mx-auto max-w-3xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Job</CardTitle>
                        <CardDescription>
                            Set up interview questions with time limits (10-30 seconds each)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Job Title</Label>
                                <Input
                                    id="title"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Senior React Developer"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Job Description</Label>
                                <textarea
                                    id="description"
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2"
                                    placeholder="Describe the role..."
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Interview Questions</Label>
                                    <Button type="button" variant="outline" onClick={addQuestion}>
                                        Add Question
                                    </Button>
                                </div>

                                {questions.map((q, idx) => (
                                    <Card key={idx}>
                                        <CardContent className="pt-6 space-y-4">
                                            <div className="space-y-2">
                                                <Label>Question {idx + 1}</Label>
                                                <Input
                                                    required
                                                    value={q.questionText}
                                                    onChange={(e) => updateQuestion(idx, 'questionText', e.target.value)}
                                                    placeholder="Enter your question"
                                                />
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <Label>Time Limit (10-30 seconds)</Label>
                                                    <Input
                                                        type="number"
                                                        required
                                                        min={10}
                                                        max={30}
                                                        value={q.timeLimit}
                                                        onChange={(e) => updateQuestion(idx, 'timeLimit', e.target.value)}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Current: {q.timeLimit} seconds
                                                    </p>
                                                </div>
                                                {questions.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        onClick={() => removeQuestion(idx)}
                                                        className="mt-8"
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Demo Mode Toggle */}
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Test Your Questions</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Try recording answers to see how candidates will experience the interview
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            sessionStorage.setItem('demoQuestions', JSON.stringify(questions))
                                            router.push('/dashboard/jobs/demo')
                                        }}
                                        disabled={questions.length === 0 || questions.some(q => !q.questionText.trim())}
                                    >
                                        Demo Mode
                                    </Button>
                                </div>
                            </div>

                            {/* Total Time Display */}
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-sm font-medium">
                                    Total Interview Time: {totalMinutes}m {totalSeconds}s
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {questions.length} question(s)
                                </p>
                            </div>

                            {error && <p className="text-sm text-red-600">{error}</p>}

                            <div className="flex gap-4">
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Job'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}