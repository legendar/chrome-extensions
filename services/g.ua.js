
services['g.ua'] = function(options) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://g.ua/?u=' + encodeURIComponent(options.url), true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status < 300 && xhr.status >= 200) {
                var result;
                try {
                    result = JSON.parse(xhr.responseText)
                } catch(e) {
                    result = {errormessage: 'Bad request'}
                }
                if(result.status_code == 200 && result.status_text == 'OK') {
                    options.callback(result.shortLink);
                } else {
                    options.callbackError(result['errormessage'] || 'Unknown error');
                }
            } else {
                options.callbackError('Wrong status (' + xhr.status + ')');
            }
        }
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send(null);

    // timeout
    setTimeout(function(){
        if(xhr.readyState < 3) {
            xhr.abort();
            options.callbackError('Timeout (' + options.timeout + ' seconds)');
        }
    }, options.timeout);
    return options;
};
