export interface BaseColumn {
  ColumnName: string | undefined;
  Alias: string | undefined;
  Literal: string | undefined;
  [key: string]: any;
}
export interface BaseTable {
  TableName: string | null;
  Alias: string;
  Columns: BaseColumn[];
  Schema: string | null;
  [key: string]: any;
  getTable(query?: BaseQuery | null): string;
}
export interface BaseWhere {
  Column: BaseColumn | null;
  Op: string | null;
  Value: any;
  Wheres: BaseWhere[];
}
export enum eEscapeLevels {
  tableAlias = 'table-alias',
  columnAlias = 'column-alias',
  tableName = 'table-name',
  columnName = 'column-name',
}
export interface BaseQuery {
  sqlEscape(str: string, level: eEscapeLevels): string;
}
