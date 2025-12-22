"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { GraduationCap } from "lucide-react"
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import PasswordInput from "@/components/password-input"

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <GraduationCap size={40} className="text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to StudySphere</h1>
          <p className="text-muted-foreground text-sm">
            Connect with fellow students and ace your exams together
          </p>
        </div>

        <Card className="glass-card p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="Enter your username"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    required
                    disabled={loginLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <PasswordInput
                    id="login-password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(value) => setLoginData({ ...loginData, password: value })}
                    required
                    disabled={loginLoading}
                  />
                </div>

                {loginError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-500">{loginError}</p>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading ? "Logging in..." : "Login"}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    theme="outline"
                    size="large"
                    text="signin_with"
                    width="100%"
                  />
                </div>

                <div className="text-center text-sm text-muted-foreground mt-4">
                  <p>Demo credentials:</p>
                  <p className="font-mono text-xs mt-1">razan / password123@#</p>
                </div>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      type="text"
                      placeholder="First name"
                      value={registerData.first_name}
                      onChange={(e) => setRegisterData({ ...registerData, first_name: e.target.value })}
                      required
                      disabled={registerLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      type="text"
                      placeholder="Last name"
                      value={registerData.last_name}
                      onChange={(e) => setRegisterData({ ...registerData, last_name: e.target.value })}
                      required
                      disabled={registerLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-username">Username</Label>
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="Choose a username"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    required
                    disabled={registerLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                    disabled={registerLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <PasswordInput
                    id="register-password"
                    placeholder="Create a password"
                    value={registerData.password}
                    onChange={(value) => setRegisterData({ ...registerData, password: value })}
                    required
                    disabled={registerLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <PasswordInput
                    id="confirm-password"
                    placeholder="Confirm your password"
                    value={registerData.password2}
                    onChange={(value) => setRegisterData({ ...registerData, password2: value })}
                    required
                    disabled={registerLoading}
                  />
                </div>

                {registerError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-500">{registerError}</p>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={registerLoading}>
                  {registerLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By continuing, you agree to StudySphere's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
