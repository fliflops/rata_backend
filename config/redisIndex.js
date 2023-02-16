const {
    SchemaFieldTypes
} = require('redis');

exports.userSessionIndex = async (client) => {
    try{
        await client.ft.create('idx:ratasession',{
            '$.id':{
                type: SchemaFieldTypes.TAG,
                AS:'id'
            },
            '$.email':{
                type: SchemaFieldTypes.TAG,
                AS:'email'
            },
            '$.role_id':{
                type: SchemaFieldTypes.TAG,
                AS:'role_id'
            }
        },
        {
            ON: 'JSON',
            PREFIX: 'rata:session',
        })

    }
    catch(e){
        if (e.message === 'Index already exists') {
            console.log('Index exists already, skipped creation.');
        } 
        else {
            // Something went wrong, perhaps RediSearch isn't installed...
            console.error(e);
            process.exit(1);
          }
    }

} 

exports.testIndex = async(client) => {
    try{
        await client.ft.create('idx:users', {
            '$.name': {
              type: SchemaFieldTypes.TEXT,
            //   SORTABLE: 'UNF'
            },
            '$.age': {
              type: SchemaFieldTypes.NUMERIC,
              AS: 'age'
            },
            '$.coins': {
              type: SchemaFieldTypes.NUMERIC,
              AS: 'coins'
            },
            '$.email': {
              type: SchemaFieldTypes.TAG,
              AS: 'email'
            }
          }, {
            ON: 'JSON',
            PREFIX: 'noderedis:users'
          });

    }
    catch(e){
        if (e.message === 'Index already exists') {
            console.log('Index exists already, skipped creation.');
        } 
        else {
            // Something went wrong, perhaps RediSearch isn't installed...
            console.error(e);
            process.exit(1);
        }
    }
}