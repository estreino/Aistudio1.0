export type TabId =
  | 'today'
  | 'diary'
  | 'nutrition'
  | 'workout'
  | 'sleep'
  | 'analytics'
  | 'assistant'
  | 'settings';

export interface TabConfig {
  id: TabId;
  label: string;
  shortLabel: string;
  iconName: string;
  category: 'primary' | 'secondary';
  description: string;
}

export const NAVIGATION_TABS: TabConfig[] = [
  {
    id: 'today',
    label: 'Hoje',
    shortLabel: 'Hoje',
    iconName: 'LayoutDashboard',
    category: 'primary',
    description: 'Resumo e indicadores diários em tempo real',
  },
  {
    id: 'diary',
    label: 'Diário',
    shortLabel: 'Diário',
    iconName: 'BookOpen',
    category: 'primary',
    description: 'Linha do tempo cronológica com filtros',
  },
  {
    id: 'nutrition',
    label: 'Alimentação',
    shortLabel: 'Comida',
    iconName: 'Utensils',
    category: 'primary',
    description: 'Catálogo SVG e montagem de refeições',
  },
  {
    id: 'workout',
    label: 'Treino',
    shortLabel: 'Treino',
    iconName: 'Dumbbell',
    category: 'primary',
    description: 'Sessões, exercícios, séries e cargas',
  },
  {
    id: 'sleep',
    label: 'Sono',
    shortLabel: 'Sono',
    iconName: 'Moon',
    category: 'primary',
    description: 'Duração, qualidade e horário de despertar',
  },
  {
    id: 'analytics',
    label: 'Análises',
    shortLabel: 'Análises',
    iconName: 'TrendingUp',
    category: 'secondary',
    description: 'Médias semanais e cruzamento de padrões',
  },
  {
    id: 'assistant',
    label: 'Assistente',
    shortLabel: 'Assistente',
    iconName: 'Sparkles',
    category: 'secondary',
    description: 'Rascunhos e perguntas sobre a rotina',
  },
  {
    id: 'settings',
    label: 'Configurações',
    shortLabel: 'Ajustes',
    iconName: 'Settings',
    category: 'secondary',
    description: 'Perfil, metas, backups e privacidade',
  },
];
