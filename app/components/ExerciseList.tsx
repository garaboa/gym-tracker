'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase/client'
import ExerciseItem from './ExerciseItem'

interface Exercise {
  id: number
  weight: number | null
  series: number | null
  reps: number | null
  user_id: number
  exercises: {
    id: number
    name: string
    muscle_group: string
  }
}

interface ExerciseListProps {
  exercises: Exercise[]
  routineId: number
  onExerciseUpdated: () => void
}

export default function ExerciseList({
  exercises,
  routineId,
  onExerciseUpdated
}: ExerciseListProps) {
  const [exercisesWithUsernames, setExercisesWithUsernames] = useState<(Exercise & { username: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsernamesForExercises()
  }, [exercises])

  const loadUsernamesForExercises = async () => {
    setLoading(true)
    try {
      const { data: users } = await supabase
        .from('users')
        .select('id, username')

      const usernameMap = new Map(users?.map(u => [u.id, u.username]) || [])

      const enriched = exercises.map(ex => ({
        ...ex,
        username: usernameMap.get(ex.user_id) || 'Unknown'
      }))

      setExercisesWithUsernames(enriched)
    } catch (error) {
      console.error('Error loading usernames:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center text-zinc-500">Cargando...</div>
  }

  // Agrupar ejercicios por nombre y grupo muscular
  const groupedExercises = new Map<string, (Exercise & { username: string })[]>()

  exercisesWithUsernames.forEach(ex => {
    const key = `${ex.exercises.name}|${ex.exercises.muscle_group}`
    if (!groupedExercises.has(key)) {
      groupedExercises.set(key, [])
    }
    groupedExercises.get(key)!.push(ex)
  })

  return (
    <div className="space-y-4">
      {Array.from(groupedExercises.entries()).map(([key, exs]) => (
        <div key={key}>
          {exs.length === 1 ? (
            // Un solo usuario
            <ExerciseItem
              exercise={exs[0]}
              routineId={routineId}
              onExerciseUpdated={onExerciseUpdated}
            />
          ) : (
            // Dos usuarios - mostrar lado a lado
            <div className="flex gap-2">
              {exs.map((ex, idx) => (
                <div key={ex.id} className="flex-1">
                  <ExerciseItem
                    exercise={ex}
                    routineId={routineId}
                    onExerciseUpdated={onExerciseUpdated}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}