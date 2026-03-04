"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderPreset = void 0;
const stringUtils_1 = require("../core/utils/stringUtils");
const commonValidators_1 = require("../core/validators/commonValidators");
const paymentDivisionValidator = (0, commonValidators_1.toggleValidator)(["t", "true", "y"], ["f", "false", "n"], "T", "F", "INVALID_PAYMENT_DIVISION", "결제구분 값이 올바르지 않습니다.");
exports.orderPreset = {
    type: "order",
    displayName: "주문",
    createState: () => ({
        seenItemCodes: new Map(),
    }),
    fields: [
        {
            name: "주문번호",
            requiredHeader: true,
            required: true,
            validators: [
                (0, commonValidators_1.numberHyphenValidator)(32, "INVALID_ORDER_NO_FORMAT", "주문번호는 숫자와 하이픈(-)만 허용되며 32자 이하여야 합니다."),
            ],
        },
        {
            name: "품목코드",
            requiredHeader: true,
            validators: [
                (0, commonValidators_1.numberHyphenValidator)(32, "INVALID_ITEM_CODE_FORMAT", "품목코드는 숫자와 하이픈(-)만 허용되며 32자 이하여야 합니다."),
            ],
        },
        { name: "주문일시", requiredHeader: true, required: true, validators: [commonValidators_1.dateTimeValidator] },
        { name: "주문자명", aliases: ["주문자 명"], requiredHeader: true, required: true, validators: [commonValidators_1.nameValidator] },
        {
            name: "주문자전화번호",
            aliases: ["주문자 전화번호"],
            requiredHeader: true,
            required: true,
            validators: [commonValidators_1.phoneValidator],
        },
        {
            name: "주문자핸드폰",
            aliases: ["주문자 핸드폰"],
            requiredHeader: true,
            required: true,
            validators: [commonValidators_1.phoneValidator],
        },
        { name: "수령인", requiredHeader: true, required: true, validators: [commonValidators_1.nameValidator] },
        { name: "주문자아이디", aliases: ["주문자 아이디"], requiredHeader: true, validators: [commonValidators_1.idValidator] },
        { name: "주문자이메일", aliases: ["주문자 이메일"], requiredHeader: true, validators: [commonValidators_1.emailValidator] },
        { name: "주문자주소", aliases: ["주문자 주소"], requiredHeader: true, validators: [commonValidators_1.fullAddressValidator] },
        { name: "수령인전화번호", aliases: ["수령인 전화번호"], requiredHeader: true, validators: [commonValidators_1.phoneValidator] },
        { name: "수령인핸드폰", aliases: ["수령인 핸드폰"], requiredHeader: true, validators: [commonValidators_1.phoneValidator] },
        { name: "수령인우편번호", aliases: ["수령인 우편번호"], requiredHeader: true, validators: [commonValidators_1.postalCodeValidator] },
        { name: "수령인주소(전체)", requiredHeader: true, validators: [commonValidators_1.fullAddressValidator] },
        { name: "배송메시지", aliases: ["배송 메시지"], requiredHeader: true, validators: [(0, commonValidators_1.maxLengthValidator)(255)] },
        { name: "주문상품명", requiredHeader: true, validators: [(0, commonValidators_1.maxLengthValidator)(255)] },
        { name: "상품옵션", aliases: ["상품 옵션"], requiredHeader: true, validators: [(0, commonValidators_1.maxLengthValidator)(255)] },
        { name: "수량", requiredHeader: true, validators: [commonValidators_1.quantityValidator] },
        { name: "상품가격", requiredHeader: true, validators: [(0, commonValidators_1.moneyValidator)({ allowNegative: false, negativeToZero: false })] },
        { name: "총결제금액", aliases: ["총 결제금액"], requiredHeader: true, validators: [(0, commonValidators_1.moneyValidator)({ allowNegative: false, negativeToZero: false })] },
        { name: "사용적립금", aliases: ["사용 적립금"], requiredHeader: true, validators: [(0, commonValidators_1.moneyValidator)({ allowNegative: false, negativeToZero: true })] },
        { name: "사용예치금", aliases: ["사용 예치금"], requiredHeader: true, validators: [(0, commonValidators_1.moneyValidator)({ allowNegative: false, negativeToZero: true })] },
        { name: "주문상태", requiredHeader: true, validators: [(0, commonValidators_1.maxLengthValidator)(255)] },
        { name: "결제구분", requiredHeader: true, validators: [paymentDivisionValidator] },
        { name: "결제수단", requiredHeader: true, validators: [(0, commonValidators_1.maxLengthValidator)(255)] },
        { name: "입금은행", requiredHeader: true, validators: [(0, commonValidators_1.maxLengthValidator)(64)] },
        {
            name: "상품고유번호",
            validators: [
                (0, commonValidators_1.alphaNumericHyphenValidator)(50, "INVALID_PRODUCT_UNIQUE_NO", "상품고유번호는 영문, 숫자, 하이픈(-)만 허용되며 50자 이하여야 합니다."),
            ],
        },
        { name: "상품자체코드", validators: [(0, commonValidators_1.maxLengthValidator)(40)] },
    ],
    rowValidators: [
        (ctx) => {
            const itemCode = ctx.getValue("품목코드");
            if ((0, stringUtils_1.isBlank)(itemCode)) {
                ctx.addFieldIssue("품목코드", {
                    severity: "warning",
                    code: "MISSING_ITEM_CODE",
                    message: "품목코드가 없으면 이전 후 품목별 상태 수정이 제한될 수 있습니다.",
                    rawValue: itemCode,
                });
                return;
            }
            const firstRow = ctx.state.seenItemCodes.get(itemCode);
            if (firstRow) {
                ctx.addFieldIssue("품목코드", {
                    severity: "error",
                    code: "DUPLICATE_ITEM_CODE",
                    message: `품목코드가 중복되었습니다. 최초 등장 행: ${firstRow}`,
                    rawValue: itemCode,
                });
                return;
            }
            ctx.state.seenItemCodes.set(itemCode, ctx.rowNumber);
        },
        (ctx) => {
            if (ctx.hasHeader("주문자아이디") && (0, stringUtils_1.isBlank)(ctx.getValue("주문자아이디"))) {
                ctx.addFieldIssue("주문자아이디", {
                    severity: "warning",
                    code: "MISSING_ORDERER_ID",
                    message: "주문자아이디가 없으면 이전 몰 주문 내역 조회에 제한이 생길 수 있습니다.",
                    rawValue: ctx.getValue("주문자아이디"),
                });
            }
        },
        (ctx) => {
            if (ctx.hasHeader("수량") && (0, stringUtils_1.isBlank)(ctx.getValue("수량"))) {
                ctx.addFieldIssue("수량", {
                    severity: "warning",
                    code: "EMPTY_QUANTITY_DEFAULT_ZERO",
                    message: "수량이 비어 있어 0으로 처리될 수 있습니다.",
                    rawValue: ctx.getValue("수량"),
                    normalizedValue: "0",
                });
            }
        },
        (ctx) => {
            const zeroDefaultFields = ["상품가격", "총결제금액", "사용적립금", "사용예치금"];
            for (const fieldName of zeroDefaultFields) {
                if (!ctx.hasHeader(fieldName) || !(0, stringUtils_1.isBlank)(ctx.getValue(fieldName))) {
                    continue;
                }
                ctx.addFieldIssue(fieldName, {
                    severity: "warning",
                    code: "EMPTY_AMOUNT_DEFAULT_ZERO",
                    message: `${fieldName} 값이 비어 있어 0으로 처리될 수 있습니다.`,
                    rawValue: ctx.getValue(fieldName),
                    normalizedValue: "0",
                });
            }
        },
    ],
};
