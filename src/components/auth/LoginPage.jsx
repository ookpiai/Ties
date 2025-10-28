import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // DEVELOPER BYPASS: Allow direct access with "dev" credentials
      if (formData.email === 'dev' && formData.password === 'dev') {
        console.log('Developer bypass activated')
        navigate('/dashboard')
        return
      }

      // Real Supabase authentication
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) throw signInError

      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        // First time login, redirect to profile setup
        navigate('/profile/setup')
      } else {
        // Profile exists, go to dashboard
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF0F0] via-[#FFD6D6] to-[#FFB8B8] relative overflow-hidden">
      {/* Animated Background Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Left side orbs */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-[#E03131] rounded-full blur-3xl opacity-[0.12] animate-float" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-[#E03131] rounded-full blur-3xl opacity-[0.15] animate-float-slow" />
        <div className="absolute top-1/2 left-1/4 w-56 h-56 bg-[#F03E3E] rounded-full blur-3xl opacity-[0.13] animate-float-delayed" />
        {/* Right side orbs */}
        <div className="absolute top-40 right-20 w-80 h-80 bg-[#F03E3E] rounded-full blur-3xl opacity-[0.14] animate-float-delayed" />
        <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-[#E03131] rounded-full blur-3xl opacity-[0.12] animate-float" />
        <div className="absolute top-20 right-1/3 w-64 h-64 bg-[#F03E3E] rounded-full blur-3xl opacity-[0.15] animate-float-slow" />
      </div>

      {/* Logo at very top of page - outside main content flow */}
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
            {/* WORDING BLOCK — vertically centered, no overlap with logo */}
            <h1 className="font-extrabold tracking-tight leading-[0.9] text-[clamp(56px,8vw,128px)] text-black">
              TIES<br/>Together
            </h1>

            <p className="mt-8 text-[clamp(20px,2.4vw,32px)] font-semibold text-black">
              Connect. Create. Collaborate.
            </p>
            <p className="mt-3 text-[clamp(14px,1.6vw,18px)] text-black/70">
              A home for creatives
            </p>
          </div>
        </div>

        {/* Right Column - Login Card */}
        <div className="w-full lg:w-1/2 px-10 flex items-center justify-center">
          <div className="w-full max-w-md mx-auto">
            <div className="rounded-2xl bg-white/85 backdrop-blur-md shadow-xl border border-black/5 p-8">
              <h2 className="text-2xl font-bold text-black mb-2">
                Welcome back
              </h2>
              <p className="text-sm text-black/80 mb-6">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-[#E03131] hover:text-[#F03E3E]">
                  Sign up for free
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
                      type="text"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email (or 'dev' for testing)"
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
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-[#E03131] focus:ring-[#E03131] border-black/20 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-black">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-black hover:text-black/80">
                      Forgot password?
                    </a>
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full bg-[#E03131] hover:bg-[#F03E3E] text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-black/10" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white/85 text-black">New to TIES Together?</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link to="/register">
                    <Button variant="outline" className="w-full border-black/20 text-black hover:bg-black/5">
                      Create your account
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Info message */}
              <div className="mt-6 bg-blue-50/80 border border-blue-200/50 rounded-lg p-4">
                <p className="text-xs text-blue-700">
                  Don't have an account? Sign up to create your profile and start connecting with creatives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

