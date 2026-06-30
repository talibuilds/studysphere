"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { GraduationCap, Sparkles, User, Lock, BookOpen, Star, Users, Mail, Key } from "lucide-react"
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import PasswordInput from "@/components/password-input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { authAPI } from "@/lib/api"
import { toast } from "sonner"

export default function AuthPage() {
  const router = useRouter()
  const { login, loginWithGoogle, register, isAuthenticated } = useAuth()

  // Login state
  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [loginError, setLoginError] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)

  // Register state
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
  })
  const [registerError, setRegisterError] = useState("")
  const [registerLoading, setRegisterLoading] = useState(false)

  // Forgot Password state
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [resetStep, setResetStep] = useState(1) // 1: request code, 2: verify & change
  const [resetEmail, setResetEmail] = useState("")
  const [resetOtp, setResetOtp] = useState("")
  const [resetNewPassword, setResetNewPassword] = useState("")
  const [resetNewPassword2, setResetNewPassword2] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState("")
  const [resetSuccess, setResetSuccess] = useState("")

  // Redirect if already authenticated use useEffect to avoid render time updates
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    setLoginLoading(true)

    try {
      await login(loginData.username, loginData.password)
      router.push("/")
    } catch (error: any) {
      setLoginError(error.message || "Login failed. Please check your credentials.")
    } finally {
      setLoginLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setLoginError("")
    setLoginLoading(true)

    try {
      if (credentialResponse.credential) {
        await loginWithGoogle(credentialResponse.credential)
        router.push("/")
      } else {
        setLoginError("No credential received from Google")
      }
    } catch (error: any) {
      setLoginError(error.message || "Google login failed. Please try again.")
    } finally {
      setLoginLoading(false)
    }
  }

  const handleGoogleError = () => {
    setLoginError("Google login failed. Please try again.")
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError("")

    // Validate password match
    if (registerData.password !== registerData.password2) {
      setRegisterError("Passwords do not match")
      return
    }

    setRegisterLoading(true)

    try {
      await register(registerData)
      router.push("/")
    } catch (error: any) {
      setRegisterError(error.message || "Registration failed. Please try again.")
    } finally {
      setRegisterLoading(false)
    }
  }

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError("")
    setResetLoading(true)
    setResetSuccess("")

    try {
      await authAPI.requestPasswordReset(resetEmail)
      setResetSuccess("Verification code sent to your email. Please check your inbox.")
      setResetStep(2)
    } catch (err: any) {
      setResetError(err.response?.data?.detail || "Failed to send verification code. Please try again.")
    } finally {
      setResetLoading(false)
    }
  }

  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError("")
    setResetSuccess("")

    if (resetNewPassword !== resetNewPassword2) {
      setResetError("Passwords do not match")
      return
    }

    setResetLoading(true)

    try {
      await authAPI.verifyPasswordReset({
        email: resetEmail,
        otp: resetOtp,
        new_password: resetNewPassword
      })
      setResetSuccess("Password reset successful! You can now log in with your new password.")
      toast.success("Password reset successful!")
      
      // Reset form and close after 2 seconds
      setTimeout(() => {
        setIsResetOpen(false)
        setResetStep(1)
        setResetEmail("")
        setResetOtp("")
        setResetNewPassword("")
        setResetNewPassword2("")
        setResetSuccess("")
      }, 2000)

    } catch (err: any) {
      setResetError(
        err.response?.data?.otp?.[0] || 
        err.response?.data?.new_password?.[0] || 
        err.response?.data?.detail || 
        "Failed to reset password. Please verify the code and try again."
      )
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-[#000000] text-white font-sans overflow-hidden">
      <div className="hidden lg:flex w-2/3 flex-col p-16 relative bg-[url('/bg-login.png')] bg-cover bg-center before:absolute before:inset-0 before:bg-black/40 after:absolute after:inset-y-0 after:right-0 after:w-1/2 after:bg-gradient-to-l after:from-[#000000] after:to-transparent">
        
        {/* Main Content - Centered */}
        <div className="relative z-10 flex flex-col justify-center flex-1 max-w-lg">
          <h1 className="text-[3.5rem] font-extrabold leading-[1.1] mb-6">
            Where BMSCE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Studies Together</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-sm">
            Connect with peers, join sessions, share resources, and level up your learning.
          </p>
        </div>
        
        {/* Stats - Bottom */}
        <div className="relative z-10 grid grid-cols-3 gap-6 max-w-lg pb-4">
            <div className="space-y-3">
              <Users className="text-blue-400" size={28} />
              <div>
                <p className="font-bold text-xl">500+</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Active Students</p>
              </div>
            </div>
            <div className="space-y-3">
              <BookOpen className="text-blue-400" size={28} />
              <div>
                <p className="font-bold text-xl">120+</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Study Sessions</p>
              </div>
            </div>
            <div className="space-y-3">
              <Star className="text-blue-400" size={28} />
              <div>
                <p className="font-bold text-xl">98%</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Satisfaction Rate</p>
              </div>
            </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/3 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative z-10 bg-[#000000]">
        <div className="w-full max-w-[480px] bg-[#0c0c0e] border border-white/5 rounded-2xl sm:rounded-[32px] p-6 sm:p-10 lg:p-12 relative overflow-hidden">
          
          <div className="space-y-1 mb-6 sm:mb-8 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome <span className="text-purple-500">back</span>
            </h2>
            <p className="text-sm text-slate-400">
              Enter your credentials to access your account
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="flex w-full mb-8 bg-black/40 p-1 rounded-2xl border border-white/5">
              <TabsTrigger value="login" className="flex-1 rounded-xl data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 transition-all py-2.5 font-medium">Login</TabsTrigger>
              <TabsTrigger value="register" className="flex-1 rounded-xl data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 transition-all py-2.5 font-medium">Register</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="animate-in fade-in-50 duration-500">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="login-username" className="text-slate-300 text-xs font-semibold ml-1">Username or Email</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      <User size={18} />
                    </div>
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="Enter your username or email"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      required
                      disabled={loginLoading}
                      className="bg-[#12131a] border-white/5 text-white h-11 pl-10 pr-4 rounded-xl focus-visible:ring-1 focus-visible:ring-purple-500 placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="text-slate-300 text-xs font-semibold ml-1">Password</Label>
                  <PasswordInput
                    id="login-password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(value) => setLoginData({ ...loginData, password: value })}
                    required
                    disabled={loginLoading}
                    icon={<Lock size={18} />}
                  />
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetOpen(true);
                        setResetStep(1);
                        setResetError("");
                        setResetSuccess("");
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 hover:underline font-semibold focus:outline-none transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-900/50 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]"></div>
                    <p className="text-sm text-red-400 font-medium">{loginError}</p>
                  </div>
                )}

                <Button type="submit" className="w-full h-[52px] rounded-2xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white transition-all mt-4 font-bold text-sm group" disabled={loginLoading}>
                  {loginLoading ? "Logging in..." : "Login to Dashboard"} 
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Button>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold">
                    <span className="bg-[#0b0c10] px-4 text-slate-500">Or continue with</span>
                  </div>
                </div>

                <div className="flex justify-center w-full">
                  <div className="w-full rounded-xl overflow-hidden hover:opacity-90 transition-opacity flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap
                      theme="filled_black"
                      size="large"
                      text="signin_with"
                      width="100%"
                      shape="rectangular"
                    />
                  </div>
                </div>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="animate-in fade-in-50 duration-500">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="first-name" className="text-slate-300 text-xs font-semibold ml-1">First Name</Label>
                    <Input
                      id="first-name"
                      type="text"
                      placeholder="First name"
                      value={registerData.first_name}
                      onChange={(e) => setRegisterData({ ...registerData, first_name: e.target.value })}
                      required
                      disabled={registerLoading}
                      className="bg-[#12131a] border-white/5 text-white h-11 px-4 rounded-xl focus-visible:ring-1 focus-visible:ring-purple-500 placeholder:text-slate-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="last-name" className="text-slate-300 text-xs font-semibold ml-1">Last Name</Label>
                    <Input
                      id="last-name"
                      type="text"
                      placeholder="Last name"
                      value={registerData.last_name}
                      onChange={(e) => setRegisterData({ ...registerData, last_name: e.target.value })}
                      required
                      disabled={registerLoading}
                      className="bg-[#12131a] border-white/5 text-white h-11 px-4 rounded-xl focus-visible:ring-1 focus-visible:ring-purple-500 placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="register-username" className="text-slate-300 text-xs font-semibold ml-1">Username</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      <User size={18} />
                    </div>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Choose a username"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      required
                      disabled={registerLoading}
                      className="bg-[#12131a] border-white/5 text-white h-11 pl-10 pr-4 rounded-xl focus-visible:ring-1 focus-visible:ring-purple-500 placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-slate-300 text-xs font-semibold ml-1">College Email</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      <Mail size={18} />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.name@bmsce.ac.in"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                      disabled={registerLoading}
                      className="bg-[#12131a] border-white/5 text-white h-11 pl-10 pr-4 rounded-xl focus-visible:ring-1 focus-visible:ring-purple-500 placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="register-password" className="text-slate-300 text-xs font-semibold ml-1">Password</Label>
                  <PasswordInput
                    id="register-password"
                    placeholder="Create a password"
                    value={registerData.password}
                    onChange={(value) => setRegisterData({ ...registerData, password: value })}
                    required
                    disabled={registerLoading}
                    icon={<Lock size={18} />}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password" className="text-slate-300 text-xs font-semibold ml-1">Confirm Password</Label>
                  <PasswordInput
                    id="confirm-password"
                    placeholder="Confirm your password"
                    value={registerData.password2}
                    onChange={(value) => setRegisterData({ ...registerData, password2: value })}
                    required
                    disabled={registerLoading}
                    icon={<Lock size={18} />}
                  />
                </div>

                {registerError && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-900/50 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]"></div>
                    <p className="text-sm text-red-400 font-medium">{registerError}</p>
                  </div>
                )}

                <Button type="submit" className="w-full h-[52px] rounded-2xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white transition-all mt-6 font-bold text-sm" disabled={registerLoading}>
                  {registerLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-[10px] text-slate-500 mt-8 leading-relaxed max-w-xs mx-auto">
            By continuing, you agree to StudySphere's <span className="text-slate-300 hover:text-white cursor-pointer transition-colors">Terms of Service</span> and <span className="text-slate-300 hover:text-white cursor-pointer transition-colors">Privacy Policy</span>.
          </p>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="glass border-border max-w-[95vw] sm:max-w-md p-6 sm:p-8 text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Key className="text-primary h-5 w-5" />
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              {resetStep === 1
                ? "Enter your email to receive a 6-digit password reset code."
                : "Enter the code sent to your email and choose a new password."}
            </DialogDescription>
          </DialogHeader>

          {resetStep === 1 ? (
            <form onSubmit={handleRequestReset} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="reset-email" className="text-xs font-semibold">
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    <Mail size={16} />
                  </div>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="name@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    disabled={resetLoading}
                    className="bg-secondary/30 border-border text-white pl-10 h-11 focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              </div>

              {resetError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/50">
                  <p className="text-xs text-red-400 font-medium">{resetError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent border-border hover:bg-white/5"
                  onClick={() => setIsResetOpen(false)}
                  disabled={resetLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/95 text-white" disabled={resetLoading}>
                  {resetLoading ? "Sending..." : "Send Reset Code"}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyReset} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="reset-otp" className="text-xs font-semibold">
                  6-Digit Verification Code
                </Label>
                <Input
                  id="reset-otp"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value)}
                  required
                  disabled={resetLoading}
                  className="bg-secondary/30 border-border text-white text-center tracking-widest text-lg font-bold h-11 focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reset-new-password" className="text-xs font-semibold">
                  New Password
                </Label>
                <PasswordInput
                  id="reset-new-password"
                  placeholder="Enter new password"
                  value={resetNewPassword}
                  onChange={setResetNewPassword}
                  required
                  disabled={resetLoading}
                  icon={<Lock size={16} />}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reset-new-password-2" className="text-xs font-semibold">
                  Confirm New Password
                </Label>
                <PasswordInput
                  id="reset-new-password-2"
                  placeholder="Confirm new password"
                  value={resetNewPassword2}
                  onChange={setResetNewPassword2}
                  required
                  disabled={resetLoading}
                  icon={<Lock size={16} />}
                />
              </div>

              {resetError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/50">
                  <p className="text-xs text-red-400 font-medium">{resetError}</p>
                </div>
              )}

              {resetSuccess && (
                <div className="p-3 rounded-lg bg-green-950/40 border border-green-900/50">
                  <p className="text-xs text-green-400 font-medium">{resetSuccess}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent border-border hover:bg-white/5"
                  onClick={() => setResetStep(1)}
                  disabled={resetLoading}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/95 text-white" disabled={resetLoading}>
                  {resetLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
