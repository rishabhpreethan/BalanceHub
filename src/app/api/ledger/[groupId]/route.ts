import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/simple-auth'

export async function GET(
  request: Request,
  context: any
) {
  try {
    const userId = await requireAuth(request)

    const { groupId } = context.params as { groupId: string }

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

    // Get aggregated ledger data
    const expenses = await prisma.expenseEvent.findMany({
      where: {
        groupId,
        // Apply visibility scope filtering
        OR: [
          { visibilityScope: 'PUBLIC' },
          { visibilityScope: 'GROUP' },
          { userId } // User can always see their own expenses
        ]
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate user totals
    const userTotals = new Map<string, { name: string, spent: number, expenseCount: number }>()
    let totalExpenses = 0

    expenses.forEach((expense: any) => {
      const amount = parseFloat(expense.amount.toString())
      const current = userTotals.get(expense.userId) || { 
        name: expense.user.name || expense.user.email, 
        spent: 0, 
        expenseCount: 0 
      }
      current.spent += amount
      current.expenseCount += 1
      userTotals.set(expense.userId, current)
      totalExpenses += amount
    })

    // Get group member count for fair share calculation
    const memberCount = await prisma.groupMember.count({
      where: { groupId }
    })

    const fairShare = totalExpenses / memberCount

    // Calculate balances
    const balances = Array.from(userTotals.entries()).map(([userId, data]) => ({
      userId,
      name: data.name,
      spent: data.spent,
      expenseCount: data.expenseCount,
      balance: data.spent - fairShare,
      fairShare
    }))

    return NextResponse.json({
      expenses,
      balances,
      totalExpenses,
      fairShare,
      memberCount
    })
  } catch (error) {
    console.error('Error fetching ledger:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
