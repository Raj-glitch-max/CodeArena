import NeonCard from '../components/NeonCard'
import { useParams } from 'react-router-dom'

export default function BattleResults() {
  const { id } = useParams()
  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <NeonCard>
        <div className="text-lg font-semibold">Battle Results #{id}</div>
        <div className="text-gray-400 text-sm mt-2">Replay coming soon.</div>
      </NeonCard>
    </main>
  )
}
