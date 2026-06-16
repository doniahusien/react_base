import type { PaginationMeta } from "./common";

export interface City {
  id: number; name: string;
  created_at: string; is_active: boolean;
}
export interface CityMeta extends PaginationMeta {}
export interface CityData { data: City[]; meta?: CityMeta; }
