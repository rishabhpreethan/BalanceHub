import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { z } from 'zod'
import { requireAuth } from '@/lib/simple-auth'

const createExpenseSchema = z.object({
  groupId: z.string(),
  amount: z.number().positive(),
  merchant: z.string().min(1),
  description: z.string().optional(),
  visibilityScope: z.enum(['PUBLIC', 'GROUP', 'SUBGROUP']).default('GROUP')
})

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth(request)

    const body = await request.json()
    const { groupId, amount, merchant, description, visibilityScope } = createExpenseSchema.parse(body)

    // Verify user is member of the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId
      }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
    }

    // Create expense event
    const expenseEvent = await prisma.expenseEvent.create({
      data: {
        groupId,
        userId,
        amount,
        merchant,
        description,
        visibilityScope
      },
      include: {
        user: {
          select: { name: true, email: true }
        },
        group: {
          select: { name: true }
        }
      }
    })

    // Publish real-time update via Redis
    await redis.publish(`group:${groupId}:expenses`, JSON.stringify({
      type: 'EXPENSE_CREATED',
      data: expenseEvent
    }))

    // Update merchant trie in Redis
    try {
      const existingTrie = await redis.get('merchant:trie')
      if (existingTrie) {
        const { MerchantTrie } = await import('@/lib/algorithms/merchant-trie')
        const trie = MerchantTrie.deserialize(existingTrie)
        trie.insert(merchant)
        await redis.set('merchant:trie', trie.serialize())
      }
    } catch (error) {
      console.error('Failed to update merchant trie:', error)
    }

    return NextResponse.json(expenseEvent)
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
