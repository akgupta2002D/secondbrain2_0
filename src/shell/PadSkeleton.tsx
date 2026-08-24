type Props = {
  label: string
}

export function PadSkeleton({ label }: Props) {
  return (
    <div className="padSkeleton" aria-busy="true" aria-label={label}>
      <div className="padSkeletonHeader">
        <span className="padSkeletonBlock padSkeletonIcon" />
        <span className="padSkeletonBlock padSkeletonIcon" />
        <span className="padSkeletonBlock padSkeletonIcon padSkeletonIconEnd" />
      </div>
      <div className="padSkeletonBody">
        <span className="padSkeletonLine" />
        <span className="padSkeletonLine" />
        <span className="padSkeletonLine padSkeletonLineShort" />
      </div>
    </div>
  )
}
