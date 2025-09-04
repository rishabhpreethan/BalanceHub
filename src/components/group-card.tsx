"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, DollarSign, Calendar } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

interface GroupCardProps {
  group: {
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
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 bg-gradient-to-br from-muted/40 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="truncate">{group.name}</span>
          <div className="h-8 w-8 rounded-md bg-muted text-foreground/80 flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Created {formatDate(new Date(group.createdAt))}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Members</span>
            <span className="font-medium">{group.members.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Expenses</span>
            <span className="font-medium">{group._count.expenseEvents}</span>
          </div>
          
          {/* Member avatars */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {group.members.slice(0, 3).map((member) => (
                <div
                  key={member.user.id}
                  className="w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-medium"
                  title={member.user.name || member.user.email}
                >
                  {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                </div>
              ))}
              {group.members.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                  +{group.members.length - 3}
                </div>
              )}
            </div>
          </div>

          <Link href={`/groups/${group.id}`} className="block">
            <Button className="w-full" variant="outline">
              <DollarSign className="h-4 w-4 mr-2" />
              View Group
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
