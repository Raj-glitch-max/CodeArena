import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { apiClient } from '@/services/apiClient'
import { Search, ChevronRight, Code, Users, Filter, Sparkles } from 'lucide-react'

interface Problem {
  id: number
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  solved_count?: number
}

export default function ProblemsList() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState<string>('')

  useEffect(() => {
    apiClient.get('/api/v1/problems')
      .then(r => setProblems(r.data.data || []))
      .catch(() => setProblems([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = problems.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
    const matchDiff = !difficulty || p.difficulty === difficulty
    return matchSearch && matchDiff
  })

  return (
    <div className="page-shell pt-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="section-badge mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Challenge Yourself
          </span>
          <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">Problems</h1>
          <p className="text-muted-foreground">Browse and solve coding challenges to level up</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="premium-input pl-11 w-full md:w-72"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="premium-input pl-11 w-auto appearance-none pr-10 cursor-pointer"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </motion.div>
      </div>

      {/* Problems grid */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="premium-card animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-secondary rounded-xl" />
                <div className="flex-1">
                  <div className="h-5 bg-secondary rounded w-1/3 mb-3" />
                  <div className="h-4 bg-secondary rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="premium-card text-center py-20"
        >
          <Code className="w-14 h-14 text-muted-foreground/40 mx-auto mb-5" />
          <h3 className="font-display text-xl font-semibold mb-2">No problems found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((problem, i) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/problems/${problem.id}`}
                className="premium-card flex items-center gap-5 hover:border-primary/40 group"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/12 border border-primary/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Code className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">
                    {problem.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`badge-difficulty ${problem.difficulty}`}>
                      {problem.difficulty}
                    </span>
                    {problem.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs px-2.5 py-1 rounded-lg bg-secondary/80 text-muted-foreground border border-border/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{problem.solved_count ?? 0} solved</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
