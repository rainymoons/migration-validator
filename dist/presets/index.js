"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPreset = getPreset;
const memberPreset_1 = require("./memberPreset");
const orderPreset_1 = require("./orderPreset");
const presetMap = {
    member: memberPreset_1.memberPreset,
    order: orderPreset_1.orderPreset,
};
function getPreset(type) {
    return presetMap[type];
}
