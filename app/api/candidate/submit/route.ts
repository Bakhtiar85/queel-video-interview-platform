// app/api/candidate/submit/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
import { StatusCodes } from 'http-status-codes'
import { ApiResponse } from '@/types'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()

        const jobId = formData.get('jobId') as string
        const candidateName = formData.get('candidateName') as string
        const candidateEmail = formData.get('candidateEmail') as string
        const questionId = formData.get('questionId') as string
        const videoFile = formData.get('video') as File
        const duration = parseInt(formData.get('duration') as string)

        if (!jobId || !candidateName || !candidateEmail || !questionId || !videoFile) {
            return NextResponse.json<ApiResponse>(
                { status: false, statusCode: StatusCodes.BAD_REQUEST, error: 'Missing required fields' },
                { status: StatusCodes.BAD_REQUEST }
            )
        }

        // Find or create candidate
        let candidate = await prisma.candidate.findUnique({
            where: { email: candidateEmail }
        })

        if (!candidate) {
            candidate = await prisma.candidate.create({
                data: { email: candidateEmail, name: candidateName }
            })
        }

        // Find or create application
        let application = await prisma.application.findUnique({
            where: {
                candidateId_jobId: {
                    candidateId: candidate.id,
                    jobId: jobId
                }
            }
        })

        if (!application) {
            application = await prisma.application.create({
                data: {
                    candidateId: candidate.id,
                    jobId: jobId
                }
            })
        }

        // Save video file
        const bytes = await videoFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filename = `${Date.now()}-${candidate.id}-${questionId}.webm`
        const filepath = join(process.cwd(), 'public', 'uploads', 'videos', filename)

        await writeFile(filepath, buffer)

        // Create video response
        const videoResponse = await prisma.videoResponse.create({
            data: {
                applicationId: application.id,
                questionId: questionId,
                filePath: `/uploads/videos/${filename}`,
                duration: duration,
                fileSize: buffer.length,
                mimeType: videoFile.type
            }
        })

        return NextResponse.json<ApiResponse>(
            {
                status: true,
                statusCode: StatusCodes.CREATED,
                data: videoResponse,
                message: 'Video uploaded successfully'
            },
            { status: StatusCodes.CREATED }
        )
    } catch (error: unknown) {
        return NextResponse.json<ApiResponse>(
            {
                status: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : 'Failed to upload video'
            },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
    }
}