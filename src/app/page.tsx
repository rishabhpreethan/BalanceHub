"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, BarChart3, Zap, Shield, Globe } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { isAuthenticated } from "@/lib/client-auth"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated()) router.push("/dashboard")
  }, [router])

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center mb-6">
          <DollarSign className="h-12 w-12 text-primary mr-4" />
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            BalanceHub
          </h1>
        </div>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Collaborative expense tracking with fair-split algorithms, real-time updates, 
          and CS fundamentals. Built for families, roommates, and small teams.
        </p>
        <Link href="/signin"><Button size="lg" className="text-lg px-8 py-3">Get Started - It's Free</Button></Link>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <Card>
          <CardHeader>
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Collaboration First</CardTitle>
            <CardDescription>
              Built for shared expense management with transparent, privacy-aware tracking
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <BarChart3 className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Fair-Split Algorithm</CardTitle>
            <CardDescription>
              Graph-based debt minimization using advanced algorithms to reduce transactions
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Zap className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Real-Time Updates</CardTitle>
            <CardDescription>
              Event-sourced ledger with Redis Pub/Sub for live dashboard synchronization
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Privacy Scopes</CardTitle>
            <CardDescription>
              Control expense visibility with public, group-only, or subgroup-private options
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <DollarSign className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Smart Categorization</CardTitle>
            <CardDescription>
              Trie-based merchant autocomplete with O(L) lookup performance
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Globe className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Free Deployment</CardTitle>
            <CardDescription>
              Runs entirely on free tiers: Vercel, Neon Postgres, and Upstash Redis
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Technical Highlights */}
      <Card className="mb-16">
        <CardHeader>
          <CardTitle className="text-2xl">CS Fundamentals Showcase</CardTitle>
          <CardDescription>
            BalanceHub demonstrates real-world application of computer science concepts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Data Structures & Algorithms</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Trie for merchant autocomplete</li>
                <li>• Graph algorithms for debt optimization</li>
                <li>• Event sourcing for data integrity</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Systems Design</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Serverless architecture with cold start metrics</li>
                <li>• Redis caching and Pub/Sub messaging</li>
                <li>• Database optimization with SQL views</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Balance Your Expenses?</h2>
        <p className="text-muted-foreground mb-6">
          Join groups, track expenses, and settle debts with mathematical precision.
        </p>
        <Link href="/signin"><Button size="lg">Sign In</Button></Link>
      </div>
    </div>
  )
}
