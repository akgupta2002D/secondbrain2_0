import type { EngineStats } from "../../lib/types/engine"

import {
  formatNumber,
  formatUptime,
  mbToGb,
} from "../../lib/utils/engineFormatters"

import { EngineStatCard } from "./EngineStatCard"
import { EngineStatusBadge } from "./EngineStatusBadge"

interface EngineOverviewProps {
  stats: EngineStats
}

export function EngineOverview({
  stats,
}: EngineOverviewProps) {
  const {
    system,
    cpu,
    memory,
    disk,
    network,
    gpu,
    power,
    connectivity,
    processes,
    maintenance,
    issues,
  } = stats

  return (
    <div className="engineOverview">
      <section className="engineHero">
        <div>
          <div className="engineHeroStatus">
            <EngineStatusBadge
              status={stats.status}
            />

            <span className="engineHealthScore">
              Health {stats.health_score}/100
            </span>
          </div>

          <h2>Server is {system.state}</h2>

          <p>
            Uptime{" "}
            {formatUptime(
              system.uptime_seconds,
            )}
          </p>
        </div>

        <div className="enginePowerNow">
          <span>Current power</span>

          <strong>
            {formatNumber(
              power.current_watts,
            )}{" "}
            W
          </strong>
        </div>
      </section>

      <section className="engineSection">
        <h2>Resources</h2>

        <div className="engineStatsGrid">
          <EngineStatCard
            title="CPU"
            value={`${formatNumber(
              cpu.usage_percent,
            )}%`}
            progress={cpu.usage_percent}
            detail={`${cpu.cores_physical} physical · ${cpu.cores_logical} logical cores`}
          />

          <EngineStatCard
            title="Memory"
            value={`${formatNumber(
              memory.usage_percent,
            )}%`}
            progress={memory.usage_percent}
            detail={`${formatNumber(
              mbToGb(memory.used_mb),
            )} / ${formatNumber(
              mbToGb(memory.total_mb),
            )} GB`}
          />

          <EngineStatCard
            title="Disk"
            value={`${formatNumber(
              disk.usage_percent,
            )}%`}
            progress={disk.usage_percent}
            detail={`${formatNumber(
              disk.free_gb,
            )} GB free`}
          />

          <EngineStatCard
            title="System Load"
            value={formatNumber(
              system.load_1m,
              2,
            )}
            detail={`5m ${formatNumber(
              system.load_5m,
              2,
            )} · 15m ${formatNumber(
              system.load_15m,
              2,
            )}`}
          />
        </div>
      </section>

      <section className="engineSection">
        <h2>Power</h2>

        <div className="engineStatsGrid">
          <EngineStatCard
            title="Current"
            value={`${formatNumber(
              power.current_watts,
            )} W`}
          />

          <EngineStatCard
            title="Today"
            value={`${formatNumber(
              power.energy_today_kwh,
              3,
            )} kWh`}
            detail={`${formatNumber(
              power.cost.today,
              2,
            )} ${power.cost.currency}`}
          />

          <EngineStatCard
            title="Projected Month"
            value={`${formatNumber(
              power.projected_month_kwh,
              2,
            )} kWh`}
            detail={`${formatNumber(
              power.cost.projected_month,
              2,
            )} ${power.cost.currency}`}
          />

          <EngineStatCard
            title="Rate"
            value={formatNumber(
              power.cost.rate_per_kwh,
              2,
            )}
            detail={`${power.cost.currency} / kWh`}
          />
        </div>
      </section>

      <section className="engineSection">
        <h2>Network</h2>

        <div className="engineStatsGrid">
          <EngineStatCard
            title="Internet"
            value={
              connectivity.internet
                ? "Online"
                : "Offline"
            }
            detail={`${formatNumber(
              connectivity.latency_ms,
            )} ms latency`}
          />

          <EngineStatCard
            title="Download"
            value={`${formatNumber(
              network.download_mbps,
              2,
            )} Mbps`}
          />

          <EngineStatCard
            title="Upload"
            value={`${formatNumber(
              network.upload_mbps,
              2,
            )} Mbps`}
          />

          <EngineStatCard
            title="Processes"
            value={processes.total}
            detail={`${processes.running} running · ${processes.sleeping} sleeping`}
          />
        </div>
      </section>

      <section className="engineSection">
        <h2>System</h2>

        <div className="engineInfoList">
          <div>
            <span>CPU status</span>
            <strong>{cpu.status}</strong>
          </div>

          <div>
            <span>Memory status</span>
            <strong>{memory.status}</strong>
          </div>

          <div>
            <span>Disk status</span>
            <strong>{disk.status}</strong>
          </div>

          <div>
            <span>Network status</span>
            <strong>{network.status}</strong>
          </div>

          <div>
            <span>GPU</span>
            <strong>
              {gpu.available
                ? gpu.model ?? "Available"
                : "Unavailable"}
            </strong>
          </div>

          <div>
            <span>GPU detail</span>
            <strong>
              {gpu.available
                ? gpu.status
                : gpu.reason ?? "Unavailable"}
            </strong>
          </div>

          <div>
            <span>DNS</span>
            <strong>
              {connectivity.dns
                ? "Healthy"
                : "Unavailable"}
            </strong>
          </div>

          <div>
            <span>Reboot required</span>
            <strong>
              {maintenance.reboot_required
                ? "Yes"
                : "No"}
            </strong>
          </div>
        </div>
      </section>

      {issues.length > 0 && (
        <section className="engineIssues">
          <h2>Issues</h2>

          {issues.map((issue, index) => (
            <div
              className="engineIssue"
              key={index}
            >
              {typeof issue === "string"
                ? issue
                : JSON.stringify(issue)}
            </div>
          ))}
        </section>
      )}
    </div>
  )
}