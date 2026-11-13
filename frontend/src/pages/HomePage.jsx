import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardCheck,
  ListPlus,
  Search,
} from 'lucide-react'
import { Alert } from '../components/Alert'
import { SearchForm } from '../components/SearchForm'
import { FULL_DISCLAIMER } from '../config'

const STEPS = [
  {
    icon: Search,
    title: 'Search',
    text: 'Find a medicine by name or active ingredient and review the source profile.',
  },
  {
    icon: ListPlus,
    title: 'Build your list',
    text: 'Confirm each exact match and add medicines to a list you control.',
  },
  {
    icon: ClipboardCheck,
    title: 'Review documented interactions',
    text: 'Compare the medicines in your list against the cited source, pair by pair.',
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [term, setTerm] = useState('')

  function handleSearch(value) {
    const trimmed = value.trim()
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search')
  }

  return (
    <div className="home-page">
      <section className="home-intro" aria-labelledby="home-title">
        <h1 id="home-title">
          Medicine information and documented interactions, in one reference.
        </h1>
        <p className="home-lede">
          Search a medicine, read its source profile, build a list, and review
          documented interactions from the cited source.
        </p>
        <div className="hero-search">
          <SearchForm
            value={term}
            onChange={setTerm}
            onSubmit={handleSearch}
            size="hero"
          />
        </div>
      </section>

      <section className="how-it-works" aria-labelledby="how-title">
        <h2 id="how-title" className="section-title">
          How it works
        </h2>
        <div className="how-grid">
          {STEPS.map(({ icon: Icon, title, text }) => (
            <article className="how-item" key={title}>
              <span className="how-icon" aria-hidden="true">
                <Icon size={21} strokeWidth={1.8} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <Alert tone="warning" title="Important">
        {FULL_DISCLAIMER}
      </Alert>
    </div>
  )
}
