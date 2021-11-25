const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('invoices_rev_leak_tbl',{
        invoice_no:{
            primaryKey: true,
            type:DataTypes.STRING(50)
        },
        fk_invoice_id:{
            type:DataTypes.STRING(50)
        },
        draft_bill_type:{
            primaryKey: true,
            type:DataTypes.STRING(50)
        },
        reason:{
            type:DataTypes.STRING(50)
        },
        is_draft_bill:{
            type:DataTypes.INTEGER()
        },
        createdAt:Sequelize.DATE,
        updatedAt:Sequelize.DATE,
        created_by:{
            type:DataTypes.STRING(50)
        },
        updated_by:{
            type:DataTypes.STRING(50)
        }
    },
    {
        freezeTableName : true
    })
}