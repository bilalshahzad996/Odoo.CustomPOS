/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { OrderSummary } from "@point_of_sale/app/screens/product_screen/order_summary/order_summary";

// A line is "sent to kitchen" if it appears in the order's last_order_preparation_change
// (matched by uuid) - this survives reloading the order from the Orders list.
function lineSentToKitchen(order, line) {
    try {
        const lp = order?.last_order_preparation_change;
        if (lp && lp.lines && Object.values(lp.lines).some((ch) => ch && ch.uuid === line.uuid)) {
            return true;
        }
        if ((line.uiState?.savedQuantity || 0) > 0) {
            return true;
        }
    } catch (e) {
        // ignore
    }
    return false;
}

patch(OrderSummary.prototype, {
    // Covers: full delete (backspace -> "remove") and direct numeric quantity decrease.
    async _setValue(val) {
        const order = this.currentOrder;
        let line = order?.getSelectedOrderline?.();
        if (line && this.pos.numpadMode === "quantity" && lineSentToKitchen(order, line)) {
            if (line.combo_parent_id) {
                line = line.combo_parent_id;
            }
            const current = line.getQuantity();
            const isRemove = val === "remove" && current > 0;
            const isNumericDecrease = val !== "remove" && Number(val) < current;
            if (isRemove || isNumericDecrease) {
                const ok = await this.pos._managerApprovalForDelete();
                if (!ok) {
                    this.numberBuffer?.reset?.();
                    return;
                }
            }
        }
        return super._setValue(val);
    },

    // Covers: the restaurant "Set the new quantity" decrease popup path.
    async updateQuantityNumber(newQuantity) {
        const order = this.currentOrder;
        let line = order?.getSelectedOrderline?.();
        if (line) {
            if (line.combo_parent_id) {
                line = line.combo_parent_id;
            }
            if (newQuantity !== null && newQuantity < line.getQuantity() && lineSentToKitchen(order, line)) {
                const ok = await this.pos._managerApprovalForDelete();
                if (!ok) {
                    return false;
                }
            }
        }
        return super.updateQuantityNumber(newQuantity);
    },
});