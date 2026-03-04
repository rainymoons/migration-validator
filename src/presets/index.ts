import { DatasetPreset, DatasetType } from "../core/types";
import { memberPreset } from "./memberPreset";
import { orderPreset } from "./orderPreset";

const presetMap: Record<DatasetType, DatasetPreset<any>> = {
  member: memberPreset,
  order: orderPreset,
};

export function getPreset(type: DatasetType): DatasetPreset<any> {
  return presetMap[type];
}
