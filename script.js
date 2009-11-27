
new function() {
    var o = this;
    
    this.dialog = document.createElement('div');
    this.dialog.style.display = 'none';
    this.dialog.className = 'auto-translate-dialog';
    document.body.appendChild(this.dialog);
    
    this.port = chrome.extension.connect();
    this.port.onMessage.addListener(function(m) {
        switch(m.message) {
            case 'result':
                o.dialog.innerHTML = m.result.translation;
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
    
    document.body.addEventListener('mousedown', function() {
        o.dialog.style.display = 'none';
    }, false);
}


