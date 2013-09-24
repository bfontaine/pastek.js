(function() {

    var inp   = document.getElementById('pastek-input'),
        out   = document.getElementById('html-output'),
        tools = document.getElementById('input-tools'),
        rawbutton = document.createElement('a'),
        savebutton,
        cache = '',
        warn = window.console && console.warn ? console.warn.bind(console) : function(){},
        empty_re = /^\s*$/,
        help_text = document.getElementById('intro-text').innerHTML,
        s;

    function addEventListener( el, name, fn, useCapture ) {
        if  (el.addEventListener) { // Modern browsers
            el.addEventListener(name, fn, !!useCapture);
        } else if (inp.attachEvent) { // IE
            inp.attachEvent('on' + name, fn);
        } else { // others
            inp['on' + name] = fn;
        }
    }

    /**
     * Main rendering function. It reads the Pastek input,
     * and update the HTML one.
     **/
    function updateHTML() {
        var text = inp.value.replace(/\n+$/g, '');

        if (text == cache) { return; }

        cache = text;

        if (empty_re.test(text)) {
            out.innerHTML = '';
            return;
        }

        try {
            out.innerHTML = pastek_core.mk_html(text + "\n");
        } catch(e) {
            warn('' + e + ', text=<'+text.replace(/\n/g, '\\n')+'>');
        }
    }

    addEventListener(inp, 'keyup', updateHTML);

    /**
     * Save text across sessions
     **/

    if (window.localStorage && typeof localStorage.getItem == 'function') {
        s = localStorage.getItem('pastek.text');

        if (s && inp.value.length == 0) {
            inp.value = s;
            updateHTML();
        }

        addEventListener(window, 'unload', function() {
            localStorage.setItem('pastek.text',
                                 inp.value != help_text ? inp.value : "");
        });
    }

    /**
     * On startup include the help text if the input is empty
     **/

    if (inp.value.length == 0) {

        inp.value = help_text;
        updateHTML();
    }

    /**
     * Save Pastek input as a file using a Blob, if it's supported
     * by the browser.
     **/

    function createSourceURL() {
        var b = new Blob([inp.value], {type: "text/plain"});
        return URL.createObjectURL(b);
    }

    if (window.Blob && window.URL && typeof URL.createObjectURL == 'function') {

        rawbutton.className = 'button';
        rawbutton.textContent = rawbutton.innerText = 'View raw';
        rawbutton.setAttribute('href', '#');
        rawbutton.setAttribute('target', '_blank');
        rawbutton.setAttribute('title', 'Right-click → "Save as…"');

        savebutton = rawbutton.cloneNode(true);
        savebutton.textContent = savebutton.innerText = 'Save as…';
        savebutton.setAttribute('download', 'pastek.txt');

        addEventListener(rawbutton, 'click', function() {
            rawbutton.setAttribute('href', createSourceURL());
        });

        addEventListener(savebutton, 'click', function() {
            savebutton.setAttribute('href', createSourceURL());
            savebutton.setAttribute('download',
                                    prompt('Select a filename:', 'pastek.txt'));
        });

        tools.appendChild(rawbutton);
        tools.appendChild(savebutton);

    }

})();
