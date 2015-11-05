
try { applyOptions(); } catch (e) {}

// prevent double-loading
if(!window['trloaded']) { window.trloaded = true;

var hold = false,
    thover = null,
    popup = null,
    last = null,
    lastt = null,
    lastmd = null,
    allowHide = true;

function isA(e) {
    while(e.parentNode) {
        if(e.tagName == 'A') {
            return true;
        }
        e = e.parentNode;
    }
    return false;
}

document.addEventListener('mousemove', function(e) {
    var mx = e.movementX || e.webkitMovementX,
        my = e.movementY || e.webkitMovementY;
    if(!o.hover || hold || (mx == 0 && my == 0)) return;
    thover && clearTimeout(thover);
    var t = o['hover-timeout'];
    if(lastmd === e.srcElement && isA(e.srcElement)) {
        t *= 1.5; // for A links increase timeout
    }
    thover = setTimeout(showPopup.bind(null, e, 'hover'), t);
});

document.addEventListener('mouseup', function(e) {
    if(o['hover']) {
        hold = true;
        thover && clearTimeout(thover);
        setTimeout(function(){ hold = false; }, o['hover-timeout']);
    }
    if(lastmd === e.srcElement && isA(e.srcElement)) {
        hidePopup();
    } else {
        showPopup(e, 'mouseup');
    }
});

document.addEventListener('mousedown', function(e){
    lastmd = e.srcElement;
    if(!popup || !popup.node.parentNode) return;
    e = e.srcElement;
    while(e.parentNode) {
        if(e === popup.node) {
            return;
        }
        e = e.parentNode;
    }
    last = null;
    setTimeout(hidePopup, 100);
}, false);

function showPopup(e, type) {
    var hold = [];
    ['ctrlKey', 'altKey', 'shiftKey', 'metaKey'].forEach(function(k) {
        e[k] && hold.push(k);
    });
    hold = hold.join('-');

    if(hold != o.key) {
        return;
    }

    var s = window.getSelection();
    if(!s || s.rangeCount == 0 || s.toString().length == 0/* || s.isCollapsed*/) {
        s = wordUnderCursor(e);
    } else {
        s = stringFromSelection(s);
        if(last && likeLast(s) && popup && popup.node && popup.node.parentNode) {
            s = wordUnderCursor(e);
            //window.getSelection().empty();
        }
    }

    if(!s || !s.text) {
        return;
    }

    if(popup && popup.node.parentNode && last) {
        var r = popup.node.getBoundingClientRect();
        if(inRect(r, {x: e.x, y: e.y})) {
            s = {
                text: s.text,
                x: last.x,
                y: last.y,
                w: last.w,
                h: last.h
            };
        }
    }

    if(!popup) {
        createPopup();
    }

    if(likeLast(s)) {
        document.body.appendChild(popup.node);
        popup.node.style.opacity = 1;
        return;
    }

    popup.text.textContent = s.text;


    if(!popup.node.parentNode) {
        document.body.appendChild(popup.node);
        popup.node.style.opacity = 1;
    } else {
        allowHide = false;
    }

    popupPosition(s);

    //popup.text.focus();
    translate();
}

function hidePopup() {
    if(allowHide && popup && popup.node && popup.node.parentNode) {
        popup.node.style.opacity = 0;
        popup.node.parentNode.removeChild(popup.node);
    }
    allowHide = true;
}

function applyOptions() {
    if(popup) {
        if(o.simple) {
            popup.shadow.removeChild(popup.header);
        } else {
            popup.shadow.insertBefore(popup.header, popup.shadow.firstChild);
        }

        popup.to.childNodes[0].textContent = chrome.i18n.getMessage('lang_own', [chrome.i18n.getMessage('lang_' + o.lang.split('-').join('_')), chrome.i18n.getMessage('lang_' + o.second.split('-').join('_'))])
    }
}

function translate() {
    var data = {
        action: 'translate',
        text: popup.text.textContent,
        service: popup.lang.getAttribute('value')
    };

    if(!popup.auto.checked) {
        data.from = popup.from.value;
        data.to = popup.to.value;
    } else {
        popup.from.value = 'auto';
        popup.to.value = 'auto';
    }

    if(lastt) {
        if(lastt.text == data.text && lastt.service == data.service && data.from == lastt.from && data.to == lastt.to) {
            return;
        }
    }

    lastt = data;

    if(!(data.service in langs)) {
        clearNode(popup.content);
        var d = createNode('div', {
            display: 'block',
            margin: '50px auto',
            textAlign: 'center'
        }, popup.content);
        d.textContent = 'Sorry! This service is not implemented!';
        return;
    }

    if(data.from && langs[data.service].indexOf(data.from) == -1) {
        clearNode(popup.content);
        var d = createNode('div', {
            display: 'block',
            margin: '50px auto',
        }, popup.content);
        d.textContent = chrome.i18n.getMessage('no_support', [chrome.i18n.getMessage('lang_' + data.from.split('-').join('_'))]);
        return;
    }

    var tm = setTimeout(function() {
        clearNode(popup.content);
        createNode('img', {
            display: 'block',
            margin: '50px auto',
        }, {src: chrome.extension.getURL('img/loader.gif')}, popup.content);
        popupPosition(last);
    }, 400);

    data.auto = popup.auto.checked;
    chrome.runtime.sendMessage(data, function(res) {
        clearTimeout(tm);
        if(lastt.text == res.text && lastt.service == res.service && res.from == lastt.from && res.to == lastt.to) {
            clearNode(popup.content).appendChild(buildResults(res));
            popupPosition(last);
        }
    });
}

function buildResults(res) {
    var d = document.createDocumentFragment();

    if(res.results.status && res.results.status == 'error') {
        var m = createNode('div', {
            display: 'block',
            margin: '50px auto',
        }, d);
        m.textContent = res.results.message;
    } else {
        popup.from.value = res.results.from;
        /*if(!popup.auto.checked && popup.to.value != res.results.to) {
            var n = createNode('div', {

            }, d);
            n.textContent = 'Destination language has changed from ' + popup.to.value + ' to ' + res.results.to;
        }*/
        popup.to.value = res.results.to;
    }

    var t = createNode('div', {
        margin: '0 0 5px 0',
        fontSize: ((!res.results.dict || res.results.dict.length == 0) && res.results.text.split(' ').length > 2) ? 'inherit' : '110%',
    }, d);
    t.textContent = res.results.text;

    if(res.results.dict) {
        res.results.dict.forEach(function(r) {
            var t = createNode('div', {}, d),
                l = createNode('i', {
                    color: '#444'
                }, t);
            l.textContent = r.type;
            r.text.forEach(function(k, i) {
                var w = createNode('div', {}, t);
                w.textContent = k;
                if(r.synonyms[i].length > 0) {
                    var s = createNode('span', {
                        color: '#666',
                        fontSize: '90%'
                    }, w);
                    s.textContent = ' (' + r.synonyms[i].join(', ') + ')';
                }
            });
        });
    }

    //d.appendChild(document.createTextNode(JSON.stringify(res)));
    return d;
}

function likeLast(s) {
    var ret = last &&
        (
            s.text == last.text &&
            s.x == last.x &&
            s.y == last.y &&
            s.w == last.w &&
            s.h == last.h
        );
    last = s;
    return ret;
}

function resetStyles(node) {
    // TODO
    // reset most used styles for given node
    return setStyles(node, {
        //fontSize: 'inherit',
        //lineHeight: 'inherit',
        textAlign: 'left',
        padding: 0,
        margin: 0,
        boxSizing: 'content-box',
    });
}

function setStyles(node, styles) {
    for(var i in styles) {
        node.style[i] = styles[i];
    }
    return node;
}

function clearNode(node) {
    while(node.childNodes.length) {
        node.removeChild(node.firstChild);
    }
    return node;
}

function createNode(type, styles, attrs, p) {
    var node = setStyles(resetStyles(document.createElement(type)), styles);
    if(!attrs || attrs.constructor !== Object) {
        p = attrs;
        attrs = null;
    }
    if(attrs) for(var i in attrs) {
        node.setAttribute(i, attrs[i]);
    }
    p && p.appendChild(node);
    return node;
}

function createPopup() {
    popup = {};

    popup.node = createNode('div', {
        position: 'absolute',
        background: '#fff',
        zIndex: 9999,
        color: '#222',
        fontFamily: 'sans-serif',
        //minHeight: '200px',
        //minWidth: '250px',
        //maxHeight: '500px',
        //maxWidth: '600px',
        //maxHeight: o.height + 'px',
        width: o.width + 'px',
        //display: 'flex',
        //flexDirection: 'column',
        fontSize: '16px',
        lineHeight: '20px',
        //border: '1px solid rgba(0, 0, 0, 0.1)',
        //boxShadow: '0 3px 7px rgba(0, 0, 0, 0.3)',
        boxShadow: '0 8px 17px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
        transition: 'opacity 50ms ease-in',
        transitionProperty: 'opacity,top,left',
        opacity: 0,
        //backgroundClip: 'padding-box',
        padding: '5px'
    });
    popup.shadow = (popup.node.createShadowRoot || popup.node.webkitCreateShadowRoot).call(popup.node);
    popup.shadow.innerHTML = '<style>\
        #content { /*min-height: 128px;*/ position: relative; }\
        #content:after {\
            content: "";\
            display: block;\
            position: absolute;\
            top: 0;\
            left: 0;\
            bottom: 0;\
            right: 0;\
            background: transparent url(' + chrome.extension.getURL('icons/128.png') + ') center 25px no-repeat;\
            -webkit-filter: opacity(15%) grayscale(40%);\
            z-index: -1;\
        }\
    </style>';

    popup.node.addEventListener('keydown', function(e) {
        if(e.which == 27) { // Esc
            hidePopup();
        }
    });


    popup.header = createNode('div', {
        opacity: 0.4,
        fontSize: '80%',
        //overflow: 'hidden'
    }, popup.shadow);
    popup.header.addEventListener('mouseenter', function() {
        this.style.opacity = 1.0;
    });
    popup.header.addEventListener('mouseleave', function() {
        this.style.opacity = 0.4;
    });
    if(o.simple) {
        popup.shadow.removeChild(popup.header);
    }

    popup.text = createNode('div', {
        //minHeight: '25px',
        fontSize: '110%',
        whiteSpace: 'nowrap',
        outline: '1px solid #BBB',
        padding: '3px 4px',
        overflow: 'hidden',
        margin: '1px',
        marginRight: '39px'
    }, {'contenteditable': true}, popup.header);
    var t = null;
    popup.text.addEventListener('keydown', function(e) {
        e.stopPropagation();
        if(e.which == 13 || e.which == 27) { // Enter or Esc
            e.preventDefault();
            if(e.which == 27) {
                hidePopup();
                return;
            }
        }
        clearTimeout(t);
        t = setTimeout(translate, 300);
    });
    popup.text.addEventListener('focus', function() {
        this.style.outline = '1px solid -webkit-focus-ring-color'
    });
    popup.text.addEventListener('blur', function() {
        this.style.outline = '1px solid #BBB'
    });

    popup.lang = createCustomSelect(['gtr', 'ytr', 'btr', 'ltr', 'ptr'].map(function(i, k) {
        return {img: chrome.extension.getURL('img/services/' + i + '.ico'), value: i, disabled: k > 1};
    }), o.service, translate);
    setStyles(popup.lang, {
        position: 'absolute',
        'top': '5px',
        right: '8px'
    });
    popup.header.appendChild(popup.lang);

    createLangPanel();

    popup.content = createNode('div', {
        overflow: 'auto',
        maxHeight: (o.height - 80) + 'px',
        paddingBottom: '5px',
        marginBottom: '-5px'
    }, {id: 'content'}, popup.shadow);

    /*createNode('hr', {
        border: 'none',
        borderTop: '1px solid #999'
    }, popup.header);*/
}

function createLangPanel() {
    var wrapper = createNode('div', {
        //minHeight: '30px',
        whiteSpace: 'nowrap',
        margin: '5px 0 10px'
    }, popup.header);

    var l = createNode('label', {
        fontSize: '80%',
        padding: '2px',
        background: 'rgba(0,0,0,0.07)',
        marginRight: '5px'
    }, wrapper);
    popup.auto = createNode('input', {
        verticalAlign: 'middle',
        outline: 0
    }, {type: 'checkbox'}, l);
    popup.auto.checked = o['auto'];
    popup.auto.addEventListener('change', function() {
        if(this.checked) {
            popup.from.setAttribute('disabled', true);
            popup.to.setAttribute('disabled', true);
            popup.from.value = 'auto';
            popup.to.value = 'auto';
        } else {
            popup.from.removeAttribute('disabled');
            popup.to.removeAttribute('disabled');
        }
        translate();
    });
    l.appendChild(document.createTextNode('\u00A0' + chrome.i18n.getMessage('auto') + '\u00A0'));


    var list = [];
    langs.all.forEach(function(i) {
        list.push({
            text: chrome.i18n.getMessage('lang_' + i.split('-').join('_')),
            value: i
        });
    });

    popup.from = createSelect([{
        value: 'auto',
        text: chrome.i18n.getMessage('lang_auto')
    }].concat(list), translate);
    popup.from.value = o.auto ? 'auto' : o['from'];

    popup.to = createSelect([{
        value: 'auto',
        text: chrome.i18n.getMessage('lang_own', [chrome.i18n.getMessage('lang_' + o.lang.split('-').join('_')), chrome.i18n.getMessage('lang_' + o.second.split('-').join('_'))])
    }].concat(list), translate);
    popup.to.value = o.auto ? o.auto : o['to'];

    wrapper.appendChild(popup.from);
    //wrapper.appendChild(document.createTextNode('\u00A0\u2192\u00A0'));

    var arrow = createNode('span', {
        margin: 'auto 5px',
        display: 'inline-block',
        cursor: 'pointer',
        transition: 'all 200ms'
    });
    arrow.appendChild(document.createTextNode('\u2192'));
    arrow.addEventListener('mouseover', function() {
        this.style.transform = 'rotateZ(180deg)';
    });
    arrow.addEventListener('mouseout', function() {
        this.style.transform = '';
    });
    arrow.addEventListener('click', function() {
        var v = popup.from.value;
        popup.from.value = popup.to.value;
        popup.to.value = v;
        translate();
    });
    wrapper.appendChild(arrow);

    wrapper.appendChild(popup.to);
}

function createCustomSelect(list, value, onChange) {
    var select = createNode('div', {
        display: 'inline-flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '28px',
        width: '20px',
        paddingRight: '10px',
        cursor: 'pointer',
        position: 'relative',
        background: 'white'
    }, {state: 0, value: value, last: value}), nodes = [];

    var option;

    option = createNode('div', {
        position: 'absolute',
        right: 0,
        'top': '5px',
        fontSize: '8px'
    })
    option.appendChild(document.createTextNode('\u00A0\u25BC\u00A0'));
    select.appendChild(option);

    list.forEach(function(i) {
        var k = +!(i.value == value);
        option = createNode('div', {
            order: k,
            display: ['block', 'none'][k],
            height: '28px',
            width: k ? '30px': '16px',
            backgroundSize: '16px',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            marginLeft: k * 10 + 'px'
        }, {value: i.value});
        if(i.img) {
            option.style.backgroundImage = 'url(' + i.img + ')';
        } else {
            option.textContent = i.text;
        }
        if(i.disabled) { option.style.WebkitFilter = 'grayscale(100%)'; option.style.opacity = '0.3'; }
        option.addEventListener('click', function() {
            select.setAttribute('value', this.getAttribute('value'));
        });
        select.appendChild(option);
        nodes.push(option);
    });

    var close = function(e) {
        if(select.getAttribute('state') == 0 || e._qtrstate) {
            return;
        }

        select.setAttribute('state', 0);
        select.style.height = '28px';
        select.style.boxShadow = 'none';
        var value = select.getAttribute('value');
        nodes.forEach(function(s) {
            var k = +!(s.getAttribute('value') == value);
            s.style.width = k ? '30px' : '16px';
            s.style.marginLeft = k * 10 + 'px';
            if(s.style.order = k) {
                s.style.display = 'none';
            }
        });
        if(select.getAttribute('last') != value) {
            onChange();
        }
        select.setAttribute('last', value);
    };

    select.addEventListener('click', function(e) {
        if(select.getAttribute('state') == 0) {
            select.setAttribute('state', 1);
            select.style.height = nodes.length * 28 + 'px';
            select.style.boxShadow = '0 0 1px black';
            nodes.forEach(function(s) {
                s.style.display = 'block'
            });
            e._qtrstate = true;
        }
    });

    document.addEventListener('click', close);

    return select;
}

function createSelect(list, onChange) {
    var select = createNode('select', { width: '138px', fontSize: '90%' }), option;
    if(o.auto) {
        select.setAttribute('disabled', true);
    }

    list.forEach(function(i) {
        option = document.createElement('option');
        option.textContent = i.text;
        option.value = i.value;
        select.appendChild(option);
    });

    select.addEventListener('change', onChange);

    return select;
}

function popupPosition(p) {
    if(!p) {
        return;
    }
    var s = {w: popup.node.offsetWidth, h: popup.node.offsetHeight},
        pos = {};

    pos.top = p.y - s.h - 10;
    pos.left = p.x - s.w / 2 + p.w / 2;

    pos.left = Math.min(pos.left, document.body.clientWidth + document.body.scrollLeft - s.w - 5);
    pos.left = Math.max(pos.left, document.body.scrollLeft + 5);

    if( (p.y - o.height - 10) < document.body.scrollTop)
      pos.top = pos.top + s.h + p.h + 20;

    pos.top += 'px';
    pos.left += 'px';

    setStyles(popup.node, pos);
}

// selection
function stringFromSelection(s) {
    var r = s.getRangeAt(0).getBoundingClientRect();
    if(r.width == 0 && r.height == 0 && r.top == 0 && r.left == 0) {
        r = (s.baseNode || s.anchorNode || s.focusNode || s.extentNode).getBoundingClientRect();
    }
    return {
        // TODO \n\r
        text: s.toString(),
        x: r.left + window.pageXOffset,
        y: r.top + window.pageYOffset,
        w: r.width,
        h: r.height
    }
}

// event
function wordUnderCursor(e) {
    return wordAtPosition(e.target, {x: e.x, y: e.y})
}

// node and point(x,y)
function wordAtPosition(node, p) {
    //console.log(node, p);
    if(node.nodeType == node.TEXT_NODE) {
        var range = node.ownerDocument.createRange();
        range.selectNodeContents(node);
        var r, w;
        for(var i = 0, l = range.endOffset; i < l; i++) {
            range.setStart(node, i); range.setEnd(node, i+1);
            if(inRect(range.getBoundingClientRect(), p)) {
                if(range.toString() == ' ') {
                    continue;
                }
                if(/\s|\.|\\|\/|,|:|;|'|"|\[|\]|\{|\}|<|>|\?|\!|\(|\)/.test(range.toString())) {
                    return;
                }
                while(!(/\s|\.|\\|\/|,|:|;|'|"|\[|\]|\{|\}|<|>|\?|\!|\(|\)/.test(range.toString())) && range.startOffset != 0) {
                    range.setStart(node, range.startOffset - 1);
                }
                if(/\s|\.|\\|\/|,|:|;|'|"|\[|\]|\{|\}|<|>|\?|\!|\(|\)/.test(range.toString())) {
                    range.setStart(node, range.startOffset + 1);
                }
                while(!(/\s|\.|\\|\/|,|:|;|'|"|\[|\]|\{|\}|<|>|\?|\!|\(|\)/.test(range.toString())) && range.endOffset != l) {
                    range.setEnd(node, range.endOffset + 1);
                }
                if(/\s|\.|\\|\/|,|:|;|'|"|\[|\]|\{|\}|<|>|\?|\!|\(|\)/.test(range.toString())) {
                    range.setEnd(node, range.endOffset - 1);
                }
                //range.expand('word');
                r = range.getBoundingClientRect();
                var w = range.toString();
                range.detach();

                return {
                    text: w,
                    x: r.left + window.pageXOffset,
                    y: r.top + window.pageYOffset,
                    w: r.width,
                    h: r.height
                };
            }
        }
        range.detach();
    } else if(['TEXTAREA', 'INPUT'].indexOf(node.nodeName) > -1) {
        var r = node.getBoundingClientRect();
        return {
            text: node.value,
            x: r.left + window.pageXOffset,
            y: r.top + window.pageYOffset,
            w: r.width,
            h: r.height
        }
    } else {
        var range = node.ownerDocument.createRange();
        range.selectNodeContents(node);
        if(!inRect(range.getBoundingClientRect(), p)) {
            range.detach();


            // work-around for shadowDom
            if(node.shadowRoot) {
                var word;
                for(var i = 0, l = node.shadowRoot.childNodes.length; i < l; i++) {
                    word = wordAtPosition(node.shadowRoot.childNodes[i], p);
                    if(word && word.text) {
                        return word;
                    }
                }
            }


            return;
        }
        range.detach();
        var word;
        for(var i = 0, l = node.childNodes.length; i < l; i++) {
            word = wordAtPosition(node.childNodes[i], p);
            if(word && word.text) {
                return word;
            }
        }


        // work-around for shadowDom
        if(node.shadowRoot) {
            var word;
            for(var i = 0, l = node.shadowRoot.childNodes.length; i < l; i++) {
                word = wordAtPosition(node.shadowRoot.childNodes[i], p);
                if(word && word.text) {
                    return word;
                }
            }
        }
    }
}

// rect(left,right,top,bottom) and point(x,y)
function inRect(r, p) {
    /*if(r.top > 400 && r.bottom < 420)
    createNode('div', {
        position: 'absolute',
        boxSizing: 'border-box',
        border: '1px solid black',
        width: r.right - r.left,
        height: r.bottom - r.top,
        top: r.top,
        left: r.left,
        background: 'red',
        opacity: 0.4
    }, document.body);*/

    return r.left <= p.x && r.right >= p.x && r.top <= p.y && r.bottom >= p.y;
}

}// end external if


var RangeDebugger = function(node, point) {
    this.node = node;
    this.range = node.ownerDocument.createRange();
    this.range.selectNodeContents(node);
    this.i = 0;
    this.l = this.range.endOffset;
    this.placeholder = node.ownerDocument.createElement('div');
    this.point = point;
};

RangeDebugger.prototype.iteration = function(count) {
    this.clearDraws();

    var i = this.i + (count || 0);
    i = Math.max(0, Math.min(this.l - 1, i));

    var from = Math.min(this.i, i), to = Math.max(this.i, i);
    console.log('iteration: %d - %d', from, to);
    for(;from < to + 1; from++) {
        this.i = from;
        this.it_();
    }

    this.draw();
};

RangeDebugger.prototype.it_ = function() {
    this.range.setStart(this.node, this.i);
    this.range.setEnd(this.node, this.i+1);
    var r = this.range.getBoundingClientRect(),
        inPoint = false;

    if(this.point && inRect(r, this.point) && this.range.toString() !== ' ') {
        inPoint = true;
        //this.range.expand('word');
        console.log('text: \'' + this.range.toString() + '\'');
        console.log('code: ' + this.range.toString().charCodeAt(0));
    }

    this.draw_(r, inPoint);
};

RangeDebugger.prototype.clearDraws = function() {
    this.placeholder.parentNode && this.placeholder.parentNode.removeChild(this.placeholder);
    while(this.placeholder.firstChild) {
        this.placeholder.removeChild(this.placeholder.firstChild);
    }
};

RangeDebugger.prototype.draw_ = function(r, inPoint) {
    this.placeholder.appendChild(
        createNode('div', {
            position: 'absolute',
            boxSizing: 'border-box',
            border: '1px solid black',
            background: inPoint ? 'green' : 'red',
            opacity: 0.4,
            top: r.top,
            left: r.left,
            width: r.right - r.left,
            height: r.bottom - r.top
        }, this.node.ownerDocument.body)
    );
};

RangeDebugger.prototype.draw = function() {
    this.point && createNode('div', {
        position: 'absolute',
        boxSizing: 'border-box',
        border: '1px solid black',
        borderRadius: '50%',
        background: 'blue',
        opacity: 0.5,
        top: this.point.x - 10,
        left: this.point.y - 10,
        width: 20,
        height: 20,
        zIndex: 3
    }, this.placeholder);
    this.node.ownerDocument.body.appendChild(this.placeholder);
}

RangeDebugger.prototype.destroy = function() {
    this.placeholder.parentNode && this.placeholder.parentNode.removeChild(this.placeholder);
    this.range.detach();
    this.node = this.range = this.placeholder = null;
};
