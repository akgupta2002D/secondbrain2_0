interface EngineStatusBadgeProps {
    status: string
  }
  
  export function EngineStatusBadge({
    status,
  }: EngineStatusBadgeProps) {
    const normalized =
      status?.toLowerCase() || "unknown"
  
    return (
      <span
        className={`engineStatus engineStatus--${normalized}`}
      >
        <span
          className="engineStatusDot"
          aria-hidden="true"
        />
  
        {normalized}
      </span>
    )
  }