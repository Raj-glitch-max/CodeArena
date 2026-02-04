import MonacoEditor from '@monaco-editor/react'

type Props = {
  language: string
  value: string
  onChange: (v: string) => void
}

export default function Editor({ language, value, onChange }: Props) {
  return (
    <div className="h-[60vh] rounded-xl overflow-hidden glass">
      <MonacoEditor
        height="100%"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={(v) => onChange(v || '')}
        options={{ fontLigatures: true, fontSize: 14, minimap: { enabled: false } }}
      />
    </div>
  )
}
