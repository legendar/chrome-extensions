function $(id) {
    return document.getElementById(id);
}

function changeIcon(e) {
    var icon = e.srcElement || e;
    $('icon-' + localStorage['icon']).className = '';
    icon.className = 'selected';
    localStorage['icon'] = icon.alt;
}

function changeService(e) {
    var service = e.srcElement || e;
    $('service-' + localStorage['service']).className = '';
    service.className = 'selected';
    localStorage['service'] = service.innerText;
    e.defaultPrevented = true;
}

function load() {

    var i, img;
    for(i = 1; i < parseInt(localStorage['iconsCount']) + 1; i++) {
        img = new Image();
        img.src = 'graphics/icons/' + (i < 10 ? '0' : '') + i + '.png';
        img.alt = i;
        img.onclick = changeIcon;
        img.id = 'icon-' + i;
        $('iconsWrapper').appendChild(img);
        if(img.width > 0) {
            if(img.width < 128) {
                img.style.padding = ((148 - img.width) / 2) + 'px';
            } else if(img.width > 128) {
                img.width = 128;
            }
        }
    }

    var services = ['bit.ly', 'goo.gl', 'u.to', 'clck.ru', 'is.gd'], a;
    for(i = 0; i < services.length; i++) {
        a = document.createElement('a');
        a.id = 'service-' + services[i];
        a.href = '#' + services[i];
        a.innerText = services[i];
        a.onclick = changeService;
        $('serviceWrapper').appendChild(a);
    }

    changeIcon($('icon-' + localStorage['icon']));
    changeService($('service-' + localStorage['service']));

    $('options').style.display = '';
    $('loading').style.display = 'none';
}

window.addEventListener("load", load);
