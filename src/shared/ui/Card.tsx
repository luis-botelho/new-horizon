import { type ReactNode } from 'react'
import styles from './Card.module.scss'

interface CardProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
}

export function Card({ children, className = '', hoverable = false }: CardProps) {
  const classes = [styles.card, hoverable ? styles.hoverable : '', className].filter(Boolean).join(' ')
  return <article className={classes}>{children}</article>
}
