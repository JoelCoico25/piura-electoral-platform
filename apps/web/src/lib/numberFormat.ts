export function createNumberFormatter(options: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat('es-PE', options)
}

export const decimalFormat = createNumberFormatter({ minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const integerFormat = createNumberFormatter({ maximumFractionDigits: 0 })
export const idhFormat = createNumberFormatter({ minimumFractionDigits: 3, maximumFractionDigits: 3 })
