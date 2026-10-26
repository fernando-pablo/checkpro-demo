import * as XLSX from 'xlsx'

const checklistItemsMap = [
  {
    id: 'temp-chave-alimentacao',
    label: 'Temperatura da chave de alimentação',
    unit: '°C'
  },
  {
    id: 'temp-chave-partida',
    label: 'Temperatura da chave de partida',
    unit: '°C'
  },
  {
    id: 'temp-cabo-saida',
    label: 'Temperatura do cabo de saída',
    unit: '°C'
  },
  {
    id: 'temp-ambiente-sala',
    label: 'Temperatura ambiente da sala',
    unit: '°C'
  },
  {
    id: 'corrente-saida',
    label: 'Corrente de saída do equipamento',
    unit: 'A'
  },
  {
    id: 'filtros-porta-painel',
    label: 'Filtros da porta do painel limpos'
  },
  {
    id: 'ruidos-anormais',
    label: 'Ruídos anormais'
  },
  {
    id: 'fixacao-componentes-partida',
    label: 'Fixação dos componentes da partida'
  },
  {
    id: 'aterramento-painel',
    label: 'Aterramento elétrico do painel'
  },
  {
    id: 'sinaleiros-botoes-painel',
    label: 'Sinaleiros e botões do painel'
  }
]

function getResponseValue(record, itemId) {
  return record.responses?.[itemId]?.value ?? ''
}

function getResponseStatus(record, itemId) {
  return record.responses?.[itemId]?.status ?? ''
}

function getResponseObservation(record, itemId) {
  return record.responses?.[itemId]?.observation ?? ''
}

function getNcItems(record) {
  return checklistItemsMap
    .filter((item) => getResponseStatus(record, item.id) === 'NC')
    .map((item) => item.label)
}

function hasAnyNC(record) {
  return getNcItems(record).length > 0
}

function overallStatus(record) {
  if (record.equipmentOperationStatus === 'Parado') {
    return 'Parado'
  }

  return hasAnyNC(record) ? 'Não Conforme' : 'Conforme'
}

function getAllObservations(record) {
  if (record.equipmentOperationStatus === 'Parado') {
    return record.stoppedEquipmentObservation || ''
  }

  return checklistItemsMap
    .map((item) => {
      const observation = getResponseObservation(record, item.id)

      if (!observation) return null

      return `${item.label}: ${observation}`
    })
    .filter(Boolean)
    .join(' | ')
}

function getValueWithUnit(record, item) {
  const value = getResponseValue(record, item.id)

  if (!value) return ''

  return item.unit ? `${value} ${item.unit}` : value
}

export function exportWeekChecklistToExcel(weekLabel, records) {
  if (!records.length) {
    alert('Não existem registros para exportar.')
    return
  }

  const coletasRows = records.map((record) => ({
    Período: weekLabel,
    Data: record.collectedDate,
    'Técnico responsável': record.collectorName || '',
    Turno: record.shift || '',
    Setor: record.sectorName,
    Equipamento: record.equipmentName,
    'Status do equipamento': record.equipmentOperationStatus || '',

    'Temp. chave alimentação (°C)': getResponseValue(
      record,
      'temp-chave-alimentacao'
    ),
    'Temp. chave partida (°C)': getResponseValue(
      record,
      'temp-chave-partida'
    ),
    'Temp. cabo saída (°C)': getResponseValue(record, 'temp-cabo-saida'),
    'Temp. ambiente sala (°C)': getResponseValue(
      record,
      'temp-ambiente-sala'
    ),
    'Corrente saída equipamento (A)': getResponseValue(
      record,
      'corrente-saida'
    ),

    'Situação geral': overallStatus(record),
    Observações: getAllObservations(record),
    Foto: record.imageName || ''
  }))

  const ncRows = records
    .filter((record) => record.equipmentOperationStatus !== 'Parado')
    .flatMap((record) =>
      checklistItemsMap
        .filter((item) => getResponseStatus(record, item.id) === 'NC')
        .map((item) => ({
          Data: record.collectedDate,
          'Técnico responsável': record.collectorName || '',
          Turno: record.shift || '',
          Setor: record.sectorName,
          Equipamento: record.equipmentName,
          'Item NC': item.label,
          Valor: getValueWithUnit(record, item),
          Observação: getResponseObservation(record, item.id),
          'Status da ação': 'Aberta'
        }))
    )

  const stoppedRows = records
    .filter((record) => record.equipmentOperationStatus === 'Parado')
    .map((record) => ({
      Data: record.collectedDate,
      'Técnico responsável': record.collectorName || '',
      Turno: record.shift || '',
      Setor: record.sectorName,
      Equipamento: record.equipmentName,
      Status: 'Parado',
      Observação: record.stoppedEquipmentObservation || ''
    }))

  const total = records.length
  const stoppedCount = records.filter(
    (record) => record.equipmentOperationStatus === 'Parado'
  ).length
  const ncCount = records.filter(hasAnyNC).length
  const conformes = total - ncCount - stoppedCount

  const taxaConformidade = total
    ? `${((conformes / total) * 100).toFixed(1)}%`
    : '0%'

  const resumoRows = [
    {
      Indicador: 'Período da semana',
      Valor: weekLabel
    },
    {
      Indicador: 'Equipamentos coletados',
      Valor: total
    },
    {
      Indicador: 'Equipamentos em funcionamento conformes',
      Valor: conformes
    },
    {
      Indicador: 'Equipamentos não conformes',
      Valor: ncCount
    },
    {
      Indicador: 'Equipamentos parados',
      Valor: stoppedCount
    },
    {
      Indicador: 'Taxa de conformidade',
      Valor: taxaConformidade
    }
  ]

  const workbook = XLSX.utils.book_new()

  const wsColetas = XLSX.utils.json_to_sheet(coletasRows)

  const wsNC = XLSX.utils.json_to_sheet(
    ncRows.length
      ? ncRows
      : [
        {
          Informação: 'Nenhuma não conformidade encontrada'
        }
      ]
  )

  const wsParados = XLSX.utils.json_to_sheet(
    stoppedRows.length
      ? stoppedRows
      : [
        {
          Informação: 'Nenhum equipamento parado registrado'
        }
      ]
  )

  const wsResumo = XLSX.utils.json_to_sheet(resumoRows)

  XLSX.utils.book_append_sheet(workbook, wsColetas, 'Coletas')
  XLSX.utils.book_append_sheet(workbook, wsNC, 'Nao_Conformidades')
  XLSX.utils.book_append_sheet(workbook, wsParados, 'Equipamentos_Parados')
  XLSX.utils.book_append_sheet(workbook, wsResumo, 'Resumo_Semanal')

  const fileName = `CheckPro2_Relatorio_${weekLabel
    .replaceAll('/', '-')
    .replaceAll(' ', '_')}.xlsx`

  XLSX.writeFile(workbook, fileName)
}