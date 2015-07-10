
services['u.to'] = function(options) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://u.to/', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status < 300 && xhr.status >= 200) {
                var result;
                if(result = /^.*?val\('(http[^']+).*$/.exec(xhr.responseText)) {
                    options.callback(result[1]);
                } else {
                    options.callbackError('Unknown error');
                }
            } else {
                options.callbackError('Wrong status (' + xhr.status + ')');
            }
        }
    };
    xhr.send('a=add&url=' + encodeURIComponent(options.url));

    // timeout
    setTimeout(function(){
        if(xhr.readyState < 3) {
            xhr.abort();
            options.callbackError('Timeout (' + options.timeout + ' seconds)');
        }
    }, options.timeout);
    return options;
};
