'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { editalParsedSchema, type EditalParsed } from '@/shared/types/edital';
import { Button } from '@/shared/ui/Button';
import { detectExportMode, type ExportMode } from '../fs/capabilities';
import { buildExportTree } from '../fs/tree';
import { writeTreeToDirectory } from '../fs/writeDirectory';
import { buildZipBlob } from '../fs/zipFallback';
import {
  buildRootFolderName,
  suggestNumeroSegment,
  suggestOrgaoSegment,
  suggestTipoSegment,
} from '../rules/folderName';
import { resolveItemQuantity } from '@/shared/lib/quantity';
import { DEFAULT_MARKUP, buildWorkbook } from '../spreadsheet/generateWorkbook';
import styles from './NewEditalFlow.module.scss';

type Status = 'idle' | 'exporting' | 'done' | 'error';

function suggestRootFolderName(parsed: EditalParsed): string {
  const meta = parsed.edital;
  return buildRootFolderName({
    numero: suggestNumeroSegment(meta.pncp || meta.pregao),
    orgao: suggestOrgaoSegment(meta.orgao),
    tipo: suggestTipoSegment(meta.objeto),
  });
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function NewEditalFlow() {
  const [jsonText, setJsonText] = useState('');
  const [importIssues, setImportIssues] = useState<string[]>([]);
  const [parsed, setParsed] = useState<EditalParsed | null>(null);
  const [rootFolderName, setRootFolderName] = useState('');
  const [markup, setMarkup] = useState(DEFAULT_MARKUP);
  const [status, setStatus] = useState<Status>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  // Detectado só no cliente (após o mount) para evitar hydration mismatch.
  const [exportMode, setExportMode] = useState<ExportMode>('zip');

  useEffect(() => {
    setExportMode(detectExportMode());
  }, []);

  const divergingItems = useMemo(
    () =>
      (parsed?.itens ?? [])
        .filter((item) => resolveItemQuantity(item).divergence)
        .map((item) => item.item),
    [parsed],
  );

  const importJson = (raw: string): void => {
    setJsonText(raw);
    setImportIssues([]);
    try {
      const result = editalParsedSchema.safeParse(JSON.parse(raw));
      if (!result.success) {
        setParsed(null);
        setImportIssues(result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`));
        return;
      }
      setParsed(result.data);
      setRootFolderName(suggestRootFolderName(result.data));
    } catch (error) {
      setParsed(null);
      setImportIssues([error instanceof Error ? error.message : 'JSON inválido']);
    }
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;
    void file.text().then(importJson);
  };

  const handleImport = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    importJson(jsonText);
  };

  const handleExport = async (): Promise<void> => {
    if (!parsed) return;
    setStatus('exporting');
    setStatusMessage('');

    try {
      const workbookBytes = new Uint8Array(await buildWorkbook(parsed, { markup }).xlsx.writeBuffer());
      const tree = buildExportTree(parsed, rootFolderName, workbookBytes);

      if (exportMode === 'file-system-access') {
        const directory = await window.showDirectoryPicker();
        const result = await writeTreeToDirectory(directory, tree);
        setStatus('done');
        setStatusMessage(
          `Pasta "${rootFolderName}" criada em "${directory.name}" com ${result.filesWritten} arquivos.`,
        );
      } else {
        const zipName = `${rootFolderName}.zip`;
        downloadBlob(await buildZipBlob(tree), zipName);
        setStatus('done');
        setStatusMessage(`Baixamos "${zipName}". Descompacte e renomeie a pasta se o sistema sugerir outro nome.`);
      }
    } catch (error) {
      // Cancelar o seletor de pasta não é erro: só volta ao estado ocioso.
      if (error instanceof DOMException && error.name === 'AbortError') {
        setStatus('idle');
        return;
      }
      setStatus('error');
      setStatusMessage(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <div className={styles.flow}>
      <section className={styles.step} aria-labelledby="passo-importar">
        <h2 id="passo-importar">1. Importe o edital (JSON)</h2>
        <p className={styles.hint}>
          Cole o JSON do edital ou escolha um arquivo. Nada sai do seu navegador.
        </p>
        <form onSubmit={handleImport} className={styles.importForm}>
          <label className={styles.fileLabel}>
            Escolher arquivo
            <input type="file" accept="application/json,.json" onChange={handleFile} />
          </label>
          <textarea
            className={styles.textarea}
            value={jsonText}
            onChange={(event) => setJsonText(event.target.value)}
            rows={6}
            placeholder='{"edital": {…}, "empresas": […], "itens": […]}'
            aria-label="JSON do edital"
          />
          <Button type="submit">Analisar</Button>
        </form>
        {importIssues.length > 0 && (
          <div role="alert" className={styles.issues}>
            <p>O JSON não passou na validação:</p>
            <ul>
              {importIssues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {parsed && (
        <section className={styles.step} aria-labelledby="passo-revisar">
          <h2 id="passo-revisar">2. Revise</h2>
          <dl className={styles.summary}>
            <div>
              <dt>Pregão</dt>
              <dd>
                {parsed.edital.pregao}
                {parsed.edital.pncp && ` · PNCP ${parsed.edital.pncp}`}
              </dd>
            </div>
            <div>
              <dt>Órgão</dt>
              <dd>{parsed.edital.orgao}</dd>
            </div>
            <div>
              <dt>Objeto</dt>
              <dd>{parsed.edital.objeto}</dd>
            </div>
            <div>
              <dt>Sessão</dt>
              <dd>{parsed.edital.sessao.replace('T', ' às ')}</dd>
            </div>
            <div>
              <dt>Empresas</dt>
              <dd>{parsed.empresas.map((empresa) => empresa.porta).join(', ')}</dd>
            </div>
            <div>
              <dt>Itens</dt>
              <dd>{parsed.itens.length}</dd>
            </div>
          </dl>

          {divergingItems.length > 0 && (
            <p role="status" className={styles.warning}>
              Atenção: itens {divergingItems.join(', ')} com quantidade divergente entre a célula e o
              rateio — a planilha usa a soma do rateio.
            </p>
          )}

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">QT</th>
                  <th scope="col">Unid.</th>
                  <th scope="col">Descrição</th>
                  <th scope="col">Rateio (SDSP/SPDC/Outras)</th>
                </tr>
              </thead>
              <tbody>
                {parsed.itens.map((item) => {
                  const { quantity, divergence } = resolveItemQuantity(item);
                  return (
                    <tr key={item.item} className={divergence ? styles.divergent : undefined}>
                      <td>{item.item}</td>
                      <td>{quantity}</td>
                      <td>{item.unid}</td>
                      <td className={styles.description}>{item.descricao}</td>
                      <td>
                        {item.qtd_sdsp} / {item.qtd_spdc} / {item.qtd_outras}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.fields}>
            <label>
              Nome da pasta
              <input
                value={rootFolderName}
                onChange={(event) => setRootFolderName(event.target.value)}
                aria-label="Nome da pasta raiz"
              />
            </label>
            <label>
              Markup (ex.: 0.30 = +30%)
              <input
                type="number"
                min={0}
                step={0.01}
                value={markup}
                onChange={(event) => setMarkup(Number(event.target.value))}
                aria-label="Markup sobre o custo"
              />
            </label>
          </div>
        </section>
      )}

      {parsed && (
        <section className={styles.step} aria-labelledby="passo-exportar">
          <h2 id="passo-exportar">3. Exporte</h2>
          <p className={styles.hint}>
            {exportMode === 'file-system-access'
              ? 'Vamos criar a árvore de pastas dentro do diretório que você escolher (Chrome/Edge).'
              : 'Seu navegador não permite criar pastas direto: vamos baixar um .zip com a árvore pronta.'}
          </p>
          <Button onClick={() => void handleExport()} disabled={status === 'exporting'}>
            {status === 'exporting' ? 'Gerando…' : 'Gerar pasta e planilha'}
          </Button>
          <p role="status" aria-live="polite" className={styles.status}>
            {statusMessage}
          </p>
          {status === 'error' && (
            <div role="alert" className={styles.issues}>
              <p>Não conseguimos exportar: {statusMessage}</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
