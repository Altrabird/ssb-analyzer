import { defineConfig, minimal2023Preset as preset } from '@vite-pwa/assets-generator/config'

// Tweak preset so the brand gradient shows through maskable safe-area cleanly.
const customPreset = {
  ...preset,
  maskable: {
    ...preset.maskable,
    resizeOptions: { background: '#3b63ff', fit: 'contain' },
  },
  apple: {
    ...preset.apple,
    resizeOptions: { background: '#3b63ff', fit: 'contain' },
  },
}

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: customPreset,
  images: ['public/logo-source.svg'],
})
