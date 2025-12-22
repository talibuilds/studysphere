export function getGroupBadgeColor(groupName: string): string {
  const colors = [
    "bg-blue-900 text-blue-100 border-blue-700",
    "bg-blue-800 text-blue-100 border-blue-600",
    "bg-blue-700 text-blue-50 border-blue-500",
    "bg-cyan-900 text-cyan-100 border-cyan-700",
    "bg-cyan-800 text-cyan-100 border-cyan-600",
    "bg-indigo-900 text-indigo-100 border-indigo-700",
    "bg-indigo-800 text-indigo-100 border-indigo-600",
    "bg-sky-900 text-sky-100 border-sky-700",
  ]

  let hash = 0
  for (let i = 0; i < groupName.length; i++) {
    const char = groupName.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }

  return colors[Math.abs(hash) % colors.length]
}
