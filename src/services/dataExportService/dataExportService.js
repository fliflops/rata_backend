const xlsx = require('xlsx')

exports.generateExcel = (data) => {
    try{
        const wb=xlsx.utils.book_new();

        Object.keys(data).map(item => {
            const ws = xlsx.utils.json_to_sheet(data[item]);
            xlsx.utils.book_append_sheet(wb,ws,item);
        })

        return buf = xlsx.write(wb,{
            type:'buffer', bookType:"xlsx"
        })
    }
    catch(e){
        throw e
    }
}