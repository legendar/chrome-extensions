
new function() {
    var o = this;

    var options = {
        maxWidth: 300,
        color: 'fafafa',
        background: '363636',
        opacity: 0.8,
        border: '000000',
        borderWidth: 3,
        fontSize: 12
    }
    
    this.dialog = document.createElement('div');
    this.dialog.style.display = 'none';
    this.dialog.id = 'auto-translate-dialog';
    this.dialog.setAttribute('style', 
        'max-width: ' + options.maxWidth + 'px;' +
        'color: #' + options.color + ';' +
        'opacity: ' + options.opacity + ';' +
        'border-color: #' + options.border + ';' +
        'border-width: ' + options.borderWidth + 'px;' +
        'background: #' + options.background + ';' +
        'font-size: #' + options.fontSize + 'px;' +
        'position: fixed; top: 0; left: 0;'
    );
    document.body.appendChild(this.dialog);
    
    this.port = chrome.extension.connect();
    this.port.onMessage.addListener(function(m) {
        switch(m.message) {
            case 'result':
                o.dialog.innerHTML = m.result;
                o.dialog.style.display = '';
                break;
        }
    });

    document.body.addEventListener('mouseup', function(e) {
        if(!(e.ctrlKey && !e.shiftKey && !e.altKey)) {
            return;
        }

        var text = window.getSelection() + '';
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


