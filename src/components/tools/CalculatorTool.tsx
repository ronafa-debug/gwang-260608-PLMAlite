import { useState } from 'react'
import { Button } from '@/components/ui/button'

const OPS = ['+', '-', '×', '÷'] as const

export function CalculatorTool() {
  const [display, setDisplay] = useState('0')
  const [prev, setPrev] = useState<number | null>(null)
  const [op, setOp] = useState<(typeof OPS)[number] | null>(null)
  const [fresh, setFresh] = useState(true)

  const inputDigit = (d: string) => {
    setDisplay((cur) => {
      if (fresh || cur === '0') return d
      if (cur.length >= 12) return cur
      return cur + d
    })
    setFresh(false)
  }

  const inputDot = () => {
    setDisplay((cur) => {
      if (fresh) return '0.'
      if (cur.includes('.')) return cur
      return `${cur}.`
    })
    setFresh(false)
  }

  const applyOp = (next: (typeof OPS)[number]) => {
    const value = Number(display)
    if (prev !== null && op && !fresh) {
      const result = compute(prev, value, op)
      setPrev(result)
      setDisplay(String(result))
    } else {
      setPrev(value)
    }
    setOp(next)
    setFresh(true)
  }

  const equals = () => {
    if (prev === null || !op) return
    const result = compute(prev, Number(display), op)
    setDisplay(String(result))
    setPrev(null)
    setOp(null)
    setFresh(true)
  }

  const clear = () => {
    setDisplay('0')
    setPrev(null)
    setOp(null)
    setFresh(true)
  }

  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.']

  return (
    <div className="mx-auto max-w-sm space-y-3">
      <div className="rounded-2xl bg-muted/50 px-4 py-5 text-right font-mono text-3xl font-semibold tabular-nums">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-2">
        <Button type="button" variant="outline" className="h-12" onClick={clear}>
          C
        </Button>
        {OPS.map((o) => (
          <Button
            key={o}
            type="button"
            variant={op === o ? 'default' : 'outline'}
            className="h-12"
            onClick={() => applyOp(o)}
          >
            {o}
          </Button>
        ))}
        {keys.map((k) => (
          <Button
            key={k}
            type="button"
            variant="outline"
            className={`h-12 ${k === '0' ? 'col-span-2' : ''}`}
            onClick={() => (k === '.' ? inputDot() : inputDigit(k))}
          >
            {k}
          </Button>
        ))}
        <Button type="button" className="h-12" onClick={equals}>
          =
        </Button>
      </div>
    </div>
  )
}

function compute(a: number, b: number, op: (typeof OPS)[number]) {
  switch (op) {
    case '+':
      return round(a + b)
    case '-':
      return round(a - b)
    case '×':
      return round(a * b)
    case '÷':
      return b === 0 ? 0 : round(a / b)
  }
}

function round(n: number) {
  return Math.round(n * 1e8) / 1e8
}
