export const cameraDurationMs = 650
export const layerDurationMs = 275
export const territoryPane = 'territories'
export const contextPane = 'territory-context'

export function shouldAnimateTransition(previous: string | null, next: string, reducedMotion: boolean) {
  return previous !== null && previous !== next && !reducedMotion
}
