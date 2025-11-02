// app/api/candidate/job/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
import { StatusCodes } from 'http-status-codes'
import { ApiResponse } from '@/types'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const linkId = searchParams.get('linkId')

        if (!linkId) {
            return NextResponse.json<ApiResponse>(
                { status: false, statusCode: StatusCodes.BAD_REQUEST, error: 'Link ID required' },
                { status: StatusCodes.BAD_REQUEST }
            )
        }

        const job = await prisma.job.findUnique({
            where: { linkId, isActive: true },
            include: {
                questions: {
                    orderBy: { orderIndex: 'asc' }
                }
            }
        })

        if (!job) {
            return NextResponse.json<ApiResponse>(
                { status: false, statusCode: StatusCodes.NOT_FOUND, error: 'Job not found' },
                { status: StatusCodes.NOT_FOUND }
            )
        }

        return NextResponse.json<ApiResponse>(
            { status: true, statusCode: StatusCodes.OK, data: job }
        )
    } catch (error: unknown) {
        return NextResponse.json<ApiResponse>(
            { status: false, statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error: error instanceof Error ? error.message : 'Failed to fetch job' },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
    }
}