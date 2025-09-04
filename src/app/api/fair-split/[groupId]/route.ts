import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateFairSplit, calculateGroupBalances } from '@/lib/algorithms/fair-split'
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

    // Get all expenses for the group
    const expenses = await prisma.expenseEvent.findMany({
      where: { groupId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Get group member count
    const memberCount = await prisma.groupMember.count({
      where: { groupId }
    })

    // Transform expenses for calculation
    const expenseData = expenses.map((expense: any) => ({
      userId: expense.userId,
      userName: expense.user.name || expense.user.email,
      amount: parseFloat(expense.amount.toString())
    }))

    // Calculate balances
    const balances = calculateGroupBalances(expenseData, memberCount)

    // Calculate optimal settlements
    const settlements = calculateFairSplit(balances)

    // Calculate metrics
    const totalTransactions = settlements.length
    const totalAmount = settlements.reduce((sum, s) => sum + s.amount, 0)
    const maxPossibleTransactions = memberCount * (memberCount - 1) / 2
    const efficiency = maxPossibleTransactions > 0 ? 
      ((maxPossibleTransactions - totalTransactions) / maxPossibleTransactions * 100) : 100

    return NextResponse.json({
      balances,
      settlements,
      metrics: {
        totalTransactions,
        totalAmount,
        maxPossibleTransactions,
        efficiency: Math.round(efficiency * 100) / 100
      }
    })
  } catch (error) {
    console.error('Error calculating fair split:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
