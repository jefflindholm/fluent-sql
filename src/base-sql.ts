export interface BaseColumn {
  ColumnName: string;
  Alias: string | null;
  Literal: string | null;
  [key: string]: any;
}
export interface BaseTable {
  _tableName: string|null;
  _alias: string | null;
  _columns: BaseColumn[];
  _schema: string | null;
  [key: string]: any;
}
export interface BaseWhere {
  Column: BaseColumn | null;
  Op: string | null;
  Value: any;
  Wheres: BaseWhere[];
}
export enum eEscapeLevels {
  table = 'table-alias',
  column = 'column-alias'
}
export interface BaseQuery {
  sqlEscape(str: string, level: eEscapeLevels): string;
  create(): BaseQuery;
}
