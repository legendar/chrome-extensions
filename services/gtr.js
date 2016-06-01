
services.gtr = {
    translate: function(data, callback) {
        this.sendRequest(data, (function(r) {
            var result = this.parseResults(r);
            if(!result.from) {
                result.from = data.from;
            }
            result.to = data.to;
            callback(result);
        }).bind(this));
    },

    sendRequest: function(data, callback) {
        //console.log(data, callback)
        //https://translate.google.com.ua/translate_a/single
        //?client=t& // gtx = google translate extension
        //sl=en&tl=ru&hl=ru
        //&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t
        //&ie=UTF-8&oe=UTF-8
        //&otf=1&ssel=0&tsel=0&kc=4&tk=626934.1025426
        //&q=ok%20how%20are%20you
        var url = 'http://translate.google.com/translate_a/single?client=gtx&ie=UTF-8&oe=UTF-8',
            post = data.text.length > 100;
        //'&sc=2&ie=UTF-8&oe=UTF-8&uptl=en&alttl=ru&oc=1&otf=2&ssel=0&tsel=6&q=hi';
        url += '&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t'
        url += '&hl=' + data.lang;
        url += '&otf=1&ssel=0&tsel=0&kc=4&tk=626934.1025426'
        post || (url += '&q=' + encodeURIComponent(data.text));
        //if(data.from != 'auto') {
            url += '&sl=' + data.from;
        //}
        url += '&tl=' + data.to;
        var xhr = new XMLHttpRequest();
        xhr.open(post ? "POST" : "GET", url, true);
        post && xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var r = xhr.responseText;
                while(/,,/.test(r)) {
                    r = r.replace(/,,/gi, ',null,')
                }
                while(/\[,/.test(r)) {
                    r = r.replace(/\[,/gi, '[null,')
                }
                while(/\{,/.test(r)) {
                    r = r.replace(/\{,/gi, '{null,')
                }
                var r = JSON.parse(r);
                callback(r);
            }
        }
        xhr.send(post ? 'q=' + encodeURIComponent(data.text) : null);
    },

    parseResults: function(result) {
        var res = {};
        if(result[2]) {
            res.from = result[2];
        }
        var text = [], i;
        for(var i = 0, l = result[0].length; i < l; i++) {
            text.push(result[0][i][0]);
        }
        res.text = text.join('');

        var dict = [];
        if(result[1]) {
            for(var i = 0, l = result[1].length; i < l; i++) {
                var d = {
                    type: result[1][i][0],
                    text: result[1][i][1],
                    synonyms: []
                };
                if(result[1][i][2]) {
                    for(var k = 0, kl = d.text.length; k < kl; k++) {
                        if(result[1][i][2][k]) {
                            d.synonyms.push(result[1][i][2][k][1]);
                        } else {
                            d.synonyms.push([]);
                        }
                    }
                }
                dict.push(d);
            }
        }
        res.dict = dict;

        return res;
    },

    // supported languages
    langs: ['az', 'sq', 'en', 'ar', 'hy', 'af', 'eu', 'be', 'bn', 'bg', 'bs', 'cy', 'hu', 'vi', 'gl', 'nl', 'el', 'ka', 'gu', 'da', 'zu', 'iw', 'ig', 'yi', 'id', 'ga', 'is', 'es', 'it', 'yo', 'kn', 'ca', 'zh-CN', 'ko', 'ht', 'km', 'lo', 'la', 'lv', 'lt', 'mk', 'ms', 'mt', 'mi', 'mr', 'mn', 'de', 'ne', 'no', 'pa', 'fa', 'pl', 'pt', 'ro', 'ru', 'ceb', 'sr', 'sk', 'sl', 'so', 'sw', 'tl', 'th', 'ta', 'te', 'tr', 'uk', 'ur', 'fi', 'fr', 'ha', 'hi', 'hmn', 'hr', 'cs', 'sv', 'eo', 'et', 'jw', 'ja']
}
