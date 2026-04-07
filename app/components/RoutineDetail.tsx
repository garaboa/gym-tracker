'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase/client'
import ExerciseList from './ExerciseList'

interface Routine {
  id: number
  name: string
  user_id: number
  username: string
}

interface RoutineDetailProps {
  routine: Routine
  onBack: () => void
  onRoutineDeleted: () => void
  onRoutineUpdated: () => void
}

export default function RoutineDetail({
  routine,
  onBack,
  onRoutineDeleted,
  onRoutineUpdated
}: RoutineDetailProps) {
  const [exercises, setExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newExerciseName, setNewExerciseName] = useState('')
  const [newMuscleGroup, setNewMuscleGroup] = useState('')
  const [newWeight, setNewWeight] = useState('')
  const [newSeries, setNewSeries] = useState('')
  const [newReps, setNewReps] = useState('')
  const [allUsers, setAllUsers] = useState<string[]>([])
  const [newUser, setNewUser] = useState('')

  useEffect(() => {
    loadExercises()
    fetchUsers()
  }, [routine.id])

  const fetchUsers = async () => {
    try {
      const { data: users } = await supabase
        .from('users')
        .select('username')
      
      const usernames = users?.map(u => u.username) || []
      setAllUsers(usernames)
      if (usernames.length > 0) {
        setNewUser(usernames[0])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const loadExercises = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('routine_exercises')
        .select(`
          id,
          weight,
          series,
          reps,
          user_id,
          exercises (
            id,
            name,
            muscle_group
          )
        `)
        .eq('routine_id', routine.id)

      setExercises(data || [])
    } catch (error) {
      console.error('Error loading exercises:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddExercise = async () => {
    if (!newExerciseName.trim() || !newMuscleGroup.trim()) return

    try {
      // Crear o obtener ejercicio
      let exerciseId
      const { data: existingExercise } = await supabase
        .from('exercises')
        .select('id')
        .eq('name', newExerciseName)
        .eq('muscle_group', newMuscleGroup)
        .single()

      if (existingExercise) {
        exerciseId = existingExercise.id
      } else {
        const { data: newExercise } = await supabase
          .from('exercises')
          .insert({
            name: newExerciseName,
            muscle_group: newMuscleGroup
          })
          .select()
          .single()

        exerciseId = newExercise?.id
      }

      // Obtener ID del usuario que hace el ejercicio
      const { data: exerciseUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', newUser)
        .single()

      if (exerciseId && exerciseUser) {
        await supabase.from('routine_exercises').insert({
          routine_id: routine.id,
          exercise_id: exerciseId,
          user_id: exerciseUser.id,
          weight: newWeight ? parseFloat(newWeight) : null,
          series: newSeries ? parseInt(newSeries) : null,
          reps: newReps ? parseInt(newReps) : null
        })

        setNewExerciseName('')
        setNewMuscleGroup('')
        setNewWeight('')
        setNewSeries('')
        setNewReps('')
        loadExercises()
      }
    } catch (error) {
      console.error('Error adding exercise:', error)
    }
  }

  const handleDeleteRoutine = async () => {
    if (!confirm('¿Eliminar esta rutina?')) return

    try {
      await supabase.from('routines').delete().eq('id', routine.id)
      onRoutineDeleted()
    } catch (error) {
      console.error('Error deleting routine:', error)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4" style={{ fontFamily: 'Tiempo Regular Text, serif' }}>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 text-zinc-400 hover:text-white transition"
        >
          ← Volver
        </button>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{routine.name}</h1>
          <button
            onClick={handleDeleteRoutine}
            className="bg-red-900 hover:bg-red-800 px-4 py-2 rounded-lg text-sm transition"
          >
            Eliminar
          </button>
        </div>

        {/* Añadir ejercicio */}
        <div className="mb-8 bg-zinc-900 p-4 rounded-lg space-y-3">
          <input
            type="text"
            placeholder="Nombre del ejercicio"
            value={newExerciseName}
            onChange={e => setNewExerciseName(e.target.value)}
            className="w-full bg-zinc-800 text-white px-4 py-2 rounded-lg placeholder-zinc-500"
          />
          <input
            type="text"
            placeholder="Grupo muscular (ej: pecho)"
            value={newMuscleGroup}
            onChange={e => setNewMuscleGroup(e.target.value)}
            className="w-full bg-zinc-800 text-white px-4 py-2 rounded-lg placeholder-zinc-500"
          />
          
          {allUsers.length > 0 && (
            <select
              value={newUser}
              onChange={e => setNewUser(e.target.value)}
              className="w-full bg-zinc-800 text-white px-4 py-2 rounded-lg"
            >
              {allUsers.map(user => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          )}

          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              placeholder="Peso"
              value={newWeight}
              onChange={e => setNewWeight(e.target.value)}
              className="bg-zinc-800 text-white px-4 py-2 rounded-lg placeholder-zinc-500"
            />
            <input
              type="number"
              placeholder="Series"
              value={newSeries}
              onChange={e => setNewSeries(e.target.value)}
              className="bg-zinc-800 text-white px-4 py-2 rounded-lg placeholder-zinc-500"
            />
            <input
              type="number"
              placeholder="Reps"
              value={newReps}
              onChange={e => setNewReps(e.target.value)}
              className="bg-zinc-800 text-white px-4 py-2 rounded-lg placeholder-zinc-500"
            />
          </div>
          <button
            onClick={handleAddExercise}
            disabled={!newExerciseName.trim() || !newMuscleGroup.trim()}
            className="w-full bg-white text-zinc-950 py-2 rounded-lg font-semibold hover:bg-zinc-200 disabled:opacity-50 transition"
          >
            Añadir Ejercicio
          </button>
        </div>

        {/* Lista de ejercicios */}
        {loading ? (
          <div className="text-center text-zinc-500">Cargando...</div>
        ) : exercises.length === 0 ? (
          <div className="text-center text-zinc-500">Sin ejercicios aún</div>
        ) : (
          <ExerciseList
            exercises={exercises}
            routineId={routine.id}
            onExerciseUpdated={loadExercises}
          />
        )}
      </div>
    </div>
  )
}