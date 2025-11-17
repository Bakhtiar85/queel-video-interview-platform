// components/ui/candidate/UploadProgress.tsx

'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useEffect } from 'react'

interface UploadProgressProps {
    current: number
    total: number
    isComplete: boolean
}

export default function UploadProgress({ current, total, isComplete }: UploadProgressProps) {
    const progress = Math.round((current / total) * 100)

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!isComplete) {
                e.preventDefault()
                e.returnValue = ''
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [isComplete])

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>
                        {isComplete ? '✓ Upload Complete!' : 'Uploading Your Interview...'}
                    </CardTitle>
                    <CardDescription>
                        {isComplete
                            ? 'Thank you for completing the interview'
                            : 'Please wait while we upload your responses. Do not close this page.'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!isComplete && (
                        <>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Uploading video {current} of {total}
                                    </span>
                                    <span className="font-medium">{progress}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                    ⚠️ Please do not close this page or refresh your browser
                                </p>
                            </div>
                        </>
                    )}

                    {isComplete && (
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                    ✓ All videos uploaded successfully!
                                </p>
                            </div>
                            <p className="text-muted-foreground">
                                Your responses have been submitted. The recruiter will review them and get back to you.
                                You can now safely close this page.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}