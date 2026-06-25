/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { PosStore } from "@point_of_sale/app/services/pos_store";
import { printKitchenReceipt } from "@restaurant_pos/js/kitchen_receipt_print";

patch(PosStore.prototype, {
    async sendOrderInPreparationUpdateLastChange(order, opts = {}) {
        const result = await super.sendOrderInPreparationUpdateLastChange(order, opts);
        if (order && !opts.cancelled) {
            await printKitchenReceipt(this, order);
        }
        return result;
    },
});