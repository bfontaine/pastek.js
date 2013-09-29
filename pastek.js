var pastek_core = {};
// This program was compiled from OCaml by js_of_ocaml 1.3
function caml_raise_with_arg (tag, arg) { throw [0, tag, arg]; }
function caml_raise_with_string (tag, msg) {
  caml_raise_with_arg (tag, new MlWrappedString (msg));
}
function caml_invalid_argument (msg) {
  caml_raise_with_string(caml_global_data[4], msg);
}
function caml_array_bound_error () {
  caml_invalid_argument("index out of bounds");
}
function caml_str_repeat(n, s) {
  if (!n) { return ""; }
  if (n & 1) { return caml_str_repeat(n - 1, s) + s; }
  var r = caml_str_repeat(n >> 1, s);
  return r + r;
}
function MlString(param) {
  if (param != null) {
    this.bytes = this.fullBytes = param;
    this.last = this.len = param.length;
  }
}
MlString.prototype = {
  string:null,
  bytes:null,
  fullBytes:null,
  array:null,
  len:null,
  last:0,
  toJsString:function() {
    return this.string = decodeURIComponent (escape(this.getFullBytes()));
  },
  toBytes:function() {
    if (this.string != null)
      var b = unescape (encodeURIComponent (this.string));
    else {
      var b = "", a = this.array, l = a.length;
      for (var i = 0; i < l; i ++) b += String.fromCharCode (a[i]);
    }
    this.bytes = this.fullBytes = b;
    this.last = this.len = b.length;
    return b;
  },
  getBytes:function() {
    var b = this.bytes;
    if (b == null) b = this.toBytes();
    return b;
  },
  getFullBytes:function() {
    var b = this.fullBytes;
    if (b !== null) return b;
    b = this.bytes;
    if (b == null) b = this.toBytes ();
    if (this.last < this.len) {
      this.bytes = (b += caml_str_repeat(this.len - this.last, '\0'));
      this.last = this.len;
    }
    this.fullBytes = b;
    return b;
  },
  toArray:function() {
    var b = this.bytes;
    if (b == null) b = this.toBytes ();
    var a = [], l = this.last;
    for (var i = 0; i < l; i++) a[i] = b.charCodeAt(i);
    for (l = this.len; i < l; i++) a[i] = 0;
    this.string = this.bytes = this.fullBytes = null;
    this.last = this.len;
    this.array = a;
    return a;
  },
  getArray:function() {
    var a = this.array;
    if (!a) a = this.toArray();
    return a;
  },
  getLen:function() {
    var len = this.len;
    if (len !== null) return len;
    this.toBytes();
    return this.len;
  },
  toString:function() { var s = this.string; return s?s:this.toJsString(); },
  valueOf:function() { var s = this.string; return s?s:this.toJsString(); },
  blitToArray:function(i1, a2, i2, l) {
    var a1 = this.array;
    if (a1) {
      if (i2 <= i1) {
        for (var i = 0; i < l; i++) a2[i2 + i] = a1[i1 + i];
      } else {
        for (var i = l - 1; i >= 0; i--) a2[i2 + i] = a1[i1 + i];
      }
    } else {
      var b = this.bytes;
      if (b == null) b = this.toBytes();
      var l1 = this.last - i1;
      if (l <= l1)
        for (var i = 0; i < l; i++) a2 [i2 + i] = b.charCodeAt(i1 + i);
      else {
        for (var i = 0; i < l1; i++) a2 [i2 + i] = b.charCodeAt(i1 + i);
        for (; i < l; i++) a2 [i2 + i] = 0;
      }
    }
  },
  get:function (i) {
    var a = this.array;
    if (a) return a[i];
    var b = this.bytes;
    if (b == null) b = this.toBytes();
    return (i<this.last)?b.charCodeAt(i):0;
  },
  safeGet:function (i) {
    if (!this.len) this.toBytes();
    if ((i < 0) || (i >= this.len)) caml_array_bound_error ();
    return this.get(i);
  },
  set:function (i, c) {
    var a = this.array;
    if (!a) {
      if (this.last == i) {
        this.bytes += String.fromCharCode (c & 0xff);
        this.last ++;
        return 0;
      }
      a = this.toArray();
    } else if (this.bytes != null) {
      this.bytes = this.fullBytes = this.string = null;
    }
    a[i] = c & 0xff;
    return 0;
  },
  safeSet:function (i, c) {
    if (this.len == null) this.toBytes ();
    if ((i < 0) || (i >= this.len)) caml_array_bound_error ();
    this.set(i, c);
  },
  fill:function (ofs, len, c) {
    if (ofs >= this.last && this.last && c == 0) return;
    var a = this.array;
    if (!a) a = this.toArray();
    else if (this.bytes != null) {
      this.bytes = this.fullBytes = this.string = null;
    }
    var l = ofs + len;
    for (var i = ofs; i < l; i++) a[i] = c;
  },
  compare:function (s2) {
    if (this.string != null && s2.string != null) {
      if (this.string < s2.string) return -1;
      if (this.string > s2.string) return 1;
      return 0;
    }
    var b1 = this.getFullBytes ();
    var b2 = s2.getFullBytes ();
    if (b1 < b2) return -1;
    if (b1 > b2) return 1;
    return 0;
  },
  equal:function (s2) {
    if (this.string != null && s2.string != null)
      return this.string == s2.string;
    return this.getFullBytes () == s2.getFullBytes ();
  },
  lessThan:function (s2) {
    if (this.string != null && s2.string != null)
      return this.string < s2.string;
    return this.getFullBytes () < s2.getFullBytes ();
  },
  lessEqual:function (s2) {
    if (this.string != null && s2.string != null)
      return this.string <= s2.string;
    return this.getFullBytes () <= s2.getFullBytes ();
  }
}
function MlWrappedString (s) { this.string = s; }
MlWrappedString.prototype = new MlString();
function MlMakeString (l) { this.bytes = ""; this.len = l; }
MlMakeString.prototype = new MlString ();
function caml_array_get (array, index) {
  if ((index < 0) || (index >= array.length - 1)) caml_array_bound_error();
  return array[index+1];
}
function caml_array_set (array, index, newval) {
  if ((index < 0) || (index >= array.length - 1)) caml_array_bound_error();
  array[index+1]=newval; return 0;
}
function caml_blit_string(s1, i1, s2, i2, len) {
  if (len === 0) return;
  if (i2 === s2.last && s2.bytes != null) {
    var b = s1.bytes;
    if (b == null) b = s1.toBytes ();
    if (i1 > 0 || s1.last > len) b = b.slice(i1, i1 + len);
    s2.bytes += b;
    s2.last += b.length;
    return;
  }
  var a = s2.array;
  if (!a) a = s2.toArray(); else { s2.bytes = s2.string = null; }
  s1.blitToArray (i1, a, i2, len);
}
function caml_call_gen(f, args) {
  if(f.fun)
    return caml_call_gen(f.fun, args);
  var n = f.length;
  var d = n - args.length;
  if (d == 0)
    return f.apply(null, args);
  else if (d < 0)
    return caml_call_gen(f.apply(null, args.slice(0,n)), args.slice(n));
  else
    return function (x){ return caml_call_gen(f, args.concat([x])); };
}
function caml_classify_float (x) {
  if (isFinite (x)) {
    if (Math.abs(x) >= 2.2250738585072014e-308) return 0;
    if (x != 0) return 1;
    return 2;
  }
  return isNaN(x)?4:3;
}
function caml_int64_compare(x,y) {
  var x3 = x[3] << 16;
  var y3 = y[3] << 16;
  if (x3 > y3) return 1;
  if (x3 < y3) return -1;
  if (x[2] > y[2]) return 1;
  if (x[2] < y[2]) return -1;
  if (x[1] > y[1]) return 1;
  if (x[1] < y[1]) return -1;
  return 0;
}
function caml_int_compare (a, b) {
  if (a < b) return (-1); if (a == b) return 0; return 1;
}
function caml_compare_val (a, b, total) {
  var stack = [];
  for(;;) {
    if (!(total && a === b)) {
      if (a instanceof MlString) {
        if (b instanceof MlString) {
            if (a != b) {
		var x = a.compare(b);
		if (x != 0) return x;
	    }
        } else
          return 1;
      } else if (a instanceof Array && a[0] === (a[0]|0)) {
        var ta = a[0];
        if (ta === 250) {
          a = a[1];
          continue;
        } else if (b instanceof Array && b[0] === (b[0]|0)) {
          var tb = b[0];
          if (tb === 250) {
            b = b[1];
            continue;
          } else if (ta != tb) {
            return (ta < tb)?-1:1;
          } else {
            switch (ta) {
            case 248: {
		var x = caml_int_compare(a[2], b[2]);
		if (x != 0) return x;
		break;
	    }
            case 255: {
		var x = caml_int64_compare(a, b);
		if (x != 0) return x;
		break;
	    }
            default:
              if (a.length != b.length) return (a.length < b.length)?-1:1;
              if (a.length > 1) stack.push(a, b, 1);
            }
          }
        } else
          return 1;
      } else if (b instanceof MlString ||
                 (b instanceof Array && b[0] === (b[0]|0))) {
        return -1;
      } else {
        if (a < b) return -1;
        if (a > b) return 1;
        if (total && a != b) {
          if (a == a) return 1;
          if (b == b) return -1;
        }
      }
    }
    if (stack.length == 0) return 0;
    var i = stack.pop();
    b = stack.pop();
    a = stack.pop();
    if (i + 1 < a.length) stack.push(a, b, i + 1);
    a = a[i];
    b = b[i];
  }
}
function caml_compare (a, b) { return caml_compare_val (a, b, true); }
function caml_create_string(len) {
  if (len < 0) caml_invalid_argument("String.create");
  return new MlMakeString(len);
}
function caml_fill_string(s, i, l, c) { s.fill (i, l, c); }
function caml_parse_format (fmt) {
  fmt = fmt.toString ();
  var len = fmt.length;
  if (len > 31) caml_invalid_argument("format_int: format too long");
  var f =
    { justify:'+', signstyle:'-', filler:' ', alternate:false,
      base:0, signedconv:false, width:0, uppercase:false,
      sign:1, prec:-1, conv:'f' };
  for (var i = 0; i < len; i++) {
    var c = fmt.charAt(i);
    switch (c) {
    case '-':
      f.justify = '-'; break;
    case '+': case ' ':
      f.signstyle = c; break;
    case '0':
      f.filler = '0'; break;
    case '#':
      f.alternate = true; break;
    case '1': case '2': case '3': case '4': case '5':
    case '6': case '7': case '8': case '9':
      f.width = 0;
      while (c=fmt.charCodeAt(i) - 48, c >= 0 && c <= 9) {
        f.width = f.width * 10 + c; i++
      }
      i--;
     break;
    case '.':
      f.prec = 0;
      i++;
      while (c=fmt.charCodeAt(i) - 48, c >= 0 && c <= 9) {
        f.prec = f.prec * 10 + c; i++
      }
      i--;
    case 'd': case 'i':
      f.signedconv = true; /* fallthrough */
    case 'u':
      f.base = 10; break;
    case 'x':
      f.base = 16; break;
    case 'X':
      f.base = 16; f.uppercase = true; break;
    case 'o':
      f.base = 8; break;
    case 'e': case 'f': case 'g':
      f.signedconv = true; f.conv = c; break;
    case 'E': case 'F': case 'G':
      f.signedconv = true; f.uppercase = true;
      f.conv = c.toLowerCase (); break;
    }
  }
  return f;
}
function caml_finish_formatting(f, rawbuffer) {
  if (f.uppercase) rawbuffer = rawbuffer.toUpperCase();
  var len = rawbuffer.length;
  if (f.signedconv && (f.sign < 0 || f.signstyle != '-')) len++;
  if (f.alternate) {
    if (f.base == 8) len += 1;
    if (f.base == 16) len += 2;
  }
  var buffer = "";
  if (f.justify == '+' && f.filler == ' ')
    for (var i = len; i < f.width; i++) buffer += ' ';
  if (f.signedconv) {
    if (f.sign < 0) buffer += '-';
    else if (f.signstyle != '-') buffer += f.signstyle;
  }
  if (f.alternate && f.base == 8) buffer += '0';
  if (f.alternate && f.base == 16) buffer += "0x";
  if (f.justify == '+' && f.filler == '0')
    for (var i = len; i < f.width; i++) buffer += '0';
  buffer += rawbuffer;
  if (f.justify == '-')
    for (var i = len; i < f.width; i++) buffer += ' ';
  return new MlWrappedString (buffer);
}
function caml_format_float (fmt, x) {
  var s, f = caml_parse_format(fmt);
  var prec = (f.prec < 0)?6:f.prec;
  if (x < 0) { f.sign = -1; x = -x; }
  if (isNaN(x)) { s = "nan"; f.filler = ' '; }
  else if (!isFinite(x)) { s = "inf"; f.filler = ' '; }
  else
    switch (f.conv) {
    case 'e':
      var s = x.toExponential(prec);
      var i = s.length;
      if (s.charAt(i - 3) == 'e')
        s = s.slice (0, i - 1) + '0' + s.slice (i - 1);
      break;
    case 'f':
      s = x.toFixed(prec); break;
    case 'g':
      prec = prec?prec:1;
      s = x.toExponential(prec - 1);
      var j = s.indexOf('e');
      var exp = +s.slice(j + 1);
      if (exp < -4 || x.toFixed(0).length > prec) {
        var i = j - 1; while (s.charAt(i) == '0') i--;
        if (s.charAt(i) == '.') i--;
        s = s.slice(0, i + 1) + s.slice(j);
        i = s.length;
        if (s.charAt(i - 3) == 'e')
          s = s.slice (0, i - 1) + '0' + s.slice (i - 1);
        break;
      } else {
        var p = prec;
        if (exp < 0) { p -= exp + 1; s = x.toFixed(p); }
        else while (s = x.toFixed(p), s.length > prec + 1) p--;
        if (p) {
          var i = s.length - 1; while (s.charAt(i) == '0') i--;
          if (s.charAt(i) == '.') i--;
          s = s.slice(0, i + 1);
        }
      }
      break;
    }
  return caml_finish_formatting(f, s);
}
function caml_format_int(fmt, i) {
  if (fmt.toString() == "%d") return new MlWrappedString(""+i);
  var f = caml_parse_format(fmt);
  if (i < 0) { if (f.signedconv) { f.sign = -1; i = -i; } else i >>>= 0; }
  var s = i.toString(f.base);
  if (f.prec >= 0) {
    f.filler = ' ';
    var n = f.prec - s.length;
    if (n > 0) s = caml_str_repeat (n, '0') + s;
  }
  return caml_finish_formatting(f, s);
}
function caml_int64_is_negative(x) {
  return (x[3] << 16) < 0;
}
function caml_int64_neg (x) {
  var y1 = - x[1];
  var y2 = - x[2] + (y1 >> 24);
  var y3 = - x[3] + (y2 >> 24);
  return [255, y1 & 0xffffff, y2 & 0xffffff, y3 & 0xffff];
}
function caml_int64_of_int32 (x) {
  return [255, x & 0xffffff, (x >> 24) & 0xffffff, (x >> 31) & 0xffff]
}
function caml_int64_ucompare(x,y) {
  if (x[3] > y[3]) return 1;
  if (x[3] < y[3]) return -1;
  if (x[2] > y[2]) return 1;
  if (x[2] < y[2]) return -1;
  if (x[1] > y[1]) return 1;
  if (x[1] < y[1]) return -1;
  return 0;
}
function caml_int64_lsl1 (x) {
  x[3] = (x[3] << 1) | (x[2] >> 23);
  x[2] = ((x[2] << 1) | (x[1] >> 23)) & 0xffffff;
  x[1] = (x[1] << 1) & 0xffffff;
}
function caml_int64_lsr1 (x) {
  x[1] = ((x[1] >>> 1) | (x[2] << 23)) & 0xffffff;
  x[2] = ((x[2] >>> 1) | (x[3] << 23)) & 0xffffff;
  x[3] = x[3] >>> 1;
}
function caml_int64_sub (x, y) {
  var z1 = x[1] - y[1];
  var z2 = x[2] - y[2] + (z1 >> 24);
  var z3 = x[3] - y[3] + (z2 >> 24);
  return [255, z1 & 0xffffff, z2 & 0xffffff, z3 & 0xffff];
}
function caml_int64_udivmod (x, y) {
  var offset = 0;
  var modulus = x.slice ();
  var divisor = y.slice ();
  var quotient = [255, 0, 0, 0];
  while (caml_int64_ucompare (modulus, divisor) > 0) {
    offset++;
    caml_int64_lsl1 (divisor);
  }
  while (offset >= 0) {
    offset --;
    caml_int64_lsl1 (quotient);
    if (caml_int64_ucompare (modulus, divisor) >= 0) {
      quotient[1] ++;
      modulus = caml_int64_sub (modulus, divisor);
    }
    caml_int64_lsr1 (divisor);
  }
  return [0,quotient, modulus];
}
function caml_int64_to_int32 (x) {
  return x[1] | (x[2] << 24);
}
function caml_int64_is_zero(x) {
  return (x[3]|x[2]|x[1]) == 0;
}
function caml_int64_format (fmt, x) {
  var f = caml_parse_format(fmt);
  if (f.signedconv && caml_int64_is_negative(x)) {
    f.sign = -1; x = caml_int64_neg(x);
  }
  var buffer = "";
  var wbase = caml_int64_of_int32(f.base);
  var cvtbl = "0123456789abcdef";
  do {
    var p = caml_int64_udivmod(x, wbase);
    x = p[1];
    buffer = cvtbl.charAt(caml_int64_to_int32(p[2])) + buffer;
  } while (! caml_int64_is_zero(x));
  if (f.prec >= 0) {
    f.filler = ' ';
    var n = f.prec - buffer.length;
    if (n > 0) buffer = caml_str_repeat (n, '0') + buffer;
  }
  return caml_finish_formatting(f, buffer);
}
function caml_parse_sign_and_base (s) {
  var i = 0, base = 10, sign = s.get(0) == 45?(i++,-1):1;
  if (s.get(i) == 48)
    switch (s.get(i + 1)) {
    case 120: case 88: base = 16; i += 2; break;
    case 111: case 79: base =  8; i += 2; break;
    case  98: case 66: base =  2; i += 2; break;
    }
  return [i, sign, base];
}
function caml_parse_digit(c) {
  if (c >= 48 && c <= 57)  return c - 48;
  if (c >= 65 && c <= 90)  return c - 55;
  if (c >= 97 && c <= 122) return c - 87;
  return -1;
}
var caml_global_data = [0];
function caml_failwith (msg) {
  caml_raise_with_string(caml_global_data[3], msg);
}
function caml_int_of_string (s) {
  var r = caml_parse_sign_and_base (s);
  var i = r[0], sign = r[1], base = r[2];
  var threshold = -1 >>> 0;
  var c = s.get(i);
  var d = caml_parse_digit(c);
  if (d < 0 || d >= base) caml_failwith("int_of_string");
  var res = d;
  for (;;) {
    i++;
    c = s.get(i);
    if (c == 95) continue;
    d = caml_parse_digit(c);
    if (d < 0 || d >= base) break;
    res = base * res + d;
    if (res > threshold) caml_failwith("int_of_string");
  }
  if (i != s.getLen()) caml_failwith("int_of_string");
  res = sign * res;
  if ((res | 0) != res) caml_failwith("int_of_string");
  return res;
}
function caml_is_printable(c) { return +(c > 31 && c < 127); }
function caml_js_wrap_callback(f) {
  var toArray = Array.prototype.slice;
  return function () {
    var args = (arguments.length > 0)?toArray.call (arguments):[undefined];
    return caml_call_gen(f, args);
  }
}
function caml_lex_array(s) {
  s = s.getFullBytes();
  var a = [], l = s.length / 2;
  for (var i = 0; i < l; i++)
    a[i] = (s.charCodeAt(2 * i) | (s.charCodeAt(2 * i + 1) << 8)) << 16 >> 16;
  return a;
}
function caml_lex_engine(tbl, start_state, lexbuf) {
  var lex_buffer = 2;
  var lex_buffer_len = 3;
  var lex_start_pos = 5;
  var lex_curr_pos = 6;
  var lex_last_pos = 7;
  var lex_last_action = 8;
  var lex_eof_reached = 9;
  var lex_base = 1;
  var lex_backtrk = 2;
  var lex_default = 3;
  var lex_trans = 4;
  var lex_check = 5;
  if (!tbl.lex_default) {
    tbl.lex_base =    caml_lex_array (tbl[lex_base]);
    tbl.lex_backtrk = caml_lex_array (tbl[lex_backtrk]);
    tbl.lex_check =   caml_lex_array (tbl[lex_check]);
    tbl.lex_trans =   caml_lex_array (tbl[lex_trans]);
    tbl.lex_default = caml_lex_array (tbl[lex_default]);
  }
  var c, state = start_state;
  var buffer = lexbuf[lex_buffer].getArray();
  if (state >= 0) {
    lexbuf[lex_last_pos] = lexbuf[lex_start_pos] = lexbuf[lex_curr_pos];
    lexbuf[lex_last_action] = -1;
  } else {
    state = -state - 1;
  }
  for(;;) {
    var base = tbl.lex_base[state];
    if (base < 0) return -base-1;
    var backtrk = tbl.lex_backtrk[state];
    if (backtrk >= 0) {
      lexbuf[lex_last_pos] = lexbuf[lex_curr_pos];
      lexbuf[lex_last_action] = backtrk;
    }
    if (lexbuf[lex_curr_pos] >= lexbuf[lex_buffer_len]){
      if (lexbuf[lex_eof_reached] == 0)
        return -state - 1;
      else
        c = 256;
    }else{
      c = buffer[lexbuf[lex_curr_pos]];
      lexbuf[lex_curr_pos] ++;
    }
    if (tbl.lex_check[base + c] == state)
      state = tbl.lex_trans[base + c];
    else
      state = tbl.lex_default[state];
    if (state < 0) {
      lexbuf[lex_curr_pos] = lexbuf[lex_last_pos];
      if (lexbuf[lex_last_action] == -1)
        caml_failwith("lexing: empty token");
      else
        return lexbuf[lex_last_action];
    }else{
      /* Erase the EOF condition only if the EOF pseudo-character was
         consumed by the automaton (i.e. there was no backtrack above)
       */
      if (c == 256) lexbuf[lex_eof_reached] = 0;
    }
  }
}
function caml_make_vect (len, init) {
  var b = [0]; for (var i = 1; i <= len; i++) b[i] = init; return b;
}
function caml_ml_flush () { return 0; }
function caml_ml_open_descriptor_out () { return 0; }
function caml_ml_out_channels_list () { return 0; }
function caml_ml_output () { return 0; }
function caml_mul(x,y) {
  return ((((x >> 16) * y) << 16) + (x & 0xffff) * y)|0;
}
function caml_register_global (n, v) { caml_global_data[n + 1] = v; }
var caml_named_values = {};
function caml_register_named_value(nm,v) {
  caml_named_values[nm] = v; return 0;
}
function caml_sys_get_config () {
  return [0, new MlWrappedString("Unix"), 32, 0];
}
(function(){function jE(xU,xV,xW,xX,xY,xZ,x0){return xU.length==6?xU(xV,xW,xX,xY,xZ,x0):caml_call_gen(xU,[xV,xW,xX,xY,xZ,x0]);}function fp(xQ,xR,xS,xT){return xQ.length==3?xQ(xR,xS,xT):caml_call_gen(xQ,[xR,xS,xT]);}function fU(xN,xO,xP){return xN.length==2?xN(xO,xP):caml_call_gen(xN,[xO,xP]);}function df(xL,xM){return xL.length==1?xL(xM):caml_call_gen(xL,[xM]);}var a=[0,new MlString("Failure")],b=[0,new MlString("Invalid_argument")],c=[0,new MlString("Not_found")],d=[0,new MlString("Assert_failure")],e=[0,new MlString(""),1,0,0],f=[0,new MlString("\0\0\xff\xff\x01\0\x07\0\xe7\xff\0\0\x03\0\x10\0^\0\xf0\xff\xf1\xff\xd2\0\x1d\x01\x02\0\xf8\xff\xf9\xff\xfa\xff\xfb\xff\xfc\xff\x0b\0\r\0\f\0\x04\0\xeb\xff\xf5\xff\xf3\xffh\x01\xb3\x01\xef\xff\xe6\xff-\0\xfd\xff\x10\0\x12\0\xff\xff\xfe\xff\r\0\xfd\xff\xfe\xff\b\0\t\0\xff\xff\x11\0\xfe\xff\n\0\x0b\0\xff\xff"),new MlString("\xff\xff\xff\xff\xff\xff\x1a\0\xff\xff\x16\0\x17\0\x15\0\x1a\0\xff\xff\xff\xff\r\0\x0b\0\t\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x02\0\x01\0\0\0\b\0\xff\xff\xff\xff\xff\xff\xff\xff\x11\0\xff\xff\xff\xff\xff\xff\xff\xff\x02\0\x02\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x01\0\xff\xff\xff\xff\xff\xff\xff\xff\x01\0\xff\xff\xff\xff"),new MlString("\x01\0\0\0\x07\0\xff\xff\0\0\xff\xff\xff\xff\x07\0\xff\xff\0\0\0\0\xff\xff\xff\xff\xff\xff\0\0\0\0\0\0\0\0\0\0\xff\xff\xff\xff\x15\0\xff\xff\0\0\0\0\0\0\xff\xff\xff\xff\0\0\0\0\x1f\0\0\0\xff\xff\xff\xff\0\0\0\0&\0\0\0\0\0\xff\xff\xff\xff\0\0+\0\0\0\xff\xff\xff\xff\0\0"),new MlString("\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x05\0\x06\0\x05\0\x06\0\x05\0\0\0\0\0\0\0\x1d\0\0\0\0\0\0\0\0\0\xff\xff%\0\0\0\xff\xff\xff\xff\0\0\0\0\0\0\0\0\0\0\x05\0\x06\0\0\0\x06\0\x12\0\0\0\0\0\b\0\0\0\x13\0\x1d\0\x11\0\x0f\0\x1d\0\x0e\0\x1d\0\xff\xff\x1d\0\x1d\0\xff\xff\x1d\0\x14\0\xff\xff\x15\0\xff\xff#\0\xff\xff\xff\xff\"\0\xff\xff\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0!\0\0\0 \0\0\0\0\0\0\0\0\0\0\0\x03\0\0\0\x0b\0\f\0\r\0\x16\0\x1d\0\x17\0\x1d\0\x1d\0\x1d\0(\0)\0-\0.\0\xff\xff'\0\xff\xff\xff\xff\xff\xff,\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\n\0\x10\0\t\0\0\0\0\0\0\0\x1d\0\x1d\0\x1d\0\0\0\0\0\0\0\0\0\0\0\0\0\xff\xff\xff\xff\xff\xff\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\0\0\0\0\0\0\0\0\0\0\0\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xff\xff\x04\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\xff\xff\xff\xff\0\0\0\0\xff\xff\xff\xff\0\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\xff\xff\0\0\0\0\0\0\0\0\0\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x19\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\0\0\0\0\0\0\0\0\0\0\0\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\0\0\x1c\0\0\0\0\0\0\0\0\0\0\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\0\0\0\0\0\0\0\0\0\0\0\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\0\0\x1c\0\0\0\0\0\0\0\0\0\0\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\0\0\0\0\0\0\0\0\0\0\0\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0"),new MlString("\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x05\0\x02\0\x02\0\x06\0\x06\0\xff\xff\xff\xff\xff\xff\x03\0\xff\xff\xff\xff\xff\xff\xff\xff\x15\0$\0\xff\xff\x07\0\x07\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x05\0\x02\0\xff\xff\x06\0\x02\0\xff\xff\xff\xff\x02\0\xff\xff\x02\0\x03\0\x02\0\x02\0\x03\0\x02\0\x03\0\x07\0\x03\0\x03\0\x07\0\x03\0\x13\0\x07\0\x14\0\x07\0 \0\x07\0\x07\0!\0\x07\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x1e\0\xff\xff\x1e\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x02\0\xff\xff\x02\0\x02\0\x02\0\r\0\x03\0\x16\0\x03\0\x03\0\x03\0'\0(\0,\0-\0\x07\0$\0\x07\0\x07\0\x07\0*\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x02\0\x02\0\x02\0\xff\xff\xff\xff\xff\xff\x03\0\x03\0\x03\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x07\0\x07\0\x07\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\b\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\0\0\x02\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x15\0$\0\xff\xff\xff\xff\x07\0*\0\xff\xff\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x1e\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\x0b\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\f\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\xff\xff\x1a\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1a\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\xff\xff\x1b\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\x1b\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff"),new MlString(""),new MlString(""),new MlString(""),new MlString(""),new MlString(""),new MlString("")];caml_register_global(6,c);caml_register_global(5,[0,new MlString("Division_by_zero")]);caml_register_global(3,b);caml_register_global(2,a);var cI=new MlString("%.12g"),cH=new MlString("."),cG=new MlString("%d"),cF=new MlString("true"),cE=new MlString("false"),cD=new MlString("Pervasives.do_at_exit"),cC=new MlString("tl"),cB=new MlString("hd"),cA=new MlString("\\b"),cz=new MlString("\\t"),cy=new MlString("\\n"),cx=new MlString("\\r"),cw=new MlString("\\\\"),cv=new MlString("\\'"),cu=new MlString(""),ct=new MlString("String.blit"),cs=new MlString("String.sub"),cr=new MlString(""),cq=new MlString("Buffer.add: cannot grow buffer"),cp=new MlString(""),co=new MlString(""),cn=new MlString("\""),cm=new MlString("\""),cl=new MlString("'"),ck=new MlString("'"),cj=new MlString("."),ci=new MlString("printf: bad positional specification (0)."),ch=new MlString("%_"),cg=[0,new MlString("printf.ml"),144,8],cf=new MlString("''"),ce=new MlString("Printf: premature end of format string ``"),cd=new MlString("''"),cc=new MlString(" in format string ``"),cb=new MlString(", at char number "),ca=new MlString("Printf: bad conversion %"),b$=new MlString("Sformat.index_of_int: negative argument "),b_=[0,[0,65,new MlString("#913")],[0,[0,66,new MlString("#914")],[0,[0,71,new MlString("#915")],[0,[0,68,new MlString("#916")],[0,[0,69,new MlString("#917")],[0,[0,90,new MlString("#918")],[0,[0,84,new MlString("#920")],[0,[0,73,new MlString("#921")],[0,[0,75,new MlString("#922")],[0,[0,76,new MlString("#923")],[0,[0,77,new MlString("#924")],[0,[0,78,new MlString("#925")],[0,[0,88,new MlString("#926")],[0,[0,79,new MlString("#927")],[0,[0,80,new MlString("#928")],[0,[0,82,new MlString("#929")],[0,[0,83,new MlString("#931")],[0,[0,85,new MlString("#933")],[0,[0,67,new MlString("#935")],[0,[0,87,new MlString("#937")],[0,[0,89,new MlString("#936")],[0,[0,97,new MlString("#945")],[0,[0,98,new MlString("#946")],[0,[0,103,new MlString("#947")],[0,[0,100,new MlString("#948")],[0,[0,101,new MlString("#949")],[0,[0,122,new MlString("#950")],[0,[0,116,new MlString("#952")],[0,[0,105,new MlString("#953")],[0,[0,107,new MlString("#954")],[0,[0,108,new MlString("#955")],[0,[0,109,new MlString("#956")],[0,[0,110,new MlString("#957")],[0,[0,120,new MlString("#958")],[0,[0,111,new MlString("#959")],[0,[0,112,new MlString("#960")],[0,[0,114,new MlString("#961")],[0,[0,115,new MlString("#963")],[0,[0,117,new MlString("#965")],[0,[0,99,new MlString("#967")],[0,[0,119,new MlString("#969")],[0,[0,121,new MlString("#968")],0]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]],b9=[0,new MlString("parser.ml"),103,8],b8=[0,new MlString("parser.ml"),121,12],b7=[0,new MlString("parser.ml"),169,8],b6=[0,new MlString("parser.ml"),185,12],b5=[0,new MlString("parser.ml"),144,8],b4=[0,new MlString("parser.ml"),164,12],b3=[0,new MlString("parser.ml"),209,8],b2=[0,new MlString("parser.ml"),217,12],b1=[0,new MlString("parser.ml"),235,8],b0=[0,new MlString("parser.ml"),246,12],bZ=[0,new MlString("parser.ml"),253,8],bY=[0,new MlString("parser.ml"),264,12],bX=[0,new MlString("parser.ml"),271,8],bW=[0,new MlString("parser.ml"),282,12],bV=[0,new MlString("parser.ml"),289,8],bU=[0,new MlString("parser.ml"),300,12],bT=[0,new MlString("parser.ml"),374,8],bS=[0,new MlString("parser.ml"),385,12],bR=[0,new MlString("parser.ml"),314,8],bQ=[0,new MlString("parser.ml"),325,12],bP=[0,new MlString("parser.ml"),338,8],bO=[0,new MlString("parser.ml"),349,12],bN=[0,new MlString("parser.ml"),356,8],bM=[0,new MlString("parser.ml"),367,12],bL=[0,new MlString("parser.ml"),405,8],bK=[0,new MlString("parser.ml"),418,16],bJ=[0,new MlString("parser.ml"),442,20],bI=[0,new MlString("parser.ml"),447,16],bH=[0,new MlString("parser.ml"),460,20],bG=[0,new MlString("parser.ml"),466,12],bF=[0,new MlString("parser.ml"),490,8],bE=[0,new MlString("parser.ml"),503,16],bD=[0,new MlString("parser.ml"),511,20],bC=[0,new MlString("parser.ml"),516,16],bB=[0,new MlString("parser.ml"),527,20],bA=[0,new MlString("parser.ml"),533,12],bz=[0,new MlString("parser.ml"),545,4],by=[0,new MlString("parser.ml"),584,8],bx=[0,new MlString("parser.ml"),592,4],bw=[0,new MlString("parser.ml"),631,8],bv=[0,new MlString("parser.ml"),652,8],bu=[0,new MlString("parser.ml"),663,12],bt=[0,new MlString("parser.ml"),670,8],bs=[0,new MlString("parser.ml"),681,12],br=[0,new MlString("parser.ml"),688,8],bq=[0,new MlString("parser.ml"),741,16],bp=[0,new MlString("parser.ml"),745,12],bo=[0,new MlString("parser.ml"),779,8],bn=[0,new MlString("parser.ml"),819,12],bm=[0,new MlString("parser.ml"),839,8],bl=[0,new MlString("parser.ml"),882,12],bk=[0,new MlString("parser.ml"),887,8],bj=[0,new MlString("parser.ml"),927,12],bi=[0,new MlString("parser.ml"),978,8],bh=[0,new MlString("parser.ml"),998,12],bg=[0,new MlString("parser.ml"),1003,8],bf=[0,new MlString("parser.ml"),1023,12],be=[0,new MlString("parser.ml"),1028,8],bd=[0,new MlString("parser.ml"),1048,12],bc=[0,new MlString("parser.ml"),1053,8],bb=[0,new MlString("parser.ml"),1073,12],ba=[0,new MlString("parser.ml"),1127,12],a$=[0,new MlString("parser.ml"),1131,8],a_=[3,45],a9=[3,40],a8=[0,new MlString("parser.ml"),1247,12],a7=[0,new MlString("parser.ml"),1251,8],a6=[0,new MlString("parser.ml"),1293,8],a5=[3,32],a4=[0,new MlString("parser.ml"),1344,12],a3=[0,new MlString("parser.ml"),1348,8],a2=[3,42],a1=[3,35],a0=[3,43],aZ=[3,45],aY=[3,40],aX=[0,new MlString("parser.ml"),1481,8],aW=[0,new MlString("parser.ml"),1525,12],aV=[0,new MlString("parser.ml"),1529,8],aU=[0,new MlString("parser.ml"),1541,8],aT=[0,new MlString("parser.ml"),1556,12],aS=[0,new MlString("parser.ml"),1588,8],aR=[0,new MlString("parser.ml"),1632,8],aQ=[0,new MlString("parser.ml"),1680,12],aP=[0,new MlString("parser.ml"),1684,8],aO=[3,45],aN=[3,40],aM=[0,new MlString("parser.ml"),1796,8],aL=[0,new MlString("parser.ml"),1844,12],aK=[0,new MlString("parser.ml"),1848,8],aJ=[0,new MlString("parser.ml"),1890,8],aI=[0,new MlString("parser.ml"),1907,8],aH=[0,new MlString("parser.ml"),1930,16],aG=[0,new MlString("parser.ml"),1934,12],aF=[0,new MlString("parser.ml"),2115,8],aE=[0,new MlString("parser.ml"),2135,12],aD=[0,new MlString("parser.ml"),2097,8],aC=[0,new MlString("parser.ml"),2103,12],aB=[0,new MlString("parser.ml"),2086,8],aA=[0,new MlString("parser.ml"),2092,12],az=[0,new MlString("parser.ml"),2145,4],ay=[0,new MlString("parser.ml"),2175,8],ax=[0,new MlString("parser.ml"),2192,8],aw=[0,new MlString("parser.ml"),2200,12],av=[0,new MlString("parser.ml"),2219,8],au=[0,new MlString("parser.ml"),2227,12],at=[0,new MlString("parser.ml"),2248,8],as=new MlString("Internal failure -- please contact the parser generator's developers.\n%!"),ar=[0,new MlString("parser.ml"),2310,4],aq=[0,new MlString("parser.ml"),2344,8],ap=[0,new MlString("parser.ml"),2362,8],ao=[0,new MlString("parser.ml"),2376,8],an=[0,new MlString("parser.ml"),2396,8],am=[0,new MlString("parser.ml"),2438,8],al=[0,new MlString("parser.ml"),2458,12],ak=[0,new MlString("parser.ml"),2413,8],aj=[0,new MlString("parser.ml"),2433,12],ai=[0,new MlString("parser.ml"),2686,8],ah=[0,new MlString("parser.ml"),2702,4],ag=[0,new MlString("parser.ml"),2710,8],af=[0,[0,[0,[0,new MlString("")],0],0],0],ae=new MlString("Parser.Error"),ad=new MlString("'"),ac=new MlString("main: unexpected character -> '"),ab=new MlString("td"),aa=new MlString(">"),$=new MlString("</"),_=new MlString(">"),Z=new MlString("<"),Y=new MlString("</tr>"),X=new MlString(""),W=new MlString("<tr>"),V=new MlString("</li>"),U=new MlString("<li>"),T=new MlString("</ul>"),S=new MlString(""),R=new MlString("<ul>"),Q=new MlString(">"),P=new MlString("</h"),O=new MlString(">"),N=new MlString("<h"),M=new MlString("</p>"),L=new MlString("<p>"),K=new MlString("</table>"),J=new MlString(""),I=new MlString("th"),H=new MlString(""),G=new MlString("<table>"),F=new MlString("<br />"),E=new MlString(""),D=new MlString("</sup>"),C=new MlString("<sup>"),B=new MlString("</sub>"),A=new MlString("<sub>"),z=new MlString("&#38;"),y=new MlString(";"),x=new MlString("&"),w=new MlString(";"),v=new MlString(" is not greek letter shortcut."),u=new MlString("&"),t=new MlString("</code>"),s=new MlString("<code>"),r=new MlString("</em>"),q=new MlString("<em>"),p=new MlString("</strong>"),o=new MlString("<strong>"),n=new MlString("</pre>"),m=new MlString("\">"),l=new MlString("<pre data-pastek-cmd=\""),k=new MlString(""),j=new MlString("mk_html");function i(g){throw [0,a,g];}function cJ(h){throw [0,b,h];}function cQ(cK,cM){var cL=cK.getLen(),cN=cM.getLen(),cO=caml_create_string(cL+cN|0);caml_blit_string(cK,0,cO,0,cL);caml_blit_string(cM,0,cO,cL,cN);return cO;}function cR(cP){return caml_format_int(cG,cP);}var cY=caml_ml_open_descriptor_out(2);function c0(cT,cS){return caml_ml_output(cT,cS,0,cS.getLen());}function cZ(cX){var cU=caml_ml_out_channels_list(0);for(;;){if(cU){var cV=cU[2];try {}catch(cW){}var cU=cV;continue;}return 0;}}caml_register_named_value(cD,cZ);function c4(c2,c1){return caml_ml_output_char(c2,c1);}function dp(c3){return caml_ml_flush(c3);}function dn(c6){var c5=0,c7=c6;for(;;){if(c7){var c9=c7[2],c8=c5+1|0,c5=c8,c7=c9;continue;}return c5;}}function dq(c_){var c$=c_,da=0;for(;;){if(c$){var db=c$[2],dc=[0,c$[1],da],c$=db,da=dc;continue;}return da;}}function dh(de,dd){if(dd){var dg=dd[2],di=df(de,dd[1]);return [0,di,dh(de,dg)];}return 0;}function dr(dl,dj){var dk=dj;for(;;){if(dk){var dm=dk[2];df(dl,dk[1]);var dk=dm;continue;}return 0;}}function dO(ds,du){var dt=caml_create_string(ds);caml_fill_string(dt,0,ds,du);return dt;}function dP(dx,dv,dw){if(0<=dv&&0<=dw&&!((dx.getLen()-dw|0)<dv)){var dy=caml_create_string(dw);caml_blit_string(dx,dv,dy,0,dw);return dy;}return cJ(cs);}function dQ(dB,dA,dD,dC,dz){if(0<=dz&&0<=dA&&!((dB.getLen()-dz|0)<dA)&&0<=dC&&!((dD.getLen()-dz|0)<dC))return caml_blit_string(dB,dA,dD,dC,dz);return cJ(ct);}function dR(dK,dE){if(dE){var dF=dE[1],dG=[0,0],dH=[0,0],dJ=dE[2];dr(function(dI){dG[1]+=1;dH[1]=dH[1]+dI.getLen()|0;return 0;},dE);var dL=caml_create_string(dH[1]+caml_mul(dK.getLen(),dG[1]-1|0)|0);caml_blit_string(dF,0,dL,0,dF.getLen());var dM=[0,dF.getLen()];dr(function(dN){caml_blit_string(dK,0,dL,dM[1],dK.getLen());dM[1]=dM[1]+dK.getLen()|0;caml_blit_string(dN,0,dL,dM[1],dN.getLen());dM[1]=dM[1]+dN.getLen()|0;return 0;},dJ);return dL;}return cu;}var dS=caml_sys_get_config(0)[2],dT=caml_mul(dS/8|0,(1<<(dS-10|0))-1|0)-1|0;function d6(dW,dV,dU){var dX=caml_lex_engine(dW,dV,dU);if(0<=dX){dU[11]=dU[12];var dY=dU[12];dU[12]=[0,dY[1],dY[2],dY[3],dU[4]+dU[6]|0];}return dX;}function d7(d3,d0,dZ){var d1=dZ-d0|0,d2=caml_create_string(d1);caml_blit_string(d3[2],d0,d2,0,d1);return d2;}function d8(d4,d5){return d4[2].safeGet(d5);}function eo(d9){var d_=1<=d9?d9:1,d$=dT<d_?dT:d_,ea=caml_create_string(d$);return [0,ea,0,d$,ea];}function ep(eb){return dP(eb[1],0,eb[2]);}function ei(ec,ee){var ed=[0,ec[3]];for(;;){if(ed[1]<(ec[2]+ee|0)){ed[1]=2*ed[1]|0;continue;}if(dT<ed[1])if((ec[2]+ee|0)<=dT)ed[1]=dT;else i(cq);var ef=caml_create_string(ed[1]);dQ(ec[1],0,ef,0,ec[2]);ec[1]=ef;ec[3]=ed[1];return 0;}}function eq(eg,ej){var eh=eg[2];if(eg[3]<=eh)ei(eg,1);eg[1].safeSet(eh,ej);eg[2]=eh+1|0;return 0;}function er(em,ek){var el=ek.getLen(),en=em[2]+el|0;if(em[3]<en)ei(em,el);dQ(ek,0,em[1],em[2],el);em[2]=en;return 0;}function ev(es){return 0<=es?es:i(cQ(b$,cR(es)));}function ew(et,eu){return ev(et+eu|0);}var ex=df(ew,1);function eE(ey){return dP(ey,0,ey.getLen());}function eG(ez,eA,eC){var eB=cQ(cc,cQ(ez,cd)),eD=cQ(cb,cQ(cR(eA),eB));return cJ(cQ(ca,cQ(dO(1,eC),eD)));}function fv(eF,eI,eH){return eG(eE(eF),eI,eH);}function fw(eJ){return cJ(cQ(ce,cQ(eE(eJ),cf)));}function e3(eK,eS,eU,eW){function eR(eL){if((eK.safeGet(eL)-48|0)<0||9<(eK.safeGet(eL)-48|0))return eL;var eM=eL+1|0;for(;;){var eN=eK.safeGet(eM);if(48<=eN){if(!(58<=eN)){var eP=eM+1|0,eM=eP;continue;}var eO=0;}else if(36===eN){var eQ=eM+1|0,eO=1;}else var eO=0;if(!eO)var eQ=eL;return eQ;}}var eT=eR(eS+1|0),eV=eo((eU-eT|0)+10|0);eq(eV,37);var eX=eT,eY=dq(eW);for(;;){if(eX<=eU){var eZ=eK.safeGet(eX);if(42===eZ){if(eY){var e0=eY[2];er(eV,cR(eY[1]));var e1=eR(eX+1|0),eX=e1,eY=e0;continue;}throw [0,d,cg];}eq(eV,eZ);var e2=eX+1|0,eX=e2;continue;}return ep(eV);}}function gV(e9,e7,e6,e5,e4){var e8=e3(e7,e6,e5,e4);if(78!==e9&&110!==e9)return e8;e8.safeSet(e8.getLen()-1|0,117);return e8;}function fx(fe,fo,ft,e_,fs){var e$=e_.getLen();function fq(fa,fn){var fb=40===fa?41:125;function fm(fc){var fd=fc;for(;;){if(e$<=fd)return df(fe,e_);if(37===e_.safeGet(fd)){var ff=fd+1|0;if(e$<=ff)var fg=df(fe,e_);else{var fh=e_.safeGet(ff),fi=fh-40|0;if(fi<0||1<fi){var fj=fi-83|0;if(fj<0||2<fj)var fk=1;else switch(fj){case 1:var fk=1;break;case 2:var fl=1,fk=0;break;default:var fl=0,fk=0;}if(fk){var fg=fm(ff+1|0),fl=2;}}else var fl=0===fi?0:1;switch(fl){case 1:var fg=fh===fb?ff+1|0:fp(fo,e_,fn,fh);break;case 2:break;default:var fg=fm(fq(fh,ff+1|0)+1|0);}}return fg;}var fr=fd+1|0,fd=fr;continue;}}return fm(fn);}return fq(ft,fs);}function fX(fu){return fp(fx,fw,fv,fu);}function gb(fy,fJ,fT){var fz=fy.getLen()-1|0;function fV(fA){var fB=fA;a:for(;;){if(fB<fz){if(37===fy.safeGet(fB)){var fC=0,fD=fB+1|0;for(;;){if(fz<fD)var fE=fw(fy);else{var fF=fy.safeGet(fD);if(58<=fF){if(95===fF){var fH=fD+1|0,fG=1,fC=fG,fD=fH;continue;}}else if(32<=fF)switch(fF-32|0){case 1:case 2:case 4:case 5:case 6:case 7:case 8:case 9:case 12:case 15:break;case 0:case 3:case 11:case 13:var fI=fD+1|0,fD=fI;continue;case 10:var fK=fp(fJ,fC,fD,105),fD=fK;continue;default:var fL=fD+1|0,fD=fL;continue;}var fM=fD;c:for(;;){if(fz<fM)var fN=fw(fy);else{var fO=fy.safeGet(fM);if(126<=fO)var fP=0;else switch(fO){case 78:case 88:case 100:case 105:case 111:case 117:case 120:var fN=fp(fJ,fC,fM,105),fP=1;break;case 69:case 70:case 71:case 101:case 102:case 103:var fN=fp(fJ,fC,fM,102),fP=1;break;case 33:case 37:case 44:case 64:var fN=fM+1|0,fP=1;break;case 83:case 91:case 115:var fN=fp(fJ,fC,fM,115),fP=1;break;case 97:case 114:case 116:var fN=fp(fJ,fC,fM,fO),fP=1;break;case 76:case 108:case 110:var fQ=fM+1|0;if(fz<fQ){var fN=fp(fJ,fC,fM,105),fP=1;}else{var fR=fy.safeGet(fQ)-88|0;if(fR<0||32<fR)var fS=1;else switch(fR){case 0:case 12:case 17:case 23:case 29:case 32:var fN=fU(fT,fp(fJ,fC,fM,fO),105),fP=1,fS=0;break;default:var fS=1;}if(fS){var fN=fp(fJ,fC,fM,105),fP=1;}}break;case 67:case 99:var fN=fp(fJ,fC,fM,99),fP=1;break;case 66:case 98:var fN=fp(fJ,fC,fM,66),fP=1;break;case 41:case 125:var fN=fp(fJ,fC,fM,fO),fP=1;break;case 40:var fN=fV(fp(fJ,fC,fM,fO)),fP=1;break;case 123:var fW=fp(fJ,fC,fM,fO),fY=fp(fX,fO,fy,fW),fZ=fW;for(;;){if(fZ<(fY-2|0)){var f0=fU(fT,fZ,fy.safeGet(fZ)),fZ=f0;continue;}var f1=fY-1|0,fM=f1;continue c;}default:var fP=0;}if(!fP)var fN=fv(fy,fM,fO);}var fE=fN;break;}}var fB=fE;continue a;}}var f2=fB+1|0,fB=f2;continue;}return fB;}}fV(0);return 0;}function h_(gc){var f3=[0,0,0,0];function ga(f8,f9,f4){var f5=41!==f4?1:0,f6=f5?125!==f4?1:0:f5;if(f6){var f7=97===f4?2:1;if(114===f4)f3[3]=f3[3]+1|0;if(f8)f3[2]=f3[2]+f7|0;else f3[1]=f3[1]+f7|0;}return f9+1|0;}gb(gc,ga,function(f_,f$){return f_+1|0;});return f3[1];}function gR(gd,gg,ge){var gf=gd.safeGet(ge);if((gf-48|0)<0||9<(gf-48|0))return fU(gg,0,ge);var gh=gf-48|0,gi=ge+1|0;for(;;){var gj=gd.safeGet(gi);if(48<=gj){if(!(58<=gj)){var gm=gi+1|0,gl=(10*gh|0)+(gj-48|0)|0,gh=gl,gi=gm;continue;}var gk=0;}else if(36===gj)if(0===gh){var gn=i(ci),gk=1;}else{var gn=fU(gg,[0,ev(gh-1|0)],gi+1|0),gk=1;}else var gk=0;if(!gk)var gn=fU(gg,0,ge);return gn;}}function gM(go,gp){return go?gp:df(ex,gp);}function gB(gq,gr){return gq?gq[1]:gr;}function jD(iB,gt,iN,iC,id,iT,gs){var gu=df(gt,gs);function ic(gz,iS,gv,gE){var gy=gv.getLen();function h$(iK,gw){var gx=gw;for(;;){if(gy<=gx)return df(gz,gu);var gA=gv.safeGet(gx);if(37===gA){var gI=function(gD,gC){return caml_array_get(gE,gB(gD,gC));},gO=function(gQ,gJ,gL,gF){var gG=gF;for(;;){var gH=gv.safeGet(gG)-32|0;if(!(gH<0||25<gH))switch(gH){case 1:case 2:case 4:case 5:case 6:case 7:case 8:case 9:case 12:case 15:break;case 10:return gR(gv,function(gK,gP){var gN=[0,gI(gK,gJ),gL];return gO(gQ,gM(gK,gJ),gN,gP);},gG+1|0);default:var gS=gG+1|0,gG=gS;continue;}var gT=gv.safeGet(gG);if(124<=gT)var gU=0;else switch(gT){case 78:case 88:case 100:case 105:case 111:case 117:case 120:var gW=gI(gQ,gJ),gX=caml_format_int(gV(gT,gv,gx,gG,gL),gW),gZ=gY(gM(gQ,gJ),gX,gG+1|0),gU=1;break;case 69:case 71:case 101:case 102:case 103:var g0=gI(gQ,gJ),g1=caml_format_float(e3(gv,gx,gG,gL),g0),gZ=gY(gM(gQ,gJ),g1,gG+1|0),gU=1;break;case 76:case 108:case 110:var g2=gv.safeGet(gG+1|0)-88|0;if(g2<0||32<g2)var g3=1;else switch(g2){case 0:case 12:case 17:case 23:case 29:case 32:var g4=gG+1|0,g5=gT-108|0;if(g5<0||2<g5)var g6=0;else{switch(g5){case 1:var g6=0,g7=0;break;case 2:var g8=gI(gQ,gJ),g9=caml_format_int(e3(gv,gx,g4,gL),g8),g7=1;break;default:var g_=gI(gQ,gJ),g9=caml_format_int(e3(gv,gx,g4,gL),g_),g7=1;}if(g7){var g$=g9,g6=1;}}if(!g6){var ha=gI(gQ,gJ),g$=caml_int64_format(e3(gv,gx,g4,gL),ha);}var gZ=gY(gM(gQ,gJ),g$,g4+1|0),gU=1,g3=0;break;default:var g3=1;}if(g3){var hb=gI(gQ,gJ),hc=caml_format_int(gV(110,gv,gx,gG,gL),hb),gZ=gY(gM(gQ,gJ),hc,gG+1|0),gU=1;}break;case 37:case 64:var gZ=gY(gJ,dO(1,gT),gG+1|0),gU=1;break;case 83:case 115:var hd=gI(gQ,gJ);if(115===gT)var he=hd;else{var hf=[0,0],hg=0,hh=hd.getLen()-1|0;if(!(hh<hg)){var hi=hg;for(;;){var hj=hd.safeGet(hi),hk=14<=hj?34===hj?1:92===hj?1:0:11<=hj?13<=hj?1:0:8<=hj?1:0,hl=hk?2:caml_is_printable(hj)?1:4;hf[1]=hf[1]+hl|0;var hm=hi+1|0;if(hh!==hi){var hi=hm;continue;}break;}}if(hf[1]===hd.getLen())var hn=hd;else{var ho=caml_create_string(hf[1]);hf[1]=0;var hp=0,hq=hd.getLen()-1|0;if(!(hq<hp)){var hr=hp;for(;;){var hs=hd.safeGet(hr),ht=hs-34|0;if(ht<0||58<ht)if(-20<=ht)var hu=1;else{switch(ht+34|0){case 8:ho.safeSet(hf[1],92);hf[1]+=1;ho.safeSet(hf[1],98);var hv=1;break;case 9:ho.safeSet(hf[1],92);hf[1]+=1;ho.safeSet(hf[1],116);var hv=1;break;case 10:ho.safeSet(hf[1],92);hf[1]+=1;ho.safeSet(hf[1],110);var hv=1;break;case 13:ho.safeSet(hf[1],92);hf[1]+=1;ho.safeSet(hf[1],114);var hv=1;break;default:var hu=1,hv=0;}if(hv)var hu=0;}else var hu=(ht-1|0)<0||56<(ht-1|0)?(ho.safeSet(hf[1],92),hf[1]+=1,ho.safeSet(hf[1],hs),0):1;if(hu)if(caml_is_printable(hs))ho.safeSet(hf[1],hs);else{ho.safeSet(hf[1],92);hf[1]+=1;ho.safeSet(hf[1],48+(hs/100|0)|0);hf[1]+=1;ho.safeSet(hf[1],48+((hs/10|0)%10|0)|0);hf[1]+=1;ho.safeSet(hf[1],48+(hs%10|0)|0);}hf[1]+=1;var hw=hr+1|0;if(hq!==hr){var hr=hw;continue;}break;}}var hn=ho;}var he=cQ(cm,cQ(hn,cn));}if(gG===(gx+1|0))var hx=he;else{var hy=e3(gv,gx,gG,gL);try {var hz=0,hA=1;for(;;){if(hy.getLen()<=hA)var hB=[0,0,hz];else{var hC=hy.safeGet(hA);if(49<=hC)if(58<=hC)var hD=0;else{var hB=[0,caml_int_of_string(dP(hy,hA,(hy.getLen()-hA|0)-1|0)),hz],hD=1;}else{if(45===hC){var hF=hA+1|0,hE=1,hz=hE,hA=hF;continue;}var hD=0;}if(!hD){var hG=hA+1|0,hA=hG;continue;}}var hH=hB;break;}}catch(hI){if(hI[1]!==a)throw hI;var hH=eG(hy,0,115);}var hJ=hH[1],hK=he.getLen(),hL=0,hP=hH[2],hO=32;if(hJ===hK&&0===hL){var hM=he,hN=1;}else var hN=0;if(!hN)if(hJ<=hK)var hM=dP(he,hL,hK);else{var hQ=dO(hJ,hO);if(hP)dQ(he,hL,hQ,0,hK);else dQ(he,hL,hQ,hJ-hK|0,hK);var hM=hQ;}var hx=hM;}var gZ=gY(gM(gQ,gJ),hx,gG+1|0),gU=1;break;case 67:case 99:var hR=gI(gQ,gJ);if(99===gT)var hS=dO(1,hR);else{if(39===hR)var hT=cv;else if(92===hR)var hT=cw;else{if(14<=hR)var hU=0;else switch(hR){case 8:var hT=cA,hU=1;break;case 9:var hT=cz,hU=1;break;case 10:var hT=cy,hU=1;break;case 13:var hT=cx,hU=1;break;default:var hU=0;}if(!hU)if(caml_is_printable(hR)){var hV=caml_create_string(1);hV.safeSet(0,hR);var hT=hV;}else{var hW=caml_create_string(4);hW.safeSet(0,92);hW.safeSet(1,48+(hR/100|0)|0);hW.safeSet(2,48+((hR/10|0)%10|0)|0);hW.safeSet(3,48+(hR%10|0)|0);var hT=hW;}}var hS=cQ(ck,cQ(hT,cl));}var gZ=gY(gM(gQ,gJ),hS,gG+1|0),gU=1;break;case 66:case 98:var hY=gG+1|0,hX=gI(gQ,gJ)?cF:cE,gZ=gY(gM(gQ,gJ),hX,hY),gU=1;break;case 40:case 123:var hZ=gI(gQ,gJ),h0=fp(fX,gT,gv,gG+1|0);if(123===gT){var h1=eo(hZ.getLen()),h5=function(h3,h2){eq(h1,h2);return h3+1|0;};gb(hZ,function(h4,h7,h6){if(h4)er(h1,ch);else eq(h1,37);return h5(h7,h6);},h5);var h8=ep(h1),gZ=gY(gM(gQ,gJ),h8,h0),gU=1;}else{var h9=gM(gQ,gJ),ia=ew(h_(hZ),h9),gZ=ic(function(ib){return h$(ia,h0);},h9,hZ,gE),gU=1;}break;case 33:df(id,gu);var gZ=h$(gJ,gG+1|0),gU=1;break;case 41:var gZ=gY(gJ,cp,gG+1|0),gU=1;break;case 44:var gZ=gY(gJ,co,gG+1|0),gU=1;break;case 70:var ie=gI(gQ,gJ);if(0===gL){var ig=caml_format_float(cI,ie),ih=0,ii=ig.getLen();for(;;){if(ii<=ih)var ij=cQ(ig,cH);else{var ik=ig.safeGet(ih),il=48<=ik?58<=ik?0:1:45===ik?1:0;if(il){var im=ih+1|0,ih=im;continue;}var ij=ig;}var io=ij;break;}}else{var ip=e3(gv,gx,gG,gL);if(70===gT)ip.safeSet(ip.getLen()-1|0,103);var iq=caml_format_float(ip,ie);if(3<=caml_classify_float(ie))var ir=iq;else{var is=0,it=iq.getLen();for(;;){if(it<=is)var iu=cQ(iq,cj);else{var iv=iq.safeGet(is)-46|0,iw=iv<0||23<iv?55===iv?1:0:(iv-1|0)<0||21<(iv-1|0)?1:0;if(!iw){var ix=is+1|0,is=ix;continue;}var iu=iq;}var ir=iu;break;}}var io=ir;}var gZ=gY(gM(gQ,gJ),io,gG+1|0),gU=1;break;case 91:var gZ=fv(gv,gG,gT),gU=1;break;case 97:var iy=gI(gQ,gJ),iz=df(ex,gB(gQ,gJ)),iA=gI(0,iz),iE=gG+1|0,iD=gM(gQ,iz);if(iB)fU(iC,gu,fU(iy,0,iA));else fU(iy,gu,iA);var gZ=h$(iD,iE),gU=1;break;case 114:var gZ=fv(gv,gG,gT),gU=1;break;case 116:var iF=gI(gQ,gJ),iH=gG+1|0,iG=gM(gQ,gJ);if(iB)fU(iC,gu,df(iF,0));else df(iF,gu);var gZ=h$(iG,iH),gU=1;break;default:var gU=0;}if(!gU)var gZ=fv(gv,gG,gT);return gZ;}},iM=gx+1|0,iJ=0;return gR(gv,function(iL,iI){return gO(iL,iK,iJ,iI);},iM);}fU(iN,gu,gA);var iO=gx+1|0,gx=iO;continue;}}function gY(iR,iP,iQ){fU(iC,gu,iP);return h$(iR,iQ);}return h$(iS,0);}var iU=fU(ic,iT,ev(0)),iV=h_(gs);if(iV<0||6<iV){var i8=function(iW,i2){if(iV<=iW){var iX=caml_make_vect(iV,0),i0=function(iY,iZ){return caml_array_set(iX,(iV-iY|0)-1|0,iZ);},i1=0,i3=i2;for(;;){if(i3){var i4=i3[2],i5=i3[1];if(i4){i0(i1,i5);var i6=i1+1|0,i1=i6,i3=i4;continue;}i0(i1,i5);}return fU(iU,gs,iX);}}return function(i7){return i8(iW+1|0,[0,i7,i2]);};},i9=i8(0,0);}else switch(iV){case 1:var i9=function(i$){var i_=caml_make_vect(1,0);caml_array_set(i_,0,i$);return fU(iU,gs,i_);};break;case 2:var i9=function(jb,jc){var ja=caml_make_vect(2,0);caml_array_set(ja,0,jb);caml_array_set(ja,1,jc);return fU(iU,gs,ja);};break;case 3:var i9=function(je,jf,jg){var jd=caml_make_vect(3,0);caml_array_set(jd,0,je);caml_array_set(jd,1,jf);caml_array_set(jd,2,jg);return fU(iU,gs,jd);};break;case 4:var i9=function(ji,jj,jk,jl){var jh=caml_make_vect(4,0);caml_array_set(jh,0,ji);caml_array_set(jh,1,jj);caml_array_set(jh,2,jk);caml_array_set(jh,3,jl);return fU(iU,gs,jh);};break;case 5:var i9=function(jn,jo,jp,jq,jr){var jm=caml_make_vect(5,0);caml_array_set(jm,0,jn);caml_array_set(jm,1,jo);caml_array_set(jm,2,jp);caml_array_set(jm,3,jq);caml_array_set(jm,4,jr);return fU(iU,gs,jm);};break;case 6:var i9=function(jt,ju,jv,jw,jx,jy){var js=caml_make_vect(6,0);caml_array_set(js,0,jt);caml_array_set(js,1,ju);caml_array_set(js,2,jv);caml_array_set(js,3,jw);caml_array_set(js,4,jx);caml_array_set(js,5,jy);return fU(iU,gs,js);};break;default:var i9=fU(iU,gs,[0]);}return i9;}function jP(jA){function jC(jz){return 0;}return jE(jD,0,function(jB){return jA;},c4,c0,dp,jC);}function jO(jF,jI){var jG=jF[2],jH=jF[1],jJ=jI[2],jK=jI[1];if(1!==jK&&0!==jG){var jL=jG?jG[2]:i(cC),jN=[0,jK-1|0,jJ],jM=jG?jG[1]:i(cB);return [0,jH,[0,jO(jM,jN),jL]];}return [0,jH,[0,[0,jJ,0],jG]];}var vV=[0,[0,ae]];function k0(jU,jS,jR,jQ){var jT=[0,jS,jR,jQ];if(-1===jU[6])throw [0,d,bz];var jV=jU[3];if(typeof jV==="number")switch(jV){case 4:case 12:var j3=jT[1],j4=jT[2],j5=[0,jT[3],0];for(;;){var j6=j4-26|0;if(j6<0||6<j6)var j7=0;else switch(j6){case 0:var j_=[0,j3[3],j5],j9=j3[2],j8=j3[1],j3=j8,j4=j9,j5=j_;continue;case 1:if(-1===jU[6])throw [0,d,b1];var j$=jU[3];if(typeof j$==="number"&&12===j$){ka(jU);var kc=kb(jU,j3[1],j3[2],[8,j5]),j7=1,kd=0;}else var kd=1;if(kd){if(-1===jU[6])throw [0,d,b0];jU[6]=-1;var kc=ke(jU,j3,j4),j7=1;}break;case 4:if(-1===jU[6])throw [0,d,bZ];var kf=jU[3];if(typeof kf==="number"&&4===kf){ka(jU);var kc=kg(jU,j3[1],j3[2],[1,j5]),j7=1,kh=0;}else var kh=1;if(kh){if(-1===jU[6])throw [0,d,bY];jU[6]=-1;var kc=ke(jU,j3,j4),j7=1;}break;case 5:if(-1===jU[6])throw [0,d,bX];var ki=jU[3];if(typeof ki==="number"&&4===ki){ka(jU);var kc=kg(jU,j3[1],j3[2],[2,j5]),j7=1,kj=0;}else var kj=1;if(kj){if(-1===jU[6])throw [0,d,bW];jU[6]=-1;var kc=ke(jU,j3,j4),j7=1;}break;case 6:if(-1===jU[6])throw [0,d,bV];var kk=jU[3];if(typeof kk==="number"&&12===kk){ka(jU);var kc=kl(jU,j3[1],j3[2],[8,j5]),j7=1,km=0;}else var km=1;if(km){if(-1===jU[6])throw [0,d,bU];jU[6]=-1;var kc=ke(jU,j3,j4),j7=1;}break;default:var j7=0;}if(!j7)var kc=kn(0);return kc;}case 1:return ko(jU,jT,26);case 2:return kp(jU,jT,26);case 3:return kq(jU,jT,26);case 5:return kr(jU,jT,26);case 7:return ks(jU,jT,26);case 8:return kt(jU,jT,26);case 13:return ku(jU,jT,26);case 14:return kv(jU,jT,26);default:}else switch(jV[0]){case 1:return jW(jU,jT,26,jV[1]);case 2:return jX(jU,jT,26,jV[1]);case 3:return jY(jU,jT,26,jV[1]);case 4:return jZ(jU,jT,26,jV[1]);case 5:return j0(jU,jT,26,jV[1]);case 6:return j1(jU,jT,26,jV[1]);case 7:break;default:return j2(jU,jT,26,jV[1]);}if(-1===jU[6])throw [0,d,by];jU[6]=-1;return ke(jU,jT,26);}function kb(kA,ky,kx,kw){var kz=[0,ky,kx,kw];if(-1===kA[6])throw [0,d,bx];var kB=kA[3];if(typeof kB==="number")switch(kB){case 4:case 14:var kJ=kz[1],kK=kz[2],kL=[0,kz[3],0];for(;;){var kM=kK-22|0;if(kM<0||7<kM)var kN=0;else switch(kM){case 0:if(-1===kA[6])throw [0,d,bT];var kO=kA[3];if(typeof kO==="number"&&14<=kO){ka(kA);var kP=kl(kA,kJ[1],kJ[2],[7,kL]),kN=1,kQ=0;}else var kQ=1;if(kQ){if(-1===kA[6])throw [0,d,bS];kA[6]=-1;var kP=ke(kA,kJ,kK),kN=1;}break;case 2:var kT=[0,kJ[3],kL],kS=kJ[2],kR=kJ[1],kJ=kR,kK=kS,kL=kT;continue;case 3:if(-1===kA[6])throw [0,d,bR];var kU=kA[3];if(typeof kU==="number"&&4===kU){ka(kA);var kP=kV(kA,kJ[1],kJ[2],[1,kL]),kN=1,kW=0;}else var kW=1;if(kW){if(-1===kA[6])throw [0,d,bQ];kA[6]=-1;var kP=ke(kA,kJ,kK),kN=1;}break;case 6:if(-1===kA[6])throw [0,d,bP];var kX=kA[3];if(typeof kX==="number"&&4===kX){ka(kA);var kP=kV(kA,kJ[1],kJ[2],[2,kL]),kN=1,kY=0;}else var kY=1;if(kY){if(-1===kA[6])throw [0,d,bO];kA[6]=-1;var kP=ke(kA,kJ,kK),kN=1;}break;case 7:if(-1===kA[6])throw [0,d,bN];var kZ=kA[3];if(typeof kZ==="number"&&14<=kZ){ka(kA);var kP=k0(kA,kJ[1],kJ[2],[7,kL]),kN=1,k1=0;}else var k1=1;if(k1){if(-1===kA[6])throw [0,d,bM];kA[6]=-1;var kP=ke(kA,kJ,kK),kN=1;}break;default:var kN=0;}if(!kN)var kP=kn(0);return kP;}case 1:return k2(kA,kz,24);case 2:return kp(kA,kz,24);case 3:return kq(kA,kz,24);case 5:return kr(kA,kz,24);case 7:return k3(kA,kz,24);case 8:return k4(kA,kz,24);case 12:return k5(kA,kz,24);case 13:return k6(kA,kz,24);default:}else switch(kB[0]){case 1:return kC(kA,kz,24,kB[1]);case 2:return kD(kA,kz,24,kB[1]);case 3:return kE(kA,kz,24,kB[1]);case 4:return kF(kA,kz,24,kB[1]);case 5:return kG(kA,kz,24,kB[1]);case 6:return kH(kA,kz,24,kB[1]);case 7:break;default:return kI(kA,kz,24,kB[1]);}if(-1===kA[6])throw [0,d,bw];kA[6]=-1;return ke(kA,kz,24);}function mt(ld,k7,k9){var k8=k7,k_=k9,k$=0;for(;;){if(19===k_){var lc=[0,k8[3],k$],lb=k8[2],la=k8[1],k8=la,k_=lb,k$=lc;continue;}if(20===k_){if(-1===ld[6])throw [0,d,bL];var le=ld[3];if(typeof le==="number"&&10===le){ka(ld);var lf=k8[1],lg=lf[2],lh=[0,lf[1],lg,[0,k8[3],k$]],li=lg-36|0;if(li<0||9<li)if(-26<=li)var lj=1;else switch(li+36|0){case 5:case 7:var lj=1;break;case 9:if(-1===ld[6])throw [0,d,bK];var lk=ld[3];if(typeof lk==="number")switch(lk){case 4:case 9:var ll=1;break;case 0:var ln=lm(ld,lh,8),lo=1,lj=0,ll=0;break;case 2:var ln=lp(ld,lh,8),lo=1,lj=0,ll=0;break;case 3:var ln=lq(ld,lh,8),lo=1,lj=0,ll=0;break;case 5:var ln=lr(ld,lh,8),lo=1,lj=0,ll=0;break;case 6:var ln=ls(ld,lh,8),lo=1,lj=0,ll=0;break;case 10:var ln=lt(ld,lh,8),lo=1,lj=0,ll=0;break;case 11:var ln=lu(ld,lh,8,0),lo=1,lj=0,ll=0;break;default:var ll=2;}else var ll=7===lk[0]?1:2;switch(ll){case 1:if(-1===ld[6])throw [0,d,bJ];ld[6]=-1;var ln=ke(ld,lh,8),lo=1,lj=0;break;case 2:var ln=lv(ld,lh,8),lo=1,lj=0;break;default:}break;default:var lj=2;}else var lj=(li-2|0)<0||6<(li-2|0)?2:1;switch(lj){case 1:var ln=kn(0),lo=1;break;case 2:if(-1===ld[6])throw [0,d,bI];var lw=ld[3];if(typeof lw==="number")switch(lw){case 1:case 7:case 8:case 12:case 13:case 14:var lx=2;break;case 4:case 9:var lx=1;break;case 0:var ln=lm(ld,lh,4),lo=1,lx=0;break;default:var ly=lh[1],lz=lh[2],lA=[0,lh[3],0];for(;;){var lB=[0,ly,lz,lA],lC=lz-36|0;if(lC<0||9<lC)if(-27<=lC)var lD=0;else switch(lC+36|0){case 5:case 7:var lD=0;break;case 4:var lE=lB[1],lH=[0,lE[3],lB[3]],lG=lE[2],lF=lE[1],ly=lF,lz=lG,lA=lH;continue;case 6:if(-1===ld[6])throw [0,d,b7];var lI=ld[3];if(typeof lI==="number")switch(lI){case 3:case 5:case 6:case 10:case 11:var lJ=lB[1],lK=lJ[1],lL=lJ[2],lM=[0,[0,lJ[3],lB[3]],0];for(;;){var lN=[0,lK,lL,lM];if(9<=lL)var lO=38<=lL?45===lL?1:0:36<=lL?1:0;else{var lP=lL-4|0;if(lP<0||2<lP)var lO=1;else{if(1===lP){var lQ=lN[1],lR=lQ[1],lU=[0,[0,lR[3],lQ[3]],lN[3]],lT=lR[2],lS=lR[1],lK=lS,lL=lT,lM=lU;continue;}var lO=0;}}if(lO){if(-1===ld[6])throw [0,d,b9];var lV=ld[3];if(typeof lV==="number")switch(lV){case 3:var lW=lq(ld,lN,18),lX=1;break;case 5:var lW=lr(ld,lN,18),lX=1;break;case 6:var lW=ls(ld,lN,18),lX=1;break;case 10:var lW=lt(ld,lN,18),lX=1;break;case 11:var lW=lY(ld,lN,18,0),lX=1;break;default:var lX=0;}else var lX=0;if(!lX){if(-1===ld[6])throw [0,d,b8];ld[6]=-1;var lW=ke(ld,lN,18);}}else var lW=kn(0);var lZ=lW,lD=2,l0=0;break;}break;case 2:var lZ=lp(ld,lB,5),lD=2,l0=0;break;default:var l0=1;}else var l0=1;if(l0){if(-1===ld[6])throw [0,d,b6];ld[6]=-1;var lZ=ke(ld,lB,5),lD=2;}break;default:var lD=1;}else var lD=(lC-2|0)<0||6<(lC-2|0)?1:0;switch(lD){case 1:if(-1===ld[6])throw [0,d,b5];var l1=ld[3];if(typeof l1==="number")switch(l1){case 2:var lZ=lp(ld,lB,7),l2=1;break;case 3:var lZ=lq(ld,lB,7),l2=1;break;case 5:var lZ=lr(ld,lB,7),l2=1;break;case 6:var lZ=ls(ld,lB,7),l2=1;break;case 10:var lZ=lt(ld,lB,7),l2=1;break;case 11:var lZ=l3(ld,lB,7,0),l2=1;break;default:var l2=0;}else var l2=0;if(!l2){if(-1===ld[6])throw [0,d,b4];ld[6]=-1;var lZ=ke(ld,lB,7);}break;case 2:break;default:var lZ=kn(0);}var ln=lZ,lo=1,lx=0;break;}}else var lx=7===lw[0]?1:2;switch(lx){case 1:if(-1===ld[6])throw [0,d,bH];ld[6]=-1;var ln=ke(ld,lh,4),lo=1;break;case 2:var ln=lv(ld,lh,4),lo=1;break;default:}break;default:}}else var lo=0;if(!lo){if(-1===ld[6])throw [0,d,bG];ld[6]=-1;var ln=ke(ld,k8,k_);}}else var ln=kn(0);return ln;}}function mx(l7,l6,l5,l4){return k0(l7,l6,l5,l4);}function nF(l$,l_,l9,l8){return kb(l$,l_,l9,l8);}function kl(mg,mc,mb,ma){var md=[0,mc,mb,ma],me=mb-14|0;if(!(me<0||20<me))switch(me){case 0:case 2:case 5:case 6:case 7:case 9:case 19:return mf(mg,md[1],md[2],md[3]);case 20:if(-1===mg[6])throw [0,d,bo];var mh=mg[3];if(typeof mh==="number")switch(mh){case 0:return mp(mg,md,20);case 1:return mq(mg,md,20);case 2:return kp(mg,md,20);case 3:return kq(mg,md,20);case 5:return kr(mg,md,20);case 7:return mr(mg,md,20);case 8:return ms(mg,md,20);case 10:return mt(mg,md,20);case 12:return mu(mg,md,20);case 13:return mv(mg,md,20);case 14:return mw(mg,md,20);default:}else switch(mh[0]){case 1:return mi(mg,md,20,mh[1]);case 2:return mj(mg,md,20,mh[1]);case 3:return mk(mg,md,20,mh[1]);case 4:return ml(mg,md,20,mh[1]);case 5:return mm(mg,md,20,mh[1]);case 6:return mn(mg,md,20,mh[1]);case 7:break;default:return mo(mg,md,20,mh[1]);}if(-1===mg[6])throw [0,d,bn];mg[6]=-1;return ke(mg,md,20);default:}return kn(0);}function kg(mB,mA,mz,my){return mx(mB,mA,mz,my);}function mf(mH,mE,mD,mC){var mF=[0,mE,mD,mC],mG=mD-14|0;if(!(mG<0||19<mG))switch(mG){case 0:case 2:case 7:case 9:case 19:if(-1===mH[6])throw [0,d,bm];var mI=mH[3];if(typeof mI==="number")switch(mI){case 4:case 6:var mJ=mF[1],mK=mF[2],mL=[0,mF[3],0];for(;;){var mM=[0,mJ,mK,mL],mN=mK-14|0;if(mN<0||19<mN)var mO=0;else switch(mN){case 0:case 2:if(-1===mH[6])throw [0,d,br];var mP=mH[3];if(typeof mP==="number"&&6===mP){var mQ=[0,mM,15],mR=ka(mH);if(typeof mR==="number")switch(mR){case 0:var mS=mp(mH,mQ,14),mO=1,mU=0,mT=0;break;case 1:var mS=mq(mH,mQ,14),mO=1,mU=0,mT=0;break;case 2:var mS=kp(mH,mQ,14),mO=1,mU=0,mT=0;break;case 3:var mS=kq(mH,mQ,14),mO=1,mU=0,mT=0;break;case 5:var mS=kr(mH,mQ,14),mO=1,mU=0,mT=0;break;case 7:var mS=mr(mH,mQ,14),mO=1,mU=0,mT=0;break;case 8:var mS=ms(mH,mQ,14),mO=1,mU=0,mT=0;break;case 10:var mV=mQ[1],mW=mV[1],mX=mV[2],mY=[0,mV[3],0];for(;;){var mZ=mX-14|0;if(mZ<0||2<mZ)var m0=0;else switch(mZ){case 1:var m0=0;break;case 2:if(-1===mH[6])throw [0,d,bF];var m1=mH[3];if(typeof m1==="number"&&10===m1){ka(mH);var m2=mW[2],m3=[0,mW[1],m2,mY];if(13<=m2)if(17===m2){if(-1===mH[6])throw [0,d,bE];var m4=mH[3];if(typeof m4==="number")if(5===m4){var m5=lr(mH,m3,13),m0=1,m8=0,m7=0,m6=0;}else if(6===m4){var m5=ls(mH,m3,13),m0=1,m8=0,m7=0,m6=0;}else var m6=1;else var m6=1;if(m6){if(-1===mH[6])throw [0,d,bD];mH[6]=-1;var m5=ke(mH,m3,13),m0=1,m8=0,m7=0;}}else var m7=1;else if(11<=m2){if(-1===mH[6])throw [0,d,bC];var m9=mH[3];if(typeof m9==="number")switch(m9){case 4:case 9:var m_=1;break;case 6:var m5=m$(mH,m3,11),m0=1,m8=0,m7=0,m_=0;break;default:var m_=2;}else var m_=7===m9[0]?1:2;switch(m_){case 1:if(-1===mH[6])throw [0,d,bB];mH[6]=-1;var m5=ke(mH,m3,11),m0=1,m8=0,m7=0;break;case 2:var na=m3[1],nb=m3[2],nc=[0,m3[3],0];for(;;){var nd=[0,na,nb,nc];if(11===nb){var ne=nd[1],nh=[0,ne[3],nd[3]],ng=ne[2],nf=ne[1],na=nf,nb=ng,nc=nh;continue;}if(12===nb){if(-1===mH[6])throw [0,d,b3];var ni=mH[3];if(typeof ni==="number")switch(ni){case 4:case 6:case 9:var nj=0;break;case 5:var nk=lr(mH,nd,10),nj=2;break;default:var nj=1;}else var nj=7===ni[0]?0:1;switch(nj){case 1:var nk=ls(mH,nd,10);break;case 2:break;default:if(-1===mH[6])throw [0,d,b2];mH[6]=-1;var nk=ke(mH,nd,10);}}else var nk=kn(0);var m5=nk,m0=1,m8=0,m7=0;break;}break;default:}}else var m7=1;if(m7){var m5=kn(0),m0=1,m8=0;}}else var m8=1;if(m8){if(-1===mH[6])throw [0,d,bA];mH[6]=-1;var m5=ke(mH,mW,mX),m0=1;}break;default:var nl=mW[1],no=[0,nl[3],mY],nn=nl[2],nm=nl[1],mW=nm,mX=nn,mY=no;continue;}if(!m0)var m5=kn(0);var mS=m5,mO=1,mU=0,mT=0;break;}break;case 12:var mS=mu(mH,mQ,14),mO=1,mU=0,mT=0;break;case 13:var mS=mv(mH,mQ,14),mO=1,mU=0,mT=0;break;case 14:var mS=mw(mH,mQ,14),mO=1,mU=0,mT=0;break;default:var mT=1;}else switch(mR[0]){case 1:var mS=mi(mH,mQ,14,mR[1]),mO=1,mU=0,mT=0;break;case 2:var mS=mj(mH,mQ,14,mR[1]),mO=1,mU=0,mT=0;break;case 3:var mS=mk(mH,mQ,14,mR[1]),mO=1,mU=0,mT=0;break;case 4:var mS=ml(mH,mQ,14,mR[1]),mO=1,mU=0,mT=0;break;case 5:var mS=mm(mH,mQ,14,mR[1]),mO=1,mU=0,mT=0;break;case 6:var mS=mn(mH,mQ,14,mR[1]),mO=1,mU=0,mT=0;break;case 7:var mT=1;break;default:var mS=mo(mH,mQ,14,mR[1]),mO=1,mU=0,mT=0;}if(mT){if(-1===mH[6])throw [0,d,bq];mH[6]=-1;var mS=ke(mH,mQ,14),mO=1,mU=0;}}else var mU=1;if(mU){if(-1===mH[6])throw [0,d,bp];mH[6]=-1;var mS=ke(mH,mM,15),mO=1;}break;case 7:var np=mM[1],ns=[0,np[3],mM[3]],nr=np[2],nq=np[1],mJ=nq,mK=nr,mL=ns;continue;case 9:if(-1===mH[6])throw [0,d,bv];var nt=mH[3];if(typeof nt==="number"&&4===nt){ka(mH);var nu=mM[1],mS=nv(mH,nu[1],nu[2],[1,mM[3]]),mO=1,nw=0;}else var nw=1;if(nw){if(-1===mH[6])throw [0,d,bu];mH[6]=-1;var mS=ke(mH,mM[1],mM[2]),mO=1;}break;case 19:if(-1===mH[6])throw [0,d,bt];var nx=mH[3];if(typeof nx==="number"&&4===nx){ka(mH);var ny=mM[1],mS=nv(mH,ny[1],ny[2],[2,mM[3]]),mO=1,nz=0;}else var nz=1;if(nz){if(-1===mH[6])throw [0,d,bs];mH[6]=-1;var mS=ke(mH,mM[1],mM[2]),mO=1;}break;default:var mO=0;}if(!mO)var mS=kn(0);return mS;}case 0:return mp(mH,mF,21);case 1:return mq(mH,mF,21);case 2:return kp(mH,mF,21);case 3:return kq(mH,mF,21);case 5:return kr(mH,mF,21);case 7:return mr(mH,mF,21);case 8:return ms(mH,mF,21);case 12:return mu(mH,mF,21);case 13:return mv(mH,mF,21);case 14:return mw(mH,mF,21);default:}else switch(mI[0]){case 1:return mi(mH,mF,21,mI[1]);case 2:return mj(mH,mF,21,mI[1]);case 3:return mk(mH,mF,21,mI[1]);case 4:return ml(mH,mF,21,mI[1]);case 5:return mm(mH,mF,21,mI[1]);case 6:return mn(mH,mF,21,mI[1]);case 7:break;default:return mo(mH,mF,21,mI[1]);}if(-1===mH[6])throw [0,d,bl];mH[6]=-1;return ke(mH,mF,21);case 5:case 6:if(-1===mH[6])throw [0,d,bk];var nA=mH[3];if(typeof nA==="number")switch(nA){case 0:return mp(mH,mF,19);case 1:return mq(mH,mF,19);case 2:return kp(mH,mF,19);case 3:return kq(mH,mF,19);case 5:return kr(mH,mF,19);case 7:return mr(mH,mF,19);case 8:return ms(mH,mF,19);case 10:return mt(mH,mF,19);case 12:return mu(mH,mF,19);case 13:return mv(mH,mF,19);case 14:return mw(mH,mF,19);default:}else switch(nA[0]){case 1:return mi(mH,mF,19,nA[1]);case 2:return mj(mH,mF,19,nA[1]);case 3:return mk(mH,mF,19,nA[1]);case 4:return ml(mH,mF,19,nA[1]);case 5:return mm(mH,mF,19,nA[1]);case 6:return mn(mH,mF,19,nA[1]);case 7:break;default:return mo(mH,mF,19,nA[1]);}if(-1===mH[6])throw [0,d,bj];mH[6]=-1;return ke(mH,mF,19);default:}return kn(0);}function o6(nE,nD,nB,nC){if(14<=nB)switch(nB-14|0){case 0:case 2:case 5:case 6:case 7:case 9:case 19:return mf(nE,nD,nB,nC);case 12:case 13:case 16:case 17:case 18:return mx(nE,nD,nB,nC);case 8:case 10:case 11:case 14:case 15:return nF(nE,nD,nB,nC);default:}return kn(0);}function kV(nJ,nI,nH,nG){return nF(nJ,nI,nH,nG);}function nv(nN,nM,nL,nK){return kl(nN,nM,nL,nK);}function ko(nT,nO,nQ){var nP=nO,nR=nQ;for(;;){var nS=[0,nP,nR],nU=ka(nT);if(typeof nU==="number"&&9===nU){var nV=ka(nT);if(typeof nV==="number")switch(nV){case 1:var nW=31,nP=nS,nR=nW;continue;case 2:return kp(nT,nS,31);case 3:return kq(nT,nS,31);case 5:return kr(nT,nS,31);case 7:return ks(nT,nS,31);case 8:return kt(nT,nS,31);case 13:return ku(nT,nS,31);case 14:return kv(nT,nS,31);default:}else switch(nV[0]){case 1:return jW(nT,nS,31,nV[1]);case 2:return jX(nT,nS,31,nV[1]);case 3:return jY(nT,nS,31,nV[1]);case 4:return jZ(nT,nS,31,nV[1]);case 5:return j0(nT,nS,31,nV[1]);case 6:return j1(nT,nS,31,nV[1]);case 7:break;default:return j2(nT,nS,31,nV[1]);}if(-1===nT[6])throw [0,d,ba];nT[6]=-1;return ke(nT,nS,31);}if(-1===nT[6])throw [0,d,a$];nT[6]=-1;return ke(nT,nS[1],nS[2]);}}function j2(nX,n0,nZ,nY){ka(nX);return kg(nX,n0,nZ,[1,[0,[3,nY],0]]);}function jW(n1,n4,n3,n2){ka(n1);return kg(n1,n4,n3,[2,[0,[3,n2],0]]);}function jX(n5,n8,n7,n6){ka(n5);return kg(n5,n8,n7,[0,n6]);}function ks(n9,n$,n_){ka(n9);return kg(n9,n$,n_,a_);}function kt(oa,oc,ob){ka(oa);return kg(oa,oc,ob,a9);}function jY(od,og,of,oe){ka(od);return kg(od,og,of,[6,oe]);}function jZ(oh,ok,oj,oi){ka(oh);return kg(oh,ok,oj,[4,oi]);}function j0(ol,oo,on,om){ka(ol);return kg(ol,oo,on,[5,om]);}function j1(op,os,or,oq){ka(op);return kg(op,os,or,[3,oq]);}function ku(oy,ot,ov){var ou=ot,ow=ov;for(;;){var ox=[0,ou,ow],oz=ka(oy);if(typeof oz==="number"&&9===oz){var oA=ka(oy);if(typeof oA==="number")switch(oA){case 1:return ko(oy,ox,30);case 2:return kp(oy,ox,30);case 3:return kq(oy,ox,30);case 5:return kr(oy,ox,30);case 7:return ks(oy,ox,30);case 8:return kt(oy,ox,30);case 13:var oB=30,ou=ox,ow=oB;continue;case 14:return kv(oy,ox,30);default:}else switch(oA[0]){case 1:return jW(oy,ox,30,oA[1]);case 2:return jX(oy,ox,30,oA[1]);case 3:return jY(oy,ox,30,oA[1]);case 4:return jZ(oy,ox,30,oA[1]);case 5:return j0(oy,ox,30,oA[1]);case 6:return j1(oy,ox,30,oA[1]);case 7:break;default:return j2(oy,ox,30,oA[1]);}if(-1===oy[6])throw [0,d,a8];oy[6]=-1;return ke(oy,ox,30);}if(-1===oy[6])throw [0,d,a7];oy[6]=-1;return ke(oy,ox[1],ox[2]);}}function kv(oF,oD,oC){var oE=[0,oD,oC],oG=ka(oF);if(typeof oG==="number")switch(oG){case 1:return k2(oF,oE,29);case 2:return kp(oF,oE,29);case 3:return kq(oF,oE,29);case 5:return kr(oF,oE,29);case 7:return k3(oF,oE,29);case 8:return k4(oF,oE,29);case 12:return k5(oF,oE,29);case 13:return k6(oF,oE,29);default:}else switch(oG[0]){case 1:return kC(oF,oE,29,oG[1]);case 2:return kD(oF,oE,29,oG[1]);case 3:return kE(oF,oE,29,oG[1]);case 4:return kF(oF,oE,29,oG[1]);case 5:return kG(oF,oE,29,oG[1]);case 6:return kH(oF,oE,29,oG[1]);case 7:break;default:return kI(oF,oE,29,oG[1]);}if(-1===oF[6])throw [0,d,a6];oF[6]=-1;return ke(oF,oE,29);}function mp(oH,oJ,oI){ka(oH);return mf(oH,oJ,oI,a5);}function k2(oP,oK,oM){var oL=oK,oN=oM;for(;;){var oO=[0,oL,oN],oQ=ka(oP);if(typeof oQ==="number"&&9===oQ){var oR=ka(oP);if(typeof oR==="number")switch(oR){case 1:var oS=28,oL=oO,oN=oS;continue;case 2:return kp(oP,oO,28);case 3:return kq(oP,oO,28);case 5:return kr(oP,oO,28);case 7:return k3(oP,oO,28);case 8:return k4(oP,oO,28);case 12:return k5(oP,oO,28);case 13:return k6(oP,oO,28);default:}else switch(oR[0]){case 1:return kC(oP,oO,28,oR[1]);case 2:return kD(oP,oO,28,oR[1]);case 3:return kE(oP,oO,28,oR[1]);case 4:return kF(oP,oO,28,oR[1]);case 5:return kG(oP,oO,28,oR[1]);case 6:return kH(oP,oO,28,oR[1]);case 7:break;default:return kI(oP,oO,28,oR[1]);}if(-1===oP[6])throw [0,d,a4];oP[6]=-1;return ke(oP,oO,28);}if(-1===oP[6])throw [0,d,a3];oP[6]=-1;return ke(oP,oO[1],oO[2]);}}function kI(oT,oW,oV,oU){ka(oT);return kV(oT,oW,oV,[1,[0,[3,oU],0]]);}function kC(oX,o0,oZ,oY){ka(oX);return kV(oX,o0,oZ,[2,[0,[3,oY],0]]);}function kD(o1,o4,o3,o2){ka(o1);return kV(o1,o4,o3,[0,o2]);}function kp(o5,o8,o7){ka(o5);return o6(o5,o8,o7,a2);}function kq(o9,o$,o_){ka(o9);return o6(o9,o$,o_,a1);}function kr(pa,pc,pb){ka(pa);return o6(pa,pc,pb,a0);}function k3(pd,pf,pe){ka(pd);return kV(pd,pf,pe,aZ);}function k4(pg,pi,ph){ka(pg);return kV(pg,pi,ph,aY);}function kE(pj,pm,pl,pk){ka(pj);return kV(pj,pm,pl,[6,pk]);}function kF(pn,pq,pp,po){ka(pn);return kV(pn,pq,pp,[4,po]);}function kG(pr,pu,pt,ps){ka(pr);return kV(pr,pu,pt,[5,ps]);}function kH(pv,py,px,pw){ka(pv);return kV(pv,py,px,[3,pw]);}function k5(pC,pA,pz){var pB=[0,pA,pz],pD=ka(pC);if(typeof pD==="number")switch(pD){case 1:return ko(pC,pB,27);case 2:return kp(pC,pB,27);case 3:return kq(pC,pB,27);case 5:return kr(pC,pB,27);case 7:return ks(pC,pB,27);case 8:return kt(pC,pB,27);case 13:return ku(pC,pB,27);case 14:return kv(pC,pB,27);default:}else switch(pD[0]){case 1:return jW(pC,pB,27,pD[1]);case 2:return jX(pC,pB,27,pD[1]);case 3:return jY(pC,pB,27,pD[1]);case 4:return jZ(pC,pB,27,pD[1]);case 5:return j0(pC,pB,27,pD[1]);case 6:return j1(pC,pB,27,pD[1]);case 7:break;default:return j2(pC,pB,27,pD[1]);}if(-1===pC[6])throw [0,d,aX];pC[6]=-1;return ke(pC,pB,27);}function k6(pJ,pE,pG){var pF=pE,pH=pG;for(;;){var pI=[0,pF,pH],pK=ka(pJ);if(typeof pK==="number"&&9===pK){var pL=ka(pJ);if(typeof pL==="number")switch(pL){case 1:return k2(pJ,pI,25);case 2:return kp(pJ,pI,25);case 3:return kq(pJ,pI,25);case 5:return kr(pJ,pI,25);case 7:return k3(pJ,pI,25);case 8:return k4(pJ,pI,25);case 12:return k5(pJ,pI,25);case 13:var pM=25,pF=pI,pH=pM;continue;default:}else switch(pL[0]){case 1:return kC(pJ,pI,25,pL[1]);case 2:return kD(pJ,pI,25,pL[1]);case 3:return kE(pJ,pI,25,pL[1]);case 4:return kF(pJ,pI,25,pL[1]);case 5:return kG(pJ,pI,25,pL[1]);case 6:return kH(pJ,pI,25,pL[1]);case 7:break;default:return kI(pJ,pI,25,pL[1]);}if(-1===pJ[6])throw [0,d,aW];pJ[6]=-1;return ke(pJ,pI,25);}if(-1===pJ[6])throw [0,d,aV];pJ[6]=-1;return ke(pJ,pI[1],pI[2]);}}function lt(pS,pN,pP){var pO=pN,pQ=pP;for(;;){var pR=[0,pO,pQ],pT=ka(pS);if(typeof pT==="number"&&4<=pT)switch(pT-4|0){case 0:case 5:if(-1===pS[6])throw [0,d,aS];pS[6]=-1;return ke(pS,pR,35);case 6:var pU=35,pO=pR,pQ=pU;continue;default:}var pV=pR[1],pW=pR[2],pX=[0,0,0];for(;;){var pY=[0,pV,pW,pX],pZ=pW-35|0;if(pZ<0||1<pZ){var p0=pZ+28|0;if(p0<0||11<p0)var p1=0;else switch(p0){case 0:if(-1===pS[6])throw [0,d,bi];var p2=pS[3];if(typeof p2==="number")switch(p2){case 4:case 9:case 10:if(-1===pS[6])throw [0,d,bh];pS[6]=-1;var p4=ke(pS,pY,3),p1=1,p5=0;break;case 0:var p4=lm(pS,pY,3),p1=1,p5=0;break;case 2:var p4=lp(pS,pY,3),p1=1,p5=0;break;case 3:var p4=lq(pS,pY,3),p1=1,p5=0;break;case 5:var p4=lr(pS,pY,3),p1=1,p5=0;break;case 6:var p4=ls(pS,pY,3),p1=1,p5=0;break;case 11:var p4=p6(pS,pY,3),p1=1,p5=0;break;default:var p5=1;}else if(7===p2[0]){var p4=p3(pS,pY,3,p2[1]),p1=1,p5=0;}else var p5=1;if(p5){var p4=lv(pS,pY,3),p1=1;}break;case 1:if(-1===pS[6])throw [0,d,bg];var p7=pS[3];if(typeof p7==="number")switch(p7){case 4:case 9:case 10:if(-1===pS[6])throw [0,d,bf];pS[6]=-1;var p4=ke(pS,pY,2),p1=1,p8=0;break;case 0:var p4=lm(pS,pY,2),p1=1,p8=0;break;case 2:var p4=lp(pS,pY,2),p1=1,p8=0;break;case 3:var p4=lq(pS,pY,2),p1=1,p8=0;break;case 5:var p4=lr(pS,pY,2),p1=1,p8=0;break;case 6:var p4=ls(pS,pY,2),p1=1,p8=0;break;case 11:var p4=p6(pS,pY,2),p1=1,p8=0;break;default:var p8=1;}else if(7===p7[0]){var p4=p3(pS,pY,2,p7[1]),p1=1,p8=0;}else var p8=1;if(p8){var p4=lv(pS,pY,2),p1=1;}break;case 11:if(-1===pS[6])throw [0,d,be];var p9=pS[3];if(typeof p9==="number")switch(p9){case 4:case 9:case 10:if(-1===pS[6])throw [0,d,bd];pS[6]=-1;var p4=ke(pS,pY,1),p1=1,p_=0;break;case 0:var p4=lm(pS,pY,1),p1=1,p_=0;break;case 2:var p4=lp(pS,pY,1),p1=1,p_=0;break;case 3:var p4=lq(pS,pY,1),p1=1,p_=0;break;case 5:var p4=lr(pS,pY,1),p1=1,p_=0;break;case 6:var p4=ls(pS,pY,1),p1=1,p_=0;break;case 11:var p4=p6(pS,pY,1),p1=1,p_=0;break;default:var p_=1;}else if(7===p9[0]){var p4=p3(pS,pY,1,p9[1]),p1=1,p_=0;}else var p_=1;if(p_){var p4=lv(pS,pY,1),p1=1;}break;default:var p1=0;}if(!p1)var p4=kn(0);}else{if(0===pZ){var p$=pY[1],qc=[0,0,pY[3]],qb=p$[2],qa=p$[1],pV=qa,pW=qb,pX=qc;continue;}if(-1===pS[6])throw [0,d,bc];var qd=pS[3];if(typeof qd==="number")switch(qd){case 4:case 9:case 10:if(-1===pS[6])throw [0,d,bb];pS[6]=-1;var p4=ke(pS,pY,0),qe=1;break;case 0:var p4=lm(pS,pY,0),qe=1;break;case 2:var p4=lp(pS,pY,0),qe=1;break;case 3:var p4=lq(pS,pY,0),qe=1;break;case 5:var p4=lr(pS,pY,0),qe=1;break;case 6:var p4=ls(pS,pY,0),qe=1;break;case 11:var p4=p6(pS,pY,0),qe=1;break;default:var qe=0;}else if(7===qd[0]){var p4=p3(pS,pY,0,qd[1]),qe=1;}else var qe=0;if(!qe)var p4=lv(pS,pY,0);}return p4;}}}function m$(qi,qg,qf){var qh=[0,qg,qf],qj=ka(qi);if(typeof qj==="number")switch(qj){case 0:return mp(qi,qh,16);case 1:return mq(qi,qh,16);case 2:return kp(qi,qh,16);case 3:return kq(qi,qh,16);case 5:return kr(qi,qh,16);case 7:return mr(qi,qh,16);case 8:return ms(qi,qh,16);case 12:return mu(qi,qh,16);case 13:return mv(qi,qh,16);case 14:return mw(qi,qh,16);default:}else switch(qj[0]){case 1:return mi(qi,qh,16,qj[1]);case 2:return mj(qi,qh,16,qj[1]);case 3:return mk(qi,qh,16,qj[1]);case 4:return ml(qi,qh,16,qj[1]);case 5:return mm(qi,qh,16,qj[1]);case 6:return mn(qi,qh,16,qj[1]);case 7:break;default:return mo(qi,qh,16,qj[1]);}if(-1===qi[6])throw [0,d,aR];qi[6]=-1;return ke(qi,qh,16);}function mq(qp,qk,qm){var ql=qk,qn=qm;for(;;){var qo=[0,ql,qn],qq=ka(qp);if(typeof qq==="number"&&9===qq){var qr=ka(qp);if(typeof qr==="number")switch(qr){case 0:return mp(qp,qo,33);case 1:var qs=33,ql=qo,qn=qs;continue;case 2:return kp(qp,qo,33);case 3:return kq(qp,qo,33);case 5:return kr(qp,qo,33);case 7:return mr(qp,qo,33);case 8:return ms(qp,qo,33);case 12:return mu(qp,qo,33);case 13:return mv(qp,qo,33);case 14:return mw(qp,qo,33);default:}else switch(qr[0]){case 1:return mi(qp,qo,33,qr[1]);case 2:return mj(qp,qo,33,qr[1]);case 3:return mk(qp,qo,33,qr[1]);case 4:return ml(qp,qo,33,qr[1]);case 5:return mm(qp,qo,33,qr[1]);case 6:return mn(qp,qo,33,qr[1]);case 7:break;default:return mo(qp,qo,33,qr[1]);}if(-1===qp[6])throw [0,d,aQ];qp[6]=-1;return ke(qp,qo,33);}if(-1===qp[6])throw [0,d,aP];qp[6]=-1;return ke(qp,qo[1],qo[2]);}}function mo(qt,qw,qv,qu){ka(qt);return nv(qt,qw,qv,[1,[0,[3,qu],0]]);}function mi(qx,qA,qz,qy){ka(qx);return nv(qx,qA,qz,[2,[0,[3,qy],0]]);}function mj(qB,qE,qD,qC){ka(qB);return nv(qB,qE,qD,[0,qC]);}function mr(qF,qH,qG){ka(qF);return nv(qF,qH,qG,aO);}function ms(qI,qK,qJ){ka(qI);return nv(qI,qK,qJ,aN);}function mk(qL,qO,qN,qM){ka(qL);return nv(qL,qO,qN,[6,qM]);}function ml(qP,qS,qR,qQ){ka(qP);return nv(qP,qS,qR,[4,qQ]);}function mm(qT,qW,qV,qU){ka(qT);return nv(qT,qW,qV,[5,qU]);}function mn(qX,q0,qZ,qY){ka(qX);return nv(qX,q0,qZ,[3,qY]);}function mu(q4,q2,q1){var q3=[0,q2,q1],q5=ka(q4);if(typeof q5==="number")switch(q5){case 1:return ko(q4,q3,32);case 2:return kp(q4,q3,32);case 3:return kq(q4,q3,32);case 5:return kr(q4,q3,32);case 7:return ks(q4,q3,32);case 8:return kt(q4,q3,32);case 13:return ku(q4,q3,32);case 14:return kv(q4,q3,32);default:}else switch(q5[0]){case 1:return jW(q4,q3,32,q5[1]);case 2:return jX(q4,q3,32,q5[1]);case 3:return jY(q4,q3,32,q5[1]);case 4:return jZ(q4,q3,32,q5[1]);case 5:return j0(q4,q3,32,q5[1]);case 6:return j1(q4,q3,32,q5[1]);case 7:break;default:return j2(q4,q3,32,q5[1]);}if(-1===q4[6])throw [0,d,aM];q4[6]=-1;return ke(q4,q3,32);}function mv(q$,q6,q8){var q7=q6,q9=q8;for(;;){var q_=[0,q7,q9],ra=ka(q$);if(typeof ra==="number"&&9===ra){var rb=ka(q$);if(typeof rb==="number")switch(rb){case 0:return mp(q$,q_,23);case 1:return mq(q$,q_,23);case 2:return kp(q$,q_,23);case 3:return kq(q$,q_,23);case 5:return kr(q$,q_,23);case 7:return mr(q$,q_,23);case 8:return ms(q$,q_,23);case 12:return mu(q$,q_,23);case 13:var rc=23,q7=q_,q9=rc;continue;case 14:return mw(q$,q_,23);default:}else switch(rb[0]){case 1:return mi(q$,q_,23,rb[1]);case 2:return mj(q$,q_,23,rb[1]);case 3:return mk(q$,q_,23,rb[1]);case 4:return ml(q$,q_,23,rb[1]);case 5:return mm(q$,q_,23,rb[1]);case 6:return mn(q$,q_,23,rb[1]);case 7:break;default:return mo(q$,q_,23,rb[1]);}if(-1===q$[6])throw [0,d,aL];q$[6]=-1;return ke(q$,q_,23);}if(-1===q$[6])throw [0,d,aK];q$[6]=-1;return ke(q$,q_[1],q_[2]);}}function mw(rg,re,rd){var rf=[0,re,rd],rh=ka(rg);if(typeof rh==="number")switch(rh){case 1:return k2(rg,rf,22);case 2:return kp(rg,rf,22);case 3:return kq(rg,rf,22);case 5:return kr(rg,rf,22);case 7:return k3(rg,rf,22);case 8:return k4(rg,rf,22);case 12:return k5(rg,rf,22);case 13:return k6(rg,rf,22);default:}else switch(rh[0]){case 1:return kC(rg,rf,22,rh[1]);case 2:return kD(rg,rf,22,rh[1]);case 3:return kE(rg,rf,22,rh[1]);case 4:return kF(rg,rf,22,rh[1]);case 5:return kG(rg,rf,22,rh[1]);case 6:return kH(rg,rf,22,rh[1]);case 7:break;default:return kI(rg,rf,22,rh[1]);}if(-1===rg[6])throw [0,d,aJ];rg[6]=-1;return ke(rg,rf,22);}function rE(ro,ri,rq,rl){var rj=ri[2],rk=ri[1],rm=[0,ri[3],rl];if(37<=rj)var rn=45===rj?1:38<=rj?0:1;else if(7<=rj)if(19<=rj)var rn=0;else switch(rj-7|0){case 0:return l3(ro,rk,rj,rm);case 1:return lu(ro,rk,rj,rm);case 11:return lY(ro,rk,rj,rm);default:var rn=0;}else var rn=4<=rj?0:1;return rn?rp(ro,rk,rj,rm):kn(0);}function lY(rF,rr,rG,rB){var rs=rr[2],rt=rr[1],rw=rr[3],rx=af,ry=dh(function(ru){var rv=ru[2];return [0,dn(ru[1]),rv];},rw);for(;;){if(ry){var rz=ry[2],rA=jO(rx,ry[1]),rx=rA,ry=rz;continue;}var rC=[0,[1,rx],rB];if(9<=rs)if(36<=rs)switch(rs-36|0){case 1:case 9:var rD=1;break;case 0:return rE(rF,rt,rs,rC);default:var rD=0;}else var rD=0;else switch(rs){case 4:case 5:case 6:var rD=0;break;case 7:return l3(rF,rt,rs,rC);case 8:return lu(rF,rt,rs,rC);default:var rD=1;}return rD?rp(rF,rt,rs,rC):kn(0);}}function lu(rS,rH,rU,rJ){var rI=rH,rK=rJ;for(;;){var rL=rI[1],rM=rL[2],rN=rL[1],rO=rI[3],rP=[0,[0,dn(rL[3]),rO],rK],rQ=rM-4|0;if(rQ<0||31<rQ){if(32<=rQ)switch(rQ-32|0){case 1:case 9:var rR=1;break;case 0:return rE(rS,rN,rM,rP);default:var rR=0;}else var rR=1;if(rR)return rp(rS,rN,rM,rP);}else{var rT=rQ-3|0;if(!(rT<0||11<rT))switch(rT){case 0:return l3(rS,rN,rM,rP);case 1:var rI=rN,rK=rP;continue;case 11:return lY(rS,rN,rM,rP);default:}}return kn(0);}}function l3(r2,rV,r3,rY){var rW=rV[2],rX=rV[1],rZ=[0,[2,rV[3]],rY],r0=rW-4|0;if(r0<0||31<r0){if(32<=r0)switch(r0-32|0){case 1:case 9:var r1=1;break;case 0:return rE(r2,rX,rW,rZ);default:var r1=0;}else var r1=1;if(r1)return rp(r2,rX,rW,rZ);}else if(4===r0)return lu(r2,rX,rW,rZ);return kn(0);}function sO(sg,r6,r5,r4){var r7=[0,r6,r5,r4],r8=r5-37|0;if(r8<0||8<r8)if(-18<=r8)var r9=0;else switch(r8+37|0){case 0:case 1:case 2:case 3:case 7:case 8:case 18:var r9=1;break;case 10:var r_=r7[1],r$=r_[3],sa=r_[1],sb=sa[1],sc=sb[3],sd=sb[1],se=sa[3]?[4,[0,sc],r$]:[4,0,[0,sc,r$]],sf=[0,sd[1],sd[2],se];if(-1===sg[6])throw [0,d,aF];var sh=sg[3];if(typeof sh==="number")switch(sh){case 4:case 5:case 6:case 9:var si=0;break;case 0:return lm(sg,sf,36);case 2:return lp(sg,sf,36);case 3:return lq(sg,sf,36);case 10:return lt(sg,sf,36);case 11:return rE(sg,sf,36,0);default:var si=1;}else var si=7===sh[0]?0:1;if(si)return lv(sg,sf,36);if(-1===sg[6])throw [0,d,aE];sg[6]=-1;return ke(sg,sf,36);case 13:if(-1===sg[6])throw [0,d,aD];var sj=sg[3];if(typeof sj==="number"&&6===sj)return m$(sg,r7,12);if(-1===sg[6])throw [0,d,aC];sg[6]=-1;return ke(sg,r7,12);default:var r9=0;}else var r9=(r8-1|0)<0||6<(r8-1|0)?1:0;if(r9){if(-1===sg[6])throw [0,d,aB];var sk=sg[3];if(typeof sk==="number"&&6===sk)return m$(sg,r7,17);if(-1===sg[6])throw [0,d,aA];sg[6]=-1;return ke(sg,r7,17);}return kn(0);}function tf(sp,sn,sm,sl){var so=[0,sn,sm,sl];if(-1===sp[6])throw [0,d,az];var sq=sp[3];if(typeof sq==="number")switch(sq){case 1:return mq(sp,so,34);case 7:return mr(sp,so,34);case 8:return ms(sp,so,34);case 12:return mu(sp,so,34);case 13:return mv(sp,so,34);case 14:return mw(sp,so,34);default:}else switch(sq[0]){case 1:return mi(sp,so,34,sq[1]);case 2:return mj(sp,so,34,sq[1]);case 3:return mk(sp,so,34,sq[1]);case 4:return ml(sp,so,34,sq[1]);case 5:return mm(sp,so,34,sq[1]);case 6:return mn(sp,so,34,sq[1]);case 7:break;default:return mo(sp,so,34,sq[1]);}if(-1===sp[6])throw [0,d,ay];sp[6]=-1;return ke(sp,so,34);}function sB(sx,sr,st){var ss=sr,su=st,sv=0;for(;;){var sw=[0,ss,su,sv];if(39<=su)switch(su-39|0){case 0:case 3:if(-1===sx[6])throw [0,d,aI];var sy=sx[3];if(typeof sy==="number"&&5===sy){var sz=[0,sw,40],sA=ka(sx);if(typeof sA==="number"&&5<=sA)switch(sA-5|0){case 0:var sC=sB(sx,sz,39),sF=1,sE=0,sD=0;break;case 2:var sC=sG(sx,sz,39),sF=1,sE=0,sD=0;break;case 5:var sH=sz[1],sI=sH[1],sJ=sH[2];for(;;){if(39===sJ){var sK=sI[1],sM=sK[2],sL=sK[1],sI=sL,sJ=sM;continue;}if(42===sJ){if(-1===sx[6])throw [0,d,aU];var sN=sx[3];if(typeof sN==="number"&&10===sN){ka(sx);var sP=sO(sx,sI[1],sI[2],[0,0]),sQ=1;}else var sQ=0;if(!sQ){if(-1===sx[6])throw [0,d,aT];sx[6]=-1;var sP=ke(sx,sI,sJ);}}else var sP=kn(0);var sC=sP,sF=1,sE=0,sD=0;break;}break;default:var sD=1;}else var sD=1;if(sD){if(-1===sx[6])throw [0,d,aH];sx[6]=-1;var sC=ke(sx,sz,39),sF=1,sE=0;}}else var sE=1;if(sE){if(-1===sx[6])throw [0,d,aG];sx[6]=-1;var sC=ke(sx,sw,40),sF=1;}break;case 2:var sR=sw[1],sU=[0,0,sw[3]],sT=sR[2],sS=sR[1],ss=sS,su=sT,sv=sU;continue;default:var sF=0;}else var sF=0;if(!sF)var sC=kn(0);return sC;}}function sG(s0,sV,sX){var sW=sV,sY=sX;for(;;){var sZ=[0,sW,sY],s1=ka(s0);if(typeof s1==="number"){var s2=s1-5|0;if(!(s2<0||2<s2))switch(s2){case 1:break;case 2:var s3=41,sW=sZ,sY=s3;continue;default:return sB(s0,sZ,41);}}if(-1===s0[6])throw [0,d,at];s0[6]=-1;return ke(s0,sZ,41);}}function rp(td,s4,s6,s8){var s5=s4,s7=s6,s9=s8;for(;;){if(37===s7){var s_=s5[1],s$=s_[3],tc=[0,[3,s$[1],s$[2]],s9],ta=s_[1],tb=s_[2],s5=ta,s7=tb,s9=tc;continue;}if(45===s7)return s9;if(4<=s7)return kn(0);switch(s7){case 1:return lY(td,s5[1],s5[2],s9);case 2:return lu(td,s5[1],s5[2],s9);case 3:return l3(td,s5[1],s5[2],s9);default:return rE(td,s5[1],s5[2],s9);}}}function kn(te){fU(jP,cY,as);throw [0,d,ar];}function lv(ti,th,tg){return tf(ti,th,tg,0);}function ls(tl,tk,tj){return sO(tl,tk,tj,0);}function lm(tm,to,tn){ka(tm);return tf(tm,to,tn,[0,0]);}function lp(tu,tp,tr){var tq=tp,ts=tr;for(;;){var tt=[0,tq,ts],tv=ka(tu);if(typeof tv==="number")switch(tv){case 0:case 1:case 7:case 8:case 12:case 13:case 14:var tw=1;break;case 2:var tx=44,tq=tt,ts=tx;continue;default:var tw=0;}else var tw=7===tv[0]?0:1;if(tw){var ty=tt[1],tz=tt[2],tA=[0,0,0];for(;;){var tB=[0,ty,tz,tA];if(4===tz)var tC=0;else{if(9<=tz)if(36<=tz)switch(tz-36|0){case 0:case 1:case 9:var tD=1;break;case 8:var tE=tB[1],tH=[0,0,tB[3]],tG=tE[2],tF=tE[1],ty=tF,tz=tG,tA=tH;continue;default:var tC=0,tD=0;}else{var tC=0,tD=0;}else if(6===tz){var tC=0,tD=0;}else var tD=1;if(tD){if(-1===tu[6])throw [0,d,ax];var tI=tu[3];if(typeof tI==="number")switch(tI){case 1:case 7:case 8:case 12:case 13:case 14:var tJ=2;break;case 0:var tK=lm(tu,tB,6),tC=1,tJ=0;break;default:var tJ=1;}else var tJ=7===tI[0]?1:2;switch(tJ){case 1:if(-1===tu[6])throw [0,d,aw];tu[6]=-1;var tK=ke(tu,tB,6),tC=1;break;case 2:var tK=lv(tu,tB,6),tC=1;break;default:}}}if(!tC)var tK=kn(0);return tK;}}if(-1===tu[6])throw [0,d,aq];tu[6]=-1;return ke(tu,tt,44);}}function lq(tQ,tL,tN){var tM=tL,tO=tN;for(;;){var tP=[0,tM,tO],tR=ka(tQ);if(typeof tR==="number")switch(tR){case 0:case 1:case 7:case 8:case 12:case 13:case 14:var tS=1;break;case 3:var tT=43,tM=tP,tO=tT;continue;default:var tS=0;}else var tS=7===tR[0]?0:1;if(tS){var tU=tP[1],tV=tP[2],tW=[0,0,0];for(;;){var tX=[0,tU,tV,tW];if(9<=tV)if(18===tV)var tY=1;else if(36<=tV)switch(tV-36|0){case 0:case 1:case 9:var tY=1;break;case 7:var tZ=tX[1],t2=[0,0,tX[3]],t1=tZ[2],t0=tZ[1],tU=t0,tV=t1,tW=t2;continue;default:var tY=0;}else var tY=0;else var tY=(tV-4|0)<0||2<(tV-4|0)?1:0;if(tY){if(-1===tQ[6])throw [0,d,av];var t3=tQ[3];if(typeof t3==="number")switch(t3){case 1:case 7:case 8:case 12:case 13:case 14:var t4=1;break;case 0:var t5=lm(tQ,tX,9),t4=2;break;default:var t4=0;}else var t4=7===t3[0]?0:1;switch(t4){case 1:var t5=lv(tQ,tX,9);break;case 2:break;default:if(-1===tQ[6])throw [0,d,au];tQ[6]=-1;var t5=ke(tQ,tX,9);}}else var t5=kn(0);return t5;}}if(-1===tQ[6])throw [0,d,ap];tQ[6]=-1;return ke(tQ,tP,43);}}function lr(t9,t7,t6){var t8=[0,t7,t6],t_=ka(t9);if(typeof t_==="number"){var t$=t_-5|0;if(!(t$<0||2<t$))switch(t$){case 1:break;case 2:return sG(t9,t8,42);default:return sB(t9,t8,42);}}if(-1===t9[6])throw [0,d,ao];t9[6]=-1;return ke(t9,t8,42);}function p6(uc,ub,ua){return rp(uc,ub,ua,0);}function p3(uh,uf,ue,ud){var ug=[0,uf,ue,ud],ui=ka(uh);if(typeof ui==="number"&&4<=ui)switch(ui-4|0){case 0:case 5:if(-1===uh[6])throw [0,d,an];uh[6]=-1;return ke(uh,ug,38);case 6:return uj(uh,ug,38);default:}return uk(uh,ug,38);}function ka(ul){var um=ul[2],un=df(ul[1],um);ul[3]=un;ul[4]=um[11];ul[5]=um[12];var uo=ul[6]+1|0;if(0<=uo)ul[6]=uo;return un;}function ke(vY,up,ur){var uq=up,us=ur;for(;;)switch(us){case 1:var uu=uq[2],ut=uq[1],uq=ut,us=uu;continue;case 2:var uw=uq[2],uv=uq[1],uq=uv,us=uw;continue;case 3:var uy=uq[2],ux=uq[1],uq=ux,us=uy;continue;case 4:var uA=uq[2],uz=uq[1],uq=uz,us=uA;continue;case 5:var uC=uq[2],uB=uq[1],uq=uB,us=uC;continue;case 6:var uE=uq[2],uD=uq[1],uq=uD,us=uE;continue;case 7:var uG=uq[2],uF=uq[1],uq=uF,us=uG;continue;case 8:var uI=uq[2],uH=uq[1],uq=uH,us=uI;continue;case 9:var uK=uq[2],uJ=uq[1],uq=uJ,us=uK;continue;case 10:var uM=uq[2],uL=uq[1],uq=uL,us=uM;continue;case 11:var uO=uq[2],uN=uq[1],uq=uN,us=uO;continue;case 12:var uQ=uq[2],uP=uq[1],uq=uP,us=uQ;continue;case 13:var uS=uq[2],uR=uq[1],uq=uR,us=uS;continue;case 14:var uU=uq[2],uT=uq[1],uq=uT,us=uU;continue;case 15:var uW=uq[2],uV=uq[1],uq=uV,us=uW;continue;case 16:var uY=uq[2],uX=uq[1],uq=uX,us=uY;continue;case 17:var u0=uq[2],uZ=uq[1],uq=uZ,us=u0;continue;case 18:var u2=uq[2],u1=uq[1],uq=u1,us=u2;continue;case 19:var u4=uq[2],u3=uq[1],uq=u3,us=u4;continue;case 20:var u6=uq[2],u5=uq[1],uq=u5,us=u6;continue;case 21:var u8=uq[2],u7=uq[1],uq=u7,us=u8;continue;case 22:var u_=uq[2],u9=uq[1],uq=u9,us=u_;continue;case 23:var va=uq[2],u$=uq[1],uq=u$,us=va;continue;case 24:var vc=uq[2],vb=uq[1],uq=vb,us=vc;continue;case 25:var ve=uq[2],vd=uq[1],uq=vd,us=ve;continue;case 26:var vg=uq[2],vf=uq[1],uq=vf,us=vg;continue;case 27:var vi=uq[2],vh=uq[1],uq=vh,us=vi;continue;case 28:var vk=uq[2],vj=uq[1],uq=vj,us=vk;continue;case 29:var vm=uq[2],vl=uq[1],uq=vl,us=vm;continue;case 30:var vo=uq[2],vn=uq[1],uq=vn,us=vo;continue;case 31:var vq=uq[2],vp=uq[1],uq=vp,us=vq;continue;case 32:var vs=uq[2],vr=uq[1],uq=vr,us=vs;continue;case 33:var vu=uq[2],vt=uq[1],uq=vt,us=vu;continue;case 34:var vw=uq[2],vv=uq[1],uq=vv,us=vw;continue;case 35:var vy=uq[2],vx=uq[1],uq=vx,us=vy;continue;case 36:var vA=uq[2],vz=uq[1],uq=vz,us=vA;continue;case 37:var vC=uq[2],vB=uq[1],uq=vB,us=vC;continue;case 38:var vE=uq[2],vD=uq[1],uq=vD,us=vE;continue;case 39:var vG=uq[2],vF=uq[1],uq=vF,us=vG;continue;case 40:var vI=uq[2],vH=uq[1],uq=vH,us=vI;continue;case 41:var vK=uq[2],vJ=uq[1],uq=vJ,us=vK;continue;case 42:var vM=uq[2],vL=uq[1],uq=vL,us=vM;continue;case 43:var vO=uq[2],vN=uq[1],uq=vN,us=vO;continue;case 44:var vQ=uq[2],vP=uq[1],uq=vP,us=vQ;continue;case 45:var vS=uq[2],vR=uq[1],uq=vR,us=vS;continue;case 46:var vU=uq[2],vT=uq[1],uq=vT,us=vU;continue;case 47:throw vV;default:var vX=uq[2],vW=uq[1],uq=vW,us=vX;continue;}}function uk(v5,vZ,v1){var v0=vZ,v2=v1,v3=0;for(;;){var v4=[0,v0,v2,v3];if(38<=v2)switch(v2-38|0){case 0:if(-1===v5[6])throw [0,d,am];var v6=v5[3];if(typeof v6==="number")switch(v6){case 4:case 9:case 10:if(-1===v5[6])throw [0,d,al];v5[6]=-1;var v7=ke(v5,v4,37),v9=1,v8=0;break;case 0:var v7=lm(v5,v4,37),v9=1,v8=0;break;case 2:var v7=lp(v5,v4,37),v9=1,v8=0;break;case 3:var v7=lq(v5,v4,37),v9=1,v8=0;break;case 5:var v7=lr(v5,v4,37),v9=1,v8=0;break;case 6:var v7=ls(v5,v4,37),v9=1,v8=0;break;case 11:var v7=p6(v5,v4,37),v9=1,v8=0;break;default:var v8=1;}else if(7===v6[0]){var v7=p3(v5,v4,37,v6[1]),v9=1,v8=0;}else var v8=1;if(v8){var v7=lv(v5,v4,37),v9=1;}break;case 8:var v_=v4[1],wb=[0,0,v4[3]],wa=v_[2],v$=v_[1],v0=v$,v2=wa,v3=wb;continue;case 9:if(-1===v5[6])throw [0,d,ak];var wc=v5[3];if(typeof wc==="number")switch(wc){case 4:case 9:case 10:if(-1===v5[6])throw [0,d,aj];v5[6]=-1;var v7=ke(v5,v4,45),v9=1,wd=0;break;case 0:var v7=lm(v5,v4,45),v9=1,wd=0;break;case 2:var v7=lp(v5,v4,45),v9=1,wd=0;break;case 3:var v7=lq(v5,v4,45),v9=1,wd=0;break;case 5:var v7=lr(v5,v4,45),v9=1,wd=0;break;case 6:var v7=ls(v5,v4,45),v9=1,wd=0;break;case 11:var v7=p6(v5,v4,45),v9=1,wd=0;break;default:var wd=1;}else if(7===wc[0]){var v7=p3(v5,v4,45,wc[1]),v9=1,wd=0;}else var wd=1;if(wd){var v7=lv(v5,v4,45),v9=1;}break;default:var v9=0;}else var v9=0;if(!v9)var v7=kn(0);return v7;}}function uj(wj,we,wg){var wf=we,wh=wg;for(;;){var wi=[0,wf,wh],wk=ka(wj);if(typeof wk==="number"&&4<=wk)switch(wk-4|0){case 0:case 5:if(-1===wj[6])throw [0,d,ai];wj[6]=-1;return ke(wj,wi,46);case 6:var wl=46,wf=wi,wh=wl;continue;default:}return uk(wj,wi,46);}}function wq(wn){var wm=2;for(;;){var wo=d6(f,wm,wn);if(wo<0||26<wo){df(wn[1],wn);var wm=wo;continue;}switch(wo){case 9:case 18:var wp=14;break;case 0:var wp=wq(wn);break;case 1:var wp=wr(1,wn);break;case 2:var wp=8;break;case 3:var wp=3;break;case 4:var wp=2;break;case 5:var wp=6;break;case 6:var wp=5;break;case 7:var wp=7;break;case 10:var wp=[1,d8(wn,wn[5]+1|0)];break;case 11:var wp=1;break;case 12:var wp=[0,d8(wn,wn[5]+1|0)];break;case 13:var wp=13;break;case 14:var wp=9;break;case 15:var wp=4;break;case 16:var wp=[4,d7(wn,wn[5]+1|0,wn[6]-1|0)];break;case 17:var wp=[5,d8(wn,wn[5]+1|0)];break;case 20:var wp=ws(eo(16),wn);break;case 21:var wp=[2,d7(wn,wn[5],wn[6])];break;case 22:var wp=10;break;case 23:var wp=0;break;case 24:var wp=11;break;case 25:var wp=[6,d8(wn,wn[5]+1|0)];break;case 26:var wp=i(cQ(ac,cQ(dO(1,d8(wn,wn[5])),ad)));break;default:var wp=12;}return wp;}}function wr(ww,wu){var wt=30;for(;;){var wv=d6(f,wt,wu);if(wv<0||2<wv){df(wu[1],wu);var wt=wv;continue;}switch(wv){case 1:var wx=1===ww?wq(wu):wr(ww-1|0,wu);break;case 2:var wx=wr(ww,wu);break;default:var wx=wr(ww+1|0,wu);}return wx;}}function ws(wB,wz){var wy=36;for(;;){var wA=d6(f,wy,wz);if(wA<0||2<wA){df(wz[1],wz);var wy=wA;continue;}switch(wA){case 1:eq(wB,d8(wz,wz[5]));var wC=ws(wB,wz);break;case 2:var wD=eo(16),wC=wE(ep(wB),wD,wz);break;default:var wC=[3,ep(wB)];}return wC;}}function wE(wJ,wI,wG){var wF=42;for(;;){var wH=d6(f,wF,wG);if(0===wH)var wK=[7,[0,wJ,ep(wI)]];else{if(1!==wH){df(wG[1],wG);var wF=wH;continue;}eq(wI,d8(wG,wG[5]));var wK=wE(wJ,wI,wG);}return wK;}}var xK=caml_js_wrap_callback(function(wL){var wM=new MlWrappedString(wL),wW=[0],wV=1,wU=0,wT=0,wS=0,wR=0,wQ=0,wP=wM.getLen(),wO=cQ(wM,cr),wX=[0,function(wN){wN[9]=1;return 0;},wO,wP,wQ,wR,wS,wT,wU,wV,wW,e,e],wY=wq(wX),wZ=[0,wq,wX,wY,wX[11],wX[12],4.6116860184273879e+18],w0=0;if(-1===wZ[6])throw [0,d,ah];var w1=wZ[3];if(typeof w1==="number"&&4<=w1)switch(w1-4|0){case 0:case 5:if(-1===wZ[6])throw [0,d,ag];wZ[6]=-1;var w2=ke(wZ,w0,47),w3=1;break;case 6:var w2=uj(wZ,w0,47),w3=1;break;default:var w3=0;}else var w3=0;if(!w3)var w2=uk(wZ,w0,47);var xf=function(w4){return dR(F,dh(w5,w4));},w5=function(w6){return dR(E,dh(w7,w6));},xg=0,xh=w2,w7=function(w8){switch(w8[0]){case 1:return cQ(C,cQ(w5(w8[1]),D));case 2:return cQ(A,cQ(w5(w8[1]),B));case 3:var w9=w8[1];return 38===w9?z:dO(1,w9);case 4:return cQ(x,cQ(w8[1],y));case 5:var w_=w8[1];try {var w$=b_;for(;;){if(!w$)throw [0,c];var xa=w$[1],xc=w$[2],xb=xa[2];if(0!==caml_compare(xa[1],w_)){var w$=xc;continue;}var xd=xb;break;}}catch(xe){if(xe[1]!==c)throw xe;var xd=i(cQ(dO(1,w_),v));}return cQ(u,cQ(xd,w));case 6:return cQ(s,cQ(w8[1],t));case 7:return cQ(q,cQ(w5(w8[1]),r));case 8:return cQ(o,cQ(w5(w8[1]),p));default:return w8[1];}};for(;;){if(xh){var xi=xh[1],xI=xh[2];switch(xi[0]){case 1:var xo=function(xj){var xk=xj[2],xl=xj[1];if(xk){var xm=0,xn=xk;for(;;){if(xn){var xp=xn[2],xq=[0,cQ(U,cQ(xo(xn[1]),V)),xm],xm=xq,xn=xp;continue;}var xr=cQ(R,cQ(dR(S,xm),T));return cQ(xf(xl),xr);}}return xf(xl);},xs=xo(xi[1]);break;case 2:var xs=cQ(L,cQ(xf(xi[1]),M));break;case 3:var xt=xi[1],xs=cQ(l,cQ(xt,cQ(m,cQ(xi[2],n))));break;case 4:var xu=xi[1],xz=function(xv,xy){return cQ(W,cQ(dR(X,dh(function(xw){var xx=cQ($,cQ(xv,aa));return cQ(Z,cQ(xv,cQ(_,cQ(w5(xw),xx))));},xy)),Y));},xB=xi[2],xD=cQ(dR(J,dh(function(xz){return function(xA){return xz(ab,xA);};}(xz),xB)),K),xC=xu?xz(I,xu[1]):H,xs=cQ(G,cQ(xC,xD));break;default:var xE=xi[1],xF=7<=xE?6:xE,xG=cQ(P,cQ(cR(xF),Q)),xH=cQ(O,cQ(w5(xi[2]),xG)),xs=cQ(N,cQ(cR(xF),xH));}var xJ=[0,xs,xg],xg=xJ,xh=xI;continue;}return dR(k,dq(xg)).toString();}});pastek_core[j.toString()]=xK;cZ(0);return;}());
