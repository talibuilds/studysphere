"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ExternalLink, Plus, Link as LinkIcon, Trash2 } from "lucide-react"
import { sessionsAPI } from "@/lib/api"
import { AddResourceDialog } from "@/components/add-resource-dialog"

interface Resource {
    id: number
    title: string
    link: string
    added_by_name: string
    added_by_image: string
    is_owner: boolean
    can_delete: boolean
    created_at: string
}

interface SessionResourcesProps {
    sessionId: string
    canAddResource: boolean
    onAddClick?: () => void
    externalShowDialog?: boolean
    externalSetShowDialog?: (show: boolean) => void
}

export function SessionResources({
    sessionId,
    canAddResource,
    onAddClick,
    externalShowDialog,
    externalSetShowDialog
}: SessionResourcesProps) {
    const [resources, setResources] = useState<Resource[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    // Use external state if provided, otherwise use internal state
    const dialogOpen = externalShowDialog !== undefined ? externalShowDialog : showAddDialog
    const setDialogOpen = externalSetShowDialog || setShowAddDialog

    useEffect(() => {
        fetchResources()
    }, [sessionId])

    const fetchResources = async () => {
        try {
            setLoading(true)
            const data = await sessionsAPI.getResources(sessionId)
            setResources(data)
        } catch (err: any) {
            console.error("Failed to fetch resources:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleAddResource = async (title: string, link: string) => {
        try {
            setIsAdding(true)
            await sessionsAPI.addResource(sessionId, { title, link })
            await fetchResources()
            setDialogOpen(false)
            alert("Resource added successfully!")
        } catch (err: any) {
            console.error("Failed to add resource:", err)
            throw new Error(err.response?.data?.detail || "Failed to add resource")
        } finally {
            setIsAdding(false)
        }
    }

    const handleDeleteResource = async (resourceId: number) => {
        if (!confirm("Are you sure you want to delete this resource?")) {
            return
        }

        try {
            setDeletingId(resourceId)
            await sessionsAPI.deleteResource(sessionId, resourceId)
            await fetchResources()
            alert("Resource deleted successfully!")
        } catch (err: any) {
            console.error("Failed to delete resource:", err)
            alert(err.response?.data?.detail || "Failed to delete resource")
        } finally {
            setDeletingId(null)
        }
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 1) return "just now"
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
        return date.toLocaleDateString()
    }

    if (loading) {
        return (
            <Card className="glass-card p-6">
                <p className="text-muted-foreground text-center">Loading resources...</p>
            </Card>
        )
    }

    return (
        <div className="space-y-4">

            {resources.length === 0 ? (
                <Card className="glass-card p-4 text-center">
                    <LinkIcon size={33} className="mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-base font-semibold mb-1">No Resources Yet</p>
                    <p className="text-muted-foreground text-sm">
                        {canAddResource
                            ? "Share helpful resources with attendees"
                            : "Check back later"}
                    </p>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {resources.map((resource) => (
                        <Card key={resource.id} className="glass-card p-3 hover:bg-accent/5 transition-colors">
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg mb-1">{resource.title}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Avatar className="h-4 w-4">
                                                <AvatarImage src={resource.added_by_image} />
                                                <AvatarFallback>{resource.added_by_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <span>{resource.added_by_name}</span>
                                            <span>•</span>
                                            <span>{formatTime(resource.created_at)}</span>
                                        </div>
                                    </div>
                                    {resource.can_delete && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                            onClick={() => handleDeleteResource(resource.id)}
                                            disabled={deletingId === resource.id}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    )}
                                </div>

                                <a
                                    href={resource.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                                >
                                    <ExternalLink size={14} />
                                    View Resource
                                </a>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <AddResourceDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onAdd={handleAddResource}
                isLoading={isAdding}
            />
        </div>
    )
}
