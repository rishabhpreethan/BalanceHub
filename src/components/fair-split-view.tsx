"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, RefreshCw, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { getToken } from "@/lib/client-auth"

interface Settlement {
  from: string
  to: string
  amount: number
  fromName: string
  toName: string
}

interface UserBalance {
  userId: string
  name: string
  balance: number
}

interface FairSplitData {
  balances: UserBalance[]
  settlements: Settlement[]
  metrics: {
    totalTransactions: number
    totalAmount: number
    maxPossibleTransactions: number
    efficiency: number
  }
}

interface FairSplitViewProps {
  groupId: string
}

export function FairSplitView({ groupId }: FairSplitViewProps) {
  const [data, setData] = useState<FairSplitData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFairSplitData()
  }, [groupId])

  const fetchFairSplitData = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const response = await fetch(`/api/fair-split/${groupId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      })
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error("Error fetching fair split data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Failed to load fair split data</p>
          <Button onClick={fetchFairSplitData} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Algorithm Efficiency Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Algorithm Efficiency
          </CardTitle>
          <CardDescription>
            Graph-based debt minimization results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{data.metrics.totalTransactions}</div>
              <p className="text-sm text-muted-foreground">Optimal Transactions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">{data.metrics.maxPossibleTransactions}</div>
              <p className="text-sm text-muted-foreground">Max Possible</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.metrics.efficiency}%</div>
              <p className="text-sm text-muted-foreground">Efficiency</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatCurrency(data.metrics.totalAmount)}</div>
              <p className="text-sm text-muted-foreground">Total to Settle</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Balances */}
      <Card>
        <CardHeader>
          <CardTitle>Current Balances</CardTitle>
          <CardDescription>
            Individual balance status before settlement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.balances.map((balance) => (
              <div key={balance.userId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-medium">
                    {balance.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{balance.name}</span>
                </div>
                <div className={`font-semibold ${balance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {balance.balance >= 0 ? '+' : ''}{formatCurrency(balance.balance)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimal Settlements */}
      <Card>
        <CardHeader>
          <CardTitle>Optimal Settlement Plan</CardTitle>
          <CardDescription>
            Minimum transactions needed to settle all debts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.settlements.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-lg font-semibold mb-2">All Settled!</h3>
              <p className="text-muted-foreground">
                No transactions needed - everyone's balance is even.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.settlements.map((settlement, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm font-medium">
                        {settlement.fromName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{settlement.fromName}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium">
                        {settlement.toName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{settlement.toName}</span>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {formatCurrency(settlement.amount)}
                  </div>
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">💡 How it works:</h4>
                <p className="text-sm text-muted-foreground">
                  Our graph-based algorithm minimizes the number of transactions by finding the optimal 
                  debt settlement path. Instead of everyone paying everyone else, we calculate the most 
                  efficient way to balance all debts with the fewest transfers.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
