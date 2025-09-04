"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { DollarSign, User, Calendar } from "lucide-react"

interface Expense {
  id: string
  amount: string
  merchant: string
  description?: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface ExpenseListProps {
  expenses: Expense[]
}

export function ExpenseList({ expenses }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No expenses yet</h3>
          <p className="text-muted-foreground text-center">
            Add your first expense to start tracking group spending.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <Card key={expense.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{expense.merchant}</CardTitle>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(parseFloat(expense.amount))}
                </div>
              </div>
            </div>
            {expense.description && (
              <CardDescription>{expense.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{expense.user.name || expense.user.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(new Date(expense.createdAt))}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
