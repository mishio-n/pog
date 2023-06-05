import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const GenderCategory = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const;
export type GenderCategory = (typeof GenderCategory)[keyof typeof GenderCategory];
export const Region = {
  MIHO: "MIHO",
  RITTO: "RITTO",
  NRA: "NRA",
} as const;
export type Region = (typeof Region)[keyof typeof Region];
export const Course = {
  TURF: "TURF",
  DART: "DART",
} as const;
export type Course = (typeof Course)[keyof typeof Course];
export const Grade = {
  CLASSIC: "CLASSIC",
  G1: "G1",
  G2: "G2",
  G3: "G3",
  NORMAL: "NORMAL",
} as const;
export type Grade = (typeof Grade)[keyof typeof Grade];
export type Horse = {
  id: Generated<number>;
  name: string;
  url: string;
  genderCategory: GenderCategory;
  stable: string;
  region: Region;
};
export type Owner = {
  id: Generated<number>;
  name: string;
  seasonId: number;
  ruleId: number;
};
export type Race = {
  id: Generated<number>;
  race: string;
  odds: number;
  point: number;
  result: number;
  horseId: number;
  date: Timestamp;
  course: Course;
  grade: Grade;
};
export type Rule = {
  id: Generated<number>;
  name: string;
  description: string;
  isOdds: boolean;
  isDart: boolean;
};
export type Season = {
  id: Generated<number>;
  name: string;
};
export type DB = {
  Horse: Horse;
  Owner: Owner;
  Race: Race;
  Rule: Rule;
  Season: Season;
};
