
var holds = [
    'Ctrl+Alt+Selection',
    'Ctrl+Alt+Mouseover',
];

var popupOffset = 5; //px

var mouseoverDelay = 300;

function $(id){return document.getElementById(id)};


var popup;

function createPopup(){

    popup = document.createElement('DIV');

    popup.style.position = 'absolute';
    popup.style.display = 'none';
    popup.style.background = '#999';

    document.body.appendChild(popup);

}

var popupOffset = 5;

function showPopup(context) {
    popup || createPopup();

    popup.innerHTML = context.translation;
    popup.style.display = '';

    //console.log(popup.offsetHeight + 10, context.rect.y);
    if((popup.offsetHeight + popupOffset) < context.rect.y) {
        // top
        popup.style.top = context.rect.y - popup.offsetHeight - popupOffset + 'px';
    } else {
        // bottom
        popup.style.top = context.rect.y + context.rect.h + popupOffset + 'px';
    }

    popup.style.left = context.rect.x + context.rect.w / 2 - popup.offsetWidth / 2 + 'px';
}

var port = chrome.extension.connect();
port.onMessage.addListener(showPopup);

var keys = ['Ctrl', 'Alt', 'Shift', 'Meta'];
function invoke(e, type) {
    var hotkeys = [];
    for(var k in keys) {
        if(e[keys[k].toLowerCase() + 'Key']) {
            hotkeys.push(keys[k]);
        }
    }

    hotkeys = hotkeys.join('+');
    var hs = hotkeys + '+Selection';
    var hm = hotkeys + '+Mouseover';

    var rect = { x: 0, y: 0, w: 0, h: 0 };

    var text = '';

    if(holds.indexOf(hs) >= 0 && type == 'mouseup') {

        // get translation
        text = window.getSelection().toString();
        hotkeys = hs;

    }

    if(holds.indexOf(hm) >= 0 && type == 'mouseover') {

        var data = getWordAtPoint(e.srcElement, e.x, e.y);
        if(data == null) return;
        text = data.text;
        rect = data.rect;
        hotkeys = hm;

    }

    if(text.length < 1) {
        return;
    }

    showPopup({
        translation: text,
        hotkeys: hotkeys,
        rect: rect
    });

    /*port.postMessage({
        message: 'translate',
        context: {
            hotkeys: hotkeys,
            rect: rect
        }
    });*/

}

var holdMouseover = false;
var holdMouseoverT;
var mouseoverT;
document.body.addEventListener('mouseup', function(e) {
    clearTimeout(holdMouseoverT);
    clearTimeout(mouseoverT);
    holdMouseover = true;
    holdMouseoverT = setTimeout("holdMouseover = false;", 2 * mouseoverDelay);
    invoke(e, 'mouseup');
});
document.body.addEventListener('mousemove', function(e) {
    if(holdMouseover) return;
    clearTimeout(mouseoverT);
    mouseoverT = setTimeout(invoke.bind(null, e, 'mouseover'), mouseoverDelay);
});

document.body.addEventListener('mousedown', function(e){
    // hide popup
    return;
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

function getWordAtPoint(elem, x, y) {
    if(elem.nodeType == elem.TEXT_NODE) {
        var range = elem.ownerDocument.createRange();
        range.selectNodeContents(elem);
        var currentPos = 0;
        var endPos = range.endOffset;
        var bcr;
        while(currentPos+1 < endPos) {
            range.setStart(elem, currentPos);
            range.setEnd(elem, currentPos+1);
            bcr = range.getBoundingClientRect();
            if(bcr.left <= x && bcr.right  >= x && bcr.top  <= y && bcr.bottom >= y) {
                range.expand("word");
                bcr = range.getBoundingClientRect();
                var ret = range.toString();
                range.detach();

                /*var d = document.createElement('div');
                d.style.position = 'absolute';
                d.style.border = '1px solid red';
                d.style.left = bcr.left + 'px';
                d.style.top = bcr.top + 'px';
                d.style.width = bcr.width + 'px';
                d.style.height = bcr.height + 'px';
                document.body.appendChild(d);*/

                return {text: ret, rect: {
                    x: bcr.left + window.pageXOffset,
                    y: bcr.top + window.pageYOffset,
                    w: bcr.width,
                    h: bcr.height

                }};
            }
            currentPos += 1;
        }
    } else {
        for(var i = 0; i < elem.childNodes.length; i++) {
            var range = elem.childNodes[i].ownerDocument.createRange();
            range.selectNodeContents(elem.childNodes[i]);
            if(range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right  >= x &&
              range.getBoundingClientRect().top  <= y && range.getBoundingClientRect().bottom >= y) {
                range.detach();
                return getWordAtPoint(elem.childNodes[i], x, y);
            } else {
                range.detach();
            }
        }
    }
    return null;
}


