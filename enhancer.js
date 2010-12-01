if(!window['-chrome-autofill-enhancer-loaded']) {
window['-chrome-autofill-enhancer-loaded'] = true;
new function() {

    var o = this;
    o.id = '-chrome-autofill-enhancer-data';

    o.list = function(el) {
        //
        el._autocomplete = el.getAttribute('autocomplete');
        el.setAttribute('autocomplete', 'off');
        var div = document.createElement('div');
        //var css = document.defaultView.getComputedStyle(el, null).cssText;
        div.setAttribute('style', /*css + */([
            'position: absolute',
            'left: ' + (el.getBoundingClientRect().left + document.body.scrollLeft - document.body.clientLeft) + 'px',
            'top: ' + (el.getBoundingClientRect().top + document.body.scrollTop - document.body.clientTop + el.offsetHeight) + 'px',
            'z-index: 9999',
            'width: ' + (el.offsetWidth-2) + 'px',
            'background: #ffffff',
            'color: #363636',
            'border: 1px solid #363636',
            '-webkit-box-shadow: #363636 2px 2px 3px'
        ].join(';')));
        document.body.appendChild(div);
        var i, mx = 0, m, sub, subs = [], p = 2;
        for(i in el[o.id]['array']) {
            sub = document.createElement('div');
            sub.innerHTML = '<b style="background: #FFF8DD; border-right: 1px solid #363636; display: inline-block; text-align: right; padding-right: ' + p + 'px; margin-right: 2px;">' + el[o.id]['array'][i] + '</b>';
            if(el.tagName == 'INPUT' && el.getAttribute('type') == 'password') {
                sub.innerHTML += '**************';
            } else {
                sub.innerHTML += el[o.id]['data'][el[o.id]['array'][i]];
            }
            sub.setAttribute('style', 'text-overflow: ellipsis; overflow: hidden; white-space: nowrap;');
            sub.setAttribute('num', i);
            sub.setAttribute('index', el[o.id]['array'][i]);
            sub.el = el;
            sub.addEventListener('mouseover', function(e){
                o.move(this.el, this.getAttribute('num'));
            });
            sub.addEventListener('click', function(e){
                o.hide(this.el);
            });
            div.appendChild(sub);
            m = sub.getElementsByTagName('b')[0].offsetWidth;
            if(m > mx) mx = m;
            subs.push(sub);
        }
        for(i in subs) {
            subs[i].getElementsByTagName('b')[0].style.width = mx + 'px';
        }
        div.style.left = (el.getBoundingClientRect().left + document.body.scrollLeft - document.body.clientLeft - mx - p - 1) + 'px';
        div.style.width = (el.offsetWidth-2 + mx + p + 1) + 'px',

        div.el = el;
        div.addEventListener('mouseout', function(e){
            o.move(this.el, -1);
        });

        el[o.id]['div'] = div;
        el[o.id]['key'] = -1;
        el[o.id]['active'] = true;
    };

    o.move = function(el, key) {
        key = key == 'last' ? (el[o.id]['array'].length - 1) : (key == 'first' ? 0 : key);
        key = key == 'next' ? (el[o.id]['key']+1) : (key == 'prev' ? (el[o.id]['key']-1) : key);
        key = key < -1 ? (el[o.id]['array'].length + key) : (key >= el[o.id]['array'].length ? (key% el[o.id]['array'].length - 1) : key);
        key = parseInt(key);
        el[o.id]['key'] != -1 && (el[o.id].div.querySelectorAll('div[num="' + el[o.id]['key'] + '"]')[0].style.background = 'transparent');
        el[o.id]['key'] = key;
        el[o.id]['key'] != -1 && (el[o.id].div.querySelectorAll('div[num="' + el[o.id]['key'] + '"]')[0].style.background = '#D5E2FF');
        el.value = key == -1 ? el[o.id]._value : el[o.id]['data'][el[o.id]['array'][key]];
    };

    o.hide = function(el, blur) {
        el[o.id].div && el[o.id].div.parentNode.removeChild(el[o.id].div);
        el[o.id] = {active: false};
        el._autocomplete && (el.autocomplete = el._autocomplete);
        !blur && el.focus();
    };

    // find all fields
    var i, els = document.querySelectorAll('input, textarea'), l = els.length;
    for(i=0; i<l; i++) {
        if(els[i].tagName == 'INPUT' && els[i].hasAttribute('type') && !(els[i].getAttribute('type') == 'text' || els[i].getAttribute('type') == 'password')) {
            continue;
        }
        els[i][o.id] = {active: false};
        els[i].addEventListener('keydown', function(e){
            if(!this[o.id].active && e.ctrlKey && e.keyCode == 32) {
                // Ctrl + Space

                // load all data from enhancer
                this[o.id]['data'] = window[o.id] || '{}';
                this[o.id]['array'] = [];
                for(var x in this[o.id]['data']) {
                    this[o.id]['array'].push(x);
                }
                if(this[o.id]['array'].length == 0) return;

                // insert data list
                o.list(this);
                this[o.id]._value = this.value;

                // stop default event
                e.stopPropagation()
                e.preventDefault();
                e.returnValue = false;
                e.cancelBubble = true;
                return false;
            } else if(this[o.id].active && (e.keyCode == 38 || e.keyCode == 40)) {
                // up/down
                o.move(this, e.keyCode == 38 ? 'prev' : 'next');
                e.stopPropagation()
                e.preventDefault();
                e.returnValue = false;
                e.cancelBubble = true;
                return false;
            } else if(this[o.id].active && e.keyCode == 13) {
                // enter
                o.hide(this);
                e.stopPropagation()
                e.preventDefault();
                e.returnValue = false;
                e.cancelBubble = true;
                return false;
            } else if(this[o.id].active) {
                // any key
                this[o.id]._value = this.value;
            } else {
                // nothing
            }
        }, false);
        els[i].addEventListener('blur', function(){
            o.hide(this, true);
        });
    }

}};
