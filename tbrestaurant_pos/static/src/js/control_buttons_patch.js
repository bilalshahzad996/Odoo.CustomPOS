/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { ControlButtons } from "@point_of_sale/app/screens/product_screen/control_buttons/control_buttons";
import { OrderReceipt } from "@point_of_sale/app/screens/receipt_screen/receipt/order_receipt";
import { printKitchenReceipt } from "@restaurant_pos/js/kitchen_receipt_print";

patch(ControlButtons.prototype, {
    async clickPrintKitchenReceipt() {
        await printKitchenReceipt(this.pos, this.pos.getOrder());
    },
    async clickPrintFullReceipt() {
        const order = this.pos.getOrder();
        if (!order) { return; }
        const fullOrder = new Proxy(order, {
            get(target, prop, receiver) {
                if (prop === "finalized") { return true; }
                return Reflect.get(target, prop, receiver);
            },
        });
        await this.pos.printer.print(
            OrderReceipt,
            { order: fullOrder, basic_receipt: false },
            this.pos.printOptions
        );
    },
});