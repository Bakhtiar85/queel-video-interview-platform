// app/dashboard/jobs/demo/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import CameraSetup from '@/components/ui/candidate/CameraSetup'
import QuestionRecorder from '@/components/ui/candidate/QuestionRecorder'

interface Question {
    questionText: string
    timeLimit: number
}

const DEFAULT_QUESTIONS: Question[] = [
    { questionText: 'Tell us about yourself', timeLimit: 20 },
    { questionText: 'What are your strengths?', timeLimit: 20 }
]

export default function DemoModePage() {
    const [step, setStep] = useState<'intro' | 'setup' | 'recording' | 'complete'>('intro')
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [demoQuestions, setDemoQuestions] = useState<Question[]>(DEFAULT_QUESTIONS)
    const [isLoading, setIsLoading] = useState(true)

    // Load questions with a slight delay to avoid hydration issues
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                // Try localStorage first (for new tab support)
                const savedLocal = localStorage.getItem('demoQuestions')
                if (savedLocal) {
                    setDemoQuestions(JSON.parse(savedLocal))
                } else {
                    // Fallback to sessionStorage
                    const saved = sessionStorage.getItem('demoQuestions')
                    if (saved) {
                        setDemoQuestions(JSON.parse(saved))
                    }
                }
            } catch (error) {
                console.error('Failed to load demo questions:', error)
                // Keep DEFAULT_QUESTIONS
            }
            setIsLoading(false)
        }, 100) // Small delay to avoid hydration mismatch

        return () => clearTimeout(timer)
    }, [])

    const handleSetupComplete = () => {
        setStep('recording')
    }

    const handleRecordingComplete = () => {
        if (currentQuestionIndex < demoQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        } else {
            setStep('complete')
        }
    }

    const restartDemo = () => {
        setCurrentQuestionIndex(0)
        setStep('setup')
    }

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 bg-background">
                <Card className="w-full max-w-2xl">
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <p className="text-center text-muted-foreground">Loading demo questions...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (step === 'intro') {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 bg-background">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>Demo Mode</CardTitle>
                        <CardDescription>
                            Test the interview experience with your questions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm font-medium mb-2">Demo Questions:</p>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                                {demoQuestions.map((q, i) => (
                                    <li key={i}>{q.questionText} ({q.timeLimit}s)</li>
                                ))}
                            </ol>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            This is a practice run. Your recordings won&apos;t be saved.
                        </p>
                        <div className="flex gap-3">
                            <Button onClick={() => setStep('setup')} className="flex-1">
                                Start Demo
                            </Button>
                            <Button variant="outline" onClick={() => window.close()} className="flex-1">
                                Close
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (step === 'setup') {
        return <CameraSetup onComplete={handleSetupComplete} />
    }

    if (step === 'recording') {
        const currentQuestion = demoQuestions[currentQuestionIndex]

        return (
            <div className="flex min-h-screen items-center justify-center p-4 bg-background">
                <QuestionRecorder
                    key={currentQuestionIndex}
                    questionText={currentQuestion.questionText}
                    timeLimit={currentQuestion.timeLimit}
                    questionNumber={currentQuestionIndex + 1}
                    totalQuestions={demoQuestions.length}
                    onNext={handleRecordingComplete}
                />
            </div>
        )
    }

    if (step === 'complete') {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 bg-background">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>Demo Complete!</CardTitle>
                        <CardDescription>You&apos;ve experienced the full candidate flow</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                ✓ Demo completed successfully
                            </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Your demo recordings were not saved. This is how candidates will experience your interview.
                        </p>
                        <div className="flex gap-3">
                            <Button onClick={restartDemo} variant="outline" className="flex-1">
                                Try Again
                            </Button>
                            <Button onClick={() => window.close()} className="flex-1">
                                Close Tab
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return null
}