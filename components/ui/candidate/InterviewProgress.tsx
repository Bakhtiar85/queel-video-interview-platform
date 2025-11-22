// components/ui/candidate/InterviewProgress.tsx

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Circle, Video, Lock } from 'lucide-react'

interface QuestionProgress {
    questionNumber: number
    questionText: string
    attemptsUsed: number
    maxAttempts: number
    isCompleted: boolean
    hasSelectedVideo: boolean
}

interface InterviewProgressProps {
    questions: QuestionProgress[]
    currentQuestionIndex: number
    onNavigate?: (index: number) => void
}

export default function InterviewProgress({ questions, currentQuestionIndex, onNavigate }: InterviewProgressProps) {
    const canNavigateTo = (index: number) => {
        // Can only navigate to current or completed questions
        return index <= currentQuestionIndex
    }

    const handleQuestionClick = (index: number) => {
        if (canNavigateTo(index) && onNavigate) {
            onNavigate(index)
        }
    }

    return (
        <Card className="w-full lg:w-64 h-fit sticky top-4">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {questions.map((q, idx) => {
                    const canNavigate = canNavigateTo(idx)
                    const isClickable = canNavigate && onNavigate
                    
                    return (
                        <div
                            key={idx}
                            onClick={() => handleQuestionClick(idx)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                                idx === currentQuestionIndex
                                    ? 'border-primary bg-primary/5'
                                    : q.isCompleted
                                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                    : 'border-border bg-muted/50'
                            } ${
                                isClickable
                                    ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]'
                                    : 'cursor-not-allowed opacity-60'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold text-muted-foreground">
                                            Q{q.questionNumber}
                                        </span>
                                        {q.isCompleted && q.hasSelectedVideo && (
                                            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        )}
                                        {idx === currentQuestionIndex && (
                                            <Circle className="w-3 h-3 fill-primary text-primary animate-pulse" />
                                        )}
                                        {!canNavigate && (
                                            <Lock className="w-3 h-3 text-muted-foreground" />
                                        )}
                                    </div>
                                    <p className="text-xs text-foreground line-clamp-2 mb-2">
                                        {q.questionText}
                                    </p>
                                    
                                    {/* Attempts counter */}
                                    <div className="flex items-center gap-1.5">
                                        <Video className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                            {q.attemptsUsed}/{q.maxAttempts} attempts
                                        </span>
                                    </div>

                                    {/* Attempt dots */}
                                    <div className="flex items-center gap-1 mt-1.5">
                                        {Array.from({ length: q.maxAttempts }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-2 h-2 rounded-full ${
                                                    i < q.attemptsUsed
                                                        ? q.hasSelectedVideo && q.isCompleted
                                                            ? 'bg-green-500'
                                                            : 'bg-primary'
                                                        : 'bg-muted-foreground/30'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}