'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase/client'

interface Routine {
  id: number
  name: string
  user_id: number
  username: string
}

interface RoutineListProps {
  routines: Routine[]
  selectedUsers: string[]
  loading: boolean
  onRoutineSelect: (routine: Routine) => void
  onRoutineCreated: () => void
}

export default function RoutineList({
  routines,
  selectedUsers,
  loading,
  onRoutineSelect,
  onRoutineCreated
}: RoutineListProps) {
  const [newRoutineName, setNewRoutineName] = useState('')
  const [selectedUser, setSelectedUser] = useState(selectedUsers[0])
  const [creating, setCreating] = useState(false)

  const handleCreateRoutine = async () => {
    if (!newRoutineName.trim()) return

    setCreating(true)
    try {
      // Obtener ID del usuario seleccionado
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('username', selectedUser)
        .single()

      if (user) {
        // Crear rutina
        const { error } = await supabase
          .from('routines')
          .insert({
            user_id: user.id,
            name: newRoutineName
          })

        if (!error) {
          setNewRoutineName('')
          onRoutineCreated()
        }
      }
    } catch (error) {
      console.error('Error creating routine:', error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Gym Tracker</h1>

        {/* Selector de usuario */}
        <div className="mb-6 flex gap-2">
          {selectedUsers.map(user => (
            <button
              key={user}
              onClick={() => setSelectedUser(user)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                selectedUser === user
                  ? 'bg-white text-zinc-950'
                  : 'bg-zinc-800 hover:bg-zinc-700'
              }`}
            >
              {user}
            </button>
          ))}
        </div>

        {/* Crear nueva rutina */}
        <div className="mb-8 bg-zinc-900 p-4 rounded-lg">
          <input
            type="text"
            placeholder="Nombre de nueva rutina"
            value={newRoutineName}
            onChange={e => setNewRoutineName(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleCreateRoutine()}
            className="w-full bg-zinc-800 text-white px-4 py-2 rounded-lg mb-2 placeholder-zinc-500"
          />
          <button
            onClick={handleCreateRoutine}
            disabled={creating || !newRoutineName.trim()}
            className="w-full bg-white text-zinc-950 py-2 rounded-lg font-semibold hover:bg-zinc-200 disabled:opacity-50 transition"
          >
            {creating ? 'Creando...' : 'Crear Rutina'}
          </button>
        </div>

        {/* Lista de rutinas */}
        {loading ? (
          <div className="text-center text-zinc-500">Cargando...</div>
        ) : routines.length === 0 ? (
          <div className="text-center text-zinc-500">Sin rutinas aún</div>
        ) : (
          <div className="space-y-3">
            {routines.map(routine => (
              <button
                key={routine.id}
                onClick={() => onRoutineSelect(routine)}
                className="w-full text-left bg-zinc-900 hover:bg-zinc-800 p-4 rounded-lg transition"
              >
                <div className="font-semibold">{routine.name}</div>
                <div className="text-sm text-zinc-500">{routine.username}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}