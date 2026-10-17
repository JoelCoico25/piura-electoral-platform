import TerritorySelectorFields from '../TerritorySelectorFields/TerritorySelectorFields'
import type { SelectorProps } from '../TerritorySelectorFields/TerritorySelectorFields'

const TerritorySelectors = (props: SelectorProps) => {
  return <TerritorySelectorFields key={props.province?.ubigeo ?? 'none'} {...props} />
}

export default TerritorySelectors
