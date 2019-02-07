/* global describe it */
import '../src/string';
import { SqlQuery } from '../src/fluent-sql.js';
import { SqlTable } from '../src/fluent-sql.js';
import { SqlColumn } from '../src/fluent-sql.js';
//import {SqlWhere} from '../src/fluent-sql.js';
//import {SqlOrder} from '../src/fluent-sql.js';
import { SqlJoin } from '../src/fluent-sql.js';
import { SqlBuilder } from '../src/fluent-sql.js';
import { setDefaultOptions, getDefaultOptions } from '../src/fluent-sql.js';

describe('fluent sql tests', () => {
  const businessColumns = [{ ColumnName: 'id' }, { ColumnName: 'business_name' }, { ColumnName: 'tax_id' }];
  const business = new SqlTable({ TableName: 'business', columns: businessColumns });

  describe('default tests', () => {
    it('should override all the settings for default options', () => {
      const oldOptions = Object.assign({}, getDefaultOptions());
      const newOptions = Object.assign({}, getDefaultOptions(), {
        sqlStartChar: '`',
        sqlEndChar: '`',
      });
      setDefaultOptions(newOptions);
      expect(newOptions).to.deep.equal(getDefaultOptions());
      setDefaultOptions(oldOptions);
    });
  });

  describe('sqlescape test', () => {
    it('should return [name] for a string', () => {
      expect('name'.sqlEscape()).to.equal('[name]');
    });
    it('should return escape based on the passed SqlQuery', () => {
      const query = new SqlQuery({ sqlStartChar: '+', sqlEndChar: '*+' });
      expect(query.sqlEscape('name')).to.equal('+name*+');
      expect('name'.sqlEscape(query)).to.equal('+name*+');
    });
  });

  describe('SqlJoin tests', () => {
    it('should throw error if it is not constructed from a SqlColumn', () => {
      expect(SqlJoin.bind(null, {})).toThrow({
        location: 'SqlJoin::constructor',
        message: 'trying to join on something not a SqlColumn',
      });
    });
    it('should throw error if it is not linked via using with a SqlColumn', () => {
      const join = business.on(business.id);
      expect(join.using.bind(join, {})).toThrow({
        location: 'SqlJoin::using',
        message: 'trying to join on something not a SqlColumn',
      });
    });
  });
});
