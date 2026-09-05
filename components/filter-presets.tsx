"use client"

import { buildFilter, FILTER_PRESETS, presetToAdjustments, type FilterPreset } from "@/lib/editor"

type Props = {
  src: string
  activeName: string
  onSelect: (preset: FilterPreset) => void
}

export function FilterPresets({ src, activeName, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {FILTER_PRESETS.map((preset) => {
        const active = preset.name === activeName
        return (
          <button
            key={preset.name}
            type="button"
            onClick={() => onSelect(preset)}
            className={`group flex flex-col overflow-hidden rounded-md border text-left transition-colors ${
              active ? "border-accent" : "border-border hover:border-muted-foreground"
            }`}
            aria-pressed={active}
          >
            <div className="relative aspect-square w-full overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src || "/placeholder.svg"}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover"
                style={{ filter: buildFilter(presetToAdjustments(preset)) }}
              />
            </div>
            <span
              className={`px-1.5 py-1 text-center text-[11px] font-medium ${
                active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              }`}
            >
              {preset.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
