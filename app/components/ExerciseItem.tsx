'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase/client'

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

interface ExerciseItemProps {
  exercise: Exercise
  routineId: number
  onExerciseUpdated: () => void
  userColor?: 'white' | 'gray'
}

export default function ExerciseItem({
  exercise,
  routineId,
  onExerciseUpdated,
  userColor = 'white'
}: ExerciseItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [weight, setWeight] = useState(exercise.weight?.toString() || '')
  const [series, setSeries] = useState(exercise.series?.toString() || '')
  const [reps, setReps] = useState(exercise.reps?.toString() || '')
  const [username, setUsername] = useState('Unknown')

  useEffect(() => {
    fetchUsername()
  }, [exercise.user_id])

  const fetchUsername = async () => {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('username')
        .eq('id', exercise.user_id)
        .single()

      if (user) {
        setUsername(user.username)
      }
    } catch (error) {
      console.error('Error fetching username:', error)
    }
  }

  const handleSave = async () => {
    try {
      await supabase
        .from('routine_exercises')
        .update({
          weight: weight ? parseFloat(weight) : null,
          series: series ? parseInt(series) : null,
          reps: reps ? parseInt(reps) : null
        })
        .eq('id', exercise.id)

      setIsEditing(false)
      onExerciseUpdated()
    } catch (error) {
      console.error('Error updating exercise:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este ejercicio?')) return

    try {
      await supabase
        .from('routine_exercises')
        .delete()
        .eq('id', exercise.id)

      onExerciseUpdated()
    } catch (error) {
      console.error('Error deleting exercise:', error)
    }
  }

  const bgColor = userColor === 'white' ? 'bg-zinc-900' : 'bg-zinc-800'
  const textColor = userColor === 'white' ? 'text-white' : 'text-zinc-300'

  if (isEditing) {
    return (
      <div className={`${bgColor} p-4 rounded-lg space-y-3`} style={{ fontFamily: 'Tiempo Regular Text, serif' }}>
        <div className={`font-semibold ${textColor}`}>{exercise.exercises.name}</div>
        <div className={`text-sm ${textColor} mb-3 opacity-75`}>{exercise.exercises.muscle_group}</div>
        <div className={`text-sm ${textColor} mb-3`}>{username}</div>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            placeholder="Peso"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            className="bg-zinc-700 text-white px-3 py-2 rounded-lg placeholder-zinc-500 text-sm"
          />
          <input
            type="number"
            placeholder="Series"
            value={series}
            onChange={e => setSeries(e.target.value)}
            className="bg-zinc-700 text-white px-3 py-2 rounded-lg placeholder-zinc-500 text-sm"
          />
          <input
            type="number"
            placeholder="Reps"
            value={reps}
            onChange={e => setReps(e.target.value)}
            className="bg-zinc-700 text-white px-3 py-2 rounded-lg placeholder-zinc-500 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-white text-zinc-950 py-2 rounded-lg font-semibold hover:bg-zinc-200 transition text-sm"
          >
            Guardar
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 bg-zinc-700 hover:bg-zinc-600 py-2 rounded-lg transition text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${bgColor} p-4 rounded-lg`} style={{ fontFamily: 'Tiempo Regular Text, serif' }}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className={`font-semibold ${textColor}`}>{exercise.exercises.name}</div>
          <div className={`text-sm ${textColor} opacity-75`}>{exercise.exercises.muscle_group}</div>
          <div className={`text-sm ${textColor} opacity-75 mt-1`}>{username}</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="text-zinc-400 hover:text-white transition text-sm"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 transition text-sm"
          >
            Eliminar
          </button>
        </div>
      </div>
      <div className={`text-sm ${textColor} opacity-75`}>
        {weight && <span>{weight}kg</span>}
        {weight && series && <span> • </span>}
        {series && <span>{series}x</span>}
        {series && reps && <span> </span>}
        {reps && <span>{reps}</span>}
      </div>
    </div>
  )
}