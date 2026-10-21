(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/atoms/AmountText.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AmountText
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
'use client';
;
;
function AmountText(param) {
    let { amount = 0, currency = '₹', size = 'md', type = 'neutral', className = '' } = param;
    const formatted = new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
    }).format(Number(amount) || 0);
    const colors = {
        neutral: 'text-slate-900',
        credit: 'text-emerald-600',
        debit: 'text-rose-600',
        warning: 'text-amber-600'
    };
    const sizes = {
        xs: 'text-xs font-bold',
        sm: 'text-sm font-semibold',
        md: 'text-base font-bold',
        lg: 'text-xl font-bold',
        xl: 'text-3xl font-extrabold'
    };
    const prefix = type === 'credit' ? '+' : type === 'debit' ? '-' : '';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "inline-flex items-center tracking-tight ".concat(colors[type], " ").concat(sizes[size], " ").concat(className),
        children: [
            prefix,
            currency,
            formatted
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/atoms/AmountText.js",
        lineNumber: 35,
        columnNumber: 5
    }, this);
}
_c = AmountText;
var _c;
__turbopack_context__.k.register(_c, "AmountText");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/atoms/Button.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Button
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
'use client';
;
;
function Button(param) {
    let { children, type = 'button', variant = 'primary', size = 'md', disabled = false, loading = false, onClick, className = '' } = param;
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
        secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-800 focus:ring-slate-400',
        success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500',
        danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
        warning: 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-400',
        outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700 focus:ring-blue-500',
        ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-400'
    };
    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-base'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: type,
        disabled: disabled || loading,
        onClick: onClick,
        className: "".concat(baseStyles, " ").concat(variants[variant], " ").concat(sizes[size], " ").concat(className),
        children: [
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                className: "animate-spin -ml-1 mr-2 h-4 w-4 text-current",
                fill: "none",
                viewBox: "0 0 24 24",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        className: "opacity-25",
                        cx: "12",
                        cy: "12",
                        r: "10",
                        stroke: "currentColor",
                        strokeWidth: "4"
                    }, void 0, false, {
                        fileName: "[project]/src/components/atoms/Button.js",
                        lineNumber: 47,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        className: "opacity-75",
                        fill: "currentColor",
                        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    }, void 0, false, {
                        fileName: "[project]/src/components/atoms/Button.js",
                        lineNumber: 55,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/atoms/Button.js",
                lineNumber: 42,
                columnNumber: 9
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/atoms/Button.js",
        lineNumber: 35,
        columnNumber: 5
    }, this);
}
_c = Button;
var _c;
__turbopack_context__.k.register(_c, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/atoms/Input.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
'use client';
;
;
function Input(param) {
    let { type = 'text', name, value, onChange, placeholder = '', required = false, disabled = false, error = '', className = '', min, max, step } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: type,
                name: name,
                value: value,
                onChange: onChange,
                placeholder: placeholder,
                required: required,
                disabled: disabled,
                min: min,
                max: max,
                step: step,
                className: "w-full px-3.5 py-2 text-sm text-slate-800 bg-white border ".concat(error ? 'border-rose-500 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500', " rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500 transition-colors ").concat(className)
            }, void 0, false, {
                fileName: "[project]/src/components/atoms/Input.js",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-1 text-xs text-rose-600",
                children: error
            }, void 0, false, {
                fileName: "[project]/src/components/atoms/Input.js",
                lineNumber: 36,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/atoms/Input.js",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_c = Input;
var _c;
__turbopack_context__.k.register(_c, "Input");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/atoms/Select.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Select
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
'use client';
;
;
function Select(param) {
    let { name, value, onChange, options = [], placeholder = 'Select option', placeholderDisabled = false, required = false, disabled = false, error = '', className = '' } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                name: name,
                value: value,
                onChange: onChange,
                required: required,
                disabled: disabled,
                className: "w-full px-3.5 py-2 text-sm text-slate-800 bg-white border ".concat(error ? 'border-rose-500 focus:ring-rose-400' : 'border-slate-300 focus:ring-blue-500', " rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500 transition-colors ").concat(className),
                children: [
                    placeholder && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "",
                        disabled: placeholderDisabled,
                        children: placeholder
                    }, void 0, false, {
                        fileName: "[project]/src/components/atoms/Select.js",
                        lineNumber: 30,
                        columnNumber: 11
                    }, this),
                    options.map((opt, idx)=>{
                        const val = typeof opt === 'object' ? opt.value : opt;
                        const label = typeof opt === 'object' ? opt.label : opt;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                            value: val,
                            children: label
                        }, idx, false, {
                            fileName: "[project]/src/components/atoms/Select.js",
                            lineNumber: 38,
                            columnNumber: 13
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/atoms/Select.js",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-1 text-xs text-rose-600",
                children: error
            }, void 0, false, {
                fileName: "[project]/src/components/atoms/Select.js",
                lineNumber: 44,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/atoms/Select.js",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_c = Select;
var _c;
__turbopack_context__.k.register(_c, "Select");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/molecules/FormField.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FormField
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
'use client';
;
;
function FormField(param) {
    let { label, required = false, error = '', helpText = '', children, className = '' } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-1.5 ".concat(className),
        children: [
            label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "block text-xs font-semibold text-slate-700 uppercase tracking-wider",
                children: [
                    label,
                    " ",
                    required && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-rose-500",
                        children: "*"
                    }, void 0, false, {
                        fileName: "[project]/src/components/molecules/FormField.js",
                        lineNumber: 17,
                        columnNumber: 32
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/molecules/FormField.js",
                lineNumber: 16,
                columnNumber: 9
            }, this),
            children,
            helpText && !error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-slate-500",
                children: helpText
            }, void 0, false, {
                fileName: "[project]/src/components/molecules/FormField.js",
                lineNumber: 21,
                columnNumber: 30
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-rose-600 font-medium",
                children: error
            }, void 0, false, {
                fileName: "[project]/src/components/molecules/FormField.js",
                lineNumber: 22,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/molecules/FormField.js",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_c = FormField;
var _c;
__turbopack_context__.k.register(_c, "FormField");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/utils/exportHelper.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Lazy loaders for heavy libraries to prevent bloating initial page bundles and slow compiles
__turbopack_context__.s([
    "exportToStyledExcel",
    ()=>exportToStyledExcel,
    "exportToStyledPDF",
    ()=>exportToStyledPDF
]);
async function getXLSX() {
    const mod = await __turbopack_context__.A("[project]/node_modules/xlsx-js-style/dist/xlsx.min.js [app-client] (ecmascript, async loader)");
    return mod.default || mod;
}
async function getPDFModules() {
    const [jspdfMod, autoTableMod] = await Promise.all([
        __turbopack_context__.A("[project]/node_modules/jspdf/dist/jspdf.es.min.js [app-client] (ecmascript, async loader)"),
        __turbopack_context__.A("[project]/node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.mjs [app-client] (ecmascript, async loader)")
    ]);
    const jsPDF = jspdfMod.jsPDF || jspdfMod.default || jspdfMod;
    let autoTable = autoTableMod.default || autoTableMod.autoTable || autoTableMod;
    if (typeof autoTable !== 'function' && autoTable && typeof autoTable.default === 'function') {
        autoTable = autoTable.default;
    }
    return {
        jsPDF,
        autoTable
    };
}
async function exportToStyledExcel(param) {
    let { filename = "Expense_Tracker_".concat(new Date().toISOString().slice(0, 10), ".xlsx"), sheetName = 'Expense_Records', reportTitle = 'EXPENSE TRACKER', collegeName = 'PANIMALAR ENGINEERING COLLEGE', trustName = 'JAI SAKTHI EDUCATIONAL TRUST - AN AUTONOMOUS INSTITUTION', metaInfo = '', headers = [], rows = [], columnAlignments = [] } = param;
    const XLSX = await getXLSX();
    const colCount = Math.max(headers.length, 6);
    // Build Array of Arrays (AOA)
    const aoa = [
        [
            reportTitle
        ],
        [
            collegeName
        ],
        [
            trustName
        ]
    ];
    if (metaInfo) {
        aoa.push([
            metaInfo
        ]);
    }
    aoa.push([]); // Empty spacer row
    aoa.push(headers);
    // Append data rows
    rows.forEach((r)=>aoa.push(r));
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    // Top Title Merges across all columns
    const headerRowIdx = metaInfo ? 5 : 4;
    ws['!merges'] = [
        {
            s: {
                r: 0,
                c: 0
            },
            e: {
                r: 0,
                c: colCount - 1
            }
        },
        {
            s: {
                r: 1,
                c: 0
            },
            e: {
                r: 1,
                c: colCount - 1
            }
        },
        {
            s: {
                r: 2,
                c: 0
            },
            e: {
                r: 2,
                c: colCount - 1
            }
        }
    ];
    if (metaInfo) {
        ws['!merges'].push({
            s: {
                r: 3,
                c: 0
            },
            e: {
                r: 3,
                c: colCount - 1
            }
        });
    }
    // Row heights
    ws['!rows'] = [
        {
            hpt: 32
        },
        {
            hpt: 22
        },
        {
            hpt: 18
        }
    ];
    if (metaInfo) {
        ws['!rows'].push({
            hpt: 18
        });
    }
    ws['!rows'].push({
        hpt: 10
    }); // Spacer
    ws['!rows'].push({
        hpt: 26
    }); // Header row
    // Top Banner Styles
    ws['A1'].s = {
        font: {
            bold: true,
            sz: 16,
            color: {
                rgb: 'FFFFFF'
            },
            name: 'Arial'
        },
        fill: {
            fgColor: {
                rgb: '0F172A'
            }
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center'
        }
    };
    ws['A2'].s = {
        font: {
            bold: true,
            sz: 12,
            color: {
                rgb: 'FFFFFF'
            },
            name: 'Arial'
        },
        fill: {
            fgColor: {
                rgb: '1E3A8A'
            }
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center'
        }
    };
    ws['A3'].s = {
        font: {
            bold: true,
            sz: 10,
            color: {
                rgb: 'FEF08A'
            },
            name: 'Arial'
        },
        fill: {
            fgColor: {
                rgb: '1E40AF'
            }
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center'
        }
    };
    if (metaInfo && ws['A4']) {
        ws['A4'].s = {
            font: {
                italic: true,
                sz: 9,
                color: {
                    rgb: '475569'
                },
                name: 'Arial'
            },
            fill: {
                fgColor: {
                    rgb: 'F1F5F9'
                }
            },
            alignment: {
                horizontal: 'center',
                vertical: 'center'
            }
        };
    }
    // Border presets
    const thinBorder = {
        top: {
            style: 'thin',
            color: {
                rgb: 'CBD5E1'
            }
        },
        bottom: {
            style: 'thin',
            color: {
                rgb: 'CBD5E1'
            }
        },
        left: {
            style: 'thin',
            color: {
                rgb: 'CBD5E1'
            }
        },
        right: {
            style: 'thin',
            color: {
                rgb: 'CBD5E1'
            }
        }
    };
    // Header row styling with vibrant professional blue fill
    for(let c = 0; c < colCount; c++){
        const cellRef = XLSX.utils.encode_cell({
            r: headerRowIdx,
            c
        });
        if (ws[cellRef]) {
            ws[cellRef].s = {
                font: {
                    bold: true,
                    color: {
                        rgb: 'FFFFFF'
                    },
                    sz: 10,
                    name: 'Arial'
                },
                fill: {
                    fgColor: {
                        rgb: '2563EB'
                    }
                },
                alignment: {
                    horizontal: 'center',
                    vertical: 'center',
                    wrapText: true
                },
                border: {
                    top: {
                        style: 'medium',
                        color: {
                            rgb: '1E3A8A'
                        }
                    },
                    bottom: {
                        style: 'medium',
                        color: {
                            rgb: '1E3A8A'
                        }
                    },
                    left: {
                        style: 'thin',
                        color: {
                            rgb: '93C5FD'
                        }
                    },
                    right: {
                        style: 'thin',
                        color: {
                            rgb: '93C5FD'
                        }
                    }
                }
            };
        }
    }
    // Data rows styling
    const dataStartRow = headerRowIdx + 1;
    for(let r = 0; r < rows.length; r++){
        const rowIdx = dataStartRow + r;
        const isEven = r % 2 === 1;
        for(let c = 0; c < colCount; c++){
            const cellRef = XLSX.utils.encode_cell({
                r: rowIdx,
                c
            });
            if (ws[cellRef]) {
                const align = columnAlignments[c] || (c === 0 ? 'center' : 'left');
                ws[cellRef].s = {
                    font: {
                        sz: 9.5,
                        color: {
                            rgb: '0F172A'
                        },
                        name: 'Arial'
                    },
                    fill: isEven ? {
                        fgColor: {
                            rgb: 'F8FAFC'
                        }
                    } : undefined,
                    border: thinBorder,
                    alignment: {
                        vertical: 'center',
                        horizontal: align,
                        wrapText: false
                    }
                };
                // Format currency numbers if they look like numbers
                if (typeof ws[cellRef].v === 'number') {
                    ws[cellRef].z = '#,##0.00';
                }
            }
        }
    }
    // Calculate dynamic auto column widths based on maximum content length
    const colWidths = headers.map((h, colIdx)=>{
        let maxLen = String(h).length;
        rows.forEach((row)=>{
            const cellVal = row[colIdx];
            if (cellVal !== undefined && cellVal !== null) {
                maxLen = Math.max(maxLen, String(cellVal).length);
            }
        });
        // Return character width with generous padding
        return {
            wch: Math.min(Math.max(maxLen + 4, 8), 45)
        };
    });
    ws['!cols'] = colWidths;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, sheetName);
    XLSX.writeFile(workbook, filename);
}
async function exportToStyledPDF(param) {
    let { filename = "Expense_Tracker_".concat(new Date().toISOString().slice(0, 10), ".pdf"), reportTitle = 'EXPENSE TRACKER', collegeName = 'PANIMALAR ENGINEERING COLLEGE', trustName = 'JAI SAKTHI EDUCATIONAL TRUST - AN AUTONOMOUS INSTITUTION', metaInfo = '', headers = [], rows = [], orientation = 'landscape', columnStyles = {} } = param;
    const { jsPDF, autoTable } = await getPDFModules();
    const doc = new jsPDF(orientation);
    const pageWidth = doc.internal.pageSize.getWidth();
    // Top Dark Heading Banner for EXPENSE TRACKER
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(14, 10, pageWidth - 28, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(reportTitle, pageWidth / 2, 18, {
        align: 'center'
    });
    // College & Trust Information
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138); // Deep Blue
    doc.text(collegeName, pageWidth / 2, 28, {
        align: 'center'
    });
    doc.setFontSize(8.5);
    doc.setTextColor(185, 28, 28); // Crimson Red
    doc.text(trustName, pageWidth / 2, 33, {
        align: 'center'
    });
    if (metaInfo) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(metaInfo, pageWidth / 2, 38, {
            align: 'center'
        });
    }
    const startY = metaInfo ? 42 : 37;
    const tableFn = typeof autoTable === 'function' ? autoTable : typeof doc.autoTable === 'function' ? doc.autoTable.bind(doc) : null;
    if (!tableFn) {
        throw new Error('AutoTable PDF module failed to initialize.');
    }
    tableFn(doc, {
        head: [
            headers
        ],
        body: rows,
        startY,
        theme: 'grid',
        styles: {
            fontSize: 8,
            cellPadding: 2.5,
            lineColor: [
                203,
                213,
                225
            ],
            lineWidth: 0.1,
            textColor: [
                15,
                23,
                42
            ]
        },
        headStyles: {
            fillColor: [
                37,
                99,
                235
            ],
            textColor: [
                255,
                255,
                255
            ],
            fontStyle: 'bold',
            halign: 'center',
            lineColor: [
                30,
                58,
                138
            ],
            lineWidth: 0.2
        },
        alternateRowStyles: {
            fillColor: [
                248,
                250,
                252
            ]
        },
        columnStyles,
        margin: {
            left: 14,
            right: 14
        },
        didDrawPage: (data)=>{
            // Footer page number
            const pageNumber = doc.internal.getNumberOfPages();
            doc.setFontSize(7.5);
            doc.setTextColor(148, 163, 184);
            doc.text("Page ".concat(data.pageNumber, " of ").concat(pageNumber, " • Confidential DS Club Financial Report"), pageWidth / 2, doc.internal.pageSize.getHeight() - 8, {
                align: 'center'
            });
        }
    });
    doc.save(filename);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/income/page.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>IncomePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$atoms$2f$AmountText$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/atoms/AmountText.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$atoms$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/atoms/Button.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$atoms$2f$Input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/atoms/Input.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$atoms$2f$Select$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/atoms/Select.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$molecules$2f$FormField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/molecules/FormField.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PlusCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-plus.mjs [app-client] (ecmascript) <export default as PlusCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-up-right.mjs [app-client] (ecmascript) <export default as ArrowUpRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$spreadsheet$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileSpreadsheet$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-spreadsheet.mjs [app-client] (ecmascript) <export default as FileSpreadsheet>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.mjs [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$exportHelper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/exportHelper.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
function IncomePage() {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [incomes, setIncomes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [showAddModal, setShowAddModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        source: 'College Funding',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        paymentMethod: 'Bank Transfer',
        referenceNumber: ''
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "IncomePage.useEffect": ()=>{
            fetchIncome();
        }
    }["IncomePage.useEffect"], []);
    const fetchIncome = async ()=>{
        try {
            setLoading(true);
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/income');
            if (res.data.success) {
                setIncomes(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally{
            setLoading(false);
        }
    };
    const handleAddIncome = async (e)=>{
        e.preventDefault();
        try {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/income', formData);
            if (res.data.success) {
                setShowAddModal(false);
                setFormData({
                    source: 'College Funding',
                    amount: '',
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    paymentMethod: 'Bank Transfer',
                    referenceNumber: ''
                });
                fetchIncome();
            }
        } catch (err) {
            var _err_response_data, _err_response;
            alert(((_err_response = err.response) === null || _err_response === void 0 ? void 0 : (_err_response_data = _err_response.data) === null || _err_response_data === void 0 ? void 0 : _err_response_data.message) || err.message);
        }
    };
    const sourceOptions = [
        'College Funding',
        'Sponsorship',
        'Membership Fees',
        'Event Registration',
        'Donations',
        'Other Income'
    ];
    const totalIncomeSum = incomes.reduce((acc, inc)=>acc + inc.amount, 0);
    // Export to Excel (.xlsx) matching structured model format
    const exportToExcel = async ()=>{
        if (incomes.length === 0) {
            alert('No income records available to export.');
            return;
        }
        try {
            const headers = [
                '#',
                'Income Code / ID',
                'Source / Sponsor Name',
                'Category / Description',
                'Payment Method',
                'Reference No',
                'Amount (INR)',
                'Status',
                'Recorded At'
            ];
            const rows = incomes.map((inc, idx)=>[
                    idx + 1,
                    inc.incomeCode || 'N/A',
                    inc.source || '-',
                    inc.description || 'Club Inflow',
                    inc.paymentMethod || 'Bank Transfer',
                    inc.referenceNumber || '-',
                    inc.amount || 0,
                    'Completed',
                    new Date(inc.date || inc.createdAt).toLocaleString('en-IN')
                ]);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$exportHelper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["exportToStyledExcel"])({
                filename: "Panimalar_Club_Income_".concat(new Date().toISOString().slice(0, 10), ".xlsx"),
                sheetName: 'Income_Ledger',
                reportTitle: 'EXPENSE TRACKER',
                metaInfo: "Generated: ".concat(new Date().toLocaleString('en-IN'), " | Total Entries: ").concat(incomes.length, " | Total Income: Rs. ").concat(totalIncomeSum.toLocaleString('en-IN')),
                headers,
                rows,
                columnAlignments: [
                    'center',
                    'center',
                    'left',
                    'left',
                    'center',
                    'center',
                    'right',
                    'center',
                    'center'
                ]
            });
        } catch (err) {
            console.error('Export Excel failed:', err);
            alert('Failed to export Excel: ' + (err.message || 'Unknown error'));
        }
    };
    // Export to PDF matching structured model format
    const exportToPDF = async ()=>{
        if (incomes.length === 0) {
            alert('No income records available to export.');
            return;
        }
        try {
            const headers = [
                '#',
                'Code',
                'Source / Sponsor',
                'Description',
                'Payment Method',
                'Reference No',
                'Amount',
                'Status',
                'Recorded At'
            ];
            const rows = incomes.map((inc, idx)=>{
                const dateStr = new Date(inc.date || inc.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
                return [
                    idx + 1,
                    inc.incomeCode || 'N/A',
                    inc.source || '',
                    inc.description || '-',
                    inc.paymentMethod || 'Bank Transfer',
                    inc.referenceNumber || '-',
                    "Rs. ".concat((inc.amount || 0).toLocaleString('en-IN')),
                    'Completed',
                    dateStr
                ];
            });
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$exportHelper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["exportToStyledPDF"])({
                filename: "Panimalar_Club_Income_".concat(new Date().toISOString().slice(0, 10), ".pdf"),
                reportTitle: 'EXPENSE TRACKER',
                metaInfo: "Club Income Ledger | Total Entries: ".concat(incomes.length, " | Total Inflow: Rs. ").concat(totalIncomeSum.toLocaleString('en-IN')),
                headers,
                rows,
                orientation: 'landscape',
                columnStyles: {
                    0: {
                        halign: 'center',
                        cellWidth: 10
                    },
                    1: {
                        halign: 'center',
                        cellWidth: 26
                    },
                    2: {
                        halign: 'left'
                    },
                    3: {
                        halign: 'left'
                    },
                    4: {
                        halign: 'center',
                        cellWidth: 28
                    },
                    5: {
                        halign: 'center',
                        cellWidth: 26
                    },
                    6: {
                        halign: 'right',
                        cellWidth: 28
                    },
                    7: {
                        halign: 'center',
                        cellWidth: 22
                    },
                    8: {
                        halign: 'center',
                        cellWidth: 26
                    }
                }
            });
        } catch (err) {
            console.error('Export PDF failed:', err);
            alert('Failed to export PDF: ' + (err.message || 'Unknown error'));
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col md:flex-row md:items-center justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-xl font-extrabold text-slate-900 tracking-tight",
                                children: "Club Income Management"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/income/page.js",
                                lineNumber: 193,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-slate-500 mt-0.5",
                                children: "Track all incoming funds from college grants, sponsorships, membership fees, and donations."
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/income/page.js",
                                lineNumber: 196,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                        lineNumber: 192,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap items-center justify-between sm:justify-end gap-2.5",
                        children: [
                            [
                                'ADMIN',
                                'FINANCER',
                                'FACULTY_COORDINATOR'
                            ].includes(user === null || user === void 0 ? void 0 : user.role) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$atoms$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                variant: "primary",
                                size: "md",
                                onClick: ()=>setShowAddModal(true),
                                className: "font-bold",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PlusCircle$3e$__["PlusCircle"], {
                                        className: "w-4 h-4 mr-2"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                                        lineNumber: 204,
                                        columnNumber: 15
                                    }, this),
                                    " Record Club Income"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/income/page.js",
                                lineNumber: 203,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2.5 ml-auto sm:ml-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: exportToExcel,
                                        className: "inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer",
                                        title: "Export full table to Excel (.xlsx)",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$spreadsheet$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileSpreadsheet$3e$__["FileSpreadsheet"], {
                                                className: "w-4 h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                lineNumber: 214,
                                                columnNumber: 15
                                            }, this),
                                            " Export Excel"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                                        lineNumber: 209,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: exportToPDF,
                                        className: "inline-flex items-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer",
                                        title: "Export formatted report to PDF",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                                className: "w-4 h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                lineNumber: 221,
                                                columnNumber: 15
                                            }, this),
                                            " Export PDF"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                                        lineNumber: 216,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/income/page.js",
                                lineNumber: 208,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                        lineNumber: 201,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/income/page.js",
                lineNumber: 191,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-white shadow-lg shadow-emerald-500/20 flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-bold uppercase tracking-wider text-emerald-100",
                                children: "Total Recorded Club Income"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/income/page.js",
                                lineNumber: 229,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-3xl font-extrabold mt-1",
                                children: [
                                    "₹",
                                    totalIncomeSum.toLocaleString('en-IN')
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/income/page.js",
                                lineNumber: 230,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                        lineNumber: 228,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-3 bg-white/20 rounded-2xl backdrop-blur-xs",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpRight$3e$__["ArrowUpRight"], {
                            className: "w-8 h-8 text-white"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/income/page.js",
                            lineNumber: 233,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                        lineNumber: 232,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/income/page.js",
                lineNumber: 227,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-5 border-b border-slate-100 font-bold text-slate-900 text-sm",
                        children: "Income Ledger Entries"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                        lineNumber: 239,
                        columnNumber: 9
                    }, this),
                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-8 text-center text-xs text-slate-500",
                        children: "Loading income ledger..."
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                        lineNumber: 243,
                        columnNumber: 11
                    }, this) : incomes.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-12 text-center text-xs text-slate-500",
                        children: "No income entries recorded yet."
                    }, void 0, false, {
                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                        lineNumber: 245,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "md:hidden divide-y divide-slate-100 p-3 space-y-3",
                                children: incomes.map((inc)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-start justify-between gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "min-w-0",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "font-mono text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100",
                                                                children: inc.incomeCode
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                                lineNumber: 254,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                className: "font-bold text-xs text-slate-900 mt-1 leading-tight",
                                                                children: inc.source
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                                lineNumber: 257,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[11px] text-slate-500 mt-0.5 line-clamp-2",
                                                                children: inc.description || 'No description'
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                                lineNumber: 258,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                        lineNumber: 253,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-right flex-shrink-0",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$atoms$2f$AmountText$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                amount: inc.amount,
                                                                size: "sm",
                                                                type: "credit"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                                lineNumber: 261,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[10px] text-slate-400 mt-0.5",
                                                                children: new Date(inc.date).toLocaleDateString()
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                                lineNumber: 262,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                        lineNumber: 260,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                lineNumber: 252,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: [
                                                            "Payment: ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                className: "text-slate-700",
                                                                children: inc.paymentMethod
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                                lineNumber: 266,
                                                                columnNumber: 36
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                        lineNumber: 266,
                                                        columnNumber: 21
                                                    }, this),
                                                    inc.referenceNumber && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-mono text-[10px]",
                                                        children: [
                                                            "Ref: ",
                                                            inc.referenceNumber
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                        lineNumber: 267,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                lineNumber: 265,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, inc._id, true, {
                                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                                        lineNumber: 251,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/income/page.js",
                                lineNumber: 249,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "hidden md:block overflow-x-auto",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    className: "w-full text-left text-sm text-slate-600",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            className: "bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "px-6 py-4",
                                                        children: "Income Code"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                        lineNumber: 278,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "px-6 py-4",
                                                        children: "Source & Description"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                        lineNumber: 279,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "px-6 py-4",
                                                        children: "Date"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                        lineNumber: 280,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "px-6 py-4",
                                                        children: "Payment Method"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                        lineNumber: 281,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "px-6 py-4",
                                                        children: "Amount"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                        lineNumber: 282,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                lineNumber: 277,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/income/page.js",
                                            lineNumber: 276,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            className: "divide-y divide-slate-100",
                                            children: incomes.map((inc)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    className: "hover:bg-slate-50/80 transition-colors",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "px-6 py-4 font-mono font-bold text-slate-900 text-xs",
                                                            children: inc.incomeCode
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                            lineNumber: 288,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "px-6 py-4",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "font-bold text-slate-900 leading-tight",
                                                                    children: inc.source
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                                    lineNumber: 290,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs text-slate-500 mt-0.5",
                                                                    children: inc.description || 'No description'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                                    lineNumber: 291,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                            lineNumber: 289,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "px-6 py-4 text-xs font-medium text-slate-600",
                                                            children: new Date(inc.date).toLocaleDateString()
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                            lineNumber: 293,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "px-6 py-4 text-xs text-slate-600",
                                                            children: [
                                                                inc.paymentMethod,
                                                                " ",
                                                                inc.referenceNumber ? "(".concat(inc.referenceNumber, ")") : ''
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                            lineNumber: 296,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "px-6 py-4",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$atoms$2f$AmountText$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                amount: inc.amount,
                                                                size: "sm",
                                                                type: "credit"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                                lineNumber: 300,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                            lineNumber: 299,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, inc._id, true, {
                                                    fileName: "[project]/src/app/(dashboard)/income/page.js",
                                                    lineNumber: 287,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/income/page.js",
                                            lineNumber: 285,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/income/page.js",
                                    lineNumber: 275,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/income/page.js",
                                lineNumber: 274,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/income/page.js",
                lineNumber: 238,
                columnNumber: 7
            }, this),
            showAddModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-lg font-bold text-slate-900",
                            children: "Record Club Income"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(dashboard)/income/page.js",
                            lineNumber: 315,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleAddIncome,
                            className: "space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$molecules$2f$FormField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    label: "Income Source",
                                    required: true,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$atoms$2f$Select$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        value: formData.source,
                                        onChange: (e)=>setFormData({
                                                ...formData,
                                                source: e.target.value
                                            }),
                                        options: sourceOptions,
                                        required: true
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                                        lineNumber: 318,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/income/page.js",
                                    lineNumber: 317,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$molecules$2f$FormField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    label: "Amount (₹)",
                                    required: true,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$atoms$2f$Input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        type: "number",
                                        value: formData.amount,
                                        onChange: (e)=>setFormData({
                                                ...formData,
                                                amount: e.target.value
                                            }),
                                        placeholder: "50000",
                                        min: "0.01",
                                        step: "0.01",
                                        required: true
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                                        lineNumber: 327,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/income/page.js",
                                    lineNumber: 326,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$molecules$2f$FormField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    label: "Income Date",
                                    required: true,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$atoms$2f$Input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        type: "date",
                                        value: formData.date,
                                        onChange: (e)=>setFormData({
                                                ...formData,
                                                date: e.target.value
                                            }),
                                        required: true
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                                        lineNumber: 339,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/income/page.js",
                                    lineNumber: 338,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$molecules$2f$FormField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    label: "Payment Method",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$atoms$2f$Select$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        value: formData.paymentMethod,
                                        onChange: (e)=>setFormData({
                                                ...formData,
                                                paymentMethod: e.target.value
                                            }),
                                        options: [
                                            'Bank Transfer',
                                            'UPI',
                                            'Cheque',
                                            'Cash',
                                            'Card',
                                            'Other'
                                        ]
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                                        lineNumber: 348,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/income/page.js",
                                    lineNumber: 347,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$molecules$2f$FormField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    label: "Reference / Transaction Number",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$atoms$2f$Input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        value: formData.referenceNumber,
                                        onChange: (e)=>setFormData({
                                                ...formData,
                                                referenceNumber: e.target.value
                                            }),
                                        placeholder: "e.g. GOV-GRANT-2026"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                                        lineNumber: 356,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/income/page.js",
                                    lineNumber: 355,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$molecules$2f$FormField$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    label: "Description",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$atoms$2f$Input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        value: formData.description,
                                        onChange: (e)=>setFormData({
                                                ...formData,
                                                description: e.target.value
                                            }),
                                        placeholder: "e.g. Annual Student Activity Fund Grant"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/income/page.js",
                                        lineNumber: 364,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/income/page.js",
                                    lineNumber: 363,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-end gap-2 pt-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$atoms$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            variant: "outline",
                                            type: "button",
                                            onClick: ()=>setShowAddModal(false),
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/income/page.js",
                                            lineNumber: 372,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$atoms$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            variant: "primary",
                                            type: "submit",
                                            children: "Record Income"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/income/page.js",
                                            lineNumber: 375,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/income/page.js",
                                    lineNumber: 371,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/income/page.js",
                            lineNumber: 316,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/income/page.js",
                    lineNumber: 314,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/income/page.js",
                lineNumber: 313,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/income/page.js",
        lineNumber: 190,
        columnNumber: 5
    }, this);
}
_s(IncomePage, "r4UFICaXbIhaCKaPqnn4n5PKEWo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = IncomePage;
var _c;
__turbopack_context__.k.register(_c, "IncomePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/lucide-react/dist/esm/icons/circle-plus.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconData",
    ()=>__iconData,
    "default",
    ()=>CirclePlus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.mjs [app-client] (ecmascript)");
;
const __iconData = {
    name: "circle-plus",
    size: 24,
    node: [
        [
            "circle",
            {
                cx: "12",
                cy: "12",
                r: "10",
                key: "1mglay"
            }
        ],
        [
            "path",
            {
                d: "M8 12h8",
                key: "1wcyev"
            }
        ],
        [
            "path",
            {
                d: "M12 8v8",
                key: "napkw2"
            }
        ]
    ],
    aliases: [
        "plus-circle"
    ]
};
__iconData.node;
const CirclePlus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(__iconData);
;
 //# sourceMappingURL=circle-plus.mjs.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/circle-plus.mjs [app-client] (ecmascript) <export default as PlusCircle>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PlusCircle",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-plus.mjs [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/arrow-up-right.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconData",
    ()=>__iconData,
    "default",
    ()=>ArrowUpRight
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.mjs [app-client] (ecmascript)");
;
const __iconData = {
    name: "arrow-up-right",
    size: 24,
    node: [
        [
            "path",
            {
                d: "M7 7h10v10",
                key: "1tivn9"
            }
        ],
        [
            "path",
            {
                d: "M7 17 17 7",
                key: "1vkiza"
            }
        ]
    ]
};
__iconData.node;
const ArrowUpRight = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(__iconData);
;
 //# sourceMappingURL=arrow-up-right.mjs.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/arrow-up-right.mjs [app-client] (ecmascript) <export default as ArrowUpRight>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ArrowUpRight",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-up-right.mjs [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/file-spreadsheet.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconData",
    ()=>__iconData,
    "default",
    ()=>FileSpreadsheet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.mjs [app-client] (ecmascript)");
;
const __iconData = {
    name: "file-spreadsheet",
    size: 24,
    node: [
        [
            "path",
            {
                d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
                key: "1oefj6"
            }
        ],
        [
            "path",
            {
                d: "M14 2v5a1 1 0 0 0 1 1h5",
                key: "wfsgrz"
            }
        ],
        [
            "path",
            {
                d: "M8 13h2",
                key: "yr2amv"
            }
        ],
        [
            "path",
            {
                d: "M14 13h2",
                key: "un5t4a"
            }
        ],
        [
            "path",
            {
                d: "M8 17h2",
                key: "2yhykz"
            }
        ],
        [
            "path",
            {
                d: "M14 17h2",
                key: "10kma7"
            }
        ]
    ]
};
__iconData.node;
const FileSpreadsheet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(__iconData);
;
 //# sourceMappingURL=file-spreadsheet.mjs.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/file-spreadsheet.mjs [app-client] (ecmascript) <export default as FileSpreadsheet>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FileSpreadsheet",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$spreadsheet$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$spreadsheet$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-spreadsheet.mjs [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/file-text.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconData",
    ()=>__iconData,
    "default",
    ()=>FileText
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.mjs [app-client] (ecmascript)");
;
const __iconData = {
    name: "file-text",
    size: 24,
    node: [
        [
            "path",
            {
                d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
                key: "1oefj6"
            }
        ],
        [
            "path",
            {
                d: "M14 2v5a1 1 0 0 0 1 1h5",
                key: "wfsgrz"
            }
        ],
        [
            "path",
            {
                d: "M10 9H8",
                key: "b1mrlr"
            }
        ],
        [
            "path",
            {
                d: "M16 13H8",
                key: "t4e002"
            }
        ],
        [
            "path",
            {
                d: "M16 17H8",
                key: "z1uh3a"
            }
        ]
    ]
};
__iconData.node;
const FileText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(__iconData);
;
 //# sourceMappingURL=file-text.mjs.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/file-text.mjs [app-client] (ecmascript) <export default as FileText>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FileText",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.mjs [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=_e1626aba._.js.map