"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { KeyRound } from "lucide-react"

interface VerifyRSVPDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onVerify: (code: string) => Promise<void>
    isLoading: boolean
}

export function VerifyRSVPDialog({ open, onOpenChange, onVerify, isLoading }: VerifyRSVPDialogProps) {
    const [code, setCode] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!code.trim()) {
            setError("Please enter a verification code")
            return
        }

        if (code.length !== 6) {
            setError("Verification code must be 6 digits")
            return
        }

        try {
            setError("")
            await onVerify(code)
            setCode("")
        } catch (err: any) {
            setError(err.message || "Verification failed")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <KeyRound className="text-primary" size={20} />
                        Verify Attendance
                    </DialogTitle>
                    <DialogDescription>
                        Enter the 6-digit verification code provided by the session host to confirm your RSVP.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="code">Verification Code</Label>
                            <Input
                                id="code"
                                placeholder="000000"
                                value={code}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                                    setCode(value)
                                    setError("")
                                }}
                                maxLength={6}
                                className="text-center text-2xl tracking-widest font-mono"
                                autoFocus
                                disabled={isLoading}
                            />
                            {error && (
                                <p className="text-sm text-destructive">{error}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                onOpenChange(false)
                                setCode("")
                                setError("")
                            }}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || code.length !== 6}>
                            {isLoading ? "Verifying..." : "Verify & RSVP"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
