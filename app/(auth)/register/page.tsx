'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Registration failed')
        return
      }

      toast.success('Account created! Please sign in.')
      router.push('/login')
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#E8F4F8] mb-2">Create Account</h1>
          <p className="text-[#8B92A7]">Join ScamShield to protect your community</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#13131A] border border-[#1E1E2A] rounded-lg p-8">
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-[#E8F4F8] mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#1E1E2A] rounded-lg text-[#E8F4F8] focus:outline-none focus:border-[#C8FF00] transition-colors"
              placeholder="Enter your name"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-[#E8F4F8] mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#1E1E2A] rounded-lg text-[#E8F4F8] focus:outline-none focus:border-[#C8FF00] transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-[#E8F4F8] mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={8}
              className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#1E1E2A] rounded-lg text-[#E8F4F8] focus:outline-none focus:border-[#C8FF00] transition-colors"
              placeholder="••••••••"
            />
            <p className="text-xs text-[#8B92A7] mt-1">Minimum 8 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C8FF00] text-[#0A0A0F] py-3 rounded-lg font-semibold hover:bg-[#B8EF00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-[#8B92A7] text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#C8FF00] hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
