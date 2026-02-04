import { Link } from 'react-router-dom'
import NeonCard from '../components/NeonCard'

const mockProblems = [
  { id: 1, title: 'Two Sum', difficulty: 'easy' },
  { id: 2, title: 'Longest Substring', difficulty: 'medium' },
]

export default function ProblemsList() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <NeonCard>
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Problems</div>
        </div>
        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-left">
            <thead className="bg-white/5">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Difficulty</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {mockProblems.map(p => (
                <tr key={p.id} className="border-t border-white/10">
                  <td className="p-3">{p.title}</td>
                  <td className="p-3 capitalize">{p.difficulty}</td>
                  <td className="p-3 text-right"><Link to={`/problems/${p.id}`} className="px-4 py-2 rounded bg-white/10">Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NeonCard>
    </main>
  )
}
