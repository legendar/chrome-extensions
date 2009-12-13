
console.log(localStorage);

new function() {
    var o = this;
    
    this.selection = null;

    this.options = {
        maxWidth: 300,
        color: 'fafafa',
        background: '363636',
        opacity: 0.8,
        border: '000000',
        borderWidth: 0,
        borderRadius: 10,
        fontSize: 16,
        fontSizeAdditional: 14,
        padding: 8,

        offset: 3,

        resetSelection: false,
        
        languages: [
            {
                keys: 'ctrl',
                from: 'en',
                first: 'ru',
                second: 'en',
                additionalDetection: false,
                convertToLowerCase: false
            },
            {
                keys: 'ctrl|alt',
                from: '*',
                first: 'ru',
                second: 'en',
                additionalDetection: true,
                convertToLowerCase: true
            }
        ],
    };

    this.dialog = document.createElement('div');
    this.dialog.id = 'auto-translate-dialog';
    this.dialog.setAttribute('style', 
        'max-width: ' + this.options.maxWidth + 'px !important;' +
        'color: #' + this.options.color + ' !important;' +
        'opacity: ' + this.options.opacity + ' !important;' +
        'border-color: #' + this.options.border + ' !important;' +
        'border-width: ' + this.options.borderWidth + 'px !important;' +
        '-webkit-border-radius: ' + this.options.borderRadius + 'px !important;' +
        'background-color: #' + this.options.background + ' !important;' +
        'font-size: ' + this.options.fontSize + 'px !important;' +
        'padding: ' + this.options.padding + 'px !important;' +
        'position: absolute !important; overflow: visible;' +
        'background-image: -webkit-gradient(linear, left top, right bottom, color-stop(0%, #000), color-stop(50%, #363636), color-stop(100%, #000));' +
        //'position: fixed !important; top: 0 !important; left: 0 !important;' +
        'z-index: 999999'
    );
    this.dialogA = document.createElement('span');
    //this.dialogA.id = 'auto-translate-dialog-additional';
    this.dialogA.setAttribute('style', 
        'color: #' + this.options.color + ' !important;' +
        'font-size: ' + this.options.fontSizeAdditional + 'px !important;'
    );
    this.dialog.appendChild(this.dialogA);
    document.body.appendChild(this.dialog);
    this.dialog.style.display = 'none';

    this.branding = document.createElement('img');
    this.branding.src = 'http://www.google.com/uds/css/small-logo.png';
    this.branding.onclick = function(){ document.location.href='http://translate.google.com/'; };
    this.branding.setAttribute('style', 'position: absolute !important; z-index: -1 !important; right: 1px !important; top: -20px !important; cursor: pointer !important;'+
        '-webkit-border-radius: 20px; background-color: rgba(200, 200, 200, 0.3) !important; padding: 3px 5px 0 !important;'+
        ' margin: 0 !important;'
        //'background-image: -webkit-gradient(linear, left top, right bottom, color-stop(0%, #000), color-stop(50%, #363636), color-stop(100%, #000));'
    );
    
    this.port = chrome.extension.connect();
    this.port.onMessage.addListener(function(m) {
        switch(m.message) {
            case 'result':
                //o.dialogA = o.dialog.removeChild(o.dialogA);
                o.dialog.innerHTML = m.result.text;
                if(m.result.textAdditional) {
                    o.dialogA.innerHTML = m.result.textAdditional;
                    o.dialog.appendChild(o.dialogA);
                }
                o.dialog.style.display = '';
                o.fixDialogPosition();
                if(o.selection && o.options.resetSelection) {
                    o.selection.empty();
                    o.selection = null;
                }
                o.dialog.appendChild(o.branding);
                break;
        }
    });
    
    this.fixDialogPosition = function() {
        if(!o.selection) {
            o.dialog.style.top = '0';
            o.dialog.style.left = '0';
            return;
        }
        
        function getOffsets(el) {
            var l = t = 0;
            do {
                l += el.offsetLeft || 0;
                t += el.offsetTop || 0;
                el = el.offsetParent || null;
            } while (el);
            return {'top': t, 'left': l};
        }
        
        var tmpNode = document.createElement('span');
        o.selection.getRangeAt(0).insertNode(tmpNode);
        offsets = getOffsets(tmpNode);
        tmpNode.parentNode.removeChild(tmpNode);
        delete tmpNode;

        if(offsets.top - document.body.scrollTop >= o.dialog.offsetHeight) {
            o.dialog.style.top = (offsets.top - o.dialog.offsetHeight - o.options.offset) + 'px';
        } else {
            o.dialog.style.top = (offsets.top + 20 + o.options.offset) + 'px';
        }
        o.dialog.style.left = offsets.left + 'px';
    };

    document.body.addEventListener('mouseup', function(e) {
        if(!(e.ctrlKey && !e.shiftKey && !e.altKey)) {
            return;
        }

        o.selection = window.getSelection();
        var text = o.selection.toString();
        if(text.length < 1) {
            return;
        }
    
        o.port.postMessage({
            message: 'translate',
            text: text
        });

    }, false);
    
    document.body.addEventListener('mousedown', function(e) {
        var r = true;
        e = e.srcElement;
        while(e.parentNode) {
            if(e.id == 'auto-translate-dialog') {
                r = false;
                break;
            }
            e = e.parentNode;
        }
        if(r) {
            o.dialog.style.display = 'none';
        }
    }, false);
}


