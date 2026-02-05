import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiClient } from '@/services/apiClient'
import { ArrowLeft, Play, CheckCircle, Code, Clock, Target, Flame } from 'lucide-react'
import MonacoEditor from '@monaco-editor/react'
import { motion } from 'framer-motion'

interface Problem {
  id: number
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  examples?: Array<{ input: string; output: string; explanation?: string }>
  constraints?: string[]
}

export default function ProblemDetail() {
  const { id } = useParams()
  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('# Write your solution here\n')
  const [language, setLanguage] = useState('python')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ passed: number; total: number } | null>(null)

  useEffect(() => {
    if (!id) return
    apiClient.get(`/api/v1/problems/${id}`)
      .then(r => setProblem(r.data.data))
      .catch(() => setProblem(null))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit() {
    if (!id) return
    setSubmitting(true)
    setResult(null)
    try {
      const res = await apiClient.post('/api/v1/submissions', {
        problem_id: parseInt(id),
        code,
        language,
      })
      setResult(res.data.data)
    } catch {
      // Handle error
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="page-shell pt-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/3" />
          <div className="h-4 bg-secondary rounded w-1/4" />
          <div className="h-96 bg-secondary rounded" />
        </div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="page-shell pt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="premium-card text-center py-20"
        >
          <Code className="w-14 h-14 text-muted-foreground/40 mx-auto mb-5" />
          <h2 className="font-display text-2xl font-bold mb-3">Problem not found</h2>
          <Link to="/problems" className="text-primary hover:underline font-medium">
            Back to problems
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/90 backdrop-blur-2xl sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/problems" className="p-2.5 rounded-xl hover:bg-secondary/60 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-display text-xl font-bold">{problem.title}</h1>
                <div className="flex items-center gap-4 mt-1.5">
                  <span className={`badge-difficulty ${problem.difficulty}`}>
                    {problem.difficulty}
                  </span>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    ~20 min
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="premium-input w-auto text-sm py-2.5"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
              <button className="btn-neon-ghost text-sm py-2.5">
                <Play className="w-4 h-4" />
                Run
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-neon-primary text-sm py-2.5"
              >
                <Target className="w-4 h-4" />
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Problem description */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="premium-card overflow-auto"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/40">
              <div className="w-10 h-10 rounded-xl bg-primary/12 border border-primary/30 flex items-center justify-center">
                <Code className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display text-lg font-semibold">Description</h2>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {problem.description}
              </p>

              {problem.examples && problem.examples.length > 0 && (
                <>
                  <h3 className="font-display text-lg font-semibold mt-8 mb-4 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-accent" />
                    Examples
                  </h3>
                  {problem.examples.map((ex, i) => (
                    <div key={i} className="bg-surface-2 rounded-xl p-5 mb-4 font-mono text-sm border border-border/40">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Input</div>
                      <div className="mb-4 text-foreground">{ex.input}</div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Output</div>
                      <div className="text-accent">{ex.output}</div>
                      {ex.explanation && (
                        <>
                          <div className="text-xs uppercase tracking-wider text-muted-foreground mt-4 mb-2">Explanation</div>
                          <div className="text-muted-foreground">{ex.explanation}</div>
                        </>
                      )}
                    </div>
                  ))}
                </>
              )}

              {problem.constraints && (
                <>
                  <h3 className="font-display text-lg font-semibold mt-8 mb-4">Constraints</h3>
                  <ul className="space-y-2">
                    {problem.constraints.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                        <code className="text-sm">{c}</code>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </motion.div>

          {/* Code editor */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="premium-card p-0 overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="w-3 h-3 rounded-full bg-neon-yellow" />
                  <span className="w-3 h-3 rounded-full bg-neon-green" />
                </div>
                <span className="text-sm text-muted-foreground font-mono ml-2">
                  solution.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : language}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {result && (
                  <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full ${
                    result.passed === result.total 
                      ? 'bg-neon-green/12 border border-neon-green/30 text-neon-green' 
                      : 'bg-neon-yellow/12 border border-neon-yellow/30 text-neon-yellow'
                  }`}>
                    <CheckCircle className="w-4 h-4" />
                    {result.passed}/{result.total} passed
                  </div>
                )}
                <div className="badge-status live">
                  <span className="text-2xs">REC</span>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <MonacoEditor
                height="100%"
                language={language}
                value={code}
                onChange={(v) => setCode(v || '')}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, Fira Code, monospace',
                  fontLigatures: true,
                  minimap: { enabled: false },
                  padding: { top: 20 },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  renderLineHighlight: 'gutter',
                  automaticLayout: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  smoothScrolling: true,
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
