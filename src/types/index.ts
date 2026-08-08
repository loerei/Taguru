export interface SavedTab {
  url: string;
  title: string;
  favIconUrl?: string;
}

export interface SavedGroup {
  id: string;
  name: string;
  createdAt: number;
  tabs: SavedTab[];
}

export interface SortOptions {
  groupByDomain: boolean;
  sortByCharRank: boolean;
  sortByPathSegments: boolean;
  sortByQueryAndHash: boolean;
  autoReFso?: boolean;
  dragMode?: 'reFso' | 'mbd' | 'off';
}
