// app/api/recruiter/submissions/[candidateId]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { StatusCodes } from 'http-status-codes'
import { ApiResponse } from '@/types'

const prisma = new PrismaClient()

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ candidateId: string }> }
) {
    try {
        const { candidateId } = await params  // Add await here
        const { searchParams } = new URL(req.url)
        const jobId = searchParams.get('jobId')

        if (!jobId) {
            return NextResponse.json<ApiResponse>(
                { status: false, statusCode: StatusCodes.BAD_REQUEST, error: 'Job ID required' },
                { status: StatusCodes.BAD_REQUEST }
            )
        }

        const application = await prisma.application.findUnique({
            where: {
                candidateId_jobId: {
                    candidateId,
                    jobId
                }
            },
            include: {
                candidate: true,
                job: {
                    include: {
                        questions: {
                            orderBy: { orderIndex: 'asc' }
                        }
                    }
                },
                videoResponses: {
                    include: {
                        question: true
                    }
                }
            }
        })

        if (!application) {
            return NextResponse.json<ApiResponse>(
                { status: false, statusCode: StatusCodes.NOT_FOUND, error: 'Submission not found' },
                { status: StatusCodes.NOT_FOUND }
            )
        }

        return NextResponse.json<ApiResponse>(
            { status: true, statusCode: StatusCodes.OK, data: application }
        )
    } catch (error: unknown) {
        return NextResponse.json<ApiResponse>(
            {
                status: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : 'Failed to fetch submission'
            },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
    }
}