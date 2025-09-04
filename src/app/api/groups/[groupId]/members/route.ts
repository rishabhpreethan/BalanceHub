import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { requireAuth } from '@/lib/simple-auth'

const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['OWNER', 'MEMBER']).optional().default('MEMBER')
})

export async function POST(request: NextRequest, { params }: { params: { groupId: string } }) {
  try {
    const requesterId = await requireAuth(request)
    const { groupId } = params

    // Ensure requester is an OWNER of the group
    const requesterMembership = await prisma.groupMember.findFirst({
      where: { groupId, userId: requesterId }
    })

    if (!requesterMembership || requesterMembership.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only group owners can add members' }, { status: 403 })
    }

    const body = await request.json()
    const { email, role } = addMemberSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already a member
    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: user.id } }
    })

    if (existing) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 409 })
    }

    const membership = await prisma.groupMember.create({
      data: {
        groupId,
        userId: user.id,
        role
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    })

    return NextResponse.json(membership, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payload', issues: error.issues }, { status: 400 })
    }
    console.error('Error adding member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
