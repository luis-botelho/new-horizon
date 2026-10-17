import type { KanbanStage } from '@/shared/types/domain';

// Mock local da Fase 1 (sem backend). Datas relativas a "agora" para o prazo sempre parecer vivo.
export interface EditalRecord {
  id: string;
  orgao: string;
  municipio: string;
  uf: string;
  objetoOficial: string;
  objetoSimples: string;
  valorEstimadoCentavos: number;
  publicadoEm: string;
  dataLimite: string;
  stage: KanbanStage;
  documentos: { total: number; prontos: number };
}

const day = 86_400_000;
const at = (offsetDays: number) => new Date(Date.now() + offsetDays * day).toISOString();

function seed(): EditalRecord[] {
  return [
    {
      id: 'ed-001', orgao: 'Prefeitura Municipal', municipio: 'Angra dos Reis', uf: 'RJ',
      objetoOficial: 'Contratação de empresa especializada na prestação de serviços continuados de limpeza, asseio e conservação predial, com fornecimento de mão de obra e materiais, pelo período de 12 meses.',
      objetoSimples: 'Limpeza das escolas municipais por 12 meses.',
      valorEstimadoCentavos: 48_000_000, publicadoEm: at(-10), dataLimite: at(2), stage: 'documents',
      documentos: { total: 7, prontos: 4 },
    },
    {
      id: 'ed-002', orgao: 'Secretaria de Saúde', municipio: 'Volta Redonda', uf: 'RJ',
      objetoOficial: 'Registro de preços para eventual aquisição de material médico-hospitalar de consumo, conforme especificações do Termo de Referência.',
      objetoSimples: 'Compra de luvas, gazes e seringas para os postos de saúde.',
      valorEstimadoCentavos: 21_500_000, publicadoEm: at(-3), dataLimite: at(15), stage: 'radar',
      documentos: { total: 6, prontos: 0 },
    },
    {
      id: 'ed-003', orgao: 'Câmara Municipal', municipio: 'Paraty', uf: 'RJ',
      objetoOficial: 'Contratação de solução de tecnologia da informação para desenvolvimento e manutenção de portal institucional.',
      objetoSimples: 'Fazer e manter o site da Câmara.',
      valorEstimadoCentavos: 9_800_000, publicadoEm: at(-6), dataLimite: at(6), stage: 'analysis',
      documentos: { total: 5, prontos: 1 },
    },
    {
      id: 'ed-004', orgao: 'Prefeitura Municipal', municipio: 'Ubatuba', uf: 'SP',
      objetoOficial: 'Fornecimento parcelado de gêneros alimentícios perecíveis e não perecíveis para a alimentação escolar.',
      objetoSimples: 'Fornecer alimentos para a merenda escolar.',
      valorEstimadoCentavos: 72_300_000, publicadoEm: at(-12), dataLimite: at(1), stage: 'proposal',
      documentos: { total: 8, prontos: 8 },
    },
  ];
}

// Sobrevive ao hot reload do `next dev`. Em produção, o backend real substitui isto.
const g = globalThis as unknown as { __nhEditais?: EditalRecord[] };
export const editaisStore = (g.__nhEditais ??= seed());
