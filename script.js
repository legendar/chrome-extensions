
if(!document.getElementById('-chrome-auto-translate-plugin-dialog')) {
    //create dialog
    (function(){
        var d = document.createElement('DIV');
        d.id = '-chrome-auto-translate-plugin-dialog';
        d.style.display = 'none';
        d.setAttribute('style', 
            'display: none;' +
            'opacity: 1 !important;' +
            'border-color: none !important;' +
            'background: transparent !important;' +
            'padding: 0 !important;' +
            'margin: 0 !important;' +
            'position: absolute !important;' +
            'top: 0;' +
            'left: 0;' +
            'overflow: visible !important;' +
            'z-index: 999999 !important;' +
            'text-align: left !important;');
        d.innerHTML = window['-chrome-auto-translate-core-data-theme'];
        document.body.appendChild(d);
    })();
}

if(!window['-auto-translate-core-data-loaded']) {
window['-auto-translate-core-data-loaded'] = true;
new function() {
    var port = chrome.extension.connect();
    
    port.onMessage.addListener(function(m) {
        switch(m.message) {
            case 'result':
                var d = document.getElementById('-chrome-auto-translate-plugin-dialog');
                d.getElementsByClassName('translate')[0].innerHTML = m.result.text;
                d.getElementsByClassName('additional')[0].innerHTML = m.result.textAdditional;
                d.style.display = '';
                (function(d) {
                    var offset = 3;
                    var selection = window.getSelection();

                    if(!selection || !selection.baseNode) {
                        /*d.style.top = '0';
                        d.style.left = '0';*/
                        return;
                    }

                    function getOffsets(el) {
                        var b = el.getBoundingClientRect(), doc = document.documentElement;
                        return {
                            'top':  b.top + (window.pageYOffset || doc.scrollTop) - doc.clientTop,
                            'left': b.left + (window.pageXOffset || doc.scrollLeft) - doc.clientLeft
                        };

                        var l = t = 0;
                        do {
                            l += el.offsetLeft || 0;
                            t += el.offsetTop || 0;
                            el = el.offsetParent || null;
                        } while (el);
                        return {'top': t, 'left': l};
                    }

                    var tmpNode = document.createElement('span');
                    selection.getRangeAt(0).insertNode(tmpNode);
                    offsets = getOffsets(tmpNode);
                    tmpNode.parentNode.removeChild(tmpNode);
                    delete tmpNode;

                    if(offsets.top - document.documentElement.scrollTop >= d.offsetHeight) {
                        d.style.top = (offsets.top - d.offsetHeight - offset) + 'px';
                    } else {
                        d.style.top = (offsets.top + 20 + offset) + 'px';
                    }
                    d.style.left = offsets.left + 'px';
                })(d);
                //window.getSelection().empty();
                break;
        }
    });
    
    document.body.addEventListener('mouseup', function(e) {
        var keys = ['Ctrl', 'Alt', 'Shift', 'Meta'];
        var hotkeys = [];
        for(var k in keys) {
            if(e[keys[k].toLowerCase() + 'Key']) {
                hotkeys.push(keys[k]);
            }
        }
        hotkeys.push('Selection');
        hotkeys = hotkeys.join('+');

        var text = window.getSelection().toString();
        if(text.length < 1) {
            return;
        }
    
        port.postMessage({
            message: 'translate',
            text: text,
            hotkeys: hotkeys
        });

    }, false);
    
    document.body.addEventListener('mousedown', function(e) {
        var r = true;
        e = e.srcElement;
        while(e.parentNode) {
            if(e.id == '-chrome-auto-translate-plugin-dialog') {
                r = false;
                break;
            }
            e = e.parentNode;
        }
        if(r) {
            document.getElementById('-chrome-auto-translate-plugin-dialog').style.display = 'none';
        }
    }, false);
}
}
