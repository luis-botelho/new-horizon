import { forwardRef, type ButtonHTMLAttributes } from 'react'
import styles from './Button.module.scss'

type Variant = 'primary' | 'secondary' | 'subtle' | 'ghost' | 'danger' | 'link'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, className = '', disabled, children, ...props }, ref) => {
    const classes = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ')
    return (
      <button ref={ref} className={classes} disabled={disabled || loading} {...props}>
        {loading ? 'Aguarde...' : children}
      </button>
    )
  }
)

Button.displayName = 'Button'
