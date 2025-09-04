"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { formatCurrency } from "@/lib/utils"

interface Expense {
  id: string
  amount: string
  merchant: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface Balance {
  userId: string
  name: string
  spent: number
  expenseCount: number
  balance: number
  fairShare: number
}

interface BalanceChartProps {
  expenses: Expense[]
  balances: Balance[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function BalanceChart({ expenses, balances }: BalanceChartProps) {
  // Prepare data for spending by user chart
  const spendingData = balances.map(balance => ({
    name: balance.name,
    spent: balance.spent,
    fairShare: balance.fairShare,
    balance: balance.balance
  }))

  // Prepare data for expense categories (merchants)
  const merchantData = expenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.merchant === expense.merchant)
    if (existing) {
      existing.amount += parseFloat(expense.amount)
      existing.count += 1
    } else {
      acc.push({
        merchant: expense.merchant,
        amount: parseFloat(expense.amount),
        count: 1
      })
    }
    return acc
  }, [] as Array<{ merchant: string; amount: number; count: number }>)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8) // Top 8 merchants

  // Prepare data for spending over time
  const timeData = expenses
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .reduce((acc, expense, index) => {
      const date = new Date(expense.createdAt).toLocaleDateString()
      const amount = parseFloat(expense.amount)
      
      if (acc.length === 0) {
        acc.push({ date, cumulative: amount, daily: amount })
      } else {
        const lastCumulative = acc[acc.length - 1].cumulative
        const existingDay = acc.find(item => item.date === date)
        
        if (existingDay) {
          existingDay.daily += amount
          existingDay.cumulative = lastCumulative + amount
          // Update all subsequent entries
          const dayIndex = acc.indexOf(existingDay)
          for (let i = dayIndex + 1; i < acc.length; i++) {
            acc[i].cumulative += amount
          }
        } else {
          acc.push({ date, cumulative: lastCumulative + amount, daily: amount })
        }
      }
      return acc
    }, [] as Array<{ date: string; cumulative: number; daily: number }>)

  return (
    <div className="grid gap-6">
      {/* Spending by User */}
      <Card>
        <CardHeader>
          <CardTitle>Spending vs Fair Share</CardTitle>
          <CardDescription>
            Compare how much each member has spent against their fair share
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={spendingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="spent" fill="#8884d8" name="Amount Spent" />
              <Bar dataKey="fairShare" fill="#82ca9d" name="Fair Share" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Merchants */}
        <Card>
          <CardHeader>
            <CardTitle>Top Merchants</CardTitle>
            <CardDescription>
              Breakdown of spending by merchant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={merchantData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ merchant, amount }) => `${merchant}: ${formatCurrency(amount)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {merchantData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Balance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Balance Distribution</CardTitle>
            <CardDescription>
              Who owes money vs who is owed money
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={spendingData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar 
                  dataKey="balance" 
                  name="Balance"
                >
                  {spendingData.map((entry, index) => (
                    <Cell key={`balance-cell-${index}`} fill={entry.balance >= 0 ? "#00C49F" : "#FF8042"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Spending Over Time */}
      {timeData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Spending Over Time</CardTitle>
            <CardDescription>
              Cumulative group spending trend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Cumulative Spending"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
