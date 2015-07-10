
services['goo.gl'] = function(options) {
    var apiKey = 'AIzaSyBwRf6A2_iAUSTBg933UOY5OI6Ul1oFWQ4'
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://www.googleapis.com/urlshortener/v1/url?key=' + apiKey, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status < 300 && xhr.status >= 200) {
                var result = JSON.parse(xhr.responseText);
                if(result['id']) {
                    options.callback(result['id']);
                } else {
                    options.callbackError(result['error']['message']);
                }
            } else {
                options.callbackError('Wrong status (' + xhr.status + ')');
            }
        }
    };
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({longUrl: options.url}));

    // timeout
    setTimeout(function(){
        if(xhr.readyState < 3) {
            xhr.abort();
            options.callbackError('Timeout (' + options.timeout + ' seconds)');
        }
    }, options.timeout);
    return options;
};
