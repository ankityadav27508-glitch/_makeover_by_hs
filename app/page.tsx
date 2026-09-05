import { Aperture } from "lucide-react"
import { ImageEditor } from "@/components/image-editor"

export default function Page() {
  return (
    <main className="min-h-dvh">
      <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
            <Aperture className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-semibold">Studio</h1>
            <p className="text-xs text-muted-foreground">Interactive image editor</p>
          </div>
        </div>
        <p className="hidden text-xs text-muted-foreground sm:block">
          Edits run entirely in your browser — nothing is uploaded.
        </p>
      </header>
      <ImageEditor />
    </main>
  )
}
