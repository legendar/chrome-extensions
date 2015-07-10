
services['bit.ly'] = function(options, isJMP) {
    var uri =  'http://api.bit.ly/v3/shorten?format=json&apikey=R_8f0a190da4203b72c58e52af8b169b98&login=o_659hr4ae8j';
    if(isJMP) {
      uri = uri + '&domain=j.mp'
    }
    uri = uri + '&uri=' + encodeURIComponent(options.url);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', uri, true);
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
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
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

services['j.mp'] = function(options) {
  return services['bit.ly'](options, true)
}
