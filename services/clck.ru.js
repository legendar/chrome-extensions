
services['clck.ru'] = function(options) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://clck.ru/--?json=on&url=' + encodeURIComponent(options.url), true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status < 300 && xhr.status >= 200) {
                var result = JSON.parse(xhr.responseText);
                if(result.length) {
                    options.callback(result[0]);
                } else {
                    options.callbackError('Unknown error');
                }
            } else {
                options.callbackError('Wrong status (' + xhr.status + ')');
            }
        }
    };
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
