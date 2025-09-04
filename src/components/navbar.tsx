"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LogOut, User } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { clearToken, isAuthenticated } from "@/lib/client-auth"
import { useRouter } from "next/navigation"
import Image from "next/image"
import LogoImg from "../../balancehublogo2.png"

export function Navbar() {
  const [authed, setAuthed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setAuthed(isAuthenticated())
  }, [])

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image src={LogoImg} alt="BalanceHub" width={50} height={50} className="invert" />
          </Link>

          <div className="flex items-center space-x-4">
            {authed ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Account</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      clearToken()
                      setAuthed(false)
                      router.push("/")
                    }}
                    className="flex items-center space-x-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </div>
            ) : (
              <Link href="/signin"><Button>Sign In</Button></Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
