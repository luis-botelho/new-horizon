import styles from './Badge.module.scss'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface BadgeProps {
  children: string
  variant?: Variant
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return <span className={[styles.badge, styles[variant]].join(' ')}>{children.toUpperCase()}</span>
}
