
services['bit.ly'] = function(options) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://api.bit.ly/v3/shorten?format=json&apikey=R_8f0a190da4203b72c58e52af8b169b98&login=o_659hr4ae8j&uri=' + encodeURIComponent(options.url), true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status < 300 && xhr.status >= 200) {
                var result = JSON.parse(xhr.responseText);
                if(result.status_code == 200 && result.status_txt == 'OK') {
                    options.callback(result.data.url);
                } else {
                    options.callbackError(result.status_txt);
                }
            } else {
                options.callbackError('Wrong status (' + xhr.status + ')');
            }
        }
    };
    xhr.send();

    // timeout
    setTimeout(function(){
        if(xhr.readyState < 3) {
            xhr.abort();
            options.callbackError('Timeout (' + options.timeout + ' seconds)');
        }
    }, options.timeout);
    return options;
};
