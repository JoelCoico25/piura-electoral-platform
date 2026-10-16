type ExplorerModule = {
  default: typeof import('../features/explorer/ExplorerPage').ExplorerPage
}

let explorerPromise: Promise<ExplorerModule> | undefined

export function loadExplorerPage(): Promise<ExplorerModule> {
  explorerPromise ??= import('../features/explorer/ExplorerPage')
    .then(module => ({ default: module.ExplorerPage }))
    .catch(error => {
      explorerPromise = undefined
      throw error
    })
  return explorerPromise
}

export function preloadExplorerPage() {
  void loadExplorerPage().catch(() => {
    // A failed prefetch should not interrupt the page; navigation can retry.
  })
}
