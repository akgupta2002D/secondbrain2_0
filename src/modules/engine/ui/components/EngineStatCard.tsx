interface EngineStatCardProps {
    title: string
    value: string | number
    detail?: string
    progress?: number | null
  }
  
  export function EngineStatCard({
    title,
    value,
    detail,
    progress,
  }: EngineStatCardProps) {
    const safeProgress =
      typeof progress === "number"
        ? Math.min(Math.max(progress, 0), 100)
        : null
  
    return (
      <article className="engineStatCard">
        <span className="engineStatLabel">
          {title}
        </span>
  
        <strong className="engineStatValue">
          {value}
        </strong>
  
        {safeProgress !== null && (
          <div
            className="engineProgress"
            role="progressbar"
            aria-label={title}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={safeProgress}
          >
            <div
              className="engineProgressFill"
              style={{
                width: `${safeProgress}%`,
              }}
            />
          </div>
        )}
  
        {detail && (
          <span className="engineStatDetail">
            {detail}
          </span>
        )}
      </article>
    )
  }