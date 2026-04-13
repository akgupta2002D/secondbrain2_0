export type GoalsGraphCenter = {
  id: string
  label: string
}

export type GoalsGraphNode = {
  id: string
  label: string
  /** Optional longer description shown when the node is selected */
  detail?: string
  /** Optional hex stroke for vine + ring accent (e.g. #93c5fd) */
  strokeColor?: string
}

export type GoalsGraphData = {
  version: 1
  center: GoalsGraphCenter
  nodes: GoalsGraphNode[]
}
