'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HeartPulse } from 'lucide-react'
import { Label } from '@radix-ui/react-label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // important if Flask uses session cookies
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (res.ok) {
        if (data.is_admin===true) {
            router.push('/admin/doctors')
        } 
        if (data.is_admin==false) {
            router.push('/patients')
        } 
    } 
    else {
      setError(data.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{
                                                            backgroundImage: "url('/images/background.jpeg')", // adjust path
    }}>
      
      <Card className="w-95 shadow-lg bg-white/20 backdrop-blur-md border border-white/30">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <HeartPulse className="text-red-500 h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-semibold text-white">
            ECG Anomaly Detection
          </CardTitle>
          <CardDescription className="text-sm text-white-muted-foreground">
            Please login to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className='grid gap-2'>
              <Label htmlFor="email" className='font-semibold'>Email</Label>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="placeholder text-black"
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor="password" className='font-semibold'>Password</Label>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full mt-10 bg-white text-black hover:bg-gray-300">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
