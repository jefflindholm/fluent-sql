import './string.extensions';

import SqlTable from './sql-table';
import SqlWhere from './sql-where';
import { BaseTable } from './base-sql';
import SqlQuery, {
  getDefaultOptions
} from './sql-query';

export interface SearchDetails {
  select: string;
  columns: string;
  filter: string;
  orderBy: string;
  pageNo: number;
  pageSize: number;
}
export enum udOperation {
  update,
  delete
}
// TODO: make encryptFunction have a better signature
/**
* @param operation - update/delete
* @param BaseTable - SqlTable to perform operation on
* @param details - object of columns with values { id: 1, name: 'jeff' }
* @param encryptFunction - will be executed on each value to add if present (columnName, value)
**/
function updateDelete(operation: udOperation, sqlTable: BaseTable, details: any, encryptFunction: any) {
  if (!(sqlTable instanceof SqlTable)) {
    throw {
      location: 'SqlBuilder::update',
      message: 'sqlTable is not an instance of SqlTable'
    }; // eslint-disable-line
  }
  const options = getDefaultOptions();
  const isArray = !options.namedValues || options.markerType === 'number';
  const data: any = isArray ? [] : {};
  if (details.id) {
    if (!isArray) {
      data.id = details.id;
    } else {
      data.push(details.id);
    }
  }
  const sep = operation === udOperation.update ? ',' : ' AND ';
  let hasEncryptedValues = false;
  let item = 1;
  let columns = '';
  let attr;
  let variable;
  let encrypted;
  let column;
  for (attr in details) { // eslint-disable-line no-restricted-syntax
    if (details.hasOwnProperty(attr) && attr !== 'id' && sqlTable.hasOwnProperty(attr)) {
      column = (sqlTable as BaseTable)[attr];
      if (isArray) {
        variable = (item + 1).toString();
        data.push(details[attr]);
      } else {
        variable = attr + item.toString();
        data[variable] = details[attr];
      }
      encrypted = (encryptFunction ? encryptFunction(column, variable) : null);
      variable = encrypted || `${options.namedValueMarker}${variable}`;
      if (encrypted != null) {
        hasEncryptedValues = true;
      }
      columns += `${(item === 1 ? '' : sep)}${attr.toSnakeCase()} = ${variable}`;
      item += 1;
    }
  }
  let sql;
  if (operation === udOperation.update) {
    if (isArray) {
      sql = `UPDATE ${sqlTable.getTable(null)} SET ${columns} WHERE id = ${options.namedValueMarker}1`;
    } else {
      sql = `UPDATE ${sqlTable.getTable(null)} SET ${columns} WHERE id = ${options.namedValueMarker}id`;
    }
  } else {
    if (details.id) {
      if (isArray) {
        columns += `${(item === 1 ? '' : sep)}id = ${options.namedValueMarker}1`;
      } else {
        columns += `${(item === 1 ? '' : sep)}id = ${options.namedValueMarker}id`;
      }
    }
    sql = `DELETE FROM ${sqlTable.getTable(null)} WHERE ${columns}`;
  }
  return {
    sql,
    values: data,
    hasEncrypted: hasEncryptedValues,
  };
}

function buildWhere(filterString: string, sqlTable: BaseTable): SqlWhere {
  let where: SqlWhere | null = null;
  if (filterString) {
    const ors = filterString.split(';');

    ors.forEach((orFilter) => {
      const filters = orFilter.split(',');
      let whereClause: SqlWhere | null = null
      filters.forEach((filter) => {
        const parts = filter.split('.');
        const attr = parts[0];
        const op = parts[1];
        const val1 = parts[2];
        const val2 = parts.length > 3 ? parts[3] : null;
        if (sqlTable.hasOwnProperty(attr)) {
          const tmpClause = (sqlTable as BaseTable)[attr].op(op, val1, val2);
          if (whereClause) {
            whereClause = whereClause.and(tmpClause);
          } else {
            whereClause = tmpClause;
          }
        } else {
          throw { location: 'SqlBuilder:buildWhere', message: (`unknown column ${attr} in table ${sqlTable.TableName} from where clause`) }
        }
      });
      if (!whereClause) {
        throw { location: 'SqlBuilder:buildWhere', message: "Somehow adding NULL whereClause" };
      }
      if (where) {
        where = where.or(whereClause);
      } else {
        where = whereClause;
      }
    });
  }
  if (!where) {
    throw { location: 'SqlBuilder:buildWhere', message: "Somehow returning NULL where" };
  }
  return where;
}

export default class SqlBuilder {
  static update(sqlTable: BaseTable, details: any, encryptFunction?: any) {
    return updateDelete(udOperation.update, sqlTable, details, encryptFunction);
  }
  static delete(sqlTable: BaseTable, details: any, encryptFunction?: any) {
    return updateDelete(udOperation.delete, sqlTable, details, encryptFunction);
  }
  static insert(sqlTable: BaseTable, details: any, newId?: any, encryptFunction?: any) {
    if (!(sqlTable instanceof SqlTable)) {
      throw {
        location: 'SqlBuilder::insert',
        message: 'sqlTable is not an instance of SqlTable'
      }; //eslint-disable-line
    }
    const options = getDefaultOptions();
    const isArray = !options.namedValues || options.markerType === 'number';
    let item = 1;
    const data: any = isArray ? [] : {};
    let variable;
    let encrypted;
    let column;
    let columnList = '';
    let variableList = '';
    let hasEncryptedValues = false;
    for (const attr in details) { // eslint-disable-line no-restricted-syntax
      if (details.hasOwnProperty(attr) && attr !== 'id' && sqlTable.hasOwnProperty(attr)) {
        column = (sqlTable as BaseTable)[attr]
        if (isArray) {
          variable = item.toString();
          data.push(details[attr]);
        } else {
          variable = attr + item.toString();
          data[variable] = details[attr];
        }
        columnList += (item === 1 ? '' : ',') + attr.toSnakeCase();
        encrypted = (encryptFunction ? encryptFunction(column, variable) : null);
        variable = encrypted || `${options.namedValueMarker}${variable}`;
        if (encrypted != null) {
          hasEncryptedValues = true;
        }
        variableList += `${(item === 1 ? '' : ',')}${variable}`;
        item += 1;
      }
    }
    if (newId) {
      columnList += ', id';
      if (isArray) {
        variableList += `, ${options.namedValueMarker}${item}`;
        data.push(newId);
      } else {
        variableList += `, ${options.namedValueMarker}id`;
        data.id = newId;
      }
    }

    return {
      sql: `INSERT INTO ${sqlTable.getTable(null)} (${columnList}) VALUES (${variableList})`,
      values: data,
      hasEncrypted: hasEncryptedValues,
    };
  }
  /**
   * @param {sqlTable} - SqlTable instance for the table to build the update for
   * @param {searchDetails} - object
   *  - select = columns to select from the table (comma separated)
   *  - filter =
   *      = string - where clause column.OP.value,... comma = AND'ed semi-colon = OR'ed
   *          example:
   *                 { select: 'key.gt.9;key.lt.2' } = key > 9 OR key < 2
   *                 { select: 'key.gt.9,name.like.foo;key.lt2 } = (key > 9 AND name like '%foo%') OR (key < 2)
   *      = array of string - column.OP.value... will be OR'ed with each other string
   *  - orderBy = column;[ASC|DESC],...
   *  - pageNo = which page to fetch of paged data defaults to 1st
   *  - pageSize = how much data per page defaults to 50
   */

  static search(sqlTable: BaseTable, searchDetails: SearchDetails) {
    const query = new SqlQuery(null);
    query.from(sqlTable);
    const searchColumns = searchDetails.columns || searchDetails.select;
    if (searchColumns) {
      let columns = null;
      if (Array.isArray(searchColumns)) {
        columns = searchColumns;
      } else {
        columns = searchColumns.split(',');
      }
      columns.forEach((c: string) => {
        if (sqlTable.hasOwnProperty(c.toCamel())) {
          query.select((sqlTable as BaseTable)[c.toCamel()]);
        } else {
          throw { location: 'SqlBuilder:search - columns', message: (`(columns) unknown column for table ${sqlTable.TableName} - ${c}`) }
        }
      });
    } else {
      query.select(sqlTable.star());
    }

    let whereClause = new SqlWhere(null);
    if (searchDetails.filter) {
      if (Array.isArray(searchDetails.filter)) {
        searchDetails.filter.forEach((filter) => {
          whereClause.or(buildWhere(filter, sqlTable));
        });
      } else {
        whereClause = buildWhere(searchDetails.filter, sqlTable);
      }
    }
    if (whereClause) {
      query.where(whereClause);
    }
    if (searchDetails.orderBy) {
      if (Array.isArray(searchDetails.orderBy)) {
        searchDetails.orderBy.forEach((c) => {
          if (sqlTable.hasOwnProperty(c)) {
            query.orderBy((sqlTable as BaseTable)[c]);
          } else {
            throw { location: 'SqlBuilder:Search - orderBy', message: (`unknown column for table ${sqlTable.TableName} - ${c}`) }
          }
        });
      } else {
        searchDetails.orderBy.split(',').forEach((c) => {
          const columnDetails = c.split(';');
          const name = columnDetails[0];
          if (sqlTable.hasOwnProperty(name)) {
            query.orderBy(((sqlTable as BaseTable)[name].dir(columnDetails[1] || 'ASC')));
          } else {
            throw { location: 'SqlBuilder:Search - orderBy2', message: (`unknown column for table ${sqlTable.TableName} - ${c}`) }
          }
        });
      }
    }
    if (searchDetails.pageNo) {
      query.page(searchDetails.pageNo);
    }
    if (searchDetails.pageSize) {
      query.pageSize(searchDetails.pageSize);
    }
    if (!searchDetails.pageNo && !searchDetails.pageSize) {
      query.pageSize(50);
    }
    return query
  }
}
