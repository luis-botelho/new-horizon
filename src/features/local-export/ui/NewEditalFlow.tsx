'use client';

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react';
import {
  editalParsedSchema,
  type EditalDraft,
  type ProponentCompany,
} from '@/shared/types/edital';
import { Button } from '@/shared/ui/Button';
import { detectExportMode, type ExportMode } from '../fs/capabilities';
import { buildExportTree } from '../fs/tree';
import { writeTreeToDirectory } from '../fs/writeDirectory';
import { buildZipBlob } from '../fs/zipFallback';
import { suggestRootFolderName } from '../rules/folderName';
import {
  emptyItemForm,
  formToMeta,
  itemFormToItem,
  itemToForm,
  metaToForm,
  nextItemNumber,
  patchForm,
  patchItemForm,
  type ItemForm,
  type MetaForm,
} from '../rules/draftForm';
import { resolveItemQuantity } from '@/shared/lib/quantity';
import { DEFAULT_MARKUP, buildWorkbook } from '../spreadsheet/generateWorkbook';
import { DocumentAudit } from './DocumentAudit';
import styles from './NewEditalFlow.module.scss';

type Status = 'idle' | 'exporting' | 'done' | 'error';

/** Rascunho em revisão: meta e itens formatados como form + empresas. */
interface ReviewDraft {
  form: MetaForm;
  empresas: ProponentCompany[];
  itens: ItemForm[];
  /** Avisos da origem (parser do PDF, leitura do JSON) exibidos na revisão. */
  issues: string[];
}

export interface ImportSlotProps {
  onImport: (draft: EditalDraft) => void;
}

export interface NewEditalFlowProps {
  /** Slot acima do JSON no passo 1 — ex.: leitura de PDF (feature edital-parser). */
  renderImportSlot?: (props: ImportSlotProps) => ReactNode;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function NewEditalFlow({ renderImportSlot }: NewEditalFlowProps) {
  const [jsonText, setJsonText] = useState('');
  const [importIssues, setImportIssues] = useState<string[]>([]);
  const [draft, setDraft] = useState<ReviewDraft | null>(null);
  const [exportIssues, setExportIssues] = useState<string[]>([]);
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
      (draft?.itens ?? [])
        .map(itemFormToItem)
        .filter((item) => resolveItemQuantity(item).divergence)
        .map((item) => item.item),
    [draft],
  );

  const applyDraft = (incoming: EditalDraft): void => {
    setDraft({
      form: metaToForm(incoming.meta),
      empresas: incoming.empresas,
      itens: incoming.itens.map(itemToForm),
      issues: incoming.issues,
    });
    setExportIssues([]);
    const suggested = suggestRootFolderName(incoming.meta);
    if (suggested) setRootFolderName(suggested);
  };

  const importJson = (raw: string): void => {
    setJsonText(raw);
    setImportIssues([]);
    try {
      const result = editalParsedSchema.safeParse(JSON.parse(raw));
      if (!result.success) {
        setDraft(null);
        setImportIssues(result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`));
        return;
      }
      applyDraft({
        meta: result.data.edital,
        empresas: result.data.empresas,
        itens: result.data.itens,
        issues: [],
      });
    } catch (error) {
      setDraft(null);
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

  const updateForm = (key: keyof MetaForm, value: string): void => {
    setExportIssues([]);
    setDraft((current) => (current ? { ...current, form: patchForm(current.form, key, value) } : current));
  };

  const updateItem = (index: number, key: keyof ItemForm, value: string): void => {
    setExportIssues([]);
    setDraft((current) =>
      current ? { ...current, itens: patchItemForm(current.itens, index, key, value) } : current,
    );
  };

  const removeItem = (index: number): void => {
    setExportIssues([]);
    setDraft((current) =>
      current ? { ...current, itens: current.itens.filter((_, position) => position !== index) } : current,
    );
  };

  const addItem = (): void => {
    setDraft((current) =>
      current
        ? { ...current, itens: [...current.itens, emptyItemForm(nextItemNumber(current.itens))] }
        : current,
    );
  };

  const handleExport = async (): Promise<void> => {
    if (!draft) return;
    // A revisão só vira contrato validado aqui: o Zod decide se pode exportar.
    const validation = editalParsedSchema.safeParse({
      edital: formToMeta(draft.form),
      empresas: draft.empresas,
      itens: draft.itens.map(itemFormToItem),
    });
    if (!validation.success) {
      setExportIssues(validation.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`));
      return;
    }
    if (!rootFolderName.trim()) {
      setExportIssues(['Informe o nome da pasta raiz.']);
      return;
    }
    setExportIssues([]);
    const parsed = validation.data;

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

  const hasSlot = renderImportSlot !== undefined;

  return (
    <div className={styles.flow}>
      <section className={styles.step} aria-labelledby="passo-importar">
        <h2 id="passo-importar">1. Importe o edital</h2>
        <p className={styles.hint}>
          {hasSlot
            ? 'Leia o PDF do edital ou cole o JSON pronto — a leitura acontece só no seu navegador.'
            : 'Cole o JSON do edital ou escolha um arquivo. Nada sai do seu navegador.'}
        </p>
        {renderImportSlot?.({ onImport: applyDraft })}
        {hasSlot && <h3 className={styles.subheading}>Ou cole o JSON</h3>}
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

      {draft && (
        <section className={styles.step} aria-labelledby="passo-revisar">
          <h2 id="passo-revisar">2. Revise</h2>
          <p className={styles.hint}>
            {draft.empresas.map((empresa) => `${empresa.apelido} (${empresa.porta})`).join(', ')} ·{' '}
            {draft.itens.length} {draft.itens.length === 1 ? 'item' : 'itens'}
          </p>

          <div className={styles.fields}>
            <label>
              Pregão
              <input value={draft.form.pregao} onChange={(event) => updateForm('pregao', event.target.value)} />
            </label>
            <label>
              PNCP
              <input value={draft.form.pncp} onChange={(event) => updateForm('pncp', event.target.value)} />
            </label>
            <label>
              Processo SEI
              <input
                value={draft.form.processo_sei}
                onChange={(event) => updateForm('processo_sei', event.target.value)}
              />
            </label>
            <label>
              UASG
              <input value={draft.form.uasg} onChange={(event) => updateForm('uasg', event.target.value)} />
            </label>
            <label>
              Órgão
              <input value={draft.form.orgao} onChange={(event) => updateForm('orgao', event.target.value)} />
            </label>
            <label>
              Objeto
              <input value={draft.form.objeto} onChange={(event) => updateForm('objeto', event.target.value)} />
            </label>
            <label>
              Sessão
              <input
                type="datetime-local"
                value={draft.form.sessao}
                onChange={(event) => updateForm('sessao', event.target.value)}
              />
            </label>
            <label>
              Plataforma
              <input
                value={draft.form.plataforma}
                onChange={(event) => updateForm('plataforma', event.target.value)}
              />
            </label>
            <label>
              Critério
              <input value={draft.form.criterio} onChange={(event) => updateForm('criterio', event.target.value)} />
            </label>
            <label>
              Modo
              <input value={draft.form.modo} onChange={(event) => updateForm('modo', event.target.value)} />
            </label>
            <label>
              Orçamento
              <input
                value={draft.form.orcamento}
                onChange={(event) => updateForm('orcamento', event.target.value)}
              />
            </label>
            <label>
              Validade da proposta (dias)
              <input
                type="number"
                min={1}
                step={1}
                value={draft.form.validade_proposta_dias}
                onChange={(event) => updateForm('validade_proposta_dias', event.target.value)}
              />
            </label>
            <label>
              Prazo de entrega (dias)
              <input
                type="number"
                min={1}
                step={1}
                value={draft.form.entrega_dias}
                onChange={(event) => updateForm('entrega_dias', event.target.value)}
              />
            </label>
            <label>
              Prazo de pagamento (dias)
              <input
                type="number"
                min={1}
                step={1}
                value={draft.form.pagamento_dias}
                onChange={(event) => updateForm('pagamento_dias', event.target.value)}
              />
            </label>
            <label>
              Garantia (meses)
              <input
                type="number"
                min={1}
                step={1}
                value={draft.form.garantia_meses}
                onChange={(event) => updateForm('garantia_meses', event.target.value)}
              />
            </label>
            <label>
              Observações
              <textarea
                rows={3}
                value={draft.form.observacoes}
                onChange={(event) => updateForm('observacoes', event.target.value)}
              />
            </label>
          </div>

          {draft.issues.length > 0 && (
            <div role="status" className={styles.warning}>
              <p>O leitor sinalizou pontos para revisar:</p>
              <ul>
                {draft.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

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
                  <th scope="col">Rateio (SDSP / SPDC / Outras)</th>
                  <th scope="col">
                    <span className={styles.visuallyHidden}>Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {draft.itens.map((itemForm, index) => {
                  const { quantity, divergence } = resolveItemQuantity(itemFormToItem(itemForm));
                  const rowLabel = `item ${itemForm.item || index + 1}`;
                  return (
                    <tr key={index} className={divergence ? styles.divergent : undefined}>
                      <td>
                        <input
                          className={styles.cellInput}
                          type="number"
                          min={1}
                          step={1}
                          value={itemForm.item}
                          onChange={(event) => updateItem(index, 'item', event.target.value)}
                          aria-label={`Número do ${rowLabel}`}
                        />
                      </td>
                      <td>{quantity}</td>
                      <td>
                        <input
                          className={styles.cellInput}
                          value={itemForm.unid}
                          onChange={(event) => updateItem(index, 'unid', event.target.value)}
                          aria-label={`Unidade do ${rowLabel}`}
                        />
                      </td>
                      <td className={styles.description}>
                        <input
                          className={styles.cellInput}
                          value={itemForm.descricao}
                          onChange={(event) => updateItem(index, 'descricao', event.target.value)}
                          aria-label={`Descrição do ${rowLabel}`}
                        />
                      </td>
                      <td>
                        <div className={styles.rateioInputs}>
                          <input
                            className={styles.cellInput}
                            type="number"
                            min={0}
                            step="any"
                            value={itemForm.qtd_sdsp}
                            onChange={(event) => updateItem(index, 'qtd_sdsp', event.target.value)}
                            aria-label={`Quantidade SDSP do ${rowLabel}`}
                          />
                          <input
                            className={styles.cellInput}
                            type="number"
                            min={0}
                            step="any"
                            value={itemForm.qtd_spdc}
                            onChange={(event) => updateItem(index, 'qtd_spdc', event.target.value)}
                            aria-label={`Quantidade SPDC do ${rowLabel}`}
                          />
                          <input
                            className={styles.cellInput}
                            type="number"
                            min={0}
                            step="any"
                            value={itemForm.qtd_outras}
                            onChange={(event) => updateItem(index, 'qtd_outras', event.target.value)}
                            aria-label={`Quantidade outras do ${rowLabel}`}
                          />
                        </div>
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          onClick={() => removeItem(index)}
                          aria-label={`Excluir o ${rowLabel}`}
                        >
                          Excluir
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Button variant="ghost" onClick={addItem}>
            Adicionar item
          </Button>

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

      {draft && (
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
          {exportIssues.length > 0 && (
            <div role="alert" className={styles.issues}>
              <p>Complete a revisão antes de exportar:</p>
              <ul>
                {exportIssues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
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

      <section className={styles.step} aria-labelledby="passo-auditar">
        <h2 id="passo-auditar">4. Conferir guia × arquivos</h2>
        <p className={styles.hint}>
          Bate os arquivos da pasta 3- DOCUMENTAÇÃO com o checklist do guia e alerta faltantes e
          vencimentos. Somente nomes de arquivo são lidos — nada sai do seu navegador.
        </p>
        <DocumentAudit />
      </section>
    </div>
  );
}
