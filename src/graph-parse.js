const isNumeric = (val) => parseFloat(val) == val;

function buildParams(query) {
    const results = [];

    // handle params p:v,p1:v1,...pn:vn
    // v = literal or v = <variable> or v = &ref
    const params = query.split(',');
    params.forEach(p => {
        const pieces = p.split(':');
        const param = {
            type: 'Argument',
            name: pieces[0],
        };
        if (pieces[1][0] === '<') {
            param.value = {
                type: 'Variable',
                name: pieces[1].replace(/[<>]/g, ''),
            };
        } else if (pieces[1][0] === '&') {
            const name = pieces[1].substring(1);
            param.value = {
                type: 'Reference',
                name: isNumeric(name) ? parseFloat(name) : name,
            };
        } else {
            let value = '';
            if (pieces[1][0] === '"') {
                value = pieces[1].replace(/"/g, '');
            } else if (pieces[1] === 'true' || pieces[1] === 'false') {
                value = !!pieces[1];
            } else if (pieces[1] === 'null') {
                value = null;
            } else {
                value = parseFloat(pieces[1]);
            }
            param.value = {
                type: 'Literal',
                value,
            }
        }
        results.push(param);
    });
    return results;
}

const newField = {
    type: 'Field',
    name: '',
    alias: null,
    params: [],
    fields: []
};

function parse(baseQuery) {
    const query = baseQuery.replace(/\sas\s/, '*as*').replace(/\s/g, '');

    const fields = [];
    let field = null;
    for (let i = 0; i < query.length; i++) {
        let c = query[i];

        // start of sub field list
        if (c === '{') {
            if (field ) {
                const result = parse(query.substr(i));
                field.fields = result.fields;
                i += result.end;
            } else {
                field = Object.assign({}, newField);
                fields.push(field);
            }
            continue;
        }
        // the sub fields are done
        if (c === '}') {
            return {
                fields,
                end: i,
            };
        }

        // Handle foo as bar
        if (c === '*') {
            i += 4;
            field.alias = '';
            while (query[i] !== ',' && query[i] !== '(' && query[i] !== '{') {
                field.alias += query[i++];
            }
            i = i - 1;
            continue;
        }

        // our field has some parameters
        if (c === '(') {
            // pull everything from between ( and )
            let end = i;
            while (query[end] !== ')') end++;
            const params = query.substr(i + 1, end - (i + 1));
            i = end;
            field.params = buildParams(params);
            continue;
        }

        // our field is complete, create a new field
        if (c === ',') {
            field = Object.assign({}, newField);
            fields.push(field);
            continue;
        }

        field.name += c;
    }
    return { fields, end: query.length };
}
export default (query) => {
    return {
        type: 'Query',
        fields: parse(query).fields,
    }
}
