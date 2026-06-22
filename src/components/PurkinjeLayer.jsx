const PURKINJE = "url('/purkinje.png')"

/**
 * Background layers for the Purkinje cell illustration.
 * Parent must use `relative isolate`; page content should use `relative z-10`.
 */
export default function PurkinjeLayer({ variant = "watermark", baseClass = "bg-stone-50" }) {
  if (variant === "watermark") {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className={`absolute inset-0 ${baseClass}`} />
        <div
          className="absolute inset-0 bg-contain bg-no-repeat bg-top opacity-[0.16] mix-blend-multiply"
          style={{ backgroundImage: PURKINJE }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(250,250,249,0.35) 55%, rgba(250,250,249,0.7) 100%)",
          }}
        />
      </div>
    )
  }

  if (variant === "hero") {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className={`absolute inset-0 ${baseClass}`} />
        <div className="absolute top-0 left-0 right-0 h-[55vh] overflow-hidden">
          <div
            className="absolute inset-0 bg-contain bg-no-repeat bg-top opacity-[0.18] mix-blend-multiply"
            style={{ backgroundImage: PURKINJE }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(250,249,247,0.45) 65%, rgba(250,249,247,0.92) 100%)",
            }}
          />
        </div>
      </div>
    )
  }

  if (variant === "paper") {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className={`absolute inset-0 ${baseClass}`} />
        <div
          className="absolute inset-0 bg-contain bg-no-repeat bg-top opacity-[0.14] mix-blend-multiply"
          style={{ backgroundImage: PURKINJE }}
        />
      </div>
    )
  }

  if (variant === "right") {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className={`absolute inset-0 ${baseClass}`} />
        <div
          className="absolute top-0 right-0 hidden h-full w-1/2 bg-contain bg-no-repeat bg-right-top opacity-[0.16] mix-blend-multiply lg:block"
          style={{ backgroundImage: PURKINJE }}
        />
        <div
          className="absolute top-0 right-0 hidden h-full w-1/2 lg:block"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.75) 30%, transparent 100%)",
          }}
        />
      </div>
    )
  }

  if (variant === "field") {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[#fbf8f1]" />
        <div
          className="purkinje-drift absolute -top-8 left-0 right-0 h-[78svh] bg-repeat-x bg-top opacity-[0.095] mix-blend-multiply [background-size:clamp(270px,34vw,500px)_auto] [filter:sepia(0.75)_contrast(0.85)]"
          style={{ backgroundImage: PURKINJE }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(251,248,241,0.08) 0%, rgba(251,248,241,0.62) 58%, #fbf8f1 100%)",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_22%,rgba(255,255,255,0.62),transparent_31%),radial-gradient(circle_at_82%_8%,rgba(143,103,72,0.08),transparent_30%)]" />
      </div>
    )
  }

  if (variant === "margin") {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[#fcfaf5]" />
        <div
          className="purkinje-drift-slow absolute -right-20 top-0 hidden h-full w-[58vw] bg-no-repeat bg-right-top opacity-[0.13] mix-blend-multiply [background-size:min(58vw,760px)_auto] [filter:sepia(0.82)_contrast(0.78)] md:block"
          style={{ backgroundImage: PURKINJE }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, #fcfaf5 0%, rgba(252,250,245,0.96) 42%, rgba(252,250,245,0.52) 74%, #fcfaf5 100%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#fcfaf5] to-transparent" />
      </div>
    )
  }

  if (variant === "veil") {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[#faf6ee]" />
        <div
          className="absolute -inset-x-10 top-0 h-full bg-repeat opacity-[0.065] mix-blend-multiply [background-size:clamp(220px,24vw,360px)_auto] [filter:sepia(0.8)_contrast(0.72)]"
          style={{
            backgroundImage: PURKINJE,
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 14%, black 64%, transparent 100%)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,246,238,0.98)_0%,rgba(250,246,238,0.76)_30%,rgba(250,246,238,0.76)_70%,rgba(250,246,238,0.98)_100%)]" />
      </div>
    )
  }

  return null
}
