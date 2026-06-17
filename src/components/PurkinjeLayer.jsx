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

  return null
}
