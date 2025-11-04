// app/api/candidate/complete/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
import { StatusCodes } from 'http-status-codes'
import { ApiResponse } from '@/types'

export async function POST(req: NextRequest) {
    try {
        const { candidateEmail, jobId } = await req.json()

        const candidate = await prisma.candidate.findUnique({
            where: { email: candidateEmail }
        })

        if (!candidate) {
            return NextResponse.json<ApiResponse>(
                { status: false, statusCode: StatusCodes.NOT_FOUND, error: 'Candidate not found' },
                { status: StatusCodes.NOT_FOUND }
            )
        }

        const application = await prisma.application.update({
            where: {
                candidateId_jobId: {
                    candidateId: candidate.id,
                    jobId: jobId
                }
            },
            data: {
                completedAt: new Date()
            }
        })

        return NextResponse.json<ApiResponse>(
            { status: true, statusCode: StatusCodes.OK, data: application, message: 'Application completed' }
        )
    } catch (error: unknown) {
        return NextResponse.json<ApiResponse>(
            { status: false, statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error: error instanceof Error ? error.message : 'Failed to complete application' },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
    }
}