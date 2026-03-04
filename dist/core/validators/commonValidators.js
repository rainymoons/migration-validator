"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessCodeValidator = exports.countryCodeValidator = exports.nicknameValidator = exports.joinPathValidator = exports.quantityValidator = exports.integerValidator = exports.detailAddressValidator = exports.baseAddressValidator = exports.fullAddressValidator = exports.postalCodeValidator = exports.genderValidator = exports.dateOnlyValidator = exports.dateTimeValidator = exports.phoneValidator = exports.emailValidator = exports.nameValidator = exports.idValidator = void 0;
exports.maxLengthValidator = maxLengthValidator;
exports.moneyValidator = moneyValidator;
exports.enumValidator = enumValidator;
exports.toggleValidator = toggleValidator;
exports.numberHyphenValidator = numberHyphenValidator;
exports.alphaNumericHyphenValidator = alphaNumericHyphenValidator;
const dateUtils_1 = require("../utils/dateUtils");
const domainUtils_1 = require("../utils/domainUtils");
const stringUtils_1 = require("../utils/stringUtils");
const valueUtils_1 = require("../utils/valueUtils");
function toLowerSet(values) {
    return new Set(values.map((value) => value.toLowerCase()));
}
function normalizeEmailCandidate(value) {
    return value.trim();
}
const BASIC_EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const GENERAL_ID_REGEX = /^[a-z][a-z0-9]{3,15}$/;
const SNS_ID_REGEX = /^(?:(?:nh|ka|fa|ap)@[A-Za-z0-9._-]+|(?:ka|kko)[_-]?[A-Za-z0-9]+)$/i;
const PHONE_REGEX = /^[0-9/-]{1,16}$/;
const NUMERIC_HYPHEN_REGEX = /^(?=.*\d)[0-9-]+$/;
const ALNUM_HYPHEN_REGEX = /^[A-Za-z0-9-]+$/;
const POSTAL_IN_TEXT_REGEX = /(?:\[\s*\d{3,6}-?\d{0,3}\s*\]|\b\d{3,6}-?\d{0,3}\b)/;
const POSTAL_ONLY_REGEX = /^[0-9-]{1,7}$/;
const LETTERS_ONLY_REGEX = /^[\p{L}]+$/u;
const BUSINESS_CODE_REGEX = /^[0-9-]+$/;
function maxLengthValidator(max, code = "MAX_LENGTH_EXCEEDED") {
    return (value, ctx, field) => {
        if ((0, stringUtils_1.countCharacters)(value) > max) {
            ctx.addFieldIssue(field.name, {
                severity: "error",
                code,
                message: `${field.name} 값은 ${max}자 이하여야 합니다.`,
                rawValue: value,
            });
        }
    };
}
const idValidator = async (value, ctx, field) => {
    const normalized = value.trim();
    const lowered = normalized.toLowerCase();
    const isEmailId = BASIC_EMAIL_REGEX.test(normalized);
    const isGeneralId = GENERAL_ID_REGEX.test(lowered);
    const isSnsId = SNS_ID_REGEX.test(normalized);
    if (isGeneralId && normalized !== lowered) {
        ctx.addFieldIssue(field.name, {
            severity: "warning",
            code: "NORMALIZED_ID_CASE",
            message: "영문 대문자는 자동으로 소문자로 정규화하는 것을 권장합니다.",
            rawValue: value,
            normalizedValue: lowered,
        });
    }
    if (isEmailId || isGeneralId || isSnsId) {
        return;
    }
    ctx.addFieldIssue(field.name, {
        severity: "error",
        code: "INVALID_ID_FORMAT",
        message: "아이디 형식이 올바르지 않습니다. 영문 소문자 4-16자 또는 허용된 SNS/이메일 형식이어야 합니다.",
        rawValue: value,
        normalizedValue: normalized !== lowered ? lowered : undefined,
    });
};
exports.idValidator = idValidator;
const nameValidator = (value, ctx, field) => {
    if ((0, stringUtils_1.countCharacters)(value) > 20) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "NAME_TOO_LONG",
            message: "이름은 20자 이하여야 합니다.",
            rawValue: value,
        });
    }
    if (/\s/.test(value)) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "NAME_CONTAINS_WHITESPACE",
            message: "이름에는 공백을 포함할 수 없습니다.",
            rawValue: value,
            normalizedValue: value.replace(/\s+/g, ""),
        });
    }
    if (!LETTERS_ONLY_REGEX.test(value)) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "NAME_CONTAINS_INVALID_CHAR",
            message: "이름에는 특수문자 또는 숫자를 포함할 수 없습니다.",
            rawValue: value,
        });
    }
};
exports.nameValidator = nameValidator;
const emailValidator = async (value, ctx, field) => {
    const normalized = normalizeEmailCandidate(value);
    if ((0, stringUtils_1.countCharacters)(normalized) > 40) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "EMAIL_TOO_LONG",
            message: "이메일은 40자 이하여야 합니다.",
            rawValue: value,
        });
    }
    if (/\s/.test(normalized)) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "EMAIL_CONTAINS_WHITESPACE",
            message: "이메일에는 공백을 포함할 수 없습니다.",
            rawValue: value,
            normalizedValue: normalized.replace(/\s+/g, ""),
        });
        return;
    }
    if (!BASIC_EMAIL_REGEX.test(normalized)) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "INVALID_EMAIL_FORMAT",
            message: "이메일 형식이 올바르지 않습니다.",
            rawValue: value,
        });
        return;
    }
    if (ctx.runtime.options.strictEmailDomain) {
        const [, domain = ""] = normalized.split("@");
        const exists = await (0, domainUtils_1.domainExists)(domain, ctx.runtime.emailDomainCache);
        if (!exists) {
            ctx.addFieldIssue(field.name, {
                severity: "error",
                code: "EMAIL_DOMAIN_NOT_FOUND",
                message: "이메일 도메인 조회에 실패했습니다. 실존 도메인인지 확인해 주세요.",
                rawValue: value,
            });
        }
    }
};
exports.emailValidator = emailValidator;
const phoneValidator = (value, ctx, field) => {
    if ((0, stringUtils_1.countCharacters)(value) > 16) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "PHONE_TOO_LONG",
            message: "전화번호/휴대폰번호는 16자 이하여야 합니다.",
            rawValue: value,
        });
    }
    if (/\s/.test(value)) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "PHONE_CONTAINS_WHITESPACE",
            message: "전화번호/휴대폰번호에는 공백을 포함할 수 없습니다.",
            rawValue: value,
            normalizedValue: value.replace(/\s+/g, ""),
        });
        return;
    }
    if (!PHONE_REGEX.test(value)) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "INVALID_PHONE_FORMAT",
            message: "전화번호/휴대폰번호는 숫자, 하이픈(-), 슬래시(/)만 허용됩니다.",
            rawValue: value,
        });
    }
};
exports.phoneValidator = phoneValidator;
const dateTimeValidator = (value, ctx, field) => {
    const normalized = (0, dateUtils_1.normalizeDateTime)(value);
    if (!normalized) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "INVALID_DATETIME_FORMAT",
            message: "날짜 형식이 올바르지 않습니다. YYYY-MM-DD HH:MM:SS 또는 허용된 변형 형식을 사용해 주세요.",
            rawValue: value,
        });
    }
};
exports.dateTimeValidator = dateTimeValidator;
const dateOnlyValidator = (value, ctx, field) => {
    const normalized = (0, dateUtils_1.normalizeDateOnly)(value);
    if (!normalized) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "INVALID_DATE_FORMAT",
            message: "날짜 형식이 올바르지 않습니다. YYYY-MM-DD, YYYYMMDD, YYMMDD 또는 허용된 변형 형식을 사용해 주세요.",
            rawValue: value,
        });
    }
};
exports.dateOnlyValidator = dateOnlyValidator;
function moneyValidator(options) {
    return (value, ctx, field) => {
        const parsed = (0, valueUtils_1.parseMoney)(value);
        if (!parsed.valid || parsed.numericValue === undefined) {
            ctx.addFieldIssue(field.name, {
                severity: "error",
                code: "INVALID_MONEY_FORMAT",
                message: `${field.name} 값이 금액 형식이 아닙니다.`,
                rawValue: value,
            });
            return;
        }
        if (parsed.numericValue < 0 && options.negativeToZero) {
            ctx.addFieldIssue(field.name, {
                severity: "warning",
                code: "NEGATIVE_AMOUNT_TO_ZERO",
                message: `${field.name} 음수 금액은 0으로 이전됩니다.`,
                rawValue: value,
                normalizedValue: "0",
            });
            return;
        }
        if (parsed.numericValue < 0 && !options.allowNegative) {
            ctx.addFieldIssue(field.name, {
                severity: "error",
                code: "NEGATIVE_AMOUNT_NOT_ALLOWED",
                message: `${field.name}에는 음수 금액을 사용할 수 없습니다.`,
                rawValue: value,
            });
        }
    };
}
function enumValidator(allowedValues, code, message, options = {}) {
    const normalizedAllowed = options.caseInsensitive ? toLowerSet(allowedValues) : new Set(allowedValues);
    return (value, ctx, field) => {
        const candidate = options.caseInsensitive ? value.toLowerCase() : value;
        if (!normalizedAllowed.has(candidate)) {
            ctx.addFieldIssue(field.name, {
                severity: "error",
                code,
                message,
                rawValue: value,
            });
        }
    };
}
function toggleValidator(trueValues, falseValues, normalizedTrue, normalizedFalse, code, message) {
    const trueSet = toLowerSet(trueValues);
    const falseSet = toLowerSet(falseValues);
    return (value, ctx, field) => {
        const candidate = value.toLowerCase();
        if (trueSet.has(candidate) || falseSet.has(candidate)) {
            return;
        }
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code,
            message: `${message} (허용값 예: ${normalizedTrue}/${normalizedFalse})`,
            rawValue: value,
        });
    };
}
const genderValidator = (value, ctx, field) => {
    const candidate = value.toLowerCase();
    const maleSet = new Set(["남", "남자", "m", "male"]);
    const femaleSet = new Set(["여", "여자", "f", "female"]);
    if (maleSet.has(candidate) || femaleSet.has(candidate)) {
        return;
    }
    ctx.addFieldIssue(field.name, {
        severity: "error",
        code: "INVALID_GENDER_VALUE",
        message: "성별은 남/여, 남자/여자, M/F, Male/Female 형식이어야 합니다.",
        rawValue: value,
    });
};
exports.genderValidator = genderValidator;
const postalCodeValidator = (value, ctx, field) => {
    const compact = value.replace(/[\[\]\s]/g, "");
    const normalized = compact.match(/\d{3,6}-?\d{0,3}/)?.[0] ?? compact;
    if ((0, stringUtils_1.countCharacters)(normalized) > 7) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "POSTAL_CODE_TOO_LONG",
            message: "우편번호는 7자 이하여야 합니다.",
            rawValue: value,
        });
        return;
    }
    if (!POSTAL_ONLY_REGEX.test(normalized)) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "INVALID_POSTAL_CODE_FORMAT",
            message: "우편번호는 숫자와 하이픈(-)만 사용할 수 있으며 공백은 허용되지 않습니다.",
            rawValue: value,
            normalizedValue: normalized !== value ? normalized : undefined,
        });
        return;
    }
    if (normalized !== value) {
        ctx.addFieldIssue(field.name, {
            severity: "warning",
            code: "NORMALIZED_POSTAL_CODE",
            message: "우편번호에서 대괄호 또는 공백을 제거하는 것을 권장합니다.",
            rawValue: value,
            normalizedValue: normalized,
        });
    }
};
exports.postalCodeValidator = postalCodeValidator;
const fullAddressValidator = (value, ctx, field) => {
    if ((0, stringUtils_1.countCharacters)(value) > 255) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "ADDRESS_TOO_LONG",
            message: `${field.name} 값은 255자 이하여야 합니다.`,
            rawValue: value,
        });
    }
};
exports.fullAddressValidator = fullAddressValidator;
const baseAddressValidator = (value, ctx, field) => {
    if ((0, stringUtils_1.countCharacters)(value) > 255) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "ADDRESS_TOO_LONG",
            message: `${field.name} 값은 255자 이하여야 합니다.`,
            rawValue: value,
        });
    }
    const normalized = (0, stringUtils_1.normalizeWhitespace)(value.replace(/\[[^\]]+\]/g, "").replace(/\([^)]*\)/g, ""));
    if (normalized !== value) {
        ctx.addFieldIssue(field.name, {
            severity: "warning",
            code: "ADDRESS_CONTAINS_POSTAL_CODE",
            message: `${field.name} 값에 포함된 우편번호는 별도 컬럼으로 분리하는 것을 권장합니다.`,
            rawValue: value,
            normalizedValue: normalized,
        });
    }
};
exports.baseAddressValidator = baseAddressValidator;
const detailAddressValidator = (value, ctx, field) => {
    if (POSTAL_IN_TEXT_REGEX.test(value)) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "DETAIL_ADDRESS_CONTAINS_POSTAL_CODE",
            message: "주소(번지미만)에는 우편번호가 포함되면 안 됩니다.",
            rawValue: value,
            normalizedValue: (0, stringUtils_1.normalizeWhitespace)(value.replace(POSTAL_IN_TEXT_REGEX, "")),
        });
    }
};
exports.detailAddressValidator = detailAddressValidator;
const integerValidator = (value, ctx, field) => {
    if ((0, valueUtils_1.parseInteger)(value) === null) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "INVALID_INTEGER_FORMAT",
            message: `${field.name} 값은 숫자여야 합니다.`,
            rawValue: value,
        });
    }
};
exports.integerValidator = integerValidator;
const quantityValidator = (value, ctx, field) => {
    const parsed = (0, valueUtils_1.parseInteger)(value);
    if (parsed === null) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "INVALID_QUANTITY_FORMAT",
            message: "수량은 숫자로 입력해야 합니다.",
            rawValue: value,
        });
        return;
    }
    if (parsed < 0) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "NEGATIVE_QUANTITY_NOT_ALLOWED",
            message: "수량은 음수일 수 없습니다.",
            rawValue: value,
        });
    }
};
exports.quantityValidator = quantityValidator;
function numberHyphenValidator(maxLength, code, message) {
    return (value, ctx, field) => {
        if ((0, stringUtils_1.countCharacters)(value) > maxLength) {
            ctx.addFieldIssue(field.name, {
                severity: "error",
                code: `${code}_TOO_LONG`,
                message: `${field.name} 값은 ${maxLength}자 이하여야 합니다.`,
                rawValue: value,
            });
            return;
        }
        if (!NUMERIC_HYPHEN_REGEX.test(value)) {
            ctx.addFieldIssue(field.name, {
                severity: "error",
                code,
                message,
                rawValue: value,
            });
        }
    };
}
function alphaNumericHyphenValidator(maxLength, code, message) {
    return (value, ctx, field) => {
        if ((0, stringUtils_1.countCharacters)(value) > maxLength) {
            ctx.addFieldIssue(field.name, {
                severity: "error",
                code: `${code}_TOO_LONG`,
                message: `${field.name} 값은 ${maxLength}자 이하여야 합니다.`,
                rawValue: value,
            });
            return;
        }
        if (!ALNUM_HYPHEN_REGEX.test(value)) {
            ctx.addFieldIssue(field.name, {
                severity: "error",
                code,
                message,
                rawValue: value,
            });
        }
    };
}
const joinPathValidator = (value, ctx, field) => {
    const candidate = value.toUpperCase();
    const allowed = new Set(["P", "M", "PC", "MOBILE"]);
    if (!allowed.has(candidate)) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "INVALID_JOIN_PATH",
            message: "가입경로는 P/M 또는 PC/MOBILE 형식이어야 합니다.",
            rawValue: value,
        });
    }
};
exports.joinPathValidator = joinPathValidator;
const nicknameValidator = (value, ctx, field) => {
    const length = (0, stringUtils_1.countCharacters)(value);
    const hangulOnly = /^[가-힣]+$/.test(value);
    if (hangulOnly && length > 25) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "NICKNAME_TOO_LONG",
            message: "한글 별명은 25자 이하여야 합니다.",
            rawValue: value,
        });
        return;
    }
    if (!hangulOnly && length > 50) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "NICKNAME_TOO_LONG",
            message: "영문/기타 별명은 50자 이하여야 합니다.",
            rawValue: value,
        });
    }
};
exports.nicknameValidator = nicknameValidator;
const countryCodeValidator = (value, ctx, field) => {
    if (!/^[A-Za-z]{2}$/.test(value)) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "INVALID_COUNTRY_CODE",
            message: "국적은 2자리 국가코드여야 합니다. 예: KR, JP, US",
            rawValue: value,
            normalizedValue: value.toUpperCase(),
        });
    }
};
exports.countryCodeValidator = countryCodeValidator;
const businessCodeValidator = (value, ctx, field) => {
    if ((0, stringUtils_1.countCharacters)(value) > 20) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "BUSINESS_CODE_TOO_LONG",
            message: `${field.name} 값은 20자 이하여야 합니다.`,
            rawValue: value,
        });
        return;
    }
    if (!BUSINESS_CODE_REGEX.test(value)) {
        ctx.addFieldIssue(field.name, {
            severity: "error",
            code: "INVALID_BUSINESS_CODE",
            message: `${field.name} 값은 숫자와 하이픈(-)만 허용됩니다.`,
            rawValue: value,
        });
    }
};
exports.businessCodeValidator = businessCodeValidator;
