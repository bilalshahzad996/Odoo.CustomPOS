/** @odoo-module **/

import { Component } from "@odoo/owl";

export class KitchenChangeReceipt extends Component {
    static template = "restaurant_pos.KitchenChangeReceipt";
    static props = { data: Object };
    get data() {
        return this.props.data;
    }
}

function readNote(line) {
    let raw = "";
    try { raw = line.getNote ? line.getNote() : (line.note || ""); } catch (e) { raw = ""; }
    if (!raw || raw === "[]") { return ""; }
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.map((n) => (typeof n === "string" ? n : n.text)).join(", ");
        }
        return String(raw);
    } catch (e) {
        return String(raw);
    }
}

function attrNames(line) {
    try {
        const ids = line.attribute_value_ids || [];
        return [...ids].map((a) => a.name).filter(Boolean);
    } catch (e) {
        return [];
    }
}

export function buildKitchenData(order) {
    const orderlines = order.getOrderlines ? order.getOrderlines() : (order.lines || []);
    const lines = orderlines.map((line) => {
        const product = line.getProduct ? line.getProduct() : line.product_id;
        return {
            quantity: line.getQuantity ? line.getQuantity() : line.qty,
            basic_name: product?.display_name || product?.name || "",
            note: readNote(line),
            customer_note: line.getCustomerNote ? line.getCustomerNote() : (line.customer_note || ""),
            attribute_value_names: attrNames(line),
            combo_parent_uuid: line.combo_parent_id?.uuid,
        };
    });

    const now = new Date();
    return {
        reprint: false,
        pos_reference: order.getName ? order.getName() : (order.pos_reference || ""),
        config_name: order.config?.name || order.config_id?.name || "",
        time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        tracking_number: order.tracking_number,
        preset_time: order.presetDateTime,
        preset_name: order.preset_id?.name || "",
        employee_name: order.employee_id?.name || order.user_id?.name || "",
        internal_note: "",
        general_customer_note: order.general_customer_note || "",
        changes: { title: "NEW", data: lines },
    };
}

export async function printKitchenReceipt(pos, order) {
    if (!pos || !order) { return; }
    try {
        const data = buildKitchenData(order);
        await pos.printer.print(KitchenChangeReceipt, { data }, pos.printOptions);
    } catch (e) {
        console.error("[KitchenReceipt] failed to print kitchen ticket", e);
    }
}