import React from 'react'

const SEVERITY_STYLES = {
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  red_flag: 'bg-red-100 text-red-800 border-red-200'
}

const SEVERITY_LABELS = {
  info: 'Info',
  warning: 'Warning',
  red_flag: 'Red Flag'
}

const FindingBadge = ({ severity }) => {
  const styles = SEVERITY_STYLES[severity] || SEVERITY_STYLES.info
  const label = SEVERITY_LABELS[severity] || severity

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles}`}>
      {label}
    </span>
  )
}

export default FindingBadge
