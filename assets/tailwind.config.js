

const plugin = require("tailwindcss/plugin")
const defaultTheme = require("tailwindcss/defaultTheme")
const fs = require("fs")
const path = require("path")

module.exports = {
  content: [
    "./js/**/*.js",
    "../lib/scopestrength_web.ex",
    "../lib/scopestrength_web/**/*.*ex"
  ],
  theme: {
    extend: {
      colors: {
        brand: "#FF3B45",

        background: "#101012",
        card: "#1A1A1D",
        muted: "#222226",
        secondary: "#2D2D32",
        line: "#414147",

        foreground: "#F5F5F5",
        dim: "#A5A5AD",
        faint: "#777780",

        primary: {
          DEFAULT: "#FF3B45",
          foreground: "#101012"
        },

        success: "#F5F5F5",
        warning: "#FF8A91",
        danger: "#FF3B45"
      },
      fontFamily: {
        sans: ["DM Sans", ...defaultTheme.fontFamily.sans],
        mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
        display: ["Barlow Condensed", ...defaultTheme.fontFamily.sans]
      },
      borderRadius: {
        DEFAULT: "6px",
        md: "6px",
        lg: "10px",
        xl: "14px"
      },
      ringColor: {
        DEFAULT: "#FF3B45"
      }
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    plugin(({addVariant}) => addVariant("phx-click-loading", [".phx-click-loading&", ".phx-click-loading &"])),
    plugin(({addVariant}) => addVariant("phx-submit-loading", [".phx-submit-loading&", ".phx-submit-loading &"])),
    plugin(({addVariant}) => addVariant("phx-change-loading", [".phx-change-loading&", ".phx-change-loading &"])),

    plugin(({addUtilities}) => addUtilities({
      ".num": {
        "font-family": "JetBrains Mono, ui-monospace, monospace",
        "font-variant-numeric": "tabular-nums"
      }
    })),

    plugin(function({matchComponents, theme}) {
      let iconsDir = path.join(__dirname, "../deps/heroicons/optimized")
      let values = {}
      let icons = [
        ["", "/24/outline"],
        ["-solid", "/24/solid"],
        ["-mini", "/20/solid"],
        ["-micro", "/16/solid"]
      ]
      icons.forEach(([suffix, dir]) => {
        fs.readdirSync(path.join(iconsDir, dir)).forEach(file => {
          let name = path.basename(file, ".svg") + suffix
          values[name] = {name, fullPath: path.join(iconsDir, dir, file)}
        })
      })
      matchComponents({
        "hero": ({name, fullPath}) => {
          let content = fs.readFileSync(fullPath).toString().replace(/\r?\n|\r/g, "")
          let size = theme("spacing.6")
          if (name.endsWith("-mini")) {
            size = theme("spacing.5")
          } else if (name.endsWith("-micro")) {
            size = theme("spacing.4")
          }
          return {
            [`--hero-${name}`]: `url('data:image/svg+xml;utf8,${content}')`,
            "-webkit-mask": `var(--hero-${name})`,
            "mask": `var(--hero-${name})`,
            "mask-repeat": "no-repeat",
            "background-color": "currentColor",
            "vertical-align": "middle",
            "display": "inline-block",
            "width": size,
            "height": size
          }
        }
      }, {values})
    })
  ]
}
