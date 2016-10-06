import parse from '../src/graph-parse';
const expect = require('chai').expect;

describe('graphToSql tests', () => {
    it('should generate the right structure', () => {

        const query = `
        {
            business(businessNumber: -12345, businessName: "bubba") { 
                id,
                businessName as name,
                businessNumber(id: <id>, foo: &zip, j: &1),
                address { 
                    line1(bool1: true, bool2: null),
                    city,
                    zip,
                    state { 
                        name 
                    }
                } 
            } 
        }
        `;
        const result = {
            type: 'Query',
            fields: [
                {
                    type: 'Field',
                    name: 'business',
                    alias: null,
                    params: [
                        {
                            type: 'Argument',
                            name: 'businessNumber',
                            value: {
                                type: 'Literal',
                                value: -12345
                            }
                        },
                        {
                            type: 'Argument',
                            name: 'businessName',
                            value: {
                                type: 'Literal',
                                value: 'bubba'
                            }
                        }
                    ],
                    fields: [
                        {
                            type: 'Field',
                            name: 'id',
                            alias: null,
                            params: [],
                            fields: []
                        },
                        {
                            type: 'Field',
                            name: 'businessName',
                            alias: 'name',
                            params: [],
                            fields: []
                        },
                        {
                            type: 'Field',
                            name: 'businessNumber',
                            alias: null,
                            params: [
                                {
                                    type: 'Argument',
                                    name: 'id',
                                    value: {
                                        type: 'Variable',
                                        name: 'id'
                                    }
                                },
                                {
                                    type: 'Argument',
                                    name: 'foo',
                                    value: {
                                        type: 'Reference',
                                        name: 'zip'
                                    }
                                },
                                {
                                    type: 'Argument',
                                    name: 'j',
                                    value: {
                                        type: 'Reference',
                                        name: 1
                                    }
                                }
                            ],
                            fields: []
                        },
                        {
                            type: 'Field',
                            name: 'address',
                            alias: null,
                            params: [],
                            fields: [
                                {
                                    type: 'Field',
                                    name: 'line1',
                                    alias: null,
                                    params: [
                                        {
                                            type: 'Argument',
                                            name: 'bool1',
                                            value: {
                                                type: 'Literal',
                                                value: true
                                            }
                                        },
                                        {
                                            type: 'Argument',
                                            name: 'bool2',
                                            value: {
                                                type: 'Literal',
                                                value: null
                                            }
                                        }
                                    ],
                                    fields: []
                                },
                                {
                                    type: 'Field',
                                    name: 'city',
                                    alias: null,
                                    params: [],
                                    fields: []
                                },
                                {
                                    type: 'Field',
                                    name: 'zip',
                                    alias: null,
                                    params: [],
                                    fields: []
                                },
                                {
                                    type: 'Field',
                                    name: 'state',
                                    alias: null,
                                    params: [],
                                    fields: [
                                        {
                                            type: 'Field',
                                            name: 'name',
                                            alias: null,
                                            params: [],
                                            fields: []
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };
        const graph = parse(query);
        expect(graph).to.deep.equal(result);
    });
});