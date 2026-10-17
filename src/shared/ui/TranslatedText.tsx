import styles from './TranslatedText.module.scss';

interface TranslatedTextProps {
  simple: string;
  official: string;
}

/**
 * A "Magia": mostra a tradução em destaque, mas nunca esconde o texto oficial.
 * O operador vai precisar do termo jurídico no documento real.
 */
export function TranslatedText({ simple, official }: TranslatedTextProps) {
  return (
    <div className={styles.root}>
      <p className={styles.simple}>{simple}</p>
      <details className={styles.official}>
        <summary>Ver texto oficial</summary>
        <p>{official}</p>
      </details>
    </div>
  );
}
