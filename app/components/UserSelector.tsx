'use client'

interface UserSelectorProps {
  onSelect: (users: string[]) => void
}

export default function UserSelector({ onSelect }: UserSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950">
      <div className="w-full max-w-md space-y-4 px-4">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Gym Tracker
        </h1>
        
        <button
          onClick={() => onSelect(['Lucia'])}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-lg font-semibold transition"
        >
          Entreno sola (Lucia)
        </button>

        <button
          onClick={() => onSelect(['Laura'])}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-lg font-semibold transition"
        >
          Entreno sola (Laura)
        </button>

        <button
          onClick={() => onSelect(['Lucia', 'Laura'])}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-lg font-semibold transition"
        >
          Entrenamos juntas
        </button>
      </div>
    </div>
  )
}