var services = {};
var timeout = 3;

localStorage['iconsCount'] = 7;
localStorage['icon'] = parseInt(localStorage['icon'] || 1);
localStorage['service'] = localStorage['service'] || 'goo.gl';

function drawIcon(tab, isError) {
    var icon = parseInt(localStorage['icon']);
    var icon_src = 'graphics/icons/' + (icon < 10 ? '0' : '') + icon + '.png';
    if(isError) {
      icon_src = 'graphics/error.png';
    }
    chrome.pageAction.setIcon({tabId: tab.id, path: icon_src});
}

var animationTimer;
function animateIcon(tab, frame) {
    frame = frame || 0;
    if(frame == 12) {
        frame = 0;
    }

    var cv = document.getElementById('canvas'),
        cc = cv.getContext('2d'),
        r = document.getElementById('loader');

    cc.save();
    cc.clearRect(0, 0, cv.width, cv.height);
    cc.drawImage(r, 0, 0 - frame * 19, r.width, r.height);
    cc.restore();

    chrome.pageAction.setIcon({tabId: tab.id, imageData:cc.getImageData(0, 0, cv.width, cv.height)});

    animationTimer = setTimeout(function(){animateIcon(tab, frame + 1);}, 90);
}

function stopAnimation() {
  clearTimeout(animationTimer);
}

function simplify(url, callback, callbackError) {
    if(!url) return;
    services[localStorage['service']]({
        url: url,
        callback: callback,
        callbackError: callbackError,
        timeout: timeout * 1000 // 3 seconds
    });
    return url;
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var scheme = tab.url.substring(0, 4);
    // ensure that we have HTTP(s) or FTP url
    if(scheme == 'http' || scheme == 'ftp:') {
        chrome.pageAction.show(tab.id);
        chrome.pageAction.setTitle({tabId: tab.id, title: 'Click to simplify and copy to clipboard'});
        drawIcon(tab);
    }
});

var simplifyState = {}
chrome.pageAction.onClicked.addListener(function(tab){
    if(tab.id in simplifyState) {
      return;
    }
    simplifyState[tab.id] = true;
    animateIcon(tab)
    simplify(tab.url, function(result) {
        chrome.pageAction.setTitle({tabId: tab.id, title: 'URL Simplified (' + result + ')'});
        stopAnimation();
        drawIcon(tab);
        with(document.getElementById('field')) {
            value = result;
            focus();
            select();
        }
        // copy to clipboard
        document.execCommand('Copy');
        delete simplifyState[tab.id]
    }, function(result) {
        stopAnimation();
        drawIcon(tab, true);
        chrome.pageAction.setTitle({tabId: tab.id, title: 'Error! ' + result});
        console.log('Can\'t simplify url: ' + tab.url + '. ' + result);
        delete simplifyState[tab.id]
    });
});
