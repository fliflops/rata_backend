const redisClient = require('../config').redis;
const {SchemaFieldTypes} = require('redis');

exports.searchHashes = async() => {
    try{
        await redisClient.ft.create('idx:invoice', {
            rdd:{
                type: SchemaFieldTypes.NUMERIC,
                SORTABLE: true
            },
            location:{
                type: SchemaFieldTypes.TEXT
            }
            
        },{
            ON: 'HASH',
            PREFIX: 'helios:invoice'
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