type ExplorerModule = {
  default: typeof import('../features/explorer/ExplorerPage/ExplorerPage').default
}

let explorerPromise: Promise<ExplorerModule> | undefined

export function loadExplorerPage(): Promise<ExplorerModule> {
  explorerPromise ??= import('../features/explorer/ExplorerPage/ExplorerPage')
    .then(module => ({ default: module.default }))
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
