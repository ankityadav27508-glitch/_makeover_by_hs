"use client"

import type { SliderConfig } from "@/lib/editor"

type Props = {
  config: SliderConfig
  value: number
  onChange: (value: number) => void
  onCommitStart?: () => void
  onCommitEnd?: () => void
}

export function AdjustmentSlider({ config, value, onChange, onCommitStart, onCommitEnd }: Props) {
  const changed = value !== config.base
  const displayValue = Number.isInteger(value) ? value : value.toFixed(1)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <label htmlFor={`slider-${config.key}`} className="text-muted-foreground">
          {config.label}
        </label>
        <span
          className={`font-mono text-xs tabular-nums ${changed ? "text-accent" : "text-muted-foreground"}`}
        >
          {displayValue}
          {config.unit}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <input
          id={`slider-${config.key}`}
          type="range"
          min={config.min}
          max={config.max}
          step={config.step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onPointerDown={onCommitStart}
          onPointerUp={onCommitEnd}
          onKeyDown={onCommitStart}
          onKeyUp={onCommitEnd}
          onBlur={onCommitEnd}
          aria-label={config.label}
        />
        <button
          type="button"
          onClick={() => {
            onCommitStart?.()
            onChange(config.base)
            onCommitEnd?.()
          }}
          disabled={!changed}
          className="shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground disabled:cursor-default disabled:opacity-0"
          aria-label={`Reset ${config.label}`}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
