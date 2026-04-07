'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase/client'
import RoutineList from './RoutineList'
import RoutineDetail from './RoutineDetail'

interface DashboardProps {
  selectedUsers: string[]
}

interface Routine {
  id: number
  name: string
  user_id: number
  username: string
}

export default function Dashboard({ selectedUsers }: DashboardProps) {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRoutines()
  }, [selectedUsers])

  const loadRoutines = async () => {
    setLoading(true)
    try {
      // Obtener IDs de usuarios seleccionados
      const { data: users } = await supabase
        .from('users')
        .select('id, username')
        .in('username', selectedUsers)

      if (users) {
        const userIds = users.map(u => u.id)

        // Obtener rutinas de esos usuarios
        const { data: routinesData } = await supabase
          .from('routines')
          .select('id, name, user_id')
          .in('user_id', userIds)

        // Mapear con nombres de usuario
        const routinesWithUsername = routinesData?.map(routine => {
          const user = users.find(u => u.id === routine.user_id)
          return {
            ...routine,
            username: user?.username || 'Unknown'
          }
        }) || []

        setRoutines(routinesWithUsername)
      }
    } catch (error) {
      console.error('Error loading routines:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setSelectedRoutine(null)
  }

  const handleRoutineDeleted = () => {
    loadRoutines()
    setSelectedRoutine(null)
  }

  const handleRoutineUpdated = () => {
    loadRoutines()
  }

  if (selectedRoutine) {
    return (
      <RoutineDetail
        routine={selectedRoutine}
        onBack={handleBack}
        onRoutineDeleted={handleRoutineDeleted}
        onRoutineUpdated={handleRoutineUpdated}
      />
    )
  }

  return (
    <RoutineList
      routines={routines}
      selectedUsers={selectedUsers}
      loading={loading}
      onRoutineSelect={setSelectedRoutine}
      onRoutineCreated={loadRoutines}
    />
  )
}