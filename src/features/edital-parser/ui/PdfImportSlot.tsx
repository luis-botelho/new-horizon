'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { Button } from '@/shared/ui/Button';
import { extractPdfText } from '../pdf/extractPdfText';
import { parseEditalText, type ParsedEditalText } from '../text/parseEditalText';
import styles from './PdfImportSlot.module.scss';

export interface PdfImportSlotProps {
  /** Resultado cru do leitor — quem monta o rascunho é a composição. */
  onParsed: (parsed: ParsedEditalText) => void;
}

/**
 * Passo 1 do fluxo de importação por PDF: escolhe o arquivo, extrai o texto
 * (pdfjs-dist roda aqui no navegador) e entrega ao parser puro. Nada sobe a rede.
 */
export function PdfImportSlot({ onParsed }: PdfImportSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    // Limpa antes do await: permite reescolher o mesmo arquivo em seguida.
    event.target.value = '';
    if (!file) return;
    setReading(true);
    setError('');
    void file
      .arrayBuffer()
      .then(extractPdfText)
      .then((text) => {
        onParsed(parseEditalText(text));
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : 'Não conseguimos ler este PDF.');
      })
      .finally(() => {
        setReading(false);
      });
  };

  return (
    <div className={styles.slot}>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFile}
        className={styles.file}
        tabIndex={-1}
        aria-hidden="true"
      />
      <Button onClick={() => inputRef.current?.click()} disabled={reading}>
        {reading ? 'Lendo o PDF…' : 'Ler PDF do edital'}
      </Button>
      {reading && (
        <p role="status" className={styles.status}>
          Extraindo o texto no seu navegador — pode levar uns segundos.
        </p>
      )}
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
