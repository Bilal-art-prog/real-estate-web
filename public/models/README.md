# 3D model slots

Drop compressed `.glb` assets here (Draco or Meshopt, KTX2 textures) and load
them with `@react-three/drei`'s `useGLTF`:

```tsx
const { scene } = useGLTF("/models/villa.glb", true); // true = Draco
```

Suggested filenames, matching the procedural scenes they replace:

| File | Replaces | Component |
| --- | --- | --- |
| `villa.glb` | sunset glass villa + pool | `src/components/three/HeroVilla.tsx` |
| `interior.glb` | arched lobby → lounge → dining → marble wall → balcony | `src/components/three/WalkThrough.tsx` |
| `city-block.glb` | isometric neighbourhood diorama | `src/components/three/IsoCity.tsx` |
| `property-<slug>.glb` | per-listing exterior massing | `src/components/three/PropertyViewer.tsx` |
| `emblem.glb` | rotating keyhole medallion | `src/components/three/Emblem.tsx` |

Guidelines: keep each file under ~4 MB, merge materials, bake AO where possible,
and always keep the `<Suspense>` + `Canvas3D` poster wrapper so the page never
shows a blank rectangle while a model streams.

Note: files in `public/` are copied next to `dist/index.html` and are **not**
inlined by the single-file build.
