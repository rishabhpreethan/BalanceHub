import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { requireAuth } from '@/lib/simple-auth'

const createGroupSchema = z.object({
  name: z.string().min(1).max(100)
})

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth(request)

    const body = await request.json()
    const { name } = createGroupSchema.parse(body)

    // Create group and add creator as owner
    const group = await prisma.group.create({
      data: {
        name,
        members: {
          create: {
            userId,
            role: 'OWNER'
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: {
            expenseEvents: true
          }
        }
      }
    })

    return NextResponse.json(group)
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
