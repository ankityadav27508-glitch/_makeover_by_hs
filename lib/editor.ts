export type Adjustments = {
  brightness: number
  contrast: number
  saturate: number
  grayscale: number
  sepia: number
  hueRotate: number
  blur: number
  invert: number
}

export type Transform = {
  rotate: number
  flipH: boolean
  flipV: boolean
}

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  hueRotate: 0,
  blur: 0,
  invert: 0,
}

export const DEFAULT_TRANSFORM: Transform = {
  rotate: 0,
  flipH: false,
  flipV: false,
}

export type SliderConfig = {
  key: keyof Adjustments
  label: string
  min: number
  max: number
  step: number
  unit: string
  /** value that represents "no change" */
  base: number
}

export const SLIDER_CONFIG: SliderConfig[] = [
  { key: "brightness", label: "Brightness", min: 0, max: 200, step: 1, unit: "%", base: 100 },
  { key: "contrast", label: "Contrast", min: 0, max: 200, step: 1, unit: "%", base: 100 },
  { key: "saturate", label: "Saturation", min: 0, max: 200, step: 1, unit: "%", base: 100 },
  { key: "hueRotate", label: "Hue", min: 0, max: 360, step: 1, unit: "°", base: 0 },
  { key: "sepia", label: "Sepia", min: 0, max: 100, step: 1, unit: "%", base: 0 },
  { key: "grayscale", label: "Grayscale", min: 0, max: 100, step: 1, unit: "%", base: 0 },
  { key: "invert", label: "Invert", min: 0, max: 100, step: 1, unit: "%", base: 0 },
  { key: "blur", label: "Blur", min: 0, max: 20, step: 0.1, unit: "px", base: 0 },
]

export function buildFilter(a: Adjustments): string {
  return [
    `brightness(${a.brightness}%)`,
    `contrast(${a.contrast}%)`,
    `saturate(${a.saturate}%)`,
    `grayscale(${a.grayscale}%)`,
    `sepia(${a.sepia}%)`,
    `hue-rotate(${a.hueRotate}deg)`,
    `invert(${a.invert}%)`,
    `blur(${a.blur}px)`,
  ].join(" ")
}

export type FilterPreset = {
  name: string
  adjustments: Partial<Adjustments>
}

export const FILTER_PRESETS: FilterPreset[] = [
  { name: "Original", adjustments: {} },
  { name: "Mono", adjustments: { grayscale: 100, contrast: 110 } },
  { name: "Noir", adjustments: { grayscale: 100, contrast: 145, brightness: 90 } },
  { name: "Vintage", adjustments: { sepia: 55, contrast: 95, brightness: 105, saturate: 120 } },
  { name: "Warm", adjustments: { sepia: 25, saturate: 130, brightness: 105, hueRotate: 350 } },
  { name: "Cool", adjustments: { hueRotate: 190, saturate: 115, brightness: 102 } },
  { name: "Vivid", adjustments: { saturate: 165, contrast: 118 } },
  { name: "Fade", adjustments: { contrast: 82, brightness: 112, saturate: 78 } },
  { name: "Dream", adjustments: { blur: 1.2, brightness: 108, saturate: 120, contrast: 92 } },
  { name: "Invert", adjustments: { invert: 100 } },
]

export function presetToAdjustments(preset: FilterPreset): Adjustments {
  return { ...DEFAULT_ADJUSTMENTS, ...preset.adjustments }
}
