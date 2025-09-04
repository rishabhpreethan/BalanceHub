"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getToken } from "@/lib/client-auth"

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  onExpenseAdded: () => void
}

export function AddExpenseDialog({ open, onOpenChange, groupId, onExpenseAdded }: AddExpenseDialogProps) {
  const [amount, setAmount] = useState("")
  const [merchant, setMerchant] = useState("")
  const [description, setDescription] = useState("")
  const [visibilityScope, setVisibilityScope] = useState("GROUP")
  const [merchantSuggestions, setMerchantSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (merchant.length >= 2) {
      fetchMerchantSuggestions(merchant)
    } else {
      setMerchantSuggestions([])
    }
  }, [merchant])

  const fetchMerchantSuggestions = async (query: string) => {
    try {
      const response = await fetch(`/api/merchant/autocomplete?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const suggestions = await response.json()
        setMerchantSuggestions(suggestions)
      }
    } catch (error) {
      console.error("Error fetching merchant suggestions:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !merchant.trim()) return

    setLoading(true)
    try {
      const token = getToken()
      const response = await fetch("/api/expenses/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          groupId,
          amount: parseFloat(amount),
          merchant: merchant.trim(),
          description: description.trim() || undefined,
          visibilityScope
        }),
      })

      if (response.ok) {
        onExpenseAdded()
        setAmount("")
        setMerchant("")
        setDescription("")
        setVisibilityScope("GROUP")
      } else {
        console.error("Failed to create expense")
      }
    } catch (error) {
      console.error("Error creating expense:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Record a new expense for this group. It will be included in the fair split calculation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="merchant" className="text-right">
                Merchant
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="merchant"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="e.g., Starbucks, Walmart, Uber"
                  required
                />
                {merchantSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                    {merchantSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                        onClick={() => {
                          setMerchant(suggestion)
                          setMerchantSuggestions([])
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Optional description"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="visibility" className="text-right">
                Visibility
              </Label>
              <Select value={visibilityScope} onValueChange={setVisibilityScope}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GROUP">Group Only</SelectItem>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="SUBGROUP">Subgroup</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !amount || !merchant.trim()}>
              {loading ? "Adding..." : "Add Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
