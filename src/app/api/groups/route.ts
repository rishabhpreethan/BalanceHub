import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/simple-auth'

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth(request)

    // Get all groups where user is a member
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(groups)
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
