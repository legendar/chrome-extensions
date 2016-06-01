
services.ytr = {
    translate: function(data, callback) {
        var result = {};

        if(data.from != 'auto' && this.langsMap[data.from]) {
            data.from = this.langsMap[data.from];
        }

        this.sendRequestTranslate(data, (function(r) {
            if(!r.text) {
                callback({status: 'error', message: r.message});
                return;
            }
            result.text = r.text.join(', ');
            var l = r.lang.split('-');
            result.from = l[0];
            result.to = l[1];
            //if(!(/\s|\.|\\|\/|,|:|;|'|"|\[|\]|\{|\}|<|>|\?|\!|\(|\)/.test(data.text))) {
                if(data.from == 'auto') {
                    data.from = result.from;
                }
                this.sendRequestDict(data, (function(r) {
                    result.dict = this.parseResults(r);
                    callback(result);
                }).bind(this));
            //} else {
            //    callback(result);
            //}
        }).bind(this));
    },

    // http://translate.yandex.net/api/v1/tr.json/translate?callback=ya_.json.c(44)&lang=en-ru&text=defined&srv=tr-text&id=c9a7d780-10-0&reason=paste
    // http://translate.yandex.net/dicservice.json/lookup?callback=ya_.json.c(42)&ui=ru&text=defined&lang=en-ru&flags=1

    sendRequestTranslate: function(data, callback) {
        var url = 'http://translate.yandex.net/api/v1/tr.json/translate?srv=tr-text&id=f3db03cf.574ede21.89a7ad76-9-0&reason=auto'
        //url += '&text=' + encodeURIComponent(data.text);
        if(data.from != 'auto') {
            url += '&lang=' + data.from + '-' + data.to;
        } else {
            url += '&lang=' + data.to;
        }
        this.sendRequest(url, 'text=' + encodeURIComponent(data.text), callback);
    },

    sendRequestDict: function(data, callback) {
        var url = 'http://translate.yandex.net/dicservice.json/lookup?flags=1';
        url += '&ui=' + data.lang;
        url += '&text=' + encodeURIComponent(data.text);
        url += '&lang=' + data.from + '-' + data.to;
        this.sendRequest(url, false, callback);
    },

    sendRequest: function(url, post, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open(post ? 'POST' : 'GET', url, true);
        post && xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                callback(JSON.parse(xhr.responseText));
            }
        }
        xhr.send(post || null);
    },

    parseResults: function(result) {
        var dict = [];
        for(var i = 0, l = result.def.length; i < l; i++) {
            var d = {
                type: result.def[i].tr[0].pos,
                text: [],
                synonyms: []
            };
            for(var k = 0, kl = result.def[i].tr.length; k < kl; k++) {
                d.text.push(result.def[i].tr[k].text);
                var synonyms = [];
                if(result.def[i].tr[k].mean) {
                    for(var x = 0, xl = result.def[i].tr[k].mean.length; x < xl; x++) {
                        synonyms.push(result.def[i].tr[k].mean[x].text);
                    }
                }
                d.synonyms.push(synonyms);
            }
            dict.push(d);
        }
        return dict;
    },

    // supported languages
    langs: ['ar','az','be','bg','ca','cs','da','de','el','en','es','et','fi','fr','iw','hr','hu','hy','it','ka','lt','lv','mk','nl','no','pl','pt','ro','ru','sk','sl','sq','sr','sv','tr','uk'],

    langsMap: {
        'iw': 'he'
    }
}

