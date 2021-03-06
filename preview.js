(function() {

    var inp   = document.getElementById('pastek-input'),
        out   = document.getElementById('html-output'),
        tools = document.getElementById('input-tools'),

        body  = document.getElementsByTagName('body')[0],

        // saving tools
        rawbutton,
        savebutton,
        last_filename = 'pastek.txt',

        // cache string used to check if the text in the box has changed or not
        cache = '',

        // helpers
        noop = function() {},
        warn = window.console && console.warn ? console.warn.bind(console) : noop,

        createElement = function( name, opts, klass ) {
            var e = document.createElement( name ), o;
            for (o in opts) {
                if (opts.hasOwnProperty(o)) {
                    e.setAttribute( o, opts[o] );
                }
            }
            if (klass) {
                e.className = klass;
            }
            return e;
        },

        // regexes
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
     * On startup, include the help text if the input is empty
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

        rawbutton = createElement('a', {
            href: '#',
            target: '_blank',
            title: 'Right-click → "Save as…"'
        }, 'button');
        rawbutton.textContent = rawbutton.innerText = 'View raw…';

        savebutton = rawbutton.cloneNode(true);
        savebutton.textContent = savebutton.innerText = 'Save as…';
        savebutton.setAttribute('download', last_filename);

        addEventListener(rawbutton, 'click', function() {
            rawbutton.setAttribute('href', createSourceURL());
        });

        addEventListener(savebutton, 'click', function(e) {
            var name = prompt('Select a filename:', last_filename);

            if (name == null) { e.preventDefault(); return false; }

            savebutton.setAttribute('href', createSourceURL());
            savebutton.setAttribute('download', last_filename = name);
        });

        tools.appendChild(rawbutton);
        tools.appendChild(savebutton);

    }

    /**
     * Edit a file from your local storage (#2)
     **/
    if (window.File && window.FileReader) (function(){
        var fileinput, button,
            ref = '_local_file';

        button = createElement('label', {
            href: '#',
           'for': ref
        }, 'button');
        button.innerText = button.textContent = 'Edit a local file…';

        fileinput = createElement('input', {
            type: 'file',
            accept: 'text/*'
        }, 'hidden');
        fileinput.id = ref;

        addEventListener( fileinput, 'change', function() {
            var f = fileinput.files[0],
                reader;
            if (!f) { return; }

            reader = new FileReader();
            reader.onload = function() {
                inp.value = reader.result.slice(0, 0xFFFFF);
                updateHTML();
            };
            reader.readAsText(f);
        });


        body.appendChild(fileinput);
        tools.appendChild(button);

    })();

    /**
     * Auto-expand the textarea when you type in it
     **/

})();
