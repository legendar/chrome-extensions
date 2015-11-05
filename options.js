

var services = {};

//var selects = ['from', 'first', 'second', 'theme', 'service'];
//var checkboxes = ['ctrl', 'alt', 'shift', 'meta', 'selection', 'mouseover'];
//var languages = JSON.parse(localStorage['languages']);
//var options = JSON.parse(localStorage['options']);
//var defaults = JSON.parse(localStorage['defaults']);
//var port = chrome.extension.connect();

function $(id) {
    return document.getElementById(id);
}

var options = JSON.parse(localStorage.options);

function load() {
    // i18n
    var nodes = document.querySelectorAll('*[data-i18n]');
    for(var i = 0, l = nodes.length; i < l; i++) {
        nodes[i].textContent = chrome.i18n.getMessage(nodes[i].dataset.i18n);
    }

    // keys
    options.key && options.key.split('-').forEach(function(k) {
        $(k).checked = true;
    });

    // hover
    $('hover').checked = options.hover;
    // ui
    $('simple').checked = options.simple;

    // selects
    var list = [];
    function op(value, text) {
        var o = document.createElement('option');
        o.textContent = text;
        o.value = value;
        return o;
    }
    services.gtr.langs.forEach(function(lang) {
        var text = chrome.i18n.getMessage('lang_' + lang.split('-').join('_'));
        $('lang').appendChild(op(lang, text));
        $('second').appendChild(op(lang, text));
    });
    $('lang').value = options.lang;
    $('second').value = options.second;

    // auto save options on change
    ['hover', 'simple', 'ctrlKey', 'altKey', 'shiftKey', 'metaKey', 'lang', 'second'].forEach(function(id) {
        $(id).addEventListener('change', save);
    });
}

function save() {

    // save local
    options.lang = $('lang').value;
    options.second = $('second').value;
    options.hover = $('hover').checked;
    options.simple = $('simple').checked;
    var hold = [];
    ['ctrlKey', 'altKey', 'shiftKey', 'metaKey'].forEach(function(k) {
        if($(k).checked) {
            hold.push(k);
        }
    });
    options.key = hold.join('-');

    // save in storage
    localStorage.options = JSON.stringify(options);

    // invoke background page to reload options
    chrome.runtime.sendMessage({action: 'reload'});
}

document.addEventListener('DOMContentLoaded', load, false);
