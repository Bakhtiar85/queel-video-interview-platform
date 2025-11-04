// app/api/recruiter/submissions/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { StatusCodes } from 'http-status-codes'
import { ApiResponse } from '@/types'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const jobId = searchParams.get('jobId')

        if (!jobId) {
            return NextResponse.json<ApiResponse>(
                { status: false, statusCode: StatusCodes.BAD_REQUEST, error: 'Job ID required' },
                { status: StatusCodes.BAD_REQUEST }
            )
        }

        const applications = await prisma.application.findMany({
            where: { jobId },
            include: {
                candidate: true,
                videoResponses: {
                    include: {
                        question: true
                    }
                }
            },
            orderBy: { startedAt: 'desc' }
        })

        return NextResponse.json<ApiResponse>(
            { status: true, statusCode: StatusCodes.OK, data: applications }
        )
    } catch (error: unknown) {
        return NextResponse.json<ApiResponse>(
            {
                status: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : 'Failed to fetch submissions'
            },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
    }
}