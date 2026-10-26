export const painelCcmTemplate = {
  id: 'painel_ccm_padrao',
  name: 'Painel CCM padrão',
  fields: [
    {
      id: 'temp-chave-alimentacao',
      label: 'Temperatura da chave de alimentação (°C)',
      kind: 'measurement-auto-status',
      inputType: 'number',
      unit: '°C',
      required: true,
      rule: {
        operator: '<=',
        limit: 80,
        okLabel: 'C',
        notOkLabel: 'NC'
      }
    },
    {
      id: 'temp-chave-partida',
      label: 'Temperatura da chave de partida (°C)',
      kind: 'measurement-auto-status',
      inputType: 'number',
      unit: '°C',
      required: true,
      rule: {
        operator: '<=',
        limit: 80,
        okLabel: 'C',
        notOkLabel: 'NC'
      }
    },
    {
      id: 'temp-cabo-saida',
      label: 'Temperatura do cabo de saída (°C)',
      kind: 'measurement-auto-status',
      inputType: 'number',
      unit: '°C',
      required: true,
      rule: {
        operator: '<=',
        limit: 70,
        okLabel: 'C',
        notOkLabel: 'NC'
      }
    },
    {
      id: 'temp-ambiente-sala',
      label: 'Temperatura ambiente da sala (°C)',
      kind: 'measurement-auto-status',
      inputType: 'number',
      unit: '°C',
      required: true,
      rule: {
        operator: '<=',
        limit: 32,
        okLabel: 'C',
        notOkLabel: 'NC'
      }
    },
    {
      id: 'corrente-saida',
      label: 'Corrente de saída do equipamento (A)',
      kind: 'measurement-manual-status',
      inputType: 'number',
      unit: 'A',
      required: true,
      statusRequired: true,
      statusOptions: ['C', 'NC'],
      helpText:
        'Inserir o valor da corrente e marcar C ou NC conforme a corrente nominal do motor.'
    },
    {
      id: 'filtros-porta-painel',
      label: 'Filtros da porta do painel limpos',
      kind: 'status-only',
      required: true,
      statusOptions: ['C', 'NC']
    },
    {
      id: 'ruidos-anormais',
      label: 'Ruídos anormais',
      kind: 'status-only',
      required: true,
      statusOptions: ['C', 'NC']
    },
    {
      id: 'fixacao-componentes-partida',
      label: 'Fixação dos componentes da partida',
      kind: 'status-only',
      required: true,
      statusOptions: ['C', 'NC']
    },
    {
      id: 'aterramento-painel',
      label: 'Aterramento elétrico do painel',
      kind: 'status-only',
      required: true,
      statusOptions: ['C', 'NC']
    },
    {
      id: 'sinaleiros-botoes-painel',
      label: 'Sinaleiros e botões do painel',
      kind: 'status-only',
      required: true,
      statusOptions: ['C', 'NC']
    }
  ]
}