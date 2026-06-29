{
    "name": "Restaurant POS Kitchen Receipt",
    "version": "19.0.1.1.0",
    "author": "Bilal Shahzad",
    "category": "Point of Sale",
    "depends": ["point_of_sale", "pos_restaurant", "pos_hr"],
    # "data": [
    #     "views/pos_config_views.xml",
    # ],
    "assets": {
        "point_of_sale._assets_pos": [
            "restaurant_pos/static/src/xml/kitchen_receipt.xml",
            "restaurant_pos/static/src/xml/kitchen_change_receipt.xml",
            "restaurant_pos/static/src/xml/control_buttons.xml",
            "restaurant_pos/static/src/js/kitchen_receipt_print.js",
            "restaurant_pos/static/src/js/kitchen_send_patch.js",
            "restaurant_pos/static/src/js/control_buttons_patch.js",
            "restaurant_pos/static/src/js/order_delete_guard.js",
            "restaurant_pos/static/src/js/order_line_delete_guard.js"
        ]
    },
    "installable": True,
    "application": False,
    "license": "LGPL-3"
}