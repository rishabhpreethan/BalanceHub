"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Users, DollarSign, TrendingUp, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { AddMemberDialog } from "@/components/add-member-dialog"
import { ExpenseList } from "@/components/expense-list"
import { BalanceChart } from "@/components/balance-chart"
import { FairSplitView } from "@/components/fair-split-view"
import { formatCurrency } from "@/lib/utils"
import { getToken, isAuthenticated } from "@/lib/client-auth"
import { Badge } from "@/components/ui/badge"

interface GroupData {
  id: string
  name: string
  createdAt: string
  members: Array<{
    user: {
      id: string
      name: string
      email: string
    }
    role: string
  }>
}

interface LedgerData {
  expenses: Array<{
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
  }>
  balances: Array<{
    userId: string
    name: string
    spent: number
    expenseCount: number
    balance: number
    fairShare: number
  }>
  totalExpenses: number
  fairShare: number
  memberCount: number
}

export default function GroupPage({ params }: { params: { groupId: string } }) {
  const router = useRouter()
  const [group, setGroup] = useState<GroupData | null>(null)
  const [ledger, setLedger] = useState<LedgerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const [addMemberOpen, setAddMemberOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/signin")
    }
  }, [router])

  useEffect(() => {
    if (isAuthenticated()) {
      fetchGroupData()
      fetchLedgerData()
    }
  }, [params.groupId])

  const fetchGroupData = async () => {
    try {
      const token = getToken()
      const response = await fetch(`/api/groups/${params.groupId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      })
      if (response.ok) {
        const data = await response.json()
        setGroup(data)
      } else if (response.status === 404) {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error fetching group:", error)
    }
  }

  const fetchLedgerData = async () => {
    try {
      const token = getToken()
      const response = await fetch(`/api/ledger/${params.groupId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      })
      if (response.ok) {
        const data = await response.json()
        setLedger(data)
      }
    } catch (error) {
      console.error("Error fetching ledger:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExpenseAdded = () => {
    fetchLedgerData()
    setAddExpenseOpen(false)
  }

  const handleMemberAdded = () => {
    fetchGroupData()
    setAddMemberOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated() || !group || !ledger) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-muted-foreground">
            {group.members.length} members • {ledger.expenses.length} expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAddMemberOpen(true)}>
            <Users className="h-4 w-4 mr-2" />
            Add Member
          </Button>
          <Button onClick={() => setAddExpenseOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(ledger.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              Across all expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fair Share</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(ledger.fairShare)}</div>
            <p className="text-xs text-muted-foreground">
              Per person
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ledger.expenses.length}</div>
            <p className="text-xs text-muted-foreground">
              Total transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{group.members.length}</div>
            <p className="text-xs text-muted-foreground">
              Active participants
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="expenses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="split">Fair Split</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <ExpenseList expenses={ledger.expenses} />
        </TabsContent>

        <TabsContent value="balances">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Member Balances</CardTitle>
                <CardDescription>
                  How much each member has spent vs their fair share
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ledger.balances.map((balance) => (
                    <div key={balance.userId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-medium">
                          {balance.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{balance.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {balance.expenseCount} expenses
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          Spent: {formatCurrency(balance.spent)}
                        </p>
                        <p className={`text-sm ${balance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {balance.balance >= 0 ? 'Owed: ' : 'Owes: '}
                          {formatCurrency(Math.abs(balance.balance))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="split">
          <FairSplitView groupId={params.groupId} />
        </TabsContent>

        <TabsContent value="analytics">
          <BalanceChart expenses={ledger.expenses} balances={ledger.balances} />
        </TabsContent>

        <TabsContent value="members">
          <div className="space-y-6">
            <Card className="backdrop-blur supports-[backdrop-filter]:bg-background/80">
              <CardHeader>
                <CardTitle>Members</CardTitle>
                <CardDescription>Current participants and their roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.members.map((member) => (
                    <div key={member.user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{member.user.name || member.user.email}</p>
                          <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
                        </div>
                      </div>
                      <Badge variant={member.role === 'OWNER' ? 'default' : 'secondary'} className="ml-3">
                        {member.role === 'OWNER' ? 'Owner' : 'Member'}
                      </Badge>
                    </div>
                  ))}
                  {group.members.length === 0 && (
                    <p className="text-sm text-muted-foreground">No members yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <AddExpenseDialog
        open={addExpenseOpen}
        onOpenChange={setAddExpenseOpen}
        groupId={params.groupId}
        onExpenseAdded={handleExpenseAdded}
      />

      <AddMemberDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        groupId={params.groupId}
        onMemberAdded={handleMemberAdded}
      />
    </div>
  )
}
