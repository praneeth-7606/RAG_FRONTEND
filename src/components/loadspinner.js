export default function LoadingSpinner({ size = 'sm' }) {
  const sizeClass = size === 'lg' ? 'spinner-border-lg' : ''
  
  return (
    <div className={`spinner-border ${sizeClass}`} role="status" style={{ width: '1rem', height: '1rem' }}>
      <span className="visually-hidden">Loading...</span>
    </div>
  )
}