"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Download,
  FlipHorizontal2,
  FlipVertical2,
  RotateCcw,
  RotateCw,
  Sliders,
  Sparkles,
  Undo2,
  Redo2,
  Trash2,
} from "lucide-react"
import {
  buildFilter,
  DEFAULT_ADJUSTMENTS,
  DEFAULT_TRANSFORM,
  SLIDER_CONFIG,
  presetToAdjustments,
  type Adjustments,
  type FilterPreset,
  type Transform,
} from "@/lib/editor"
import { AdjustmentSlider } from "@/components/adjustment-slider"
import { FilterPresets } from "@/components/filter-presets"
import { UploadZone } from "@/components/upload-zone"

type EditorState = {
  adjustments: Adjustments
  transform: Transform
  presetName: string
}

const INITIAL_STATE: EditorState = {
  adjustments: DEFAULT_ADJUSTMENTS,
  transform: DEFAULT_TRANSFORM,
  presetName: "Original",
}

const SAMPLE_SRC = "/sample-portrait.png"

function renderToCanvas(canvas: HTMLCanvasElement, img: HTMLImageElement, state: EditorState) {
  const { adjustments, transform } = state
  const rotated = Math.abs(transform.rotate % 180) === 90
  const w = img.naturalWidth
  const h = img.naturalHeight
  canvas.width = rotated ? h : w
  canvas.height = rotated ? w : h

  const ctx = canvas.getContext("2d")
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.save()
  ctx.filter = buildFilter(adjustments)
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((transform.rotate * Math.PI) / 180)
  ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1)
  ctx.drawImage(img, -w / 2, -h / 2, w, h)
  ctx.restore()
}

export function ImageEditor() {
  const [src, setSrc] = useState<string | null>(null)
  const [fileName, setFileName] = useState("edited-image")
  const [state, setState] = useState<EditorState>(INITIAL_STATE)
  const [tab, setTab] = useState<"adjust" | "filters">("adjust")
  const [imageReady, setImageReady] = useState(false)
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null)

  const [undoStack, setUndoStack] = useState<EditorState[]>([])
  const [redoStack, setRedoStack] = useState<EditorState[]>([])
  const beforeRef = useRef<EditorState | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  // Load image whenever the source changes.
  useEffect(() => {
    if (!src) {
      imgRef.current = null
      setImageReady(false)
      return
    }
    setImageReady(false)
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      imgRef.current = img
      setDims({ w: img.naturalWidth, h: img.naturalHeight })
      setImageReady(true)
    }
    img.src = src
  }, [src])

  // Redraw the canvas whenever image or edits change.
  useEffect(() => {
    if (!imageReady || !imgRef.current || !canvasRef.current) return
    renderToCanvas(canvasRef.current, imgRef.current, state)
  }, [imageReady, state])

  const loadFile = useCallback((file: File) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setFileName(file.name.replace(/\.[^.]+$/, "") || "edited-image")
    setState(INITIAL_STATE)
    setUndoStack([])
    setRedoStack([])
    setSrc(url)
  }, [])

  const useSample = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setFileName("sample-portrait")
    setState(INITIAL_STATE)
    setUndoStack([])
    setRedoStack([])
    setSrc(SAMPLE_SRC)
  }, [])

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  // Paste support.
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith("image/"))
      const file = item?.getAsFile()
      if (file) loadFile(file)
    }
    window.addEventListener("paste", onPaste)
    return () => window.removeEventListener("paste", onPaste)
  }, [loadFile])

  const commitBefore = useCallback(() => {
    if (!beforeRef.current) beforeRef.current = state
  }, [state])

  const commitEnd = useCallback(() => {
    if (beforeRef.current) {
      const snapshot = beforeRef.current
      beforeRef.current = null
      setUndoStack((s) => [...s, snapshot])
      setRedoStack([])
    }
  }, [])

  // Commit a discrete change with full undo history in one step.
  const commitChange = useCallback(
    (next: EditorState) => {
      setUndoStack((s) => [...s, state])
      setRedoStack([])
      setState(next)
    },
    [state],
  )

  const setAdjustment = useCallback((key: keyof Adjustments, value: number) => {
    setState((s) => ({
      ...s,
      adjustments: { ...s.adjustments, [key]: value },
      presetName: "Custom",
    }))
  }, [])

  const applyPreset = useCallback(
    (preset: FilterPreset) => {
      commitChange({
        ...state,
        adjustments: presetToAdjustments(preset),
        presetName: preset.name,
      })
    },
    [state, commitChange],
  )

  const rotate = useCallback(
    (dir: 1 | -1) => {
      commitChange({
        ...state,
        transform: { ...state.transform, rotate: (state.transform.rotate + dir * 90 + 360) % 360 },
      })
    },
    [state, commitChange],
  )

  const flip = useCallback(
    (axis: "h" | "v") => {
      commitChange({
        ...state,
        transform: {
          ...state.transform,
          flipH: axis === "h" ? !state.transform.flipH : state.transform.flipH,
          flipV: axis === "v" ? !state.transform.flipV : state.transform.flipV,
        },
      })
    },
    [state, commitChange],
  )

  const resetAll = useCallback(() => commitChange(INITIAL_STATE), [commitChange])

  const undo = useCallback(() => {
    setUndoStack((s) => {
      if (s.length === 0) return s
      const prev = s[s.length - 1]
      setRedoStack((r) => [...r, state])
      setState(prev)
      return s.slice(0, -1)
    })
  }, [state])

  const redo = useCallback(() => {
    setRedoStack((r) => {
      if (r.length === 0) return r
      const next = r[r.length - 1]
      setUndoStack((s) => [...s, state])
      setState(next)
      return r.slice(0, -1)
    })
  }, [state])

  const download = useCallback(() => {
    if (!imgRef.current) return
    const out = document.createElement("canvas")
    renderToCanvas(out, imgRef.current, state)
    out.toBlob(
      (blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${fileName}.png`
        a.click()
        URL.revokeObjectURL(url)
      },
      "image/png",
      1,
    )
  }, [state, fileName])

  const isEdited = useMemo(() => {
    return (
      JSON.stringify(state.adjustments) !== JSON.stringify(DEFAULT_ADJUSTMENTS) ||
      JSON.stringify(state.transform) !== JSON.stringify(DEFAULT_TRANSFORM)
    )
  }, [state])

  // Keyboard shortcuts.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!src) return
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if (mod && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [src, undo, redo])

  if (!src) {
    return (
      <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-10">
        <UploadZone onFile={loadFile} onUseSample={useSample} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-6 lg:h-[calc(100dvh-4rem)] lg:flex-row lg:gap-6 lg:px-6">
      {/* Canvas stage */}
      <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={undo}
              disabled={undoStack.length === 0}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Undo"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={redoStack.length === 0}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Redo"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </button>
            <div className="mx-1 h-5 w-px bg-border" />
            <button
              type="button"
              onClick={() => rotate(-1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Rotate left"
              title="Rotate left"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => rotate(1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Rotate right"
              title="Rotate right"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => flip("h")}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-muted hover:text-foreground ${
                state.transform.flipH ? "text-accent" : "text-muted-foreground"
              }`}
              aria-label="Flip horizontal"
              aria-pressed={state.transform.flipH}
              title="Flip horizontal"
            >
              <FlipHorizontal2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => flip("v")}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-muted hover:text-foreground ${
                state.transform.flipV ? "text-accent" : "text-muted-foreground"
              }`}
              aria-label="Flip vertical"
              aria-pressed={state.transform.flipV}
              title="Flip vertical"
            >
              <FlipVertical2 className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {dims && (
              <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                {dims.w} × {dims.h}
              </span>
            )}
            <UploadZone onFile={loadFile} compact />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4 sm:p-8">
          <div
            className="relative flex max-h-full max-w-full items-center justify-center"
            style={{
              backgroundImage:
                "linear-gradient(45deg, oklch(0.24 0.006 285) 25%, transparent 25%), linear-gradient(-45deg, oklch(0.24 0.006 285) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, oklch(0.24 0.006 285) 75%), linear-gradient(-45deg, transparent 75%, oklch(0.24 0.006 285) 75%)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
            }}
          >
            <canvas
              ref={canvasRef}
              className="max-h-[60vh] max-w-full rounded-md shadow-2xl lg:max-h-[calc(100dvh-14rem)]"
              style={{ objectFit: "contain" }}
              aria-label="Editable image preview"
            />
          </div>
        </div>
      </section>

      {/* Controls panel */}
      <aside className="flex w-full shrink-0 flex-col rounded-xl border border-border bg-card lg:w-80">
        <div className="flex items-center gap-1 border-b border-border p-2">
          <button
            type="button"
            onClick={() => setTab("adjust")}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === "adjust" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sliders className="h-4 w-4" />
            Adjust
          </button>
          <button
            type="button"
            onClick={() => setTab("filters")}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === "filters" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Filters
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {tab === "adjust" ? (
            <div className="space-y-5">
              {SLIDER_CONFIG.map((config) => (
                <AdjustmentSlider
                  key={config.key}
                  config={config}
                  value={state.adjustments[config.key]}
                  onChange={(v) => setAdjustment(config.key, v)}
                  onCommitStart={commitBefore}
                  onCommitEnd={commitEnd}
                />
              ))}
            </div>
          ) : (
            <FilterPresets src={src} activeName={state.presetName} onSelect={applyPreset} />
          )}
        </div>

        <div className="space-y-2 border-t border-border p-4">
          <button
            type="button"
            onClick={download}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            <Download className="h-4 w-4" />
            Export PNG
          </button>
          <button
            type="button"
            onClick={resetAll}
            disabled={!isEdited}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <Trash2 className="h-4 w-4" />
            Reset all edits
          </button>
        </div>
      </aside>
    </div>
  )
}
