// app/dashboard/jobs/demo/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import CameraSetup from '@/components/ui/candidate/CameraSetup'
import QuestionRecorder from '@/components/ui/candidate/QuestionRecorder'

interface Question {
    questionText: string
    timeLimit: number
}

export default function DemoModePage() {
    const router = useRouter()
    const [step, setStep] = useState<'intro' | 'setup' | 'recording' | 'complete'>('intro')
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

    const [demoQuestions, setDemoQuestions] = useState<Question[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('demoQuestions')
            if (saved) {
                return JSON.parse(saved)
            }
        }
        return [
            { questionText: 'Tell us about yourself', timeLimit: 20 },
            { questionText: 'What are your strengths?', timeLimit: 20 }
        ]
    })

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

    if (step === 'intro') {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 bg-background">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>Demo Mode</CardTitle>
                        <CardDescription>
                            Test the interview experience with sample questions
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
                            <Button variant="outline" onClick={() => router.back()} className="flex-1">
                                Back
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
                            <Button onClick={() => router.push('/dashboard/jobs/create')} className="flex-1">
                                Back to Job Creation
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return null
}