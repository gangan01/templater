ui.presetCombo = ui.combo.extend({
    init: function (o) {
        var me = this;
        this._super($.extend({
            presets: false,
            closeOnSelect: false,
            preview: true,
            items: function () {
                this.initPresets();
                return this.getItems();
            },
            comboWidth: 500,
            comboHeight: 500
        },o));
        if (!this.options.presets) this.options.presets = this.Class.presets;
        if (!this.options.presets) this.options.presets = [];
    },
    initPresets: function () {
        var me = this;
        
        var form = this.form;
        var name = this.options.name ? "presets."+this.options.name : false;
        
        if (this.options.presetName) {
            name = this.options.presetName;
            form = Component.app.form;
        }
        
        if (form && name) {
            this.presets = ui.Control({
                name: name,
                change: function () {
                    me.items = me.getItems();
                    me.refresh();
                    me.setSelected();
                }
            });
            form.registerItem(this.presets);
        }
    },
    refresh: function () {
        var me = this;
        this._super();
        this.itemPanel.find(">*").each(function(){
            var item = $(this).data("item");
            if (item && item.preset) {
                $(this).prepend("<span class='ui-icon ui-icon-close'>");
            }
        });
        this.itemPanel.find(">*>.ui-icon-close").mousedown(function(e){
            var item = $(this).parent().data("item");
            var i = me.presets.value.indexOf(item);
            if (i>=0) {
                me.presets.value.splice(i,1);
                me.presets.trigger("change");
            }
            e.stopPropagation();
            e.preventDefault();
            return false;
        });
        this.itemPanel.find(">.combo-group")
            .prepend("<span class='ui-icon ui-icon-folder-open'>")
            .click(function(){
                var hide = $(this).next().is(":visible");
                $(this).find(".ui-icon").attr("class","ui-icon").addClass(hide ? "ui-icon-folder-collapsed" : "ui-icon-folder-open")
                    
                $(this).nextAll().each(function() {
                    if ($(this).is('.combo-group')) return false;
                    if (hide)
                        $(this).hide();
                    else
                        $(this).show();
                });            
            });
    },
    getItems: function () {
        var items = [];
        if (this.presets) {
            var presets = this.presets.getValue();
            if (presets && presets.length) {
                items.push({group:"User defined",presets:true,disabled:true});
                $.each(presets,function(){
                    if (this) this.preset = true;
                    items.push(this);
                });
            }
        }
        items = items.concat(this.options.presets);
        return items;
    },
    savePreset: function () {
        if (this.presets) {
            this.presets.value = this.presets.value || [];
            this.presets.value.splice(0,0,{value: this.getValue()});
            this.presets.trigger("change");
        }
    }
});

ui.presetSwitcherCombo = ui.presetCombo.extend({
    init: function (o) {
        var me = this;
        if (o && o.inline && o.height) o.comboHeight = o.height;
        
        var itemTpl = function (item,common) {
            if (item.group) return $("<div class='combo-group'>").html(item.group);
            if (!item.value || !item.value.type) return;
            var type = item.value.type;
            var labelF = this.options.repository[type].switcherLabel;
            return $("<div class='combo-item'>").append(
                labelF ? labelF.call(this.options.repository[type],item.value,this) : type
            );
        }
        
        this._super($.extend({
            types: false,
            repository: false,
            switcherWidth: 250,
            itemTpl: itemTpl,
            items: function () {
                var me = this;
                var switcher = this.switcher = ui.switcher({
                    types:this.options.types,
                    repository: this.options.repository,
                    margin: 0, width: me.options.switcherWidth, height: this.options.comboHeight-28
                });
                
                this.switcher.setValue(this.value);
                this.switcher.change(function(){
                    ui.combo.prototype.setValue.call(me,this.getValue());
                    me.changeFromSwitcher = true;
                    me.trigger("change");
                    me.changeFromSwitcher = false;
                });
                
                //this.panel.css({height:this.options.comboHeight});
                
                var panel = me.options.inline ? me.element : me.panel;
                
                panel.css({height:this.options.comboHeight});
                this.switcher.element
                    .css({position:'absolute',left:0,top:0})
                    .appendTo(panel);
                
                this.itemPanel.css({
                    marginLeft:me.options.switcherWidth,
                    width: 'auto'
                });
                
                var savePresetButton = ui.button({label:"Create Preset",margin:0,click:function(){me.savePreset()}});
                savePresetButton.element
                    .css({position:"absolute",left:1,width:me.options.switcherWidth-1,bottom:1,height:26})
                    .appendTo(panel);
                
                this.initPresets();
                return this.getItems();
            }
        },o));
        
        this.options.repository = this.options.repository || this.Class;
        this.options.presets = this.options.presets || this.Class.presets;
        
        this.bind("change",this.changeSwitcher);
    },
    setSelected : function () {
        var me = this;
        me.itemPanel.find(">*").removeClass("selected").each(function(){
            var item = teacss.jQuery(this).data("item");
            if (item) {
                if (item==me.selected_on_open) {
                    teacss.jQuery(this).addClass("selected");
                } else if (item.value && me.selected_on_open && me.selected_on_open.value){
                    for (var key in item.value) {
                        if (!value_equals(item.value[key],me.selected_on_open.value[key])) return;
                    }
                    teacss.jQuery(this).addClass("selected");
                }
            }
        })
    },    
    getLabel: function () {
        var me = this;
        this.options.repository = this.options.repository || this.Class;
        var val;
        
        var type;
        if (this.value && this.value.type) {
            type = this.value.type;
        } else if (this.options.repository.default) {
            type = 'default';
        }
        
        if (type) {
            if (this.options.repository[type] 
                && this.options.repository[type].switcherLabel) 
            {
                if (this.options.repository[type].paletteLabel && !me.paletteLabel) {
                    me.paletteLabel = true;
                    ui.paletteColorPicker.events.bind("paletteChange",function(){
                        me.element.button("option",{label:me.getLabel()});
                    });
                }
                val = this.options.repository[type].switcherLabel(this.getValue(),this);
            } else {
                val = "<span class='button-label'>"+type+"</span>";
            }
            return (this.options.label || "") + (this.options.label ? ": ":"") + val;
        }
        return this._super();
    },
    setValue: function (val) {
        this._super(val);
        this.changeSwitcher();
    },
    getValue: function () {
        if (this.switcher) return this.switcher.getValue();
        return this._super();
    },
    changeSwitcher: function () {
        if (this.switcher && !this.changeFromSwitcher) {
            this.switcher.setValue($.extend(this.switcher.getValue()||{},this.value));
        }
    }
});