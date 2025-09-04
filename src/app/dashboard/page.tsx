"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, DollarSign, TrendingUp } from "lucide-react"
import { CreateGroupDialog } from "@/components/create-group-dialog"
import { GroupCard } from "@/components/group-card"
import { getToken, isAuthenticated } from "@/lib/client-auth"

interface Group {
  id: string
  name: string
  createdAt: string
  members: Array<{
    user: {
      id: string
      name: string
      email: string
    }
  }>
  _count: {
    expenseEvents: number
  }
}

export default function Dashboard() {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [createGroupOpen, setCreateGroupOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/signin")
    }
  }, [router])

  useEffect(() => {
    if (isAuthenticated()) {
      fetchGroups()
    }
  }, [])

  const fetchGroups = async () => {
    try {
      const token = getToken()
      const response = await fetch("/api/groups", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      })
      if (response.ok) {
        const data = await response.json()
        const normalized: Group[] = (data || []).map((g: Group) => ({
          ...g,
          _count: g._count ?? { expenseEvents: 0 }
        }))
        setGroups(normalized)
      }
    } catch (error) {
      console.error("Error fetching groups:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGroupCreated = (newGroup: Group) => {
    // Ensure _count exists for UI aggregations
    const normalized: Group = {
      ...newGroup,
      _count: newGroup._count ?? { expenseEvents: 0 },
    }
    setGroups([normalized, ...groups])
    setCreateGroupOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated()) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back</p>
        </div>
        <Button onClick={() => setCreateGroupOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groups.length}</div>
            <p className="text-xs text-muted-foreground">
              Active expense groups
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <div className="h-8 w-8 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {groups.reduce((sum, group) => sum + group._count.expenseEvents, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all groups
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <div className="h-8 w-8 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(groups.flatMap(g => g.members.map(m => m.user.id))).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique collaborators
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Groups Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Groups</h2>
        {groups.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first group to start tracking shared expenses with friends, 
                family, or roommates.
              </p>
              <Button onClick={() => setCreateGroupOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Group
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>

      <CreateGroupDialog
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  )
}
