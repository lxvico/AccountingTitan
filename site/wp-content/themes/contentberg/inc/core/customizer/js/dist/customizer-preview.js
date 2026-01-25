(function(modules) {
    var installedModules = {};
    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) {
            return installedModules[moduleId].exports;
        }
        var module = installedModules[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        module.l = true;
        return module.exports;
    }
    __webpack_require__.m = modules;
    __webpack_require__.c = installedModules;
    __webpack_require__.d = function(exports, name, getter) {
        if (!__webpack_require__.o(exports, name)) {
            Object.defineProperty(exports, name, {
                enumerable: true,
                get: getter
            });
        }
    };
    __webpack_require__.r = function(exports) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exports, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
    };
    __webpack_require__.t = function(value, mode) {
        if (mode & 1) value = __webpack_require__(value);
        if (mode & 8) return value;
        if (mode & 4 && typeof value === "object" && value && value.__esModule) return value;
        var ns = Object.create(null);
        __webpack_require__.r(ns);
        Object.defineProperty(ns, "default", {
            enumerable: true,
            value: value
        });
        if (mode & 2 && typeof value != "string") for (var key in value) __webpack_require__.d(ns, key, function(key) {
            return value[key];
        }.bind(null, key));
        return ns;
    };
    __webpack_require__.n = function(module) {
        var getter = module && module.__esModule ? function getDefault() {
            return module["default"];
        } : function getModuleExports() {
            return module;
        };
        __webpack_require__.d(getter, "a", getter);
        return getter;
    };
    __webpack_require__.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };
    __webpack_require__.p = "";
    return __webpack_require__(__webpack_require__.s = 1);
})([ , function(module, exports) {
    class Bunyad_CZ_CssGenerator {
        constructor(api) {
            this.api = api;
            this.elements = {};
            this.settingPrefix = "";
            this.controlPrefix = "";
            this.queryMap = {
                root: false,
                global: false,
                main: "@media (min-width: 1200px)",
                large: "@media (min-width: 940px) and (max-width: 1200px)",
                medium: "@media (min-width: 768px) and (max-width: 940px)",
                small: "@media (max-width: 767px)"
            };
            this.fontAliases = {};
            this.deviceKeys = Object.keys(this.queryMap).filter(k => ![ "root" ].includes(k));
            this.css = [];
            this.cssRoot = [];
            this.googleFonts = [];
        }
        process() {
            const changed = this.getChanged();
            Object.keys(changed).forEach(key => {
                const element = changed[key];
                this.processElement(element, element.currentValue);
            });
        }
        processElement(element, value) {
            element.type = element.type || null;
            if (element.type == "font-family") {
                let fallbacks = {
                    "sans-serif": 'system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
                    serif: "Georgia, serif"
                };
                const systemFonts = {
                    "sans-serif": fallbacks["sans-serif"],
                    serif: fallbacks["serif"],
                    helvetica: "Helvetica, " + fallbacks["sans-serif"],
                    georgia: fallbacks["serif"],
                    monospace: "Menlo, Consolas, Monaco, Liberation Mono, Lucida Console, monospace"
                };
                const references = this.fontAliases;
                let fontFamily = value;
                let fallback = element.fallback_stack || "sans-serif";
                const isSystemFont = fontFamily in systemFonts;
                const reference = references[fontFamily];
                if (fontFamily.indexOf(",") !== -1) {
                    let [theFamily, ...families] = fontFamily.split(",");
                    families = families.join(",");
                    fontFamily = theFamily;
                } else {
                    if (fallback in fallbacks) {
                        fallback = fallbacks[fallback];
                    }
                }
                if (isSystemFont) {
                    value = systemFonts[fontFamily];
                } else if (reference) {
                    value = reference;
                } else {
                    value = `"${fontFamily}", ${fallback}`;
                    this.googleFonts.push(fontFamily);
                }
            }
            if (element.type == "dimensions") {
                for (const selector of Object.keys(element.css)) {
                    const data = element.css[selector];
                    if (!data.dimensions) {
                        continue;
                    }
                    data.props = data.props || [];
                    [ "top", "bottom", "left", "right" ].forEach(key => {
                        const callback = theValue => {
                            theValue["unit"] = theValue["unit"] || "px";
                            if (!theValue[key]) {
                                return false;
                            }
                            return theValue[key] + theValue["unit"];
                        };
                        data["props"][data.dimensions + "-" + key] = callback;
                    });
                    delete data.dimensions;
                    element["css"][selector] = data;
                }
            }
            if (element.type == "upload" && element.bg_type) {
                const bgType = element.bg_type.value;
                let props = {};
                if (bgType == "cover" || bgType == "cover-nonfixed") {
                    props = {
                        "background-repeat": "no-repeat",
                        "background-position": "center center",
                        "background-size": "cover"
                    };
                    if (bgType == "cover") {
                        props["background-attachment"] = "fixed";
                    }
                } else {
                    props = {
                        "background-repeat": bgType
                    };
                }
                for (const selector of Object.keys(element.css)) {
                    const data = element.css[selector];
                    element.css[selector].props = {
                        ...props,
                        ...data.props
                    };
                }
            }
            return this.processElementCss(element, value);
        }
        processElementCss(element, value) {
            if (!element.css) {
                return;
            }
            let values = value;
            if (element.devices) {
                const validKeys = Object.keys(values).filter(k => this.deviceKeys.includes(k));
                if (!validKeys.length) {
                    values = {
                        global: values
                    };
                }
                if (!value.limit && value.main) {
                    values = {
                        global: values.main,
                        ...values
                    };
                    if (values.main) {
                        const {main: main, ...newValues} = values;
                        values = newValues;
                    }
                }
            } else {
                values = {
                    global: values
                };
            }
            const devices = this.deviceKeys.filter(k => k in values);
            let elementCss = {};
            Object.keys(element.css).forEach(selector => {
                const data = element.css[selector];
                const props = {};
                let rawProps = {};
                let mediaQueries = devices;
                if (!data.props) {
                    const first = data[Object.keys(data)[0]];
                    if (!first.props) {
                        return;
                    }
                    rawProps = {
                        ...data
                    };
                    mediaQueries = [ ...new Set([ ...mediaQueries, ...Object.keys(rawProps).filter(v => v !== "all") ]) ];
                    if (mediaQueries.includes("main") && !rawProps.main) {
                        if (rawProps.global) {
                            rawProps.main = rawProps.global;
                        }
                    }
                } else {
                    rawProps = {
                        all: data
                    };
                }
                mediaQueries.forEach(media => {
                    if (!rawProps["all"] && !rawProps[media]) {
                        return;
                    }
                    const theProps = rawProps[media] || rawProps["all"];
                    let valueKey = media;
                    if (!theProps.props) {
                        return;
                    }
                    if (theProps["value_key"]) {
                        valueKey = theProps["value_key"];
                        if (valueKey === "main" && !values["main"]) {
                            valueKey = "global";
                        }
                    }
                    const theValue = values[valueKey] || null;
                    if (theValue === null) {
                        if (!theProps["force"]) {
                            return;
                        }
                    }
                    props[media] = this.processProps(theProps.props, theValue);
                });
                if (Object.keys(props).length) {
                    elementCss[selector] = props;
                }
            });
            if (Object.keys(elementCss).length) {
                return this.addElementCss(elementCss);
            }
            return false;
        }
        processProps(props, value) {
            let propsObj = {
                ...props
            };
            if (props.condition) {
                for (let expected of Object.keys(props.condition)) {
                    const theProps = props.condition[expected];
                    if (value == expected) {
                        propsObj = {
                            ...propsObj,
                            ...theProps
                        };
                    }
                }
                delete propsObj.condition;
            }
            let propStrings = [];
            Object.keys(propsObj).forEach(prop => {
                const format = propsObj[prop];
                const propValue = this.createPropValue(format, value);
                if (!propValue) {
                    return;
                }
                propStrings.push(`${prop}: ${propValue}`);
            });
            return propStrings;
        }
        addElementCss(css) {
            if (css.vars) {
                if (css.vars.global) {
                    const cssVars = css.vars.global ? css.vars.global : css.vars.main;
                    this.cssRoot = [ ...this.cssRoot, ...cssVars ];
                } else if (css.vars.main) {
                    css[":root"] = {
                        main: css.vars.main
                    };
                }
                delete css.vars;
            }
            this.css.push(css);
            return css;
        }
        createPropValue(format, value) {
            if (typeof format === "function") {
                format = format(value);
            }
            if (typeof format !== "string") {
                return false;
            }
            if (value === "--c-main") {
                value = `var(${value})`;
            }
            var matches = format.match(/{([a-z0-9\_\-\:]+?)}/g);
            (matches || []).forEach(match => {
                const key = match.replace(/[{}]/g, "");
                const replacement = this._interpolate(key, value);
                format = format.replace(match, replacement);
            });
            format = format.replace("%s", value);
            format = format.replace("%d", Number(value));
            const rgba = format.match(/rgba\(([^,]+?),([^,]+?)\)/);
            if (rgba && rgba[1]) {
                const rgb = this._hexToRgb(rgba[1]);
                const color = [ rgb.red, rgb.green, rgb.blue ].join(",");
                format = format.replace(rgba[1], color);
            }
            const hexConvert = format.match(/hexToRgb\((#[a-z0-9]{3,7})\)/i);
            if (hexConvert && hexConvert[1]) {
                const rgb = this._hexToRgb(hexConvert[1]);
                const color = [ rgb.red, rgb.green, rgb.blue ].join(",");
                format = format.replace(hexConvert[0], color);
            }
            return format + ";";
        }
        _hexToRgb(hex) {
            hex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => "#" + r + r + g + g + b + b);
            return {
                red: parseInt(hex.slice(1, 3), 16),
                green: parseInt(hex.slice(3, 5), 16),
                blue: parseInt(hex.slice(5, 7), 16)
            };
        }
        _interpolate(key, value) {
            const settingId = `${this.settingPrefix}[${key}]`;
            return this.api(settingId).get();
        }
        render() {
            this.css = [];
            this.cssRoot = [];
            this.process();
            const css = {
                ...this.queryMap
            };
            Object.keys(css).map(k => css[k] = []);
            css.root = this.cssRoot;
            const loopElement = element => {
                Object.keys(element).forEach(selector => {
                    const data = element[selector];
                    for (const media of Object.keys(data)) {
                        const props = data[media];
                        if (!props) {
                            continue;
                        }
                        const rule = `${selector} { ${props.join(" ")} }`;
                        if (!css[media]) {
                            css[media] = [];
                        }
                        css[media].push(rule);
                    }
                });
            };
            this.css.forEach(loopElement);
            return this._renderCssMedia(css).join("\n");
        }
        _renderCssMedia(css) {
            let finalCss = [];
            for (let media of Object.keys(css)) {
                const rules = css[media];
                if (media == "global") {
                    finalCss = [ ...finalCss, ...rules ];
                } else if (media == "root") {
                    finalCss.push(`:root { ${rules.join("\n")} }`);
                } else {
                    media = this.queryMap[media] || media;
                    finalCss.push(`${media} { ${rules.join("\n")} }`);
                }
            }
            return finalCss;
        }
        getChanged() {
            let changed = {};
            Object.keys(this.elements).forEach(key => {
                const value = this.elements[key];
                if (!value.css) {
                    return;
                }
                const settingId = `${this.settingPrefix}[${key}]`;
                const currentValue = this.api(settingId).get();
                const controlKey = `${this.controlPrefix}${key}`;
                if (!value.preserve && !this.api.settings.activeControls[controlKey]) {
                    return;
                }
                if (_.isEqual(currentValue, value["value"])) {
                    return;
                }
                changed[key] = Object.assign(value, {
                    currentValue: currentValue
                });
            });
            return changed;
        }
    }
    const cssGenerator = new Bunyad_CZ_CssGenerator(wp.customize);
    (function($) {
        "use strict";
        var api = wp.customize;
        api.bind("preview-ready", (function() {
            let themePrefix = "bunyad";
            api.preview.bind("bunyad-cz-data", message => {
                themePrefix = message.theme;
                cssGenerator.settingPrefix = message.settingPrefix;
                cssGenerator.controlPrefix = message.controlPrefix;
                cssGenerator.elements = message.elements;
                cssGenerator.fontAliases = message.fontAliases;
                bindSettings(message.elements, message.settingPrefix);
            });
            api.preview.bind("bunyad-control-state", control => {
                api.settings.activeControls[control.id] = control.state;
            });
            const renderCss = () => {
                setCustomCss(cssGenerator.render(), cssGenerator.googleFonts);
            };
            api.preview.bind("bunyad-cz-render-css", () => {
                renderCss();
            });
            const bindSettings = (elements, settingPrefix) => {
                Object.keys(elements).forEach(key => {
                    const element = elements[key];
                    if (!element.css) {
                        return;
                    }
                    const settingId = `${settingPrefix}[${key}]`;
                    const setting = api(settingId);
                    if (!setting) {
                        return;
                    }
                    setting.bind(renderCss);
                });
            };
            const setCustomCss = (css, gFonts) => {
                let cssElement = $("#bunyad-cz-custom-css");
                if (!cssElement.length) {
                    const ele = $('<style id="bunyad-cz-custom-css"></style>');
                    const themeCustomCss = $(`#${themePrefix}-custom-css, #${themePrefix}-core-inline-css, #${themePrefix}-skin-inline-css, #${themePrefix}-woocommerce-inline-css`);
                    if (themeCustomCss.length) {
                        ele.insertAfter(themeCustomCss[0]);
                        themeCustomCss.remove();
                    } else {
                        ele.appendTo($("head"));
                    }
                    cssElement = ele;
                }
                cssElement.text(css);
                if (gFonts && gFonts.length) {
                    const fonts = [ ...new Set(gFonts) ].map(v => encodeURIComponent(v) + ":300,400,500,600,700,800,900");
                    const ele = $('<link rel="stylesheet" type="text/css" />');
                    ele.prop("href", "https://fonts.googleapis.com/css?family=" + fonts.join("|"));
                    ele.appendTo("head");
                }
            };
        }));
    })(jQuery);
} ]);