var o = options;
var langs;
if(!langs) {
    langs = {};
    langs.all = services.gtr.langs;
    for(var i in services) {
        langs[i] = services[i].langs;
    }
}
