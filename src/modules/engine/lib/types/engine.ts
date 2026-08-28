export interface EngineStats {
    schema_version: string
    status: string
    health_score: number
    generated_at: string
    sample_age_ms: number
  
    system: {
      state: string
      uptime_seconds: number
      load_1m: number
      load_5m: number
      load_15m: number
      normalized_load_1m: number
    }
  
    cpu: {
      status: string
      usage_percent: number
      cores_logical: number
      cores_physical: number
      temperature_c: number | null
    }
  
    memory: {
      status: string
      total_mb: number
      used_mb: number
      available_mb: number
      usage_percent: number
      swap_percent: number
      swap_total_mb: number
      swap_used_mb: number
    }
  
    disk: {
      status: string
      usage_percent: number
      total_gb: number
      used_gb: number
      free_gb: number
      read_mb_s: number
      write_mb_s: number
      read_bytes_total: number
      write_bytes_total: number
    }
  
    network: {
      status: string
      download_mbps: number
      upload_mbps: number
      bytes_recv_total: number
      bytes_sent_total: number
    }
  
    gpu: {
      available: boolean
      status: string
      reason: string | null
      model: string | null
      usage_percent: number | null
      memory_used_mb: number | null
      memory_total_mb: number | null
      temperature_c: number | null
      power_watts: number | null
    }
  
    power: {
      available: boolean
      source: string
      current_watts: number
      energy_today_kwh: number
      energy_window_kwh: number
      estimated_day_kwh: number
      estimated_month_kwh: number
      projected_month_kwh: number
      measurement_window_started_at: string
      today_is_partial: boolean
  
      cost: {
        currency: string
        rate_per_kwh: number
        today: number
        window: number
        estimated_month: number
        projected_month: number
      }
    }
  
    connectivity: {
      internet: boolean
      dns: boolean
      latency_ms: number | null
      status: string
    }
  
    processes: {
      running: number
      sleeping: number
      zombies: number
      total: number
    }
  
    maintenance: {
      reboot_required: boolean
      updates_available: number | null
      security_updates: number | null
    }
  
    issues: unknown[]
  }