# PlaceTrack design tokens

Token source of truth: `client/src/index.css`. Values below are the proposed starting system for light and dark themes. Text pairs are checked against WCAG AA (4.5:1 for normal text); state colors also carry labels/icons so meaning never depends on color alone.

## Light theme scales

| Step | Green | Neutral |
| --- | --- | --- |
| 50 | `#EDF5F0` | `#F7F8F3` |
| 100 | `#D8E8DD` | `#EEF1EA` |
| 200 | `#B8D4C2` | `#DCE2D8` |
| 300 | `#8FBAA1` | `#C7D0C5` |
| 400 | `#639679` | `#A0ADA1` |
| 500 | `#3A7956` | `#77857A` |
| 600 | `#2C6A49` | `#58665D` |
| 700 | `#1F593F` | `#3F4E44` |
| 800 | `#184632` | `#24342B` |
| 900 | `#10271F` | `#15221B` |

## Dark theme scales

The scale direction reverses for dark surfaces: low steps are near-black backgrounds, and high steps are readable foreground greens.

| Step | Green | Neutral |
| --- | --- | --- |
| 50 | `#0F241A` | `#0D1C16` |
| 100 | `#173526` | `#12271E` |
| 200 | `#214533` | `#1A3227` |
| 300 | `#315C43` | `#2B483A` |
| 400 | `#548266` | `#607C6A` |
| 500 | `#77A889` | `#8EA899` |
| 600 | `#98C4A7` | `#B2C2B5` |
| 700 | `#B6DCC0` | `#CDD9CF` |
| 800 | `#D0EBDD` | `#E4ECE5` |
| 900 | `#E6F4EA` | `#F2F6F2` |

## Semantic pairs

| State | Light background / text | Dark background / text | Light ratio | Dark ratio |
| --- | --- | --- | ---: | ---: |
| Success | `#E6F4EA` / `#155A35` | `#173B2B` / `#A9E6C0` | 7.26:1 | 8.70:1 |
| Warning | `#FFF3D6` / `#784600` | `#453316` / `#F0CC7A` | 7.12:1 | 7.84:1 |
| Error | `#FCE8E6` / `#8E2424` | `#4A2020` / `#F2A6A2` | 7.34:1 | 7.08:1 |
| Info | `#E7F0FA` / `#194C75` | `#18364B` / `#A9D4FA` | 7.82:1 | 8.08:1 |

## Pipeline pairs

| Stage | Light background / text | Dark background / text | Light ratio | Dark ratio |
| --- | --- | --- | ---: | ---: |
| Applied | `#E5F2E9` / `#1F593F` | `#173B2B` / `#A9E6C0` | 7.12:1 | 8.70:1 |
| OA scheduled | `#E7EEF7` / `#244B73` | `#243A52` / `#B8D3F2` | 7.72:1 | 7.57:1 |
| Interview | `#D9EEE8` / `#195B4A` | `#1D443A` / `#A0DACA` | 6.58:1 | 6.89:1 |
| Offer | `#F8EED8` / `#704C09` | `#493A20` / `#E8C779` | 6.68:1 | 6.74:1 |
| Rejected | `#F8E8E6` / `#852E2A` | `#492626` / `#F0AAA3` | 7.30:1 | 6.91:1 |

Applied and interview remain in the green family. OA uses a quiet blue-grey, offer uses the one warm ochre accent, and rejected uses a restrained rose. Status names remain visible in every view.

## Surface and interaction tokens

| Token | Light | Dark |
| --- | --- | --- |
| Canvas | `#F7F8F3` | `#10231B` |
| Surface | `#FFFFFF` | `#173228` |
| Raised surface | `#FFFFFF` + `0 14px 38px rgba(21,34,27,.08)` | `#1A392D` + `0 14px 38px rgba(0,0,0,.20)` |
| Sunken surface | `#EEF1EA` | `#12291F` |
| Border / subtle / strong | `#DCE2D8` / `#E8EDE6` / `#A0ADA1` | `#315142` / `#263F33` / `#607C6A` |
| Hover / pressed | `#EDF5F0` / `#D8E8DD` | `#1C3A2C` / `#244836` |
| Selected row / leading edge | `#EAF3EC` / `#1F593F` | `#1C4030` / `#8FBAA1` |
| Focus ring / offset | `#3A7956` / surface | `#8FBAA1` / `#10231B` |
| Primary / hover / pressed | `#1F593F` / `#184632` / `#123B2A` | `#2E7752` / `#398B60` / `#276543` |
| Accent / on-accent | `#D6A94F` / `#24342B` | `#D6A94F` / `#24342B` |
| Floating shadow | `0 24px 72px rgba(12,31,22,.20)` | `0 24px 72px rgba(0,0,0,.44)` |

The focus ring is 4.86:1 against the light canvas and 7.59:1 against the dark canvas. Primary foreground/background contrast is 8.21:1 in light mode and 5.42:1 in dark mode. Raised surfaces remain distinct through borders and shadow, not color alone.

## Typography preview

The UI will keep two live preview choices until a pairing is selected:

1. Sora headings + Atkinson Hyperlegible body.
2. Instrument Sans headings + Geist body.

Both families use `font-display: swap`. The preview changes only font-family tokens, leaving size, weight, spacing, and layout identical so the visual comparison is fair.
