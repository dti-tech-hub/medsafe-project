import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'

export default function NotFoundPage() {
  return (
    <div className="page-stack">
      <EmptyState
        icon={FileQuestion}
        title="Page not found"
        titleAs="h1"
        action={
          <Button as={Link} to="/">
            Return to the reference
          </Button>
        }
      >
        <p>
          The address may be incorrect, or the page may have moved. Use the
          navigation to continue.
        </p>
      </EmptyState>
    </div>
  )
}
