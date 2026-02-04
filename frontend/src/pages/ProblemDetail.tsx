import { useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import NeonCard from '../components/NeonCard'
import Editor from '../components/Editor'
import { apiClient } from '../services/apiClient'
import { connectBattleWS } from '../services/ws'

export default function ProblemDetail() {
  const { id } = useParams()
  const [code, setCode] = useState("def solve(x):\n    return x\n")
  const [language] = useState('python')
  const [output, setOutput] = useState<string>('')
  const [wsStatus, setWsStatus] = useState<string>('')
  const wsRef = useRef<WebSocket | null>(null)

  async function run() {
    const res = await apiClient.post('/api/v1/submissions/run', { challenge_id: Number(id), code, language, algorithm_id: 1 })
    setOutput(JSON.stringify(res.data, null, 2))
  }

  async function submit() {
    const res = await apiClient.post('/api/v1/submissions/submit', { challenge_id: Number(id), code, language, algorithm_id: 1 })
    setOutput(JSON.stringify(res.data, null, 2))
  }

  function connectWS() {
    if (wsRef.current) wsRef.current.close()
    const ws = connectBattleWS(1, 'dev', (msg) => setWsStatus(JSON.stringify(msg)))
    wsRef.current = ws
  }

  useEffect(() => () => { wsRef.current?.close() }, [])

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 grid gap-6">
      <NeonCard>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Problem #{id}</div>
            <div className="text-gray-400 text-sm">Use the editor to solve and run/submit</div>
          </div>
          <div className="flex gap-2">
            <button onClick={connectWS} className="px-4 py-2 rounded bg-white/10">Connect WS</button>
            <button onClick={run} className="px-4 py-2 rounded bg-neon-cyan text-black font-semibold">Run</button>
            <button onClick={submit} className="px-4 py-2 rounded border border-white/20">Submit</button>
          </div>
        </div>
      </NeonCard>
      <Editor language={language} value={code} onChange={setCode} />
      <NeonCard>
        <div className="text-sm text-gray-400 mb-2">Output</div>
        <pre className="text-sm whitespace-pre-wrap break-words">{output}</pre>
        {wsStatus && <div className="mt-4 text-xs text-gray-400">WS: {wsStatus}</div>}
      </NeonCard>
    </main>
  )
}
