// app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
import { StatusCodes } from 'http-status-codes'
import { ApiResponse, Recruiter } from '@/types'

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json()

        const recruiter = await prisma.recruiter.findUnique({
            where: { email }
        })

        if (!recruiter || recruiter.password !== password) {
            return NextResponse.json<ApiResponse>(
                { status: false, statusCode: StatusCodes.UNAUTHORIZED, error: 'Invalid credentials' },
                { status: StatusCodes.UNAUTHORIZED }
            )
        }

        return NextResponse.json<ApiResponse<Recruiter>>(
            {
                status: true,
                statusCode: StatusCodes.OK,
                data: { id: recruiter.id, email: recruiter.email, name: recruiter.name },
                message: 'Login successful'
            }
        )
    } catch (err: unknown) {
        return NextResponse.json<ApiResponse>(
            {
                status: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                error: err instanceof Error ? err.message : 'Login failed'
            },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
    }
}