const {scmdb} = require('../../database');
const {sequelize,Sequelize} = scmdb;
const {QueryTypes} = Sequelize;

const models = require('../../models');

const getGi = async({date,options}) => {
    return await sequelize.query(`
    Select 
    'HANDLING_OUT'				'service_type',
    b.wms_div_code				'location',
    f.wms_customer_profile_id	'principal_code',
    c.wms_pick_outbound_no		'wms_reference_no',
    d.wms_oub_prim_rf_dc_no		'primary_ref_doc',
    null						'vehicle_type',
    c.sku_code,
    c.order_uom					'uom',
    c.qty						'actual_qty',
    ((e.wms_itm_length * e.wms_itm_breadth * e.wms_itm_height) / 1000000 ) * c.case_qty 'actual_cbm',
    CAST(a.wms_loading_exec_date as date)	'transaction_date',
    UPPER(e.wms_itm_itemgroup)				'class_of_store'
    from wms_loading_exec_hdr a (NOLOCK)

    left join wms_div_location_list_dtl b (NOLOCK) on a.wms_loading_loc_code = b.wms_div_loc_code
    
    OUTER APPLY (
        Select 
        ax.wms_loading_exec_no,
        cx.wms_pick_outbound_no,
        cx.wms_pick_item_code	'sku_code',
        SUM(
            CASE WHEN ex.wms_ex_itm_quantity is not null 
            THEN cx.wms_pick_bin_qty/ex.wms_ex_itm_quantity
            ELSE cx.wms_pick_bin_qty END
            ) 'qty',
        SUM(cx.wms_pick_bin_qty/fx.wms_ex_itm_quantity) 'case_qty',
        dx.wms_oub_itm_order_item 'order_uom',
        dx.wms_oub_itm_masteruom 'master_uom'
    
        from wms_loading_exec_dtl ax (NOLOCK)
        left join wms_dispatch_dtl bx (NOLOCK)			on ax.wms_loading_thu_sr_no		= bx.wms_dispatch_thu_sr_no
        left join wms_pick_exec_dtl cx (NOLOCK)			on cx.wms_pick_exec_no			= bx.wms_dispatch_pack_exec_no 
                                                        AND cx.wms_pick_thu_serial_no	= ax.wms_loading_thu_sr_no
    
        left join wms_outbound_item_detail dx (NOLOCK)	on  dx.wms_oub_outbound_ord		= cx.wms_pick_outbound_no
                                                        AND dx.wms_oub_item_code		= cx.wms_pick_item_code
                                                        AND dx.wms_oub_itm_lineno		= cx.wms_pick_so_line_no
                        
        left join wms_ex_itm_su_conversion_dtl ex (NOLOCK) on ex.wms_ex_itm_code			= cx.wms_pick_item_code
                                                        AND ex.wms_ex_itm_loc_code		= ax.wms_loading_loc_code
                                                        AND ex.wms_ex_itm_storage_unit	= dx.wms_oub_itm_order_item
    
        left join wms_ex_itm_su_conversion_dtl fx (NOLOCK) on fx.wms_ex_itm_code			= cx.wms_pick_item_code
                                                        AND fx.wms_ex_itm_loc_code		= ax.wms_loading_loc_code
                                                        AND fx.wms_ex_itm_storage_unit	= 'CASE'
    
        where ax.wms_loading_exec_no = a.wms_loading_exec_no
        group by 
        cx.wms_pick_outbound_no,
        cx.wms_pick_item_code,
        dx.wms_oub_itm_order_item,
        dx.wms_oub_itm_masteruom,
        ax.wms_loading_exec_no 
    ) c 
    
    left join wms_outbound_header d (NOLOCK) on c.wms_pick_outbound_no = d.wms_oub_outbound_ord
    left join wms_item_hdr e		(NOLOCK) on c.sku_code = e.wms_itm_code
    left join wms_customer_hdr f	(NOLOCK) on d.wms_oub_cust_code = f.wms_customer_id
    
    where CAST(a.wms_loading_exec_date as date) = :date
    and a.wms_loading_exec_status = 'LD'
    `,{
        replacements: { date },
        type: QueryTypes.SELECT,
        ...options
    })
}

const getGr = async({date,options}) => {
    try{
        return await sequelize.query(`
            Select 
            'HANDLING_IN'			  'service_type',
            c.wms_div_code			  'location',
            d.wms_customer_profile_id 'principal_code',
            a.wms_gr_asn_no			  'wms_reference_no',
            b.wms_asn_prefdoc_no	  'primary_ref_doc',
            b.wms_asn_shp_vh_typ	  'vehicle_type',
            e.sku_code,
            e.order_uom				'uom',
            e.qty					'actual_qty',
            ((f.wms_itm_length * f.wms_itm_breadth * f.wms_itm_height) / 1000000 ) * e.case_qty 'actual_cbm',
            CAST(a.wms_gr_exec_date as date) 'transaction_date',
            UPPER(f.wms_itm_itemgroup)	'class_of_store'
            from 
            wms_gr_exec_dtl	a (NOLOCK)
            left join wms_asn_header b (NOLOCK)				on a.wms_gr_asn_no = b.wms_asn_no
            left join wms_div_location_list_dtl c (NOLOCK)  on a.wms_gr_loc_code = c.wms_div_loc_code
            left join wms_customer_hdr d (NOLOCK)			on  b.wms_asn_cust_code = d.wms_customer_id
            OUTER APPLY (
                Select 
                cx.wms_asn_no,
                ax.wms_gr_item			'sku_code',
                SUM(
                    CASE WHEN ex.wms_ex_itm_quantity is not null 
                    THEN ax.wms_gr_acpt_qty/ex.wms_ex_itm_quantity
                    ELSE ax.wms_gr_acpt_qty
                    END 
                ) 'qty',
                SUM(ax.wms_gr_acpt_qty/fx.wms_ex_itm_quantity) 'case_qty',
                ax.wms_gr_mas_uom		'master_uom',
                cx.wms_asn_order_uom	'order_uom'
                from wms_gr_exec_item_dtl ax (NOLOCK)		 	
                left join wms_gr_exec_dtl bx (NOLOCK)	on ax.wms_gr_exec_no = bx.wms_gr_exec_no
                left join (Select distinct wms_asn_no,wms_asn_itm_code, wms_asn_order_uom from wms_asn_detail (NOLOCK)) cx on bx.wms_gr_asn_no = cx.wms_asn_no and ax.wms_gr_item = cx.wms_asn_itm_code
                left join wms_ex_itm_su_conversion_dtl ex (NOLOCK) on ax.wms_gr_loc_code = ex.wms_ex_itm_loc_code and ax.wms_gr_item = ex.wms_ex_itm_code and cx.wms_asn_order_uom = ex.wms_ex_itm_storage_unit
                left join wms_ex_itm_su_conversion_dtl fx (NOLOCK) on ax.wms_gr_loc_code = fx.wms_ex_itm_loc_code and ax.wms_gr_item = fx.wms_ex_itm_code and fx.wms_ex_itm_storage_unit = 'CASE'
                where cx.wms_asn_no=b.wms_asn_no
                group by 
                ax.wms_gr_item,
                cx.wms_asn_no,
                ax.wms_gr_mas_uom,
                cx.wms_asn_order_uom

            ) e
            left join wms_item_hdr (NOLOCK) f on e.sku_code = f.wms_itm_code
            
            where 
            a.wms_gr_exec_status in ('PC','SC','CM')
            and e.qty > 0
            and CAST(a.wms_gr_exec_date as date) = :date
    `,{
        replacements: { date },
        type: QueryTypes.SELECT,
        ...options
    })

    }
    catch(e){
        throw e
    }
}

const getSoh = async({date,options}) => {
    try{
        return await sequelize.query(`
            Select 	
            gx.wms_div_loc_code 'location',
            ax.sbl_bin			'bin_location',
            ax.sbl_zone			'bin_zone',
            ax.sbl_item_code	'sku_code',
            fx.wms_itm_short_desc 'sku_description',
            fx.wms_itm_itemgroup  'class_of_store',
            ax.sbl_su_serial_no	'pallet_id',
            ax.sbl_supp_bat_no	'batch_no',
            (ax.sbl_quantity * bx.wms_ex_itm_quantity) * cx.wms_ex_itm_quantity 'qty',
            --(ax.sbl_quantity * bx.wms_ex_itm_quantity) / ex.wms_ex_itm_quantity 'case_qty',
            cx.wms_ex_itm_storage_unit 'uom',
            ((fx.wms_itm_length * fx.wms_itm_breadth * fx.wms_itm_height) / 1000000 ) * ((ax.sbl_quantity * bx.wms_ex_itm_quantity) / ex.wms_ex_itm_quantity) 'cbm',
            hx.lm_expiry_date 'expiry_date',
            ax.sbl_stock_status 'in_process_status'
            from 
            wms_stockbal_su_lot ax (nolock)
            left join wms_ex_itm_su_conversion_dtl bx (nolock)	on  ax.sbl_item_code			= bx.wms_ex_itm_code 
                                                        and bx.wms_ex_itm_loc_code		= ax.sbl_wh_code
                                                        and bx.wms_ex_itm_storage_unit	= CASE WHEN ax.sbl_su = 'PALLET-A' THEN 'PALLET' ELSE ax.sbl_su END
            left join wms_ex_itm_su_conversion_dtl cx (nolock)	on  ax.sbl_item_code			= cx.wms_ex_itm_code 
                                                        and cx.wms_ex_itm_loc_code		= ax.sbl_wh_code
                                                        and cx.wms_ex_itm_storage_unit	= 'PCS'
            left join wms_ex_itm_su_conversion_dtl ex (NOLOCK) on ex.wms_ex_itm_code	= bx.wms_ex_itm_code
                                                        AND ex.wms_ex_itm_loc_code		= ax.sbl_wh_code
                                                        AND ex.wms_ex_itm_storage_unit	= 'CASE'
            left join wms_item_hdr				  fx (nolock) on ax.sbl_item_code = fx.wms_itm_code
            left join wms_div_location_list_dtl	  gx (NOLOCK) on ax.sbl_wh_code = gx.wms_div_loc_code
            left join wms_lnm_lm_lotmaster		  hx (nolock) on ax.sbl_lot_no = hx.lm_lot_no    
    `,{
        replacements: { date },
        type: QueryTypes.SELECT,
        ...options
    })

    }
    catch(e){
        throw e
    }
}

const transaction = async ({date}) => {
    try{

        return await sequelize.transaction(async t => {
            const gr = await getGr({
                date,
                options:{
                    transaction:t
                }
            })
    
            const gi = await getGi({
                date,
                options:{
                    transaction:t
                }
            })

            return {
                gi,
                gr
            }
        })
    }
    catch(e){
        throw e
    }
}

const bulkCreateWMSDataHeader = async ({data,options}) => {
    try{
        return await models.wms_data_header_tbl.bulkCreate(data,{
            ...options,
            include:[
                {
                    model:models.wms_data_details_tbl,
                    as:'details'
                }
            ]
        })

    }
    catch(e){
        throw e
    }
}

const bulkCreateWMSDataDetails = async ({data,options}) => {
    try{
        return await models.wms_data_details_tbl.bulkCreate(data,{
            ...options
        })
    }
    catch(e){
        throw e
    }
}

const updateWMSDateDetails = async({data,filters,options}) => {
    try{
        return await models.wms_data_header_tbl.update({
            ...data
        },
        {
            where:{
                ...filters
            },
            ...options
        })
    }
    catch(e){
        throw e
    }
}


module.exports = {
    transaction,
    bulkCreateWMSDataHeader,
    updateWMSDateDetails
}





