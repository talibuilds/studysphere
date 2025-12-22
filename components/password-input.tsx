"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"

interface PasswordInputProps {
    id: string
    placeholder: string
    value: string
    onChange: (value: string) => void
    required?: boolean
    disabled?: boolean
}

export default function PasswordInput({
    id,
    placeholder,
    value,
    onChange,
    required = false,
    disabled = false,
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="relative">
            <Input
                id={id}
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                disabled={disabled}
                className="pr-10"
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={disabled}
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    )
}
