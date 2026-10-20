'use client';

import { useMemo, useState, type ChangeEvent } from 'react';

import { auditHabilitacao } from '../rules/audit';
import type { DocumentExpiry } from '../rules/documentExpiry';
import styles from './DocumentAudit.module.scss';

interface ExpiryBadge {
  label: string;
  tone: 'expired' | 'expiring';
}

function pluralDays(days: number): string {
  return `${days} ${days === 1 ? 'dia' : 'dias'}`;
}

/** Rótulo de alerta só quando venceu ou está perto de vencer. */
function expiryBadge(expiry: DocumentExpiry): ExpiryBadge | null {
  if (expiry.status === 'expired') {
    return { label: `vencido há ${pluralDays(Math.abs(expiry.daysLeft ?? 0))}`, tone: 'expired' };
  }
  if (expiry.status === 'expiring') {
    const days = expiry.daysLeft ?? 0;
    return { label: days === 0 ? 'vence hoje' : `vence em ${pluralDays(days)}`, tone: 'expiring' };
  }
  return null;
}

/**
 * Passo 4 do fluxo: escolhe a pasta da habilitação (3- DOCUMENTAÇÃO) e bate
 * os nomes dos arquivos com o catálogo do guia, alertando faltantes e
 * vencimentos. Só lê nomes de arquivo — nada é enviado do navegador.
 */
export function DocumentAudit() {
  const [paths, setPaths] = useState<string[] | null>(null);

  const audit = useMemo(() => (paths ? auditHabilitacao(paths, new Date()) : null), [paths]);

  const folderName = paths?.[0]?.split('/')[0] ?? '';

  const handleDirectory = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const names = Array.from(files, (file) => file.webkitRelativePath || file.name);
    setPaths(names);
    // Limpa o input para permitir reabrir a mesma pasta.
    event.target.value = '';
  };

  return (
    <div className={styles.audit}>
      <label className={styles.fileLabel}>
        Escolher pasta da documentação
        <input
          type="file"
          multiple
          onChange={handleDirectory}
          {...{ webkitdirectory: '', directory: '' }}
        />
      </label>
      <p className={styles.hint}>
        Selecione a pasta <strong>3- DOCUMENTAÇÃO</strong> — comparamos os nomes com o guia
        (seções A–E). Itens condicionais (&quot;se houver&quot;) que não se aplicam ao seu caso
        podem aparecer como não encontrados.
      </p>

      {audit && folderName && (
        <div role="status" className={styles.result}>
          <p className={styles.summary}>
            Pasta &quot;{folderName}&quot;: {audit.found} de {audit.total} itens do checklist
            encontrados.
            {audit.missing > 0 && (
              <>
                {' '}
                <strong>{audit.missing} não encontrados</strong>
              </>
            )}
            {audit.expired > 0 && (
              <>
                {' '}
                <strong className={styles.expiredText}>
                  {audit.expired} vencido{audit.expired > 1 ? 's' : ''}
                </strong>
              </>
            )}
            {audit.expiring > 0 && (
              <>
                {' '}
                <strong className={styles.expiringText}>{audit.expiring} a vencer</strong>
              </>
            )}
            {audit.missing === 0 && audit.expired === 0 && audit.expiring === 0 && (
              <> Tudo certo: nada faltando ou vencendo.</>
            )}
          </p>

          <div className={styles.sections}>
            {audit.sections.map((section) => (
              <div key={section.code} className={styles.section}>
                <p className={styles.sectionTitle}>
                  ({section.code}) {section.title}
                </p>
                <ul className={styles.list}>
                  {section.entries.map((entry) => (
                    <li
                      key={entry.text}
                      className={
                        entry.status === 'missing'
                          ? `${styles.entry} ${styles.isMissing}`
                          : styles.entry
                      }
                    >
                      <span className={styles.mark} aria-hidden="true">
                        {entry.status === 'found' ? '✓' : '✗'}
                      </span>
                      <span>
                        {entry.text}
                        {entry.status === 'missing' ? (
                          <span className={styles.missingTag}> — não encontrado</span>
                        ) : (
                          entry.files.map((file, index) => {
                            const badge = expiryBadge(file.expiry);
                            return (
                              <span key={file.path} className={styles.file}>
                                {index > 0 && ', '}
                                {file.path}
                                {badge && (
                                  <>
                                    {' '}
                                    <em
                                      className={
                                        badge.tone === 'expired'
                                          ? styles.badgeExpired
                                          : styles.badgeExpiring
                                      }
                                    >
                                      ({badge.label})
                                    </em>
                                  </>
                                )}
                              </span>
                            );
                          })
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
