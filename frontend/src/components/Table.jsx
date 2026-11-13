export function Table({ caption, children, className = '' }) {
  return (
    <div className="table-wrap">
      <table className={`data-table${className ? ` ${className}` : ''}`}>
        {caption ? <caption>{caption}</caption> : null}
        {children}
      </table>
    </div>
  )
}
