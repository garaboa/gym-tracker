'use client'

import { useState } from 'react'
import UserSelector from './components/UserSelector'
import Dashboard from './components/Dashboard'

export default function Home() {
  const [selectedUsers, setSelectedUsers] = useState<string[] | null>(null)

  if (!selectedUsers) {
    return <UserSelector onSelect={setSelectedUsers} />
  }

  return <Dashboard selectedUsers={selectedUsers} />
}