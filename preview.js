(function() {

    var inp = document.getElementById('pastek-input'),
        out = document.getElementById('html-output'),
        warn = window.console && console.warn ? console.warn.bind(console) : function(){},
        s;

    function addEventListener( el, name, fn ) {
        if  (el.addEventListener) { // Modern browsers
            el.addEventListener(name, fn, false);
        } else if (inp.attachEvent) { // IE
            inp.attachEvent('on' + name, fn);
        } else { // others
            inp['on' + name] = fn;
        }
    }

    function updateHTML() {
        var text = inp.value;

        try {
            out.innerHTML = pastek_core.mk_html(text + "\n");
        } catch(e) {
            warn('' + e + ', text=<'+text.replace(/\n/g, '\\n')+'>');
        }
    }

    addEventListener(inp, 'keyup', updateHTML);

    // save text across sessions
    if (window.localStorage && typeof localStorage.getItem == 'function') {
        s = localStorage.getItem('pastek.text');

        if (s && inp.value.length == 0) {
            inp.value = s;
            updateHTML();
        }

        addEventListener(window, 'unload', function() {
            localStorage.setItem('pastek.text', inp.value);
        });
    }

})();
