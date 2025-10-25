import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff } from 'lucide-react'
import { useToast } from '../components/Toaster'
import { TitoLoader, useLoader } from '../components/TitoLoader'

export function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const { showToast } = useToast()
  const { isLoading, withLoader } = useLoader()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      await withLoader(async () => {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        })

        if (signUpError) throw signUpError

        showToast('Account created! Please complete your profile.', 'success')
        navigate('/profile/setup')
      })
    } catch (err: any) {
      setError(err.message || 'Signup failed')
      showToast(err.message || 'Signup failed', 'error')
    }
  }

  return (
    <>
      <TitoLoader show={isLoading} />
      <div className="min-h-screen bg-gradient-to-br from-[#FFF0F0] via-[#FFD6D6] to-[#FFB8B8] relative overflow-hidden">
        {/* Animated Background Layer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#E03131] rounded-full blur-3xl opacity-[0.12] animate-float" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-[#E03131] rounded-full blur-3xl opacity-[0.15] animate-float-slow" />
          <div className="absolute top-1/2 left-1/4 w-56 h-56 bg-[#F03E3E] rounded-full blur-3xl opacity-[0.13] animate-float-delayed" />
          <div className="absolute top-40 right-20 w-80 h-80 bg-[#F03E3E] rounded-full blur-3xl opacity-[0.14] animate-float-delayed" />
          <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-[#E03131] rounded-full blur-3xl opacity-[0.12] animate-float" />
          <div className="absolute top-20 right-1/3 w-64 h-64 bg-[#F03E3E] rounded-full blur-3xl opacity-[0.15] animate-float-slow" />
        </div>

        {/* Logo at very top of page */}
        <img
          src="/logo.png"
          alt="TIES logo"
          className="absolute left-10 top-4 md:left-14 md:top-6 h-[225px] w-auto md:h-[375px] z-30"
          style={{ imageRendering: 'crisp-edges' }}
        />

        {/* Main Content */}
        <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center relative z-10">
          {/* Left Column - Brand Block */}
          <div className="w-full lg:w-1/2 px-10 flex items-center justify-center">
            <div className="px-12 max-w-[900px]">
              <h1 className="font-extrabold tracking-tight leading-[0.9] text-[clamp(56px,8vw,128px)] text-black">
                Join<br/>Today
              </h1>

              <p className="mt-8 text-[clamp(20px,2.4vw,32px)] font-semibold text-black">
                Connect. Create. Collaborate.
              </p>
              <p className="mt-3 text-[clamp(14px,1.6vw,18px)] text-black/70">
                A home for creatives
              </p>
            </div>
          </div>

          {/* Right Column - Signup Card */}
          <div className="w-full lg:w-1/2 px-10 flex items-center justify-center">
            <div className="w-full max-w-md mx-auto">
              <div className="rounded-2xl bg-white/85 backdrop-blur-md shadow-xl border border-black/5 p-8">
                <h2 className="text-2xl font-bold text-black mb-2">
                  Create your account
                </h2>
                <p className="text-sm text-black/80 mb-6">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-[#E03131] hover:text-[#F03E3E]">
                    Sign in here
                  </Link>
                </p>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <Label htmlFor="email" className="text-black">Email</Label>
                    <div className="mt-1">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className="text-black placeholder:text-black/40"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-black">Password</Label>
                    <div className="mt-1 relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a password (min 6 characters)"
                        className="text-black placeholder:text-black/40"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-black/40" />
                        ) : (
                          <Eye className="h-4 w-4 text-black/40" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-black">Confirm Password</Label>
                    <div className="mt-1">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        className="text-black placeholder:text-black/40"
                      />
                    </div>
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full bg-[#E03131] hover:bg-[#F03E3E] text-white"
                      disabled={isLoading}
                    >
                      Create account
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
