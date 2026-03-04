"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberPreset = void 0;
const dateUtils_1 = require("../core/utils/dateUtils");
const stringUtils_1 = require("../core/utils/stringUtils");
const commonValidators_1 = require("../core/validators/commonValidators");
const withdrawTrueValues = ["y", "t", "예", "탈퇴", "true"];
const withdrawFalseValues = ["n", "f", "아니오", "탈퇴안함", "false"];
const lifeMemberTrueValues = ["t", "y", "true"];
const lifeMemberFalseValues = ["f", "n", "false"];
const yesValues = ["예", "y", "t", "yes", "true"];
const noValues = ["아니오", "n", "f", "no", "false"];
function isToggleTrue(value, trueValues) {
    return trueValues.map((item) => item.toLowerCase()).includes(value.toLowerCase());
}
function isWithdrawnMember(ctx) {
    if (!ctx.hasHeader("탈퇴여부")) {
        return false;
    }
    return isToggleTrue(ctx.getValue("탈퇴여부"), withdrawTrueValues);
}
const yesNoValidator = (0, commonValidators_1.toggleValidator)(yesValues, noValues, "Y", "N", "INVALID_TOGGLE_VALUE", "예/아니오 계열 값이 아닙니다.");
const withdrawValidator = (0, commonValidators_1.toggleValidator)(withdrawTrueValues, withdrawFalseValues, "Y", "N", "INVALID_WITHDRAW_VALUE", "탈퇴여부 값이 올바르지 않습니다.");
const authValidator = (0, commonValidators_1.toggleValidator)(["인증", "승인", "t", "y", "true"], ["미인증", "미승인", "f", "n", "false"], "T", "F", "INVALID_AUTH_VALUE", "회원가입인증 값이 올바르지 않습니다.");
const lifeMemberValidator = (0, commonValidators_1.toggleValidator)(lifeMemberTrueValues, lifeMemberFalseValues, "T", "F", "INVALID_LIFE_MEMBER_VALUE", "평생회원 여부는 T/F 형식이어야 합니다.");
const solarLunarValidator = (0, commonValidators_1.toggleValidator)(["양력", "양", "t", "true"], ["음력", "음", "f", "false"], "T", "F", "INVALID_SOLAR_LUNAR_VALUE", "양력(T)/음력(F) 값이 올바르지 않습니다.");
exports.memberPreset = {
    type: "member",
    displayName: "회원",
    createState: () => ({
        seenIds: new Map(),
    }),
    fields: [
        { name: "아이디", requiredHeader: true, required: true, validators: [commonValidators_1.idValidator] },
        { name: "이름", requiredHeader: true, required: true, validators: [commonValidators_1.nameValidator] },
        { name: "전화번호", aliases: ["전화 번호"], requiredHeader: true, validators: [commonValidators_1.phoneValidator] },
        {
            name: "이메일",
            requiredHeader: true,
            required: (ctx) => !isWithdrawnMember(ctx),
            validators: [commonValidators_1.emailValidator],
        },
        {
            name: "휴대폰번호",
            aliases: ["휴대폰 번호"],
            requiredHeader: true,
            required: (ctx) => !isWithdrawnMember(ctx),
            validators: [commonValidators_1.phoneValidator],
        },
        { name: "우편번호", requiredHeader: true, validators: [commonValidators_1.postalCodeValidator] },
        { name: "주소(동/읍/면)", requiredHeader: true, validators: [commonValidators_1.baseAddressValidator] },
        { name: "주소(번지미만)", requiredHeader: true, validators: [commonValidators_1.detailAddressValidator, (0, commonValidators_1.maxLengthValidator)(255)] },
        { name: "비밀번호", requiredHeader: true },
        { name: "성별", requiredHeader: true, validators: [commonValidators_1.genderValidator] },
        { name: "나이", requiredHeader: true, validators: [commonValidators_1.integerValidator] },
        { name: "생년월일", requiredHeader: true, validators: [commonValidators_1.dateOnlyValidator] },
        { name: "양력(T)/음력(F)", requiredHeader: true, validators: [solarLunarValidator] },
        { name: "회원등급", requiredHeader: true, validators: [(0, commonValidators_1.maxLengthValidator)(20)] },
        { name: "별명", requiredHeader: true, validators: [commonValidators_1.nicknameValidator] },
        { name: "이메일수신여부", aliases: ["이메일 수신여부"], requiredHeader: true, validators: [yesNoValidator] },
        { name: "SMS수신여부", aliases: ["SMS 수신여부"], requiredHeader: true, validators: [yesNoValidator] },
        { name: "총적립금", aliases: ["적립금"], requiredHeader: true, validators: [(0, commonValidators_1.moneyValidator)({ allowNegative: false, negativeToZero: true })] },
        { name: "총예치금", requiredHeader: true, validators: [(0, commonValidators_1.moneyValidator)({ allowNegative: false, negativeToZero: true })] },
        { name: "회원가입일", requiredHeader: true, validators: [commonValidators_1.dateTimeValidator] },
        { name: "최종접속일", requiredHeader: true, validators: [commonValidators_1.dateTimeValidator] },
        { name: "추천인아이디", aliases: ["추천인 아이디"], requiredHeader: true, validators: [commonValidators_1.idValidator] },
        { name: "관리자메모", aliases: ["관리자 메모"], requiredHeader: true, validators: [(0, commonValidators_1.maxLengthValidator)(255)] },
        { name: "가입경로", requiredHeader: true, validators: [commonValidators_1.joinPathValidator] },
        { name: "탈퇴여부", requiredHeader: true, validators: [withdrawValidator] },
        { name: "탈퇴일", requiredHeader: true, validators: [commonValidators_1.dateTimeValidator] },
        {
            name: "회원구분",
            requiredHeader: true,
            validators: [
                (0, commonValidators_1.enumValidator)(["개인회원", "개인사업자", "법인사업자", "외국인회원"], "INVALID_MEMBER_TYPE", "회원구분은 개인회원, 개인사업자, 법인사업자, 외국인회원 중 하나여야 합니다."),
            ],
        },
        { name: "상호명", requiredHeader: true, validators: [(0, commonValidators_1.maxLengthValidator)(20)] },
        { name: "사업자번호", requiredHeader: true, validators: [commonValidators_1.businessCodeValidator] },
        { name: "법인번호", requiredHeader: true, validators: [commonValidators_1.businessCodeValidator] },
        { name: "외국인등록번호", requiredHeader: true, validators: [commonValidators_1.businessCodeValidator] },
        { name: "국적", requiredHeader: true, validators: [commonValidators_1.countryCodeValidator] },
        { name: "회원가입인증", requiredHeader: true, validators: [authValidator] },
        { name: "평생회원 여부", aliases: ["평생회원여부"], requiredHeader: true, validators: [lifeMemberValidator] },
        { name: "평생회원 전환일", aliases: ["평생회원전환일"], requiredHeader: true, validators: [commonValidators_1.dateTimeValidator] },
    ],
    rowValidators: [
        (ctx) => {
            const memberId = ctx.getValue("아이디");
            if ((0, stringUtils_1.isBlank)(memberId)) {
                return;
            }
            const normalizedMemberId = memberId.toLowerCase();
            const firstRow = ctx.state.seenIds.get(normalizedMemberId);
            if (firstRow) {
                ctx.addFieldIssue("아이디", {
                    severity: "error",
                    code: "DUPLICATE_MEMBER_ID",
                    message: `동일한 아이디가 중복되었습니다. 최초 등장 행: ${firstRow}`,
                    rawValue: memberId,
                    normalizedValue: normalizedMemberId,
                });
                return;
            }
            ctx.state.seenIds.set(normalizedMemberId, ctx.rowNumber);
        },
        (ctx) => {
            if (!isWithdrawnMember(ctx)) {
                return;
            }
            if (ctx.hasHeader("탈퇴일") && (0, stringUtils_1.isBlank)(ctx.getValue("탈퇴일"))) {
                ctx.addFieldIssue("탈퇴일", {
                    severity: "error",
                    code: "WITHDRAWN_MEMBER_REQUIRES_DATE",
                    message: "탈퇴여부가 탈퇴인 경우 탈퇴일이 필요합니다.",
                    rawValue: ctx.getValue("탈퇴일"),
                });
            }
        },
        (ctx) => {
            if (!ctx.hasHeader("생년월일") || !ctx.hasHeader("나이")) {
                return;
            }
            const birthDate = ctx.getValue("생년월일");
            const age = ctx.getValue("나이");
            if ((0, stringUtils_1.isBlank)(birthDate) || (0, stringUtils_1.isBlank)(age)) {
                return;
            }
            const normalizedBirthDate = (0, dateUtils_1.normalizeDateOnly)(birthDate);
            const numericAge = Number(age);
            if (!normalizedBirthDate || Number.isNaN(numericAge)) {
                return;
            }
            const calculatedAge = (0, dateUtils_1.calculateKoreanAge)(normalizedBirthDate);
            if (calculatedAge === null) {
                return;
            }
            if (calculatedAge !== numericAge) {
                ctx.addFieldIssue("나이", {
                    severity: "warning",
                    code: "AGE_BIRTHDATE_MISMATCH",
                    message: `생년월일 기준 계산 나이와 다릅니다. 계산 결과: ${calculatedAge}`,
                    rawValue: age,
                    normalizedValue: String(calculatedAge),
                });
            }
        },
        (ctx) => {
            if (!ctx.hasHeader("평생회원 여부") || !ctx.hasHeader("평생회원 전환일")) {
                return;
            }
            const lifeMemberValue = ctx.getValue("평생회원 여부");
            const switchedAt = ctx.getValue("평생회원 전환일");
            if (isToggleTrue(lifeMemberValue, lifeMemberTrueValues) && (0, stringUtils_1.isBlank)(switchedAt)) {
                ctx.addFieldIssue("평생회원 전환일", {
                    severity: "warning",
                    code: "MISSING_LIFE_MEMBER_SWITCH_DATE",
                    message: "평생회원 여부가 T인 경우 평생회원 전환일을 함께 검토하는 것을 권장합니다.",
                    rawValue: switchedAt,
                });
            }
        },
        (ctx) => {
            if (!ctx.hasHeader("가입경로") || !(0, stringUtils_1.isBlank)(ctx.getValue("가입경로"))) {
                return;
            }
            ctx.addFieldIssue("가입경로", {
                severity: "warning",
                code: "EMPTY_JOIN_PATH_DEFAULT_PC",
                message: "가입경로가 비어 있으면 PC로 처리될 수 있습니다.",
                rawValue: ctx.getValue("가입경로"),
                normalizedValue: "PC",
            });
        },
    ],
};
