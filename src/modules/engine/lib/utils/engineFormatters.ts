export function formatNumber(
    value: number | null | undefined,
    digits = 1,
  ): string {
    if (
      value === null ||
      value === undefined ||
      Number.isNaN(value)
    ) {
      return "—"
    }
  
    return value.toFixed(digits)
  }
  
  export function formatUptime(
    seconds: number | null | undefined,
  ): string {
    if (seconds == null) {
      return "—"
    }
  
    const totalSeconds = Math.max(
      0,
      Math.floor(seconds),
    )
  
    const days = Math.floor(
      totalSeconds / 86400,
    )
  
    const hours = Math.floor(
      (totalSeconds % 86400) / 3600,
    )
  
    const minutes = Math.floor(
      (totalSeconds % 3600) / 60,
    )
  
    if (days > 0) {
      return `${days}d ${hours}h`
    }
  
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
  
    return `${minutes}m`
  }
  
  export function mbToGb(
    mb: number | null | undefined,
  ): number | null {
    if (mb == null) {
      return null
    }
  
    return mb / 1024
  }