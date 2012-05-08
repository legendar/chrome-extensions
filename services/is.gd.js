
services['is.gd'] = function(options) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://is.gd/create.php?format=json&url=' + options.url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status < 300 && xhr.status >= 200) {
                var result = JSON.parse(xhr.responseText);
                if(result['shorturl']) {
                    options.callback(result['shorturl']);
                } else {
                    options.callbackError(result['errormessage'] || 'Unknown error');
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
