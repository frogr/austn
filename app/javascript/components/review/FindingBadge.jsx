import React from 'react'

const SEVERITY_CONFIG = {
  info: {
    label: 'Info',
    color: '#64D2FF',
    bg: 'rgba(100, 210, 255, 0.1)',
    border: 'rgba(100, 210, 255, 0.25)'
  },
  warning: {
    label: 'Warning',
    color: '#FF9500',
    bg: 'rgba(255, 149, 0, 0.1)',
    border: 'rgba(255, 149, 0, 0.25)'
  },
  red_flag: {
    label: 'Red Flag',
    color: '#FF3B30',
    bg: 'rgba(255, 59, 48, 0.1)',
    border: 'rgba(255, 59, 48, 0.25)'
  }
}

const FindingBadge = ({ severity }) => {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: '4px',
      fontSize: '0.65rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.5px',
      color: config.color,
      background: config.bg,
      border: `1px solid ${config.border}`,
      whiteSpace: 'nowrap', flexShrink: 0
    }}>
      <span style={{
        display: 'inline-block', width: 5, height: 5,
        borderRadius: '50%', background: config.color,
        marginRight: '5px'
      }} />
      {config.label}
    </span>
  )
}

export default FindingBadge
