export interface OnboardingStep {
  id: 'profile' | 'segment' | 'region' | 'first' | 'radar';
  title: string;
  xp: number;
  options?: readonly string[];
}

export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  { id: 'profile', title: 'Quem é você aqui?', xp: 10, options: ['Quero disputar licitações', 'Quero investir'] },
  { id: 'segment', title: 'O que sua empresa faz?', xp: 20, options: ['Serviços', 'Obras', 'Tecnologia', 'Alimentos e insumos'] },
  { id: 'region', title: 'Onde você quer atuar?', xp: 20, options: ['Minha cidade', 'Meu estado', 'Brasil todo'] },
  // O "momento Magia": um edital já traduzido, em até 60 segundos.
  { id: 'first', title: 'Veja seu primeiro edital', xp: 30 },
  { id: 'radar', title: 'Ative seu radar de editais', xp: 20, options: ['Avisar por e-mail', 'Agora não'] },
];

export const MAGIC_SAMPLE = {
  simple: 'A prefeitura quer contratar uma empresa para cuidar da limpeza das escolas por 12 meses.',
  official:
    'Contratação de empresa especializada na prestação de serviços continuados de limpeza, asseio e conservação predial, com fornecimento de mão de obra e materiais, para as unidades da rede municipal de ensino, pelo período de 12 (doze) meses.',
};
