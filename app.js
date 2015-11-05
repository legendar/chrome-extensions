
// TODO
// tts chrome.tts.speak('Hello, world.');
// themes
// other services
//      translate.ru
//      lingvo
//      babylon
//      prompt

var defaults = {
    'hover-timeout': 300,   // ms
    //'repeat-offset': 5,     // px
    'hover': true,
    'key': 'ctrlKey',
    'lang': navigator.language.split('-')[0],                       // client language
    'second': 'en',
    'from': 'auto',
    'to': 'auto',
    'service': 'gtr',
    'auto': true,
    'width': 350,
    'height': 300,
    'simple': false
};

var options = localStorage.options ? JSON.parse(localStorage.options) : defaults;
for(var i in defaults) {
    if(!(i in options)) {
        options[i] = defaults[i]
    }
}


function save(data) {
    for(var i in options) {
        if(i in data) {
            options[i] = data[i];
        }
    }
    localStorage.options = JSON.stringify(options);
}

save({});

// inject action.js for all opened tabs
chrome.tabs.query({'status': 'complete'}, function(tabs) {
    tabs.forEach(injectAction);
});

// inject action.js for new tabs
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    injectAction(tab);
});


var langs;
function injectAction(tab) {
    if(!langs) {
        langs = {};
        langs.all = services.gtr.langs;
        for(var i in services) {
            langs[i] = services[i].langs;
        }
    }

    if(['https', 'http:'].indexOf(tab.url.substring(0, 5)) !== -1) {
        chrome.tabs.executeScript(tab.id, {code: 'var o = ' + JSON.stringify(options) + '; var langs = ' + JSON.stringify(langs), allFrames: true}, function() {
            chrome.tabs.executeScript(tab.id, {file: 'action.js', allFrames: true});
        });
    }
}

chrome.runtime.onMessage.addListener(function(data, sender, callback) {
    if(data.action == 'translate') {
        save(data);
        translate({
            text: data.text,
            from: data.from || 'auto',
            to: data.to ? (data.to == 'auto' ? options.lang : data.to) : options.lang,
            second: options.second,
            lang: options.lang,
            service: data.service
        }, function(results) {
            data.results = results;
            callback(data);
        });
        return true;
    }

    if(data.action == 'options') {
        save(data);
        callback(options);
    }

    if(data.action == 'reload') {
        options = JSON.parse(localStorage.options);
        // re-inject action.js for all opened tabs (only options will reloaded, actions.js has protect to prevent reloading)
        chrome.tabs.query({'status': 'complete'}, function(tabs) {
            tabs.forEach(injectAction);
        });
    }

    return false;
});

var services = {};

function translate(data, callback, twice) {
    services[data.service].translate({text: data.text, from: data.from, to: data.to, lang: data.lang}, function(results) {
        if(results.status && results.status == 'error') {
            return callback(results);
        }
        if(data.from == 'auto' && results.from == data.to && !twice) {
            data.from = data.to; data.to = data.second;
            translate(data, callback, true);
        } else {
            callback(results);
        }
    });
}
