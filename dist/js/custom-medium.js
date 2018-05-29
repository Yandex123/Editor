rangy.init();
var CompanyFontSizes = MediumEditor.Extension.extend({

    name: 'companySizes',
    // action: 'companySizes',
    // aria: 'increase/decrease font size',
    // contentDefault: '&#xB1;', // ±
    // contentFA: '<i class="fa fa-text-height"></i>',
    fontSizes: ['18', '20', '22', '24', '26', '28', '30', '32', '34', '36', '38', '40'],

    constructor: function(options) {
        MediumEditor.Extension.call(this, options);
    },

    init: function () {
        this.buttonContainer = this.document.createElement('button');
        this.buttonContainer.classList.add('medium-editor-action');
        this.buttonContainer.title = 'Font sizes';

        const select = this.document.createElement('select');
        select.classList.add('medium-editor-form-select');
        this.buttonContainer.appendChild(select);

        // Add font sizes
        this.fontSizes.forEach(function(item){
            const option = this.document.createElement('option');
            option.innerHTML = item;
            option.value = item;
            select.appendChild(option);
        });

        // Attach editor events to keep status updates
        this.attachToEditables();

        this.on(select, 'change', event => this.handleFontSizeChange(event));
    },

    handleClick: function (event) {
        this.classApplier.toggleSelection();
    },

    getSelect: function(){
        return this.getButton().querySelector('select.medium-editor-form-select');
    },

    attachToEditables: function() {
        this.subscribe('positionedToolbar', event => this.handlePositionedToolbar(event));
    },

    /**
     * @inheritDoc
     */
    deattachFromEditables() {
        this.base.unsubscribe('positionedToolbar', event => this.handlePositionedToolbar(event));
    },

    /**
     * @inheritDoc
     */
    handlePositionedToolbar: function(event) {
        // const size = this.getSelect().value;
        const fontSize = this.document.queryCommandValue('fontSize') + '';
        this.updateSelection(fontSize);
    },

    /**
     * Update the selection of the combo box
     * @param value the item to be selected
     */
    updateSelection: function(value) {
        const select = this.getSelect();
        select.value = value || '';
    },

    handleFontSizeChange: function(event) {
        const size = this.getSelect().value + 'px';
        if (size === '') {
            this.clearFontSize();
        } else {
            var regex = new RegExp("(^<span\\s+[^>]*?\\s*class\\s*=\\s*('|\")(?:\\S+\\s+)?font-size(?:\\s+\\S+)?\\1[^>]*>).*?(<\\/span>)",'g'),
            // var regex = /^<span.*?<\/span>/g;
                span = document.createElement('span'),
                range = MediumEditor.selection.getSelectionRange(this.document),
                html = MediumEditor.selection.getSelectionHtml(this.document),
                isSpan = regex.test(html);
            if(isSpan === false) {
                range.surroundContents(span);
                span.className = 'font-size';
                span.style.fontSize = size;
            }else{
                MediumEditor.selection.getSelectedElements(this.document).forEach(function(el){
                    if (el.nodeName.toLowerCase() === 'span' && el.hasAttribute('style')) {
                        el.removeAttribute('style');
                        el.style.fontSize = size;
                    }
                });
            }
        }
    },

    clearFontSize: function() {
        MediumEditor.selection.getSelectedElements(this.document).forEach(function(el){
            if (el.nodeName.toLowerCase() === 'span' && el.hasAttribute('style')) {
                el.removeAttribute('style');
            }
        });
    },

    getButton: function() {
        return this.buttonContainer;
    },

    destroy: function() {
        this.deattachFromEditables();
    }
});

var HighlighterButton = MediumEditor.Extension.extend({
    name: 'highlighter',

    init: function () {
        this.classApplier = rangy.createClassApplier('highlight', {
            elementTagName: 'mark',
            normalize: true
        });

        this.button = this.document.createElement('button');
        this.button.classList.add('medium-editor-action');
        this.button.innerHTML = '<i class="fa fa-bookmark-o"></i>';
        this.button.title = 'Highlight';

        this.on(this.button, 'click', this.handleClick.bind(this));
    },

    getButton: function () {
        return this.button;
    },

    handleClick: function (event) {
        this.classApplier.toggleSelection();

        // Ensure the editor knows about an html change so watchers are notified
        // ie: <textarea> elements depend on the editableInput event to stay synchronized
        this.base.checkContentChanged();
    }
});

var ColorPickerExtension = MediumEditor.extensions.button.extend({
    name: "colorPicker",
    action: "applyForeColor",
    aria: "color picker",
    contentDefault: "<span class='editor-color-picker'>Text Color<span>",

    handleClick: function(e) {
        e.preventDefault();
        e.stopPropagation();

        this.selectionState = this.base.exportSelection();

        // If no text selected, stop here.
        if(this.selectionState && (this.selectionState.end - this.selectionState.start === 0) ) {
            return;
        }

        // colors for picker
        var pickerColors = [
            "#1abc9c",
            "#2ecc71",
            "#3498db",
            "#9b59b6",
            "#34495e",
            "#16a085",
            "#27ae60",
            "#2980b9",
            "#8e44ad",
            "#2c3e50",
            "#f1c40f",
            "#e67e22",
            "#e74c3c",
            "#bdc3c7",
            "#95a5a6",
            "#f39c12"
        ];

        var picker = vanillaColorPicker(this.document.querySelector(".medium-editor-toolbar-active .editor-color-picker"));
        picker.set("customColors", pickerColors);
        picker.set("positionOnTop");
        picker.openPicker();
        picker.on("colorChosen", function(color) {
            this.base.importSelection(this.selectionState);
            this.document.execCommand("styleWithCSS", false, true);
            this.document.execCommand("foreColor", false, color);
        }.bind(this));
    }
});

var editor = new MediumEditor('.editable', {
    toolbar: {
        buttons: ['h2', 'h3', 'companySizes', 'bold', 'italic', 'underline', 'strikethrough', 'colorPicker', 'quote', 'anchor', 'highlighter', 'image', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'removeFormat']
    },
    buttonLabels: 'fontawesome',
    anchor: {
        targetCheckbox: true
    },
    extensions: {
        'companySizes': new CompanyFontSizes(),
        'highlighter': new HighlighterButton(),
        'colorPicker': new ColorPickerExtension()
    }
});