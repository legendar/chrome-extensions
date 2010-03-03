function _goo_gl_a(i){function l(){for(var c=0,a=0;a<arguments.length;a++)c=c+arguments[a]&4294967295;return c}function o(c){c=c=String(c>0?c:c+4294967296);var a;a=c;for(var d=0,j=false,k=a.length-1;k>=0;--k){var f=Number(a.charAt(k));if(j){f*=2;d+=Math.floor(f/10)+f%10}else d+=f;j=!j}a=a=d%10;d=0;if(a!=0){d=10-a;if(c.length%2==1){if(d%2==1)d+=9;d/=2}}a=String(d);a+=c;return a}function p(c){for(var a=5381,d=0;d<c.length;d++)a=l(a<<5,a,c.charCodeAt(d));return a}function q(c){for(var a=0,d=0;d<c.length;d++)a=l(c.charCodeAt(d),a<<6,a<<16,-a);return a}var e="au";e+="th";e+="_";e+="to";e+="k";e+="en";var b=p(i);b=b>>2&1073741823;b=b>>4&67108800|b&63;b=b>>4&4193280|b&1023;b=b>>4&245760|b&16383;var m="7";h=q(i);var g=(b>>2&15)<<4|h&15;g|=(b>>6&15)<<12|(h>>8&15)<<8;g|=(b>>10&15)<<20|(h>>16&15)<<16;g|=(b>>14&15)<<28|(h>>24&15)<<24;m+=o(g);b="user=";b+="toolbar@google.com";b+="&url=";b+=encodeURIComponent(i);b+="&";b+=e;b+="=";b+=m;return b}

services['goo.gl'] = function(options) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://goo.gl/api/url', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 201 || xhr.status == 403) {
                var result = JSON.parse(xhr.responseText);
                if(result['short_url']) {
                    options.callback(result['short_url']);
                } else {
                    options.callbackError(result['error_message']);
                }
            } else {
                options.callbackError('Wrong status (' + xhr.status + ')');
            }
        }
    };
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(_goo_gl_a(options.url));

    // timeout
    setTimeout(function(){
        if(xhr.readyState < 3) {
            xhr.abort();
            options.callbackError('Timeout (' + options.timeout + ' seconds)');
        }
    }, options.timeout);
    return options;
};
