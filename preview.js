(function() {

    var inp = document.getElementById('pastek-input'),
        out = document.getElementById('html-output'),
        warn = window.console && console.warn ? console.warn.bind(console) : function(){};

    function updateHTML() {
        var text = inp.value;

        try {
            out.innerHTML = pastek_core.mk_html(text + "\n");
        } catch(e) {
            warn('' + e + ', text=<'+text.replace(/\n/g, '\\n')+'>');
        }
    }

    if  (inp.addEventListener) { // Modern browsers
        inp.addEventListener('keyup', updateHTML, false);
    } else if (inp.attachEvent) { // IE
        inp.attachEvent('onkeyup', updateHTML);
    } else { // others
        inp.onkeyup = updateHTML;
    }


})();
