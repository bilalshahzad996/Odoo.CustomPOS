/** @odoo-module **/
/* global Sha1 */

import { patch } from "@web/core/utils/patch";
import { _t } from "@web/core/l10n/translation";
import { PosStore } from "@point_of_sale/app/services/pos_store";
import { NumberPopup } from "@point_of_sale/app/components/popups/number_popup/number_popup";
import { makeAwaitable } from "@point_of_sale/app/utils/make_awaitable_dialog";

patch(PosStore.prototype, {
    async beforeDeleteOrder(order) {
        if (this._orderSentToKitchen(order) && !(await this._managerApprovalForDelete())) {
            return false; // block deletion
        }
        return super.beforeDeleteOrder(order);
    },

    _orderSentToKitchen(order) {
        try {
            const lp = order.last_order_preparation_change;
            if (lp && lp.lines && Object.keys(lp.lines).length > 0) {
                return true;
            }
            if (order.uiState?.lastPrints?.length > 0) {
                return true;
            }
        } catch (e) {
            // ignore
        }
        return false;
    },

    async _managerApprovalForDelete() {
        // Logged-in manager can delete without entering a PIN.
        const cashier = this.getCashier ? this.getCashier() : null;
        if (cashier && cashier._role === "manager") {
            return true;
        }

        const employees =
            (this.models["hr.employee"] && this.models["hr.employee"].getAll()) || [];
        const managers = employees.filter((e) => e._role === "manager" && e._pin);

        if (!managers.length) {
            this.notification.add(
                _t("No manager PIN is configured, so this order cannot be deleted."),
                { type: "warning", title: _t("Deletion blocked") }
            );
            return false;
        }

        const inputPin = await makeAwaitable(this.dialog, NumberPopup, {
            formatDisplayedValue: (x) => x.replace(/./g, "•"),
            title: _t("Manager PIN required to delete a sent order"),
        });
        if (!inputPin) {
            return false;
        }

        const hash = Sha1.hash(inputPin);
        if (!managers.some((e) => e._pin === hash)) {
            this.notification.add(_t("Wrong manager PIN."), {
                type: "warning",
                title: _t("Access denied"),
            });
            return false;
        }
        return true;
    },
});