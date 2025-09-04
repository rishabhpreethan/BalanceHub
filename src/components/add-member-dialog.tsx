"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getToken } from "@/lib/client-auth"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  onMemberAdded?: () => void
}

export function AddMemberDialog({ open, onOpenChange, groupId, onMemberAdded }: AddMemberDialogProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"OWNER" | "MEMBER">("MEMBER")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email")
      return
    }

    try {
      setLoading(true)
      const token = getToken()
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ email, role })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error || "Failed to add member")
        return
      }

      setSuccess("Member added successfully")
      setEmail("")
      setRole("MEMBER")
      // slight delay so the user sees the success state
      setTimeout(() => {
        onOpenChange(false)
        onMemberAdded?.()
        setSuccess(null)
      }, 500)
    } catch (err) {
      setError("Something went wrong. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add member</DialogTitle>
          <DialogDescription>
            Invite an existing user by their email address. You can optionally set their role.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">The user must already have an account.</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "OWNER" | "MEMBER")}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="OWNER">Owner</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Owners can manage members and settings.</p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !email}>
              {loading ? "Adding..." : "Add member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
