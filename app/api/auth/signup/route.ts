// app/api/auth/signup/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
import { StatusCodes } from 'http-status-codes'
import { ApiResponse, Recruiter } from '@/types'

export async function POST(req: NextRequest) {
    try {
        const { email, name, password } = await req.json()

        const existingRecruiter = await prisma.recruiter.findUnique({
            where: { email }
        })

        if (existingRecruiter) {
            return NextResponse.json<ApiResponse>(
                { status: false, statusCode: StatusCodes.CONFLICT, error: 'Email already exists' },
                { status: StatusCodes.CONFLICT }
            )
        }

        const recruiter = await prisma.recruiter.create({
            data: { email, name, password }
        })

        return NextResponse.json<ApiResponse<Recruiter>>(
            {
                status: true,
                statusCode: StatusCodes.CREATED,
                data: { id: recruiter.id, email: recruiter.email, name: recruiter.name },
                message: 'Signup successful'
            },
            { status: StatusCodes.CREATED }
        )
    } catch (err: unknown) {
        return NextResponse.json<ApiResponse>(
            {
                status: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                error: err instanceof Error ? err.message : 'Signup failed'
            },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
    }
}