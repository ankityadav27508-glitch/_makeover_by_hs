"use client"

import { useCallback, useRef, useState } from "react"
import { ImagePlus, Upload } from "lucide-react"

type Props = {
  onFile: (file: File) => void
  onUseSample?: () => void
  compact?: boolean
}

export function UploadZone({ onFile, onUseSample, compact }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0]
      if (file && file.type.startsWith("image/")) onFile(file)
    },
    [onFile],
  )

  if (compact) {
    return (
      <>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-border"
        >
          <Upload className="h-4 w-4" />
          Replace image
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </>
    )
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
      className={`flex w-full max-w-xl flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-16 text-center transition-colors ${
        dragging ? "border-accent bg-accent/5" : "border-border bg-card"
      }`}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <ImagePlus className="h-7 w-7 text-accent" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">Upload a photo to edit</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Drag and drop an image here, or browse your files. Everything happens locally in your browser.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          <Upload className="h-4 w-4" />
          Choose image
        </button>
        {onUseSample && (
          <button
            type="button"
            onClick={onUseSample}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Try a sample
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="mt-6 text-xs text-muted-foreground">JPG, PNG, WEBP, or GIF</p>
    </div>
  )
}
