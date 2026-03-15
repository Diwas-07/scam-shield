'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Welcome back!')
        router.push('/dashboard')
        router.refresh()
      }
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
          <h1 className="text-3xl font-bold text-[#E8F4F8] mb-2">Welcome Back</h1>
          <p className="text-[#8B92A7]">Sign in to your ScamShield account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#13131A] border border-[#1E1E2A] rounded-lg p-8">
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
              className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#1E1E2A] rounded-lg text-[#E8F4F8] focus:outline-none focus:border-[#C8FF00] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C8FF00] text-[#0A0A0F] py-3 rounded-lg font-semibold hover:bg-[#B8EF00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-[#8B92A7] text-sm mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#C8FF00] hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
