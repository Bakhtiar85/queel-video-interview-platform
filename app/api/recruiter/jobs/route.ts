// app/api/recruiter/jobs/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
import { StatusCodes } from 'http-status-codes'
import { ApiResponse } from '@/types'

// GET - Fetch all jobs for recruiter
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const recruiterId = searchParams.get('recruiterId')

        if (!recruiterId) {
            return NextResponse.json<ApiResponse>(
                { status: false, statusCode: StatusCodes.BAD_REQUEST, error: 'Recruiter ID required' },
                { status: StatusCodes.BAD_REQUEST }
            )
        }

        const jobs = await prisma.job.findMany({
            where: { recruiterId },
            include: { questions: true, _count: { select: { applications: true } } },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json<ApiResponse>(
            { status: true, statusCode: StatusCodes.OK, data: jobs }
        )
    } catch (error: unknown) {
        return NextResponse.json<ApiResponse>(
            { status: false, statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error: error instanceof Error ? error.message : 'Failed to fetch jobs' },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
    }
}

// POST - Create new job
export async function POST(req: NextRequest) {
    try {
        const { title, description, questions, recruiterId } = await req.json()

        const job = await prisma.job.create({
            data: {
                title,
                description,
                recruiterId,
                questions: { create: questions }
            },
            include: { questions: true }
        })

        return NextResponse.json<ApiResponse>(
            { status: true, statusCode: StatusCodes.CREATED, data: job, message: 'Job created successfully' },
            { status: StatusCodes.CREATED }
        )
    } catch (error: unknown) {
        return NextResponse.json<ApiResponse>(
            { status: false, statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error: error instanceof Error ? error.message : 'Failed to create job' },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
    }
}

// PUT - Update existing job
export async function PUT(req: NextRequest) {
    try {
        const { jobId, title, description, questions } = await req.json()

        const job = await prisma.job.update({
            where: { id: jobId },
            data: {
                title,
                description,
                questions: {
                    deleteMany: {},
                    create: questions
                }
            },
            include: { questions: true }
        })

        return NextResponse.json<ApiResponse>(
            { status: true, statusCode: StatusCodes.OK, data: job, message: 'Job updated successfully' }
        )
    } catch (error: unknown) {
        return NextResponse.json<ApiResponse>(
            { status: false, statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error: error instanceof Error ? error.message : 'Failed to update job' },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
    }
}

// DELETE - Delete job
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const jobId = searchParams.get('jobId')

        if (!jobId) {
            return NextResponse.json<ApiResponse>(
                { status: false, statusCode: StatusCodes.BAD_REQUEST, error: 'Job ID required' },
                { status: StatusCodes.BAD_REQUEST }
            )
        }

        await prisma.job.delete({ where: { id: jobId } })

        return NextResponse.json<ApiResponse>(
            { status: true, statusCode: StatusCodes.OK, message: 'Job deleted successfully' }
        )
    } catch (error: unknown) {
        return NextResponse.json<ApiResponse>(
            { status: false, statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error: error instanceof Error ? error.message : 'Failed to delete job' },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
    }
}