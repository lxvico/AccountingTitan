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
    return __webpack_require__(__webpack_require__.s = 0);
})([ function(module, exports) {
    window.Bunyad_CZ = Bunyad_CZ = {
        util: {},
        presetsNotice: {}
    };
    (function($, api, _) {
        "use strict";
        const optionsKey = Bunyad_CZ_Data.settingPrefix;
        const controlPrefix = Bunyad_CZ_Data.controlPrefix;
        Bunyad_CZ.util = function() {
            const self = {
                elements: [],
                getDefaultVal(id) {
                    const regex = new RegExp(`${optionsKey}\\[(.+?)\\]`);
                    id = id.replace(regex, "$1");
                    const element = this.elements[id];
                    if (!element || !("value" in element)) {
                        return "";
                    }
                    return element.value === null ? "" : element.value;
                }
            };
            return self;
        }();
        Bunyad_CZ.util.elements = Bunyad_CZ_Data.elements;
        $(document).on("click", ".reset-customizer", (function(e) {
            e.preventDefault();
            if (!confirm("WARNING: All settings will reset to default.")) {
                return;
            }
            var data = {
                action: "reset_customizer",
                nonce: api.settings.nonce.save
            };
            $.post(ajaxurl, data, (function(resp) {
                if (!resp.success) {
                    return;
                }
                wp.customize.state("saved").set(true);
                location.reload();
            }), "json");
        }));
        $(document).on("click", ".focus-link", (function() {
            var addNav = $(this).hasClass("is-with-nav"), navText = $(this).data("nav-text"), target, headerId;
            const section = $(this).data("section");
            if (section) {
                target = wp.customize.section(section);
                headerId = "#sub-accordion-section-" + section;
            }
            const panel = $(this).data("panel");
            if (panel) {
                target = wp.customize.panel(panel);
                headerId = "#sub-accordion-panel-" + panel;
            }
            if (target) {
                const container = target.container.length > 1 ? target.container.eq(1) : target.container;
                const curSection = wp.customize.state("expandedSection").get();
                const curPanel = wp.customize.state("expandedPanel").get();
                if (!navText && curSection) {
                    navText = curSection.params.title;
                }
                container.on("expanded.bcz", () => {
                    container.off("expanded.bcz");
                    if (addNav) {
                        var sectionNav = $(headerId).find(".bunyad-cz-section-nav");
                        if (!sectionNav.length) {
                            sectionNav = $('<div class="bunyad-cz-section-nav"></div>');
                            let appendTo = $(headerId).find(".panel-meta");
                            if (!appendTo.length) {
                                appendTo = $(headerId).find(".customize-section-title");
                            }
                            sectionNav.appendTo(appendTo);
                        }
                        let text = `\n\t\t\t\t\t\t<a href="#" class="focus-link">\n\t\t\t\t\t\t\t&laquo; Go Back to <span>${navText}</span>\n\t\t\t\t\t\t</a>\n\t\t\t\t\t`;
                        text = $(text);
                        if (curSection) {
                            text.data("section", curSection.id);
                        } else {
                            text.data("panel", curPanel.id);
                        }
                        sectionNav.html(text);
                        container.on("collapsed.bcz", () => {
                            sectionNav.remove();
                            container.off("collapsed.bcz");
                        });
                    }
                });
                requestAnimationFrame(() => {
                    target.focus();
                });
            }
            return false;
        }));
        $(document).on("click", ".bunyad-cz-group-collapsible .head-label", (function() {
            var container = $(this).closest(".bunyad-cz-group");
            container.find(" > .group-content").slideToggle(200);
            container.toggleClass("is-active");
            return false;
        }));
        Bunyad_CZ.presetsNotice = function() {
            const util = Bunyad_CZ.util;
            const self = {
                setup(setting, affected, notice, excludes) {
                    notice = "#customize-control-bunyad_" + notice;
                    let hasChanged = false;
                    setting.bind(value => {
                        hasChanged = this.checkChanged(affected, false, excludes);
                    });
                    api.previewer.bind("ready", () => {
                        if (!hasChanged) {
                            return;
                        }
                        $(notice).removeClass("bunyad-cz-hidden").show();
                    });
                    $(document).on("click", notice + " .preset-reset", e => {
                        this.resetAffected(affected, excludes);
                        $(notice).addClass("bunyad-cz-hidden");
                        return false;
                    });
                },
                containsAffected(checks, id, excludes) {
                    const checker = check => {
                        let regexStr = `${optionsKey}\\[${check}\\]`;
                        if (regexStr.includes("*")) {
                            regexStr = regexStr.replace("*", "(.+?)");
                        }
                        const regex = new RegExp(regexStr);
                        if (regex.test(id)) {
                            return true;
                        }
                    };
                    let contains = checks.some(checker);
                    if (excludes && excludes.some(checker)) {
                        contains = false;
                    }
                    return contains;
                },
                checkChanged(affected, callback, excludes) {
                    let hasChanged = false;
                    wp.customize.control.each(control => {
                        if (hasChanged || !control.setting || !control.setting.id) {
                            return;
                        }
                        const defaultVal = util.getDefaultVal(control.setting.id);
                        if (!this.containsAffected(affected, control.setting.id), excludes) {
                            return;
                        }
                        if (!_.isEqual(control.setting.get(), defaultVal)) {
                            hasChanged = true;
                        }
                    });
                    if (hasChanged && callback) {
                        callback();
                    }
                    return hasChanged;
                },
                resetAffected(affected, excludes) {
                    wp.customize.control.each(control => {
                        if (!control.setting || !control.setting.id) {
                            return;
                        }
                        const defaultVal = util.getDefaultVal(control.setting.id);
                        if (!this.containsAffected(affected, control.setting.id, excludes)) {
                            return;
                        }
                        if (!_.isEqual(control.setting.get(), defaultVal)) {
                            control.setting.set(defaultVal);
                            const pickerClear = control.container.find(".wp-picker-clear");
                            if (!defaultVal) {
                                pickerClear.click();
                            }
                            const mediaClear = control.container.find(".attachment-media-view .remove-button");
                            if (!defaultVal) {
                                mediaClear.click();
                            }
                        }
                    });
                }
            };
            return self;
        }();
        const deviceMap = {
            tablet: "medium",
            mobile: "small",
            desktop: "main"
        };
        let customizerReady;
        api.bind("ready", () => {
            customizerReady = true;
        });
        const Bunyad_CZ_Control = {
            _super: api.Control.prototype,
            lazyEmbed: false,
            doneReady: false,
            initialize: function(id, options) {
                if (this && (!options.params || options.params.type !== "group")) {
                    this.lazyEmbed = id.indexOf("bunyad_") === 0;
                }
                Bunyad_CZ_Control._super.initialize.call(this, id, options);
            },
            ready: function() {
                Bunyad_CZ_Control._super.ready.call(this);
                var control = this;
                if (!this.params.devices) {
                    return;
                }
                var devices = control.container.find(".bunyad-cz-device");
                devices.each((function() {
                    var el = $(this);
                    var device = $(this).data("device");
                    if (device !== "main") {
                        $(this).hide();
                    }
                    var setting = control.setting;
                    el.find("[data-bunyad-cz-key], [data-bunyad-cz-device-key]").each((function() {
                        var element = new api.Element($(this));
                        var localUpdate = false;
                        control.elements.push(element);
                        var deviceKey = $(this).data("bunyad-cz-device-key");
                        element.bind((function(to) {
                            if (!customizerReady || !control.doneReady || localUpdate) {
                                return;
                            }
                            var current = _.clone(Object(setting.get()));
                            var subkey = element.element.data("bunyad-cz-subkey");
                            if (subkey) {
                                current[device] = _.isObject(current[device]) ? _.clone(current[device]) : {};
                                current[device][subkey] = to;
                                if (to === "") {
                                    delete current[device][subkey];
                                }
                            } else if (deviceKey) {
                                current[deviceKey] = to;
                            } else {
                                current[device] = to;
                            }
                            setting.set(current);
                        }));
                        setting.bind((function(to) {
                            if (to === "") {
                                element.set("");
                                return;
                            }
                            let setValue = null;
                            const subKey = element.element.data("bunyad-cz-subkey");
                            if (deviceKey === "limit" && !("limit" in to)) {
                                to.limit = 0;
                            }
                            if (subKey) {
                                if (typeof to[device] === "object" && subKey in to[device]) {
                                    setValue = to[device][subKey];
                                } else {
                                    if (subKey !== "unit") {
                                        setValue = "";
                                    }
                                }
                            } else if (deviceKey && deviceKey in to) {
                                setValue = to[deviceKey];
                            } else if (!deviceKey && device in to) {
                                setValue = to[device];
                            }
                            localUpdate = true;
                            if (setValue !== null) {
                                element.set(setValue);
                            }
                            localUpdate = false;
                        }));
                    }));
                    var limitEle = el.find(".bunyad-cz-device-limit");
                    el.find("input:not(.bunyad-cz-device-limit input), select, textarea").on("focus", (function() {
                        limitEle.addClass("is-active");
                    }));
                    limitEle.find("input").on("change", (function() {
                        $(this).is(":checked") ? limitEle.addClass("is-active") : null;
                    })).trigger("change");
                }));
                control.container.find(".bunyad-cz-devices a").on("click", (function(e) {
                    var device = $(this).data("device");
                    $(this).addClass("active").siblings().removeClass("active");
                    devices.each((function() {
                        var el = $(this);
                        el.data("device") === device ? el.addClass("active").fadeIn(200) : el.removeClass("active").hide();
                    }));
                    if (e.originalEvent) {
                        api.previewedDevice.set(Object.keys(deviceMap).filter((function(key) {
                            return deviceMap[key] === device;
                        })));
                    }
                    e.preventDefault();
                }));
                control.doneReady = true;
            },
            embed: function() {
                var control = this;
                if (control.params.style) {
                    control.params.content.addClass("bunyad-cz-control-" + control.params.style);
                }
                if (control.params.classes) {
                    control.params.content.addClass(control.params.classes);
                }
                if (!control.params.group && !control.lazyEmbed) {
                    return Bunyad_CZ_Control._super.embed.call(this);
                }
                const inject = function(sectionId) {
                    if (!sectionId) {
                        return;
                    }
                    api.section(sectionId, (function(section) {
                        if (control.lazyEmbed) {
                            if (section.expanded() || api.settings.autofocus.control === control.id) {
                                section.deferred.embedded.done(() => control.actuallyEmbed(section));
                            } else {
                                section.expanded.bind(expanded => {
                                    if (expanded) {
                                        section.deferred.embedded.done(() => control.actuallyEmbed(section));
                                    }
                                });
                            }
                        } else {
                            section.deferred.embedded.done(() => control.actuallyEmbed(section));
                        }
                    }));
                };
                control.section.bind(inject);
                inject(control.section.get());
            },
            actuallyEmbed: function(section) {
                const control = this;
                section = section || control.section;
                if ("resolved" === control.deferred.embedded.state()) {
                    return;
                }
                var parentContainer = section.contentContainer.is("ul") ? section.contentContainer : section.contentContainer.find("ul:first");
                parentContainer = groupParentContainer(parentContainer, control);
                if (!control.container.parent().is(parentContainer)) {
                    parentContainer.append(control.container);
                }
                control.renderContent();
                control.deferred.embedded.resolve();
            },
            focus: function(params) {
                const control = this;
                if (control.lazyEmbed) {
                    control.actuallyEmbed();
                }
                Bunyad_CZ_Control._super.focus.call(control, params);
            }
        };
        api.Control = api.Control.extend(Bunyad_CZ_Control);
        api.bind("pane-contents-reflowed", (function() {
            try {
                api.section.each((function(section) {
                    var controls = section.controls();
                    var appendContainer = section.contentContainer.is("ul") ? section.contentContainer : section.contentContainer.find("ul:first");
                    _(controls).each((function(control) {
                        if (!control.params.group) {
                            return;
                        }
                        if (!appendContainer.data("has-groups")) {
                            appendContainer.data("has-groups", 1);
                        }
                        var container = groupParentContainer(appendContainer, control);
                        if (container.length && !container.find(control.container).length) {
                            container.append(control.container);
                        }
                    }));
                }));
            } catch (e) {
                !console || console.log(e);
            }
        }));
        const groupParentContainer = function(parentContainer, control) {
            if (!control.params.group) {
                return parentContainer;
            }
            parentContainer = parentContainer.find("#customize-control-" + control.params.group);
            if (!parentContainer.find(".controls").length) {
                parentContainer.append('<ul class="controls"></ul>');
            }
            return parentContainer.find(".controls").eq(0);
        };
        const groupsEqualChecks = () => {
            const orig = api.utils.areElementListsEqual;
            api.utils.areElementListsEqual = function(listA, listB) {
                if (listB.length && $(listB[0]).attr("id").indexOf("bunyad_") === -1) {
                    return orig(listA, listB);
                } else {
                    const container = $(listB[0]).closest(".control-section");
                    if (!container || !container.data("has-groups")) {
                        return orig(listA, listB);
                    }
                    const count = container.find('li[id*="customize-control-"]').length;
                    return count === listA.length;
                }
            };
        };
        groupsEqualChecks();
        api.bind("ready", (function() {
            api.previewedDevice.bind((function(newDevice) {
                var device = deviceMap[newDevice];
                if (!device) {
                    return;
                }
                $(".bunyad-cz-devices a[data-device=" + device + "]").click();
            }));
        }));
        api.controlConstructor["bunyad-slider"] = api.Control.extend({
            ready: function() {
                api.Control.prototype.ready.call(this);
                var control = this, container = control.container;
                var sync = function(e) {
                    if (this.val() !== e.target.value) {
                        this.val(e.target.value).trigger("change");
                    }
                };
                var target = this.params.devices ? "[data-device]" : ".customize-control-content";
                container.find(target).each((function() {
                    var range = $(this).find("[type=range]"), number = $(this).find("[type=number]");
                    var rangePosition = function() {
                        if (number.val() === "") {
                            range.val(0);
                        }
                    };
                    rangePosition();
                    range.on("input", sync.bind(number));
                    number.on("input", (function(e) {
                        sync.call(range, e);
                        rangePosition();
                    }));
                }));
            }
        });
        var Bunyad_CZ_Context = function() {
            var self = {
                dependencies: [],
                init: function() {
                    wp.customize.control.each((function(control) {
                        if (!control.params.context) {
                            return;
                        }
                        var checkActiveState = function(e) {
                            self.setActiveState(control);
                        };
                        checkActiveState();
                        control.setting.bind(checkActiveState);
                        control.active.validate = function() {
                            return self.shouldDisplay(control);
                        };
                        _.each(control.params.context, (function(data) {
                            if (!data.key) {
                                return;
                            }
                            var setting = api(data.key);
                            !setting || setting.bind(checkActiveState);
                        }));
                    }));
                },
                setActiveState: function(control) {
                    const state = self.shouldDisplay(control);
                    control.active.set(state);
                    api.previewer.send("bunyad-control-state", {
                        id: control.id,
                        state: state
                    });
                    const depends = this.dependencies[control.id];
                    if (depends) {
                        depends.forEach(child => {
                            this.setActiveState(wp.customize.control(child));
                        });
                    }
                },
                addDependency: function(parent, child) {
                    if (!this.dependencies[parent]) {
                        this.dependencies[parent] = [];
                    }
                    this.dependencies[parent].push(child);
                },
                shouldDisplay: function(control) {
                    var context = control.params.context, active = null;
                    _.each(context, (function(data) {
                        if (active === false && data.relation !== "OR") {
                            return;
                        }
                        if (active === true && data.relation === "OR") {
                            return;
                        }
                        var value = api(data.key).get(), expected = data.value, compare = data.compare || "";
                        if (!data.skipParentCheck) {
                            const origKey = controlPrefix + data.origKey;
                            const dependParent = wp.customize.control(origKey);
                            if (dependParent && dependParent.params.context) {
                                self.addDependency(origKey, control.id);
                                if (!self.shouldDisplay(dependParent)) {
                                    active = false;
                                    return;
                                }
                            }
                        }
                        active = self.compare(value, expected, compare);
                    }));
                    return active === null ? true : active;
                },
                compare: function(value, expected, compare) {
                    if (_.isArray(expected)) {
                        compare = compare == "!=" ? "not in" : "in";
                    }
                    switch (compare) {
                      case "in":
                      case "not in":
                        const result = expected.indexOf(value) !== -1;
                        return compare == "in" ? result : !result;

                      case "!=":
                        return value != expected;

                      default:
                        return value == expected;
                    }
                }
            };
            return self;
        }();
        api.bind("ready", Bunyad_CZ_Context.init);
        var Bunyad_CZ_Fonts = function() {
            var self = {
                fonts: {
                    google: [],
                    system: [],
                    global: []
                },
                isSetup: false,
                googleFonts: [],
                setup: function() {
                    if (this.isSetup || !Bunyad_Fonts_List) {
                        return false;
                    }
                    this.fonts.system = Bunyad_Fonts_List.system;
                    this.fonts.global = Bunyad_Fonts_List.global;
                    this.setupGoogle();
                    this.isSetup = true;
                },
                setupGoogle: function() {
                    if (this.fonts.google.length) {
                        return;
                    }
                    if (!Bunyad_Fonts_List || !Bunyad_Fonts_List.google) {
                        return;
                    }
                    this.googleFonts = Bunyad_Fonts_List.google;
                    var _googleFonts = [];
                    _.each(this.googleFonts, (function(font) {
                        _googleFonts.push({
                            label: font.family,
                            value: font.family,
                            group: "google"
                        });
                    }));
                    this.fonts.google = _googleFonts;
                },
                get: function(type) {
                    this.setup();
                    return type ? this.fonts[type] : this.fonts;
                },
                getOptions: function(ensureValue, addGlobal) {
                    const fonts = [].concat(addGlobal ? this.get("global") : [], this.get("google"), this.get("system"));
                    if (ensureValue && typeof ensureValue === "string") {
                        const hasValue = fonts.some(f => f.value === ensureValue);
                        if (!hasValue) {
                            fonts.push({
                                label: ensureValue,
                                value: ensureValue,
                                group: "system"
                            });
                        }
                    }
                    return fonts;
                }
            };
            return self;
        }();
        api.controlConstructor["bunyad-font-family"] = api.Control.extend({
            ready: function() {
                api.Control.prototype.ready.call(this);
                var control = this, container = control.container;
                const optGroups = [ {
                    value: "global",
                    label: "Globals"
                }, {
                    value: "google",
                    label: "Google Fonts"
                }, {
                    value: "system",
                    label: "System Fonts"
                } ];
                const select = container.find("select");
                const value = select.data("selected");
                let localUpdate = false;
                select.selectize({
                    create: true,
                    allowEmptyOption: true,
                    options: Bunyad_CZ_Fonts.getOptions(value, this.params.add_global),
                    optgroups: optGroups,
                    maxOptions: 1500,
                    optgroupField: "group",
                    valueField: "value",
                    labelField: "label",
                    searchField: "label",
                    onChange: value => {
                        if (control.setting && customizerReady) {
                            localUpdate = true;
                        }
                    }
                });
                if (value) {
                    select[0].selectize.setValue(value);
                }
                control.setting.bind((function(to) {
                    if (!localUpdate) {
                        select[0].selectize.setValue(to);
                    }
                    localUpdate = false;
                }));
            }
        });
        api.controlConstructor["bunyad-selectize"] = api.Control.extend({
            ready: function() {
                api.Control.prototype.ready.call(this);
                const control = this;
                const select = control.container.find("select");
                let localUpdate = false;
                const initArgs = {
                    create: false,
                    onChange: value => {
                        if (control.setting && customizerReady) {
                            localUpdate = true;
                            if (value === null) {
                                control.setting.set([]);
                            }
                        }
                    },
                    items: control.setting.get(),
                    plugins: []
                };
                if (control.params.sortable) {
                    initArgs.plugins.push("drag_drop");
                }
                if (control.params.multiple) {
                    initArgs.plugins.push("remove_button");
                }
                select.selectize(initArgs);
                control.setting.bind((function(to) {
                    if (!localUpdate) {
                        select[0].selectize.setValue(to);
                    }
                    localUpdate = false;
                }));
            }
        });
        api.controlConstructor["bunyad-toggle"] = api.Control.extend({
            ready: function() {
                api.Control.prototype.ready.call(this);
                const control = this;
                const checkbox = control.container.find(":checkbox");
                checkbox.on("change", (function() {
                    const parent = $(this).parent();
                    this.checked ? parent.addClass("is-checked") : parent.removeClass("is-checked");
                }));
                if (control.setting) {
                    control.setting.bind((function() {
                        checkbox.trigger("change");
                    }));
                }
            }
        });
        api.controlConstructor["bunyad-dimensions"] = api.Control.extend({
            isLinked: {},
            ready: function() {
                api.Control.prototype.ready.call(this);
                var control = this;
                this.isLinked = new api.Value;
                this.isLinked.bind((function() {
                    var ele = control.container.find(".bunyad-cz-dimensions-linked");
                    ele.removeClass("active").addClass(control.isLinked.get() ? "active" : "");
                }));
                this.isLinked.set(this.params.linked);
                this.container.on("click", ".bunyad-cz-dimensions-linked", (function() {
                    control.isLinked.set(!control.isLinked.get());
                    return false;
                }));
                var inputs = this.container.find("input[type=number]");
                inputs.on("input", (function() {
                    if (!control.isLinked.get()) {
                        return;
                    }
                    var relatedInputs = $(this).closest(".bunyad-cz-device, div").find("input[type=number]"), currentVal = $(this).val();
                    relatedInputs.val(currentVal).trigger("change");
                }));
            }
        });
        api.controlConstructor["group"] = api.Control.extend({
            ready: function() {
                api.Control.prototype.ready.call(this);
                var container = this.container;
                container.on("click", ".group-content-toggle", (function(e) {
                    const parent = $(this).closest(".bunyad-cz-group");
                    if (parent.get(0) !== container.find(".bunyad-cz-group").get(0)) {
                        e.preventDefault();
                        return;
                    }
                    parent.find(".group-content").slideToggle();
                    e.preventDefault();
                }));
            }
        });
        const colorPickerReady = control => {
            const container = control.container;
            let dynamicColor = container.find(".use-main-color");
            const mainColorId = `${optionsKey}[css_main_color]`;
            if (control.setting.id === mainColorId) {
                dynamicColor.remove();
                dynamicColor = null;
            }
            if (dynamicColor && dynamicColor.length) {
                const setBgColor = () => {
                    const color = wp.customize(mainColorId).get();
                    if (!color) {
                        return;
                    }
                    container.find(".wp-color-result").css("background", color);
                };
                const useMainClass = value => {
                    const target = container.find(".wp-picker-container");
                    value ? target.addClass("is-main-color") : target.removeClass("is-main-color");
                };
                control.setting.bind(to => {
                    if (to === Bunyad_CZ.util.getDefaultVal(control.setting.id)) {
                        useMainClass(false);
                        dynamicColor.find("input").prop("checked", false);
                    }
                });
                if (control.setting.get() === "--c-main") {
                    dynamicColor.find("input").prop("checked", true);
                    useMainClass(true);
                    setBgColor();
                }
                dynamicColor.appendTo(container.find(".wp-picker-container")).on("click", "input", (function() {
                    let value = "";
                    if ($(this).is(":checked")) {
                        value = "--c-main";
                        setBgColor();
                    }
                    control.setting.set(value);
                    useMainClass(value);
                }));
            }
            container.find("button.button").on("click", (function(e) {
                if (!e.hasOwnProperty("originalEvent")) {
                    return;
                }
                const close = e => {
                    container.removeClass("picker--active");
                    $("body").off("click.wpcolorpicker", close);
                };
                $("body").on("click.wpcolorpicker", close);
                if (!$(this).hasClass("wp-picker-open")) {
                    close();
                } else {
                    container.addClass("picker--active");
                }
            }));
        };
        api(optionsKey + "[css_main_color]", setting => {
            setting.bind(newValue => {
                if (!newValue) {
                    return;
                }
                wp.customize.control.each(control => {
                    if (![ "bunyad-color", "bunyad-color-alpha" ].includes(control.params.type) || !control.setting || control.setting.id === setting.id) {
                        return;
                    }
                    const color = control.setting.get();
                    if (color === "--c-main") {
                        control.container.find(".wp-color-result").css("background", newValue);
                    }
                });
            });
        });
        api.controlConstructor["bunyad-color"] = api.Control.extend({
            ready: function() {
                api.Control.prototype.ready.call(this);
                api.ColorControl.prototype.ready.call(this);
                this.setting.bind(to => {
                    if (to == "") {
                        const pickerClear = this.container.find(".wp-picker-clear");
                        if (pickerClear.length) {
                            pickerClear.click();
                        }
                    }
                });
                colorPickerReady(this);
            }
        });
        api.controlConstructor["bunyad-radio-image"] = api.Control.extend({
            ready: function() {
                api.Control.prototype.ready.call(this);
                var control = this;
                control.container.find("img").bunyadToolTip({
                    class: "bunyad-cz-tooltip",
                    content: function() {
                        let content;
                        if ($(this).data("preview")) {
                            content = `<img src="${$(this).data("preview")}" />`;
                        }
                        return content || $(this)[0].outerHTML;
                    }
                });
            }
        });
        api.controlConstructor["checkboxes"] = api.Control.extend({
            ready: function() {
                var control = this;
                let isUserEvent = false;
                if (control.params.sortable) {
                    control.container.find("ul").sortable({
                        update: e => {
                            control.container.find("input").trigger("change");
                        }
                    });
                }
                this.container.on("change", "input:checkbox", (function() {
                    var values = $('input[type="checkbox"]:checked', control.container).map((function() {
                        return this.value;
                    })).get();
                    isUserEvent = true;
                    control.setting.set(values || "");
                    isUserEvent = false;
                }));
                control.setting.bind(to => {
                    if (isUserEvent) {
                        return;
                    }
                    control.container.find("input[type=checkbox]").each((i, ele) => {
                        const checkBox = $(ele);
                        const checked = to.includes(checkBox.val()) ? 1 : 0;
                        checkBox.prop("checked", checked);
                    });
                });
            }
        });
        api.controlConstructor["bunyad-color-alpha"] = api.Control.extend({
            lazyEmbed: true,
            ready: function() {
                const control = this;
                let localUpdate = false;
                control.setting.bind(to => {
                    if (localUpdate) {
                        return false;
                    }
                    if (to == "") {
                        const pickerClear = this.container.find(".wp-picker-clear");
                        if (pickerClear.length) {
                            pickerClear.click();
                        }
                    } else {
                        control.container.find(".alpha-color-control").val(to).trigger("change");
                    }
                });
                control.container.find(".alpha-color-control").each((function() {
                    var $control, startingColor, paletteInput, showOpacity, defaultColor, palette, colorPickerOptions, $container, $alphaSlider, alphaVal, sliderOptions;
                    $control = $(this);
                    startingColor = $control.val().replace(/\s+/g, "");
                    paletteInput = $control.attr("data-palette");
                    showOpacity = $control.attr("data-show-opacity");
                    defaultColor = $control.attr("data-default-color");
                    if (paletteInput.indexOf("|") !== -1) {
                        palette = paletteInput.split("|");
                    } else if ("false" == paletteInput) {
                        palette = false;
                    } else {
                        palette = true;
                    }
                    colorPickerOptions = {
                        change: function(event, ui) {
                            var value, alpha, $transparency;
                            value = $control.wpColorPicker("color");
                            if (defaultColor == value) {
                                alpha = acp_get_alpha_value_from_color(value);
                                $alphaSlider.find(".ui-slider-handle").text(alpha);
                            }
                            $transparency = $container.find(".transparency");
                            $transparency.css("background-color", ui.color.toString("no-alpha"));
                            control.setting.set(value);
                        },
                        palettes: palette
                    };
                    $control.wpColorPicker(colorPickerOptions);
                    $container = $control.parents(".wp-picker-container:first");
                    $('<div class="alpha-color-picker-container">' + '<div class="min-click-zone click-zone"></div>' + '<div class="max-click-zone click-zone"></div>' + '<div class="alpha-slider"></div>' + '<div class="transparency"></div>' + "</div>").appendTo($container.find(".wp-picker-holder"));
                    $alphaSlider = $container.find(".alpha-slider");
                    alphaVal = acp_get_alpha_value_from_color(startingColor);
                    sliderOptions = {
                        create: function(event, ui) {
                            var value = $(this).slider("value");
                            $(this).find(".ui-slider-handle").text(value);
                            $(this).siblings(".transparency ").css("background-color", startingColor);
                        },
                        value: alphaVal,
                        range: "max",
                        step: 1,
                        min: 0,
                        max: 100,
                        animate: 300
                    };
                    $alphaSlider.slider(sliderOptions);
                    if ("true" == showOpacity) {
                        $alphaSlider.find(".ui-slider-handle").addClass("show-opacity");
                    }
                    $container.find(".min-click-zone").on("click", (function() {
                        acp_update_alpha_value_on_color_control(0, $control, $alphaSlider, true);
                    }));
                    $container.find(".max-click-zone").on("click", (function() {
                        acp_update_alpha_value_on_color_control(100, $control, $alphaSlider, true);
                    }));
                    $container.find(".iris-palette").on("click", (function() {
                        var color, alpha;
                        color = $(this).css("background-color");
                        alpha = acp_get_alpha_value_from_color(color);
                        acp_update_alpha_value_on_alpha_slider(alpha, $alphaSlider);
                        if (alpha != 100) {
                            color = color.replace(/[^,]+(?=\))/, (alpha / 100).toFixed(2));
                        }
                        $control.wpColorPicker("color", color);
                    }));
                    $container.find(".button.wp-picker-clear").on("click", (function() {
                        $control.wpColorPicker("color", "");
                        localUpdate = true;
                        control.setting.set("");
                        localUpdate = false;
                        acp_update_alpha_value_on_alpha_slider(100, $alphaSlider);
                    }));
                    $container.find(".button.wp-picker-default").on("click", (function() {
                        var alpha = acp_get_alpha_value_from_color(defaultColor);
                        acp_update_alpha_value_on_alpha_slider(alpha, $alphaSlider);
                    }));
                    $control.on("input change", (function() {
                        var value = $(this).val();
                        var alpha = acp_get_alpha_value_from_color(value);
                        acp_update_alpha_value_on_alpha_slider(alpha, $alphaSlider);
                    }));
                    $alphaSlider.slider().on("slide", (function(event, ui) {
                        var alpha = parseFloat(ui.value) / 100;
                        acp_update_alpha_value_on_color_control(alpha, $control, $alphaSlider, false);
                        $(this).find(".ui-slider-handle").text(ui.value);
                    }));
                }));
                colorPickerReady(this);
            }
        });
        api.bind("ready", (function() {
            api.previewer.bind("ready", () => {
                api.previewer.send("bunyad-cz-data", Bunyad_CZ_Data);
            });
            const util = Bunyad_CZ.util;
            wp.customize.control.each(control => {
                if (!control.id.match(/bunyad_|sphere_/)) {
                    return;
                }
                const skipTypes = [ "group", "message", "content", "upload" ];
                if (skipTypes.includes(control.params.type)) {
                    return;
                }
                const addReset = () => {
                    const defaultVal = util.getDefaultVal(control.setting.id);
                    let reset = control.container.find(".bunyad-cz-reset");
                    if (!reset.length) {
                        const title = control.container.find(".customize-control-title");
                        if (title.length) {
                            reset = $('<span class="bunyad-cz-reset"><a href="#" title="Reset Setting"><span class="dashicons dashicons-image-rotate icon-reset"></span></a></span>');
                            title.prepend(reset);
                        }
                    }
                    reset.on("click", "a", e => {
                        control.setting.set(defaultVal);
                        return false;
                    });
                    const settingChange = to => {
                        const loose = [ "bunyad-toggle", "checkbox" ];
                        let isDefault = false;
                        if (loose.includes(control.params.type)) {
                            if (defaultVal == to) {
                                isDefault = true;
                            }
                        } else if (_.isEqual(defaultVal, to)) {
                            isDefault = true;
                        }
                        if (!isDefault) {
                            return reset.addClass("active");
                        }
                        reset.removeClass("active");
                    };
                    control.setting.bind(settingChange);
                    settingChange(control.setting.get());
                };
                if (control.deferred.embedded.state() == "resolved") {
                    addReset();
                } else {
                    control.deferred.embedded.done(addReset);
                }
            });
        }));
    })(jQuery, wp.customize, _);
} ]);