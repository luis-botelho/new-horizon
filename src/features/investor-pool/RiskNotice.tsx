import styles from './RiskNotice.module.scss';

/** Copy obrigatória no topo de todo Pool: risco com o mesmo peso visual do retorno. */
export function RiskNotice() {
  return (
    <p role="note" className={styles.notice}>
      Investir em licitações envolve risco de perda parcial ou total do capital. Retornos passados
      não garantem resultados futuros.
    </p>
  );
}
