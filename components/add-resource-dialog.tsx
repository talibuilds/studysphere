"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LinkIcon } from "lucide-react"

interface AddResourceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAdd: (title: string, link: string) => Promise<void>
    isLoading: boolean
}

export function AddResourceDialog({ open, onOpenChange, onAdd, isLoading }: AddResourceDialogProps) {
    const [title, setTitle] = useState("")
    const [link, setLink] = useState("")
    const [errors, setErrors] = useState<{ title?: string; link?: string }>({})

    const validateUrl = (url: string): boolean => {
        try {
            new URL(url)
            return true
        } catch {
            return false
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const newErrors: { title?: string; link?: string } = {}

        if (!title.trim()) {
            newErrors.title = "Title is required"
        }

        if (!link.trim()) {
            newErrors.link = "Link is required"
        } else if (!validateUrl(link)) {
            newErrors.link = "Please enter a valid URL (e.g., https://example.com)"
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        try {
            setErrors({})
            await onAdd(title, link)
            setTitle("")
            setLink("")
        } catch (err: any) {
            console.error("Failed to add resource:", err)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <LinkIcon className="text-primary" size={20} />
                        Add Resource
                    </DialogTitle>
                    <DialogDescription>
                        Share helpful materials with other attendees. This can be a link to Google Drive, documents, or any other resource.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">
                                Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="title"
                                placeholder="Lecture Notes - Week 3"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value)
                                    setErrors((prev) => ({ ...prev, title: undefined }))
                                }}
                                disabled={isLoading}
                            />
                            {errors.title && (
                                <p className="text-sm text-destructive">{errors.title}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="link">
                                Link <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="link"
                                type="url"
                                placeholder="https://drive.google.com/..."
                                value={link}
                                onChange={(e) => {
                                    setLink(e.target.value)
                                    setErrors((prev) => ({ ...prev, link: undefined }))
                                }}
                                disabled={isLoading}
                            />
                            {errors.link && (
                                <p className="text-sm text-destructive">{errors.link}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                onOpenChange(false)
                                setTitle("")
                                setLink("")
                                setErrors({})
                            }}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Adding..." : "Add Resource"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
