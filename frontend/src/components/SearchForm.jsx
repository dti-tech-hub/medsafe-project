import { useId } from 'react'
import { Search } from 'lucide-react'
import { Button } from './Button'

export function SearchForm({
  value,
  onChange,
  onSubmit,
  size = 'default',
  label = 'Search medicines',
  placeholder = 'Search by medicine name or active ingredient',
}) {
  const inputId = useId()

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit?.(value)
  }

  return (
    <form
      className={`search-form search-form--${size}`}
      role="search"
      onSubmit={handleSubmit}
    >
      <label
        className={size === 'hero' ? 'search-form-label' : 'sr-only'}
        htmlFor={inputId}
      >
        {label}
      </label>
      <div className="search-form-row">
        <span className="search-form-icon" aria-hidden="true">
          <Search size={size === 'hero' ? 21 : 18} />
        </span>
        <input
          id={inputId}
          className="search-input"
          type="search"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
        <Button type="submit" size={size === 'hero' ? 'lg' : 'md'}>
          Search
        </Button>
      </div>
      {size === 'hero' ? (
        <p className="search-form-hint">
          Search by medicine name or active ingredient.
        </p>
      ) : null}
    </form>
  )
}
