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
function caml_string_equal(s1, s2) {
  var b1 = s1.fullBytes;
  var b2 = s2.fullBytes;
  if (b1 != null && b2 != null) return (b1 == b2)?1:0;
  return (s1.getFullBytes () == s2.getFullBytes ())?1:0;
}
function caml_sys_get_config () {
  return [0, new MlWrappedString("Unix"), 32, 0];
}
(function(){function km(Cp,Cq,Cr,Cs,Ct,Cu,Cv){return Cp.length==6?Cp(Cq,Cr,Cs,Ct,Cu,Cv):caml_call_gen(Cp,[Cq,Cr,Cs,Ct,Cu,Cv]);}function Bu(Ck,Cl,Cm,Cn,Co){return Ck.length==4?Ck(Cl,Cm,Cn,Co):caml_call_gen(Ck,[Cl,Cm,Cn,Co]);}function f9(Cg,Ch,Ci,Cj){return Cg.length==3?Cg(Ch,Ci,Cj):caml_call_gen(Cg,[Ch,Ci,Cj]);}function gC(Cd,Ce,Cf){return Cd.length==2?Cd(Ce,Cf):caml_call_gen(Cd,[Ce,Cf]);}function d8(Cb,Cc){return Cb.length==1?Cb(Cc):caml_call_gen(Cb,[Cc]);}var a=[0,new MlString("Failure")],b=[0,new MlString("Invalid_argument")],c=[0,new MlString("Not_found")],d=[0,new MlString("Assert_failure")],e=[0,new MlString(""),1,0,0],f=[0,new MlString("\0\0\xe2\xff\x02\0\x04\0\x0e\0N\0\xeb\xff\xec\xff\xed\xff\xef\xff\xf0\xffO\0\xc2\0\x01\0\xf7\xff\xf8\xff\xf9\xff\xfa\xff\xfb\xff\xfc\xff\xc4\0\x02\0\x06\0\x02\0\xe1\xff\0\0\0\0\0\0\x01\0\0\0\x01\0\x05\0\xfd\xff\x03\0\xe6\xff\xf4\xff\xf2\xff\x12\x01b\x01\xad\x01\xea\xff\x0b\0\xfd\xff\t\0\x10\0\xff\xff\xfe\xff\b\0\xfc\xff\x12\0\x04\0\x13\0\xff\xff\x14\0L\0\x16\0\x18\0\x19\0\x1a\0\xff\xff"),new MlString("\xff\xff\xff\xff\x1b\0\x1c\0\x1a\0\x1f\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x0e\0\f\0\n\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x1f\0\x11\0\x01\0\0\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\t\0\xff\xff\xff\xff\xff\xff\xff\xff\x16\0\xff\xff\xff\xff\xff\xff\xff\xff\x02\0\x02\0\xff\xff\xff\xff\x02\0\xff\xff\x02\0\x01\0\xff\xff\xff\xff\xff\xff\x03\0\x02\0\x01\0\xff\xff\xff\xff\xff\xff"),new MlString("\x04\0\0\0\xff\xff\xff\xff\x04\0\xff\xff\0\0\0\0\0\0\0\0\0\0$\0#\0\xff\xff\0\0\0\0\0\0\0\0\0\0\0\0\xff\xff\xff\xff\xff\xff\x17\0\0\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\0\0\xff\xff\0\0\0\0\0\0\xff\xff\xff\xff\xff\xff\0\0*\0\0\0\xff\xff\xff\xff\0\0\0\x001\0\0\x001\0\xff\xff\xff\xff\0\x006\x006\0\xff\xff\xff\xff\xff\xff\xff\xff\0\0"),new MlString("\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x03\0\x02\0\x02\0\xff\xff\x03\0\x02\0 \0\0\0\0\x000\0\0\0\0\0\0\0\0\0\xff\xff\xff\xff\0\0\0\0\0\0\xff\xff\0\x008\0\0\0\x03\0\x0e\0\x02\0\x13\0\x03\0\0\0\x05\0\0\0\x15\0\b\0\x12\0\x10\0\x16\0\x0f\0\xff\xff\xff\xff\x17\0\xff\xff.\0,\0\xff\xff+\0\xff\xff\xff\xff\xff\xff\xff\xff-\0\xff\xff\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xff\xff\0\0\xff\xff\xff\xff\0\0\x07\0\x14\0\x06\0\x0b\0\f\0\r\0!\0\x1d\0\"\x003\0\x1a\0\x1f\0\x1e\x002\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x1c\0'\0\xff\xff4\x007\0\xff\xff:\0\x1b\x009\0:\0;\0\n\0\x11\0\t\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0\0\0\xff\xff\xff\xff\xff\xff\0\0\0\0\0\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0\0\0\0\0\xff\xff\xff\xff\0\0\0\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0\0\0\xff\xff\xff\xff\xff\xff\0\0\x18\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xff\xff\0\0\0\0\x18\0\0\0\x18\0\xff\xff\0\0\x18\0\0\0\x18\0\x18\0\x18\0\x18\0\0\0\x18\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x01\0\0\0\xff\xff\0\0\0\0\0\0\0\0\0\0\xff\xff\0\0\0\0\xff\xff\0\0\0\0\xff\xff\0\0\0\0\0\0\xff\xff\0\0\xff\xff\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xff\xff\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x19\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xff\xff\0\0\x18\0\x18\0\x18\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0\xff\xff(\0\0\0\xff\xff\0\0\0\0\0\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0\0\0\0\0\0\0\0\0\0\0\0\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0\0\0\0\0\0\0\0\0\0\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0\0\0(\0\0\0\0\0\0\0\0\0\0\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0\0\0\0\0\0\0\0\0\0\0\xff\xff%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0\0\0\0\0\0\0\0\0\0\0\0\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0"),new MlString("\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\0\0\0\0\x02\0\x17\0\x03\0\x03\0\x1f\0\xff\xff\xff\xff/\0\xff\xff\xff\xff\xff\xff\xff\xff\x04\0\x04\0\xff\xff\xff\xff\xff\xff1\0\xff\xff5\0\xff\xff\0\0\0\0\x02\0\0\0\x03\0\xff\xff\0\0\xff\xff\0\0\0\0\0\0\0\0\x15\0\0\0\x04\0\x04\0\x16\0\x04\0+\0)\0\x04\0)\0\x04\0\x04\0\x04\0\x04\0,\0\x04\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff6\0\xff\xff\x0b\0\x0b\0\xff\xff\0\0\0\0\0\0\0\0\0\0\0\0\r\0\x1c\0!\x002\0\x19\0\x1e\0\x1d\0/\0\x04\0\x04\0\x04\0\x04\0\x04\0\x04\0\x0b\0\x1b\0\x05\x001\x003\x005\0\x0b\x007\0\x1a\x008\x009\0:\0\0\0\0\0\0\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\xff\xff\x04\0\x04\0\x04\0\xff\xff\xff\xff\xff\xff\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\xff\xff\xff\xff\x0b\x006\0\xff\xff\xff\xff\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\xff\xff\x0b\0\f\0\f\0\xff\xff\x14\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\f\0\xff\xff\xff\xff\x14\0\xff\xff\x14\0\f\0\xff\xff\x14\0\xff\xff\x14\0\x14\0\x14\0\x14\0\xff\xff\x14\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\0\0\xff\xff\x17\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff/\0\xff\xff\xff\xff)\0\xff\xff\xff\xff\x04\0\xff\xff\xff\xff\xff\xff1\0\xff\xff5\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\f\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x14\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\f\0\xff\xff\x14\0\x14\0\x14\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\x006\0%\0\xff\xff\x0b\0\xff\xff\xff\xff\xff\xff%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0%\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0\xff\xff&\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\f\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0&\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff"),new MlString(""),new MlString(""),new MlString(""),new MlString(""),new MlString(""),new MlString("")];caml_register_global(6,c);caml_register_global(5,[0,new MlString("Division_by_zero")]);caml_register_global(3,b);caml_register_global(2,a);var dy=new MlString("%.12g"),dx=new MlString("."),dw=new MlString("%d"),dv=new MlString("true"),du=new MlString("false"),dt=new MlString("Pervasives.do_at_exit"),ds=new MlString("tl"),dr=new MlString("hd"),dq=new MlString("\\b"),dp=new MlString("\\t"),dn=new MlString("\\n"),dm=new MlString("\\r"),dl=new MlString("\\\\"),dk=new MlString("\\'"),dj=new MlString("String.blit"),di=new MlString("String.sub"),dh=new MlString(""),dg=new MlString("Buffer.add: cannot grow buffer"),df=new MlString(""),de=new MlString(""),dd=new MlString("\""),dc=new MlString("\""),db=new MlString("'"),da=new MlString("'"),c$=new MlString("."),c_=new MlString("printf: bad positional specification (0)."),c9=new MlString("%_"),c8=[0,new MlString("printf.ml"),144,8],c7=new MlString("''"),c6=new MlString("Printf: premature end of format string ``"),c5=new MlString("''"),c4=new MlString(" in format string ``"),c3=new MlString(", at char number "),c2=new MlString("Printf: bad conversion %"),c1=new MlString("Sformat.index_of_int: negative argument "),c0=[0,[0,65,new MlString("#913")],[0,[0,66,new MlString("#914")],[0,[0,71,new MlString("#915")],[0,[0,68,new MlString("#916")],[0,[0,69,new MlString("#917")],[0,[0,90,new MlString("#918")],[0,[0,84,new MlString("#920")],[0,[0,73,new MlString("#921")],[0,[0,75,new MlString("#922")],[0,[0,76,new MlString("#923")],[0,[0,77,new MlString("#924")],[0,[0,78,new MlString("#925")],[0,[0,88,new MlString("#926")],[0,[0,79,new MlString("#927")],[0,[0,80,new MlString("#928")],[0,[0,82,new MlString("#929")],[0,[0,83,new MlString("#931")],[0,[0,85,new MlString("#933")],[0,[0,67,new MlString("#935")],[0,[0,87,new MlString("#937")],[0,[0,89,new MlString("#936")],[0,[0,97,new MlString("#945")],[0,[0,98,new MlString("#946")],[0,[0,103,new MlString("#947")],[0,[0,100,new MlString("#948")],[0,[0,101,new MlString("#949")],[0,[0,122,new MlString("#950")],[0,[0,116,new MlString("#952")],[0,[0,105,new MlString("#953")],[0,[0,107,new MlString("#954")],[0,[0,108,new MlString("#955")],[0,[0,109,new MlString("#956")],[0,[0,110,new MlString("#957")],[0,[0,120,new MlString("#958")],[0,[0,111,new MlString("#959")],[0,[0,112,new MlString("#960")],[0,[0,114,new MlString("#961")],[0,[0,115,new MlString("#963")],[0,[0,117,new MlString("#965")],[0,[0,99,new MlString("#967")],[0,[0,119,new MlString("#969")],[0,[0,121,new MlString("#968")],0]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]],cZ=[0,new MlString("parser.ml"),153,8],cY=[0,new MlString("parser.ml"),171,12],cX=[0,new MlString("parser.ml"),194,8],cW=[0,new MlString("parser.ml"),207,16],cV=[0,new MlString("parser.ml"),215,20],cU=[0,new MlString("parser.ml"),220,16],cT=[0,new MlString("parser.ml"),228,20],cS=[0,new MlString("parser.ml"),234,12],cR=[0,new MlString("parser.ml"),283,8],cQ=[0,new MlString("parser.ml"),299,12],cP=[0,new MlString("parser.ml"),258,8],cO=[0,new MlString("parser.ml"),278,12],cN=[0,new MlString("parser.ml"),323,8],cM=[0,new MlString("parser.ml"),380,16],cL=[0,new MlString("parser.ml"),384,12],cK=[0,new MlString("parser.ml"),422,8],cJ=[0,new MlString("parser.ml"),433,12],cI=[0,new MlString("parser.ml"),440,8],cH=[0,new MlString("parser.ml"),477,12],cG=[0,new MlString("parser.ml"),484,8],cF=[0,new MlString("parser.ml"),501,16],cE=[0,new MlString("parser.ml"),507,20],cD=[0,new MlString("parser.ml"),512,16],cC=[0,new MlString("parser.ml"),523,20],cB=[0,new MlString("parser.ml"),529,12],cA=[0,new MlString("parser.ml"),536,8],cz=[0,new MlString("parser.ml"),547,12],cy=[0,new MlString("parser.ml"),404,8],cx=[0,new MlString("parser.ml"),415,12],cw=[0,new MlString("parser.ml"),554,8],cv=[0,new MlString("parser.ml"),585,16],cu=[0,new MlString("parser.ml"),609,20],ct=[0,new MlString("parser.ml"),567,16],cs=[0,new MlString("parser.ml"),580,20],cr=[0,new MlString("parser.ml"),615,12],cq=[0,new MlString("parser.ml"),629,8],cp=[0,new MlString("parser.ml"),675,12],co=[0,new MlString("parser.ml"),680,8],cn=[0,new MlString("parser.ml"),729,12],cm=[0,new MlString("parser.ml"),739,4],cl=[0,new MlString("parser.ml"),783,8],ck=[0,new MlString("parser.ml"),791,4],cj=[0,new MlString("parser.ml"),835,8],ci=[0,new MlString("parser.ml"),843,4],ch=[0,new MlString("parser.ml"),889,8],cg=[0,new MlString("parser.ml"),913,8],cf=[0,new MlString("parser.ml"),921,12],ce=[0,new MlString("parser.ml"),1125,8],cd=[0,new MlString("parser.ml"),1136,12],cc=[0,new MlString("parser.ml"),939,8],cb=[0,new MlString("parser.ml"),950,12],ca=[0,new MlString("parser.ml"),957,8],b$=[0,new MlString("parser.ml"),968,12],b_=[0,new MlString("parser.ml"),975,8],b9=[0,new MlString("parser.ml"),986,12],b8=[0,new MlString("parser.ml"),993,8],b7=[0,new MlString("parser.ml"),1030,12],b6=[0,new MlString("parser.ml"),1037,8],b5=[0,new MlString("parser.ml"),1054,16],b4=[0,new MlString("parser.ml"),1060,20],b3=[0,new MlString("parser.ml"),1065,16],b2=[0,new MlString("parser.ml"),1076,20],b1=[0,new MlString("parser.ml"),1082,12],b0=[0,new MlString("parser.ml"),1089,8],bZ=[0,new MlString("parser.ml"),1100,12],bY=[0,new MlString("parser.ml"),1107,8],bX=[0,new MlString("parser.ml"),1118,12],bW=[3,32],bV=[0,new MlString("parser.ml"),1218,8],bU=[0,new MlString("parser.ml"),1268,8],bT=[0,new MlString("parser.ml"),1470,8],bS=[0,new MlString("parser.ml"),1481,12],bR=[0,new MlString("parser.ml"),1452,8],bQ=[0,new MlString("parser.ml"),1463,12],bP=[0,new MlString("parser.ml"),1278,8],bO=[0,new MlString("parser.ml"),1289,12],bN=[0,new MlString("parser.ml"),1302,8],bM=[0,new MlString("parser.ml"),1313,12],bL=[0,new MlString("parser.ml"),1320,8],bK=[0,new MlString("parser.ml"),1357,12],bJ=[0,new MlString("parser.ml"),1364,8],bI=[0,new MlString("parser.ml"),1381,16],bH=[0,new MlString("parser.ml"),1387,20],bG=[0,new MlString("parser.ml"),1392,16],bF=[0,new MlString("parser.ml"),1403,20],bE=[0,new MlString("parser.ml"),1409,12],bD=[0,new MlString("parser.ml"),1416,8],bC=[0,new MlString("parser.ml"),1427,12],bB=[0,new MlString("parser.ml"),1434,8],bA=[0,new MlString("parser.ml"),1445,12],bz=[0,new MlString("parser.ml"),1560,8],by=[0,new MlString("parser.ml"),1582,12],bx=[0,new MlString("parser.ml"),1614,8],bw=[0,new MlString("parser.ml"),1636,12],bv=[0,new MlString("parser.ml"),1587,8],bu=[0,new MlString("parser.ml"),1609,12],bt=[0,new MlString("parser.ml"),1648,8],bs=[0,new MlString("parser.ml"),1663,12],br=[0,new MlString("parser.ml"),1732,8],bq=[0,new MlString("parser.ml"),1804,12],bp=[0,new MlString("parser.ml"),1808,8],bo=[3,45],bn=[0,new MlString("parser.ml"),1893,8],bm=[0,new MlString("parser.ml"),1945,8],bl=[0,new MlString("parser.ml"),1997,8],bk=[3,32],bj=[0,new MlString("parser.ml"),2111,12],bi=[0,new MlString("parser.ml"),2115,8],bh=[3,45],bg=[0,new MlString("parser.ml"),2198,8],bf=[0,new MlString("parser.ml"),2248,8],be=[0,new MlString("parser.ml"),2298,8],bd=[0,new MlString("parser.ml"),2400,12],bc=[0,new MlString("parser.ml"),2404,8],bb=[0,new MlString("parser.ml"),2456,8],ba=[0,new MlString("parser.ml"),2473,8],a$=[3,33],a_=[0,new MlString("parser.ml"),2545,12],a9=[0,new MlString("parser.ml"),2549,8],a8=[3,32],a7=[0,new MlString("parser.ml"),2633,12],a6=[0,new MlString("parser.ml"),2637,8],a5=[3,42],a4=[3,35],a3=[3,43],a2=[3,45],a1=[0,new MlString("parser.ml"),2741,8],a0=[0,new MlString("parser.ml"),2791,8],aZ=[0,new MlString("parser.ml"),2841,8],aY=[0,new MlString("parser.ml"),2923,8],aX=[0,new MlString("parser.ml"),2993,12],aW=[0,new MlString("parser.ml"),2997,8],aV=[0,new MlString("parser.ml"),3016,8],aU=[3,33],aT=[0,new MlString("parser.ml"),3033,8],aS=[3,33],aR=[0,new MlString("parser.ml"),3051,8],aQ=[0,new MlString("parser.ml"),3068,8],aP=[0,new MlString("parser.ml"),3089,16],aO=[0,new MlString("parser.ml"),3093,12],aN=[0,new MlString("parser.ml"),3172,8],aM=[0,new MlString("parser.ml"),3180,12],aL=[0,new MlString("parser.ml"),3148,8],aK=[0,new MlString("parser.ml"),3156,12],aJ=[0,new MlString("parser.ml"),3137,8],aI=[0,new MlString("parser.ml"),3143,12],aH=[0,new MlString("parser.ml"),3190,4],aG=[0,new MlString("parser.ml"),3294,12],aF=[0,new MlString("parser.ml"),3242,12],aE=[0,new MlString("parser.ml"),3322,8],aD=[0,new MlString("parser.ml"),3339,8],aC=[0,new MlString("parser.ml"),3347,12],aB=[0,new MlString("parser.ml"),3366,8],aA=[0,new MlString("parser.ml"),3396,16],az=[0,new MlString("parser.ml"),3404,12],ay=[0,new MlString("parser.ml"),3425,8],ax=[0,[0,new MlString("")],0],aw=new MlString("Internal failure -- please contact the parser generator's developers.\n%!"),av=[0,new MlString("parser.ml"),3640,4],au=[0,new MlString("parser.ml"),3674,8],at=[0,new MlString("parser.ml"),3692,8],as=[0,new MlString("parser.ml"),3706,8],ar=[0,new MlString("parser.ml"),3720,8],aq=[0,new MlString("parser.ml"),3766,8],ap=[0,new MlString("parser.ml"),3864,8],ao=[0,new MlString("parser.ml"),3886,12],an=[0,new MlString("parser.ml"),3837,8],am=[0,new MlString("parser.ml"),3859,12],al=[0,new MlString("parser.ml"),3810,8],ak=[0,new MlString("parser.ml"),3832,12],aj=[0,new MlString("parser.ml"),3783,8],ai=[0,new MlString("parser.ml"),3805,12],ah=[0,new MlString("parser.ml"),4198,8],ag=[0,new MlString("parser.ml"),4214,4],af=[0,new MlString("parser.ml"),4222,8],ae=[0,[0,[0,[0,new MlString("")],0],0],0],ad=new MlString("Parser.Error"),ac=new MlString("At offset %d: unexpected character '%c'.\n"),ab=new MlString("\n"),aa=new MlString("Lexer.Error"),$=new MlString("td"),_=new MlString(">"),Z=new MlString("<"),Y=new MlString(">"),X=new MlString("</"),W=new MlString("<tr>"),V=new MlString("</tr>"),U=new MlString("<li>"),T=new MlString("</li>"),S=new MlString("<ul>"),R=new MlString("</ul>"),Q=new MlString("<div style=\"page-break-after:always;\"></div>"),P=new MlString(">"),O=new MlString("h"),N=new MlString("</"),M=new MlString("<p>"),L=new MlString("</p>"),K=new MlString("<table>"),J=new MlString("th"),I=new MlString("</table>"),H=new MlString("<br />"),G=new MlString("<sup>"),F=new MlString("</sup>"),E=new MlString("<sub>"),D=new MlString("</sub>"),C=new MlString("&#38;"),B=new MlString(" is not greek letter shortcut."),A=new MlString("<code>"),z=new MlString("</code>"),y=new MlString("<em>"),x=new MlString("</em>"),w=new MlString("<strong>"),v=new MlString("</strong>"),u=new MlString("<a href=\""),t=new MlString("\">"),s=new MlString("</a>"),r=new MlString("<img src=\""),q=new MlString("\" alt=\""),p=new MlString("\" />"),o=new MlString("<code data-pastek-cmd=\""),n=new MlString("\"><pre>"),m=new MlString("</pre></code>"),l=new MlString("%s%!"),k=new MlString("Line %d, column %d: syntax error.\n%!"),j=new MlString("mk_html");function i(g){throw [0,a,g];}function dz(h){throw [0,b,h];}var dH=(1<<31)-1|0;function dG(dA,dC){var dB=dA.getLen(),dD=dC.getLen(),dE=caml_create_string(dB+dD|0);caml_blit_string(dA,0,dE,0,dB);caml_blit_string(dC,0,dE,dB,dD);return dE;}function dI(dF){return caml_format_int(dw,dF);}var dJ=caml_ml_open_descriptor_out(2);function dR(dL,dK){return caml_ml_output(dL,dK,0,dK.getLen());}function dQ(dP){var dM=caml_ml_out_channels_list(0);for(;;){if(dM){var dN=dM[2];try {}catch(dO){}var dM=dN;continue;}return 0;}}caml_register_named_value(dt,dQ);function dV(dT,dS){return caml_ml_output_char(dT,dS);}function ef(dU){return caml_ml_flush(dU);}function ee(dX){var dW=0,dY=dX;for(;;){if(dY){var d0=dY[2],dZ=dW+1|0,dW=dZ,dY=d0;continue;}return dW;}}function eg(d1){var d2=d1,d3=0;for(;;){if(d2){var d4=d2[2],d5=[0,d2[1],d3],d2=d4,d3=d5;continue;}return d3;}}function d_(d7,d6){if(d6){var d9=d6[2],d$=d8(d7,d6[1]);return [0,d$,d_(d7,d9)];}return 0;}function eh(ec,ea){var eb=ea;for(;;){if(eb){var ed=eb[2];d8(ec,eb[1]);var eb=ed;continue;}return 0;}}function eu(ei,ek){var ej=caml_create_string(ei);caml_fill_string(ej,0,ei,ek);return ej;}function ev(en,el,em){if(0<=el&&0<=em&&!((en.getLen()-em|0)<el)){var eo=caml_create_string(em);caml_blit_string(en,el,eo,0,em);return eo;}return dz(di);}function ew(er,eq,et,es,ep){if(0<=ep&&0<=eq&&!((er.getLen()-ep|0)<eq)&&0<=es&&!((et.getLen()-ep|0)<es))return caml_blit_string(er,eq,et,es,ep);return dz(dj);}var ex=caml_sys_get_config(0)[2],ey=caml_mul(ex/8|0,(1<<(ex-10|0))-1|0)-1|0;function eN(eB,eA,ez){var eC=caml_lex_engine(eB,eA,ez);if(0<=eC){ez[11]=ez[12];var eD=ez[12];ez[12]=[0,eD[1],eD[2],eD[3],ez[4]+ez[6]|0];}return eC;}function eO(eI,eF,eE){var eG=eE-eF|0,eH=caml_create_string(eG);caml_blit_string(eI[2],eF,eH,0,eG);return eH;}function eP(eJ,eK){return eJ[2].safeGet(eK);}function eQ(eL){var eM=eL[12];eL[12]=[0,eM[1],eM[2]+1|0,eM[4],eM[4]];return 0;}function e8(eR){var eS=1<=eR?eR:1,eT=ey<eS?ey:eS,eU=caml_create_string(eT);return [0,eU,0,eT,eU];}function e9(eV){return ev(eV[1],0,eV[2]);}function e2(eW,eY){var eX=[0,eW[3]];for(;;){if(eX[1]<(eW[2]+eY|0)){eX[1]=2*eX[1]|0;continue;}if(ey<eX[1])if((eW[2]+eY|0)<=ey)eX[1]=ey;else i(dg);var eZ=caml_create_string(eX[1]);ew(eW[1],0,eZ,0,eW[2]);eW[1]=eZ;eW[3]=eX[1];return 0;}}function e_(e0,e3){var e1=e0[2];if(e0[3]<=e1)e2(e0,1);e0[1].safeSet(e1,e3);e0[2]=e1+1|0;return 0;}function e$(e6,e4){var e5=e4.getLen(),e7=e6[2]+e5|0;if(e6[3]<e7)e2(e6,e5);ew(e4,0,e6[1],e6[2],e5);e6[2]=e7;return 0;}function fd(fa){return 0<=fa?fa:i(dG(c1,dI(fa)));}function fe(fb,fc){return fd(fb+fc|0);}var ff=d8(fe,1);function fm(fg){return ev(fg,0,fg.getLen());}function fo(fh,fi,fk){var fj=dG(c4,dG(fh,c5)),fl=dG(c3,dG(dI(fi),fj));return dz(dG(c2,dG(eu(1,fk),fl)));}function gd(fn,fq,fp){return fo(fm(fn),fq,fp);}function ge(fr){return dz(dG(c6,dG(fm(fr),c7)));}function fL(fs,fA,fC,fE){function fz(ft){if((fs.safeGet(ft)-48|0)<0||9<(fs.safeGet(ft)-48|0))return ft;var fu=ft+1|0;for(;;){var fv=fs.safeGet(fu);if(48<=fv){if(!(58<=fv)){var fx=fu+1|0,fu=fx;continue;}var fw=0;}else if(36===fv){var fy=fu+1|0,fw=1;}else var fw=0;if(!fw)var fy=ft;return fy;}}var fB=fz(fA+1|0),fD=e8((fC-fB|0)+10|0);e_(fD,37);var fF=fB,fG=eg(fE);for(;;){if(fF<=fC){var fH=fs.safeGet(fF);if(42===fH){if(fG){var fI=fG[2];e$(fD,dI(fG[1]));var fJ=fz(fF+1|0),fF=fJ,fG=fI;continue;}throw [0,d,c8];}e_(fD,fH);var fK=fF+1|0,fF=fK;continue;}return e9(fD);}}function hD(fR,fP,fO,fN,fM){var fQ=fL(fP,fO,fN,fM);if(78!==fR&&110!==fR)return fQ;fQ.safeSet(fQ.getLen()-1|0,117);return fQ;}function gf(fY,f8,gb,fS,ga){var fT=fS.getLen();function f_(fU,f7){var fV=40===fU?41:125;function f6(fW){var fX=fW;for(;;){if(fT<=fX)return d8(fY,fS);if(37===fS.safeGet(fX)){var fZ=fX+1|0;if(fT<=fZ)var f0=d8(fY,fS);else{var f1=fS.safeGet(fZ),f2=f1-40|0;if(f2<0||1<f2){var f3=f2-83|0;if(f3<0||2<f3)var f4=1;else switch(f3){case 1:var f4=1;break;case 2:var f5=1,f4=0;break;default:var f5=0,f4=0;}if(f4){var f0=f6(fZ+1|0),f5=2;}}else var f5=0===f2?0:1;switch(f5){case 1:var f0=f1===fV?fZ+1|0:f9(f8,fS,f7,f1);break;case 2:break;default:var f0=f6(f_(f1,fZ+1|0)+1|0);}}return f0;}var f$=fX+1|0,fX=f$;continue;}}return f6(f7);}return f_(gb,ga);}function gF(gc){return f9(gf,ge,gd,gc);}function gV(gg,gr,gB){var gh=gg.getLen()-1|0;function gD(gi){var gj=gi;a:for(;;){if(gj<gh){if(37===gg.safeGet(gj)){var gk=0,gl=gj+1|0;for(;;){if(gh<gl)var gm=ge(gg);else{var gn=gg.safeGet(gl);if(58<=gn){if(95===gn){var gp=gl+1|0,go=1,gk=go,gl=gp;continue;}}else if(32<=gn)switch(gn-32|0){case 1:case 2:case 4:case 5:case 6:case 7:case 8:case 9:case 12:case 15:break;case 0:case 3:case 11:case 13:var gq=gl+1|0,gl=gq;continue;case 10:var gs=f9(gr,gk,gl,105),gl=gs;continue;default:var gt=gl+1|0,gl=gt;continue;}var gu=gl;c:for(;;){if(gh<gu)var gv=ge(gg);else{var gw=gg.safeGet(gu);if(126<=gw)var gx=0;else switch(gw){case 78:case 88:case 100:case 105:case 111:case 117:case 120:var gv=f9(gr,gk,gu,105),gx=1;break;case 69:case 70:case 71:case 101:case 102:case 103:var gv=f9(gr,gk,gu,102),gx=1;break;case 33:case 37:case 44:case 64:var gv=gu+1|0,gx=1;break;case 83:case 91:case 115:var gv=f9(gr,gk,gu,115),gx=1;break;case 97:case 114:case 116:var gv=f9(gr,gk,gu,gw),gx=1;break;case 76:case 108:case 110:var gy=gu+1|0;if(gh<gy){var gv=f9(gr,gk,gu,105),gx=1;}else{var gz=gg.safeGet(gy)-88|0;if(gz<0||32<gz)var gA=1;else switch(gz){case 0:case 12:case 17:case 23:case 29:case 32:var gv=gC(gB,f9(gr,gk,gu,gw),105),gx=1,gA=0;break;default:var gA=1;}if(gA){var gv=f9(gr,gk,gu,105),gx=1;}}break;case 67:case 99:var gv=f9(gr,gk,gu,99),gx=1;break;case 66:case 98:var gv=f9(gr,gk,gu,66),gx=1;break;case 41:case 125:var gv=f9(gr,gk,gu,gw),gx=1;break;case 40:var gv=gD(f9(gr,gk,gu,gw)),gx=1;break;case 123:var gE=f9(gr,gk,gu,gw),gG=f9(gF,gw,gg,gE),gH=gE;for(;;){if(gH<(gG-2|0)){var gI=gC(gB,gH,gg.safeGet(gH)),gH=gI;continue;}var gJ=gG-1|0,gu=gJ;continue c;}default:var gx=0;}if(!gx)var gv=gd(gg,gu,gw);}var gm=gv;break;}}var gj=gm;continue a;}}var gK=gj+1|0,gj=gK;continue;}return gj;}}gD(0);return 0;}function iU(gW){var gL=[0,0,0,0];function gU(gQ,gR,gM){var gN=41!==gM?1:0,gO=gN?125!==gM?1:0:gN;if(gO){var gP=97===gM?2:1;if(114===gM)gL[3]=gL[3]+1|0;if(gQ)gL[2]=gL[2]+gP|0;else gL[1]=gL[1]+gP|0;}return gR+1|0;}gV(gW,gU,function(gS,gT){return gS+1|0;});return gL[1];}function hz(gX,g0,gY){var gZ=gX.safeGet(gY);if((gZ-48|0)<0||9<(gZ-48|0))return gC(g0,0,gY);var g1=gZ-48|0,g2=gY+1|0;for(;;){var g3=gX.safeGet(g2);if(48<=g3){if(!(58<=g3)){var g6=g2+1|0,g5=(10*g1|0)+(g3-48|0)|0,g1=g5,g2=g6;continue;}var g4=0;}else if(36===g3)if(0===g1){var g7=i(c_),g4=1;}else{var g7=gC(g0,[0,fd(g1-1|0)],g2+1|0),g4=1;}else var g4=0;if(!g4)var g7=gC(g0,0,gY);return g7;}}function hu(g8,g9){return g8?g9:d8(ff,g9);}function hj(g_,g$){return g_?g_[1]:g$;}function kl(jj,hb,jv,jk,iZ,jB,ha){var hc=d8(hb,ha);function iY(hh,jA,hd,hm){var hg=hd.getLen();function iV(js,he){var hf=he;for(;;){if(hg<=hf)return d8(hh,hc);var hi=hd.safeGet(hf);if(37===hi){var hq=function(hl,hk){return caml_array_get(hm,hj(hl,hk));},hw=function(hy,hr,ht,hn){var ho=hn;for(;;){var hp=hd.safeGet(ho)-32|0;if(!(hp<0||25<hp))switch(hp){case 1:case 2:case 4:case 5:case 6:case 7:case 8:case 9:case 12:case 15:break;case 10:return hz(hd,function(hs,hx){var hv=[0,hq(hs,hr),ht];return hw(hy,hu(hs,hr),hv,hx);},ho+1|0);default:var hA=ho+1|0,ho=hA;continue;}var hB=hd.safeGet(ho);if(124<=hB)var hC=0;else switch(hB){case 78:case 88:case 100:case 105:case 111:case 117:case 120:var hE=hq(hy,hr),hF=caml_format_int(hD(hB,hd,hf,ho,ht),hE),hH=hG(hu(hy,hr),hF,ho+1|0),hC=1;break;case 69:case 71:case 101:case 102:case 103:var hI=hq(hy,hr),hJ=caml_format_float(fL(hd,hf,ho,ht),hI),hH=hG(hu(hy,hr),hJ,ho+1|0),hC=1;break;case 76:case 108:case 110:var hK=hd.safeGet(ho+1|0)-88|0;if(hK<0||32<hK)var hL=1;else switch(hK){case 0:case 12:case 17:case 23:case 29:case 32:var hM=ho+1|0,hN=hB-108|0;if(hN<0||2<hN)var hO=0;else{switch(hN){case 1:var hO=0,hP=0;break;case 2:var hQ=hq(hy,hr),hR=caml_format_int(fL(hd,hf,hM,ht),hQ),hP=1;break;default:var hS=hq(hy,hr),hR=caml_format_int(fL(hd,hf,hM,ht),hS),hP=1;}if(hP){var hT=hR,hO=1;}}if(!hO){var hU=hq(hy,hr),hT=caml_int64_format(fL(hd,hf,hM,ht),hU);}var hH=hG(hu(hy,hr),hT,hM+1|0),hC=1,hL=0;break;default:var hL=1;}if(hL){var hV=hq(hy,hr),hW=caml_format_int(hD(110,hd,hf,ho,ht),hV),hH=hG(hu(hy,hr),hW,ho+1|0),hC=1;}break;case 37:case 64:var hH=hG(hr,eu(1,hB),ho+1|0),hC=1;break;case 83:case 115:var hX=hq(hy,hr);if(115===hB)var hY=hX;else{var hZ=[0,0],h0=0,h1=hX.getLen()-1|0;if(!(h1<h0)){var h2=h0;for(;;){var h3=hX.safeGet(h2),h4=14<=h3?34===h3?1:92===h3?1:0:11<=h3?13<=h3?1:0:8<=h3?1:0,h5=h4?2:caml_is_printable(h3)?1:4;hZ[1]=hZ[1]+h5|0;var h6=h2+1|0;if(h1!==h2){var h2=h6;continue;}break;}}if(hZ[1]===hX.getLen())var h7=hX;else{var h8=caml_create_string(hZ[1]);hZ[1]=0;var h9=0,h_=hX.getLen()-1|0;if(!(h_<h9)){var h$=h9;for(;;){var ia=hX.safeGet(h$),ib=ia-34|0;if(ib<0||58<ib)if(-20<=ib)var ic=1;else{switch(ib+34|0){case 8:h8.safeSet(hZ[1],92);hZ[1]+=1;h8.safeSet(hZ[1],98);var id=1;break;case 9:h8.safeSet(hZ[1],92);hZ[1]+=1;h8.safeSet(hZ[1],116);var id=1;break;case 10:h8.safeSet(hZ[1],92);hZ[1]+=1;h8.safeSet(hZ[1],110);var id=1;break;case 13:h8.safeSet(hZ[1],92);hZ[1]+=1;h8.safeSet(hZ[1],114);var id=1;break;default:var ic=1,id=0;}if(id)var ic=0;}else var ic=(ib-1|0)<0||56<(ib-1|0)?(h8.safeSet(hZ[1],92),hZ[1]+=1,h8.safeSet(hZ[1],ia),0):1;if(ic)if(caml_is_printable(ia))h8.safeSet(hZ[1],ia);else{h8.safeSet(hZ[1],92);hZ[1]+=1;h8.safeSet(hZ[1],48+(ia/100|0)|0);hZ[1]+=1;h8.safeSet(hZ[1],48+((ia/10|0)%10|0)|0);hZ[1]+=1;h8.safeSet(hZ[1],48+(ia%10|0)|0);}hZ[1]+=1;var ie=h$+1|0;if(h_!==h$){var h$=ie;continue;}break;}}var h7=h8;}var hY=dG(dc,dG(h7,dd));}if(ho===(hf+1|0))var ig=hY;else{var ih=fL(hd,hf,ho,ht);try {var ii=0,ij=1;for(;;){if(ih.getLen()<=ij)var ik=[0,0,ii];else{var il=ih.safeGet(ij);if(49<=il)if(58<=il)var im=0;else{var ik=[0,caml_int_of_string(ev(ih,ij,(ih.getLen()-ij|0)-1|0)),ii],im=1;}else{if(45===il){var ip=ij+1|0,io=1,ii=io,ij=ip;continue;}var im=0;}if(!im){var iq=ij+1|0,ij=iq;continue;}}var ir=ik;break;}}catch(is){if(is[1]!==a)throw is;var ir=fo(ih,0,115);}var it=ir[1],iu=hY.getLen(),iv=0,iz=ir[2],iy=32;if(it===iu&&0===iv){var iw=hY,ix=1;}else var ix=0;if(!ix)if(it<=iu)var iw=ev(hY,iv,iu);else{var iA=eu(it,iy);if(iz)ew(hY,iv,iA,0,iu);else ew(hY,iv,iA,it-iu|0,iu);var iw=iA;}var ig=iw;}var hH=hG(hu(hy,hr),ig,ho+1|0),hC=1;break;case 67:case 99:var iB=hq(hy,hr);if(99===hB)var iC=eu(1,iB);else{if(39===iB)var iD=dk;else if(92===iB)var iD=dl;else{if(14<=iB)var iE=0;else switch(iB){case 8:var iD=dq,iE=1;break;case 9:var iD=dp,iE=1;break;case 10:var iD=dn,iE=1;break;case 13:var iD=dm,iE=1;break;default:var iE=0;}if(!iE)if(caml_is_printable(iB)){var iF=caml_create_string(1);iF.safeSet(0,iB);var iD=iF;}else{var iG=caml_create_string(4);iG.safeSet(0,92);iG.safeSet(1,48+(iB/100|0)|0);iG.safeSet(2,48+((iB/10|0)%10|0)|0);iG.safeSet(3,48+(iB%10|0)|0);var iD=iG;}}var iC=dG(da,dG(iD,db));}var hH=hG(hu(hy,hr),iC,ho+1|0),hC=1;break;case 66:case 98:var iI=ho+1|0,iH=hq(hy,hr)?dv:du,hH=hG(hu(hy,hr),iH,iI),hC=1;break;case 40:case 123:var iJ=hq(hy,hr),iK=f9(gF,hB,hd,ho+1|0);if(123===hB){var iL=e8(iJ.getLen()),iP=function(iN,iM){e_(iL,iM);return iN+1|0;};gV(iJ,function(iO,iR,iQ){if(iO)e$(iL,c9);else e_(iL,37);return iP(iR,iQ);},iP);var iS=e9(iL),hH=hG(hu(hy,hr),iS,iK),hC=1;}else{var iT=hu(hy,hr),iW=fe(iU(iJ),iT),hH=iY(function(iX){return iV(iW,iK);},iT,iJ,hm),hC=1;}break;case 33:d8(iZ,hc);var hH=iV(hr,ho+1|0),hC=1;break;case 41:var hH=hG(hr,df,ho+1|0),hC=1;break;case 44:var hH=hG(hr,de,ho+1|0),hC=1;break;case 70:var i0=hq(hy,hr);if(0===ht){var i1=caml_format_float(dy,i0),i2=0,i3=i1.getLen();for(;;){if(i3<=i2)var i4=dG(i1,dx);else{var i5=i1.safeGet(i2),i6=48<=i5?58<=i5?0:1:45===i5?1:0;if(i6){var i7=i2+1|0,i2=i7;continue;}var i4=i1;}var i8=i4;break;}}else{var i9=fL(hd,hf,ho,ht);if(70===hB)i9.safeSet(i9.getLen()-1|0,103);var i_=caml_format_float(i9,i0);if(3<=caml_classify_float(i0))var i$=i_;else{var ja=0,jb=i_.getLen();for(;;){if(jb<=ja)var jc=dG(i_,c$);else{var jd=i_.safeGet(ja)-46|0,je=jd<0||23<jd?55===jd?1:0:(jd-1|0)<0||21<(jd-1|0)?1:0;if(!je){var jf=ja+1|0,ja=jf;continue;}var jc=i_;}var i$=jc;break;}}var i8=i$;}var hH=hG(hu(hy,hr),i8,ho+1|0),hC=1;break;case 91:var hH=gd(hd,ho,hB),hC=1;break;case 97:var jg=hq(hy,hr),jh=d8(ff,hj(hy,hr)),ji=hq(0,jh),jm=ho+1|0,jl=hu(hy,jh);if(jj)gC(jk,hc,gC(jg,0,ji));else gC(jg,hc,ji);var hH=iV(jl,jm),hC=1;break;case 114:var hH=gd(hd,ho,hB),hC=1;break;case 116:var jn=hq(hy,hr),jp=ho+1|0,jo=hu(hy,hr);if(jj)gC(jk,hc,d8(jn,0));else d8(jn,hc);var hH=iV(jo,jp),hC=1;break;default:var hC=0;}if(!hC)var hH=gd(hd,ho,hB);return hH;}},ju=hf+1|0,jr=0;return hz(hd,function(jt,jq){return hw(jt,js,jr,jq);},ju);}gC(jv,hc,hi);var jw=hf+1|0,hf=jw;continue;}}function hG(jz,jx,jy){gC(jk,hc,jx);return iV(jz,jy);}return iV(jA,0);}var jC=gC(iY,jB,fd(0)),jD=iU(ha);if(jD<0||6<jD){var jQ=function(jE,jK){if(jD<=jE){var jF=caml_make_vect(jD,0),jI=function(jG,jH){return caml_array_set(jF,(jD-jG|0)-1|0,jH);},jJ=0,jL=jK;for(;;){if(jL){var jM=jL[2],jN=jL[1];if(jM){jI(jJ,jN);var jO=jJ+1|0,jJ=jO,jL=jM;continue;}jI(jJ,jN);}return gC(jC,ha,jF);}}return function(jP){return jQ(jE+1|0,[0,jP,jK]);};},jR=jQ(0,0);}else switch(jD){case 1:var jR=function(jT){var jS=caml_make_vect(1,0);caml_array_set(jS,0,jT);return gC(jC,ha,jS);};break;case 2:var jR=function(jV,jW){var jU=caml_make_vect(2,0);caml_array_set(jU,0,jV);caml_array_set(jU,1,jW);return gC(jC,ha,jU);};break;case 3:var jR=function(jY,jZ,j0){var jX=caml_make_vect(3,0);caml_array_set(jX,0,jY);caml_array_set(jX,1,jZ);caml_array_set(jX,2,j0);return gC(jC,ha,jX);};break;case 4:var jR=function(j2,j3,j4,j5){var j1=caml_make_vect(4,0);caml_array_set(j1,0,j2);caml_array_set(j1,1,j3);caml_array_set(j1,2,j4);caml_array_set(j1,3,j5);return gC(jC,ha,j1);};break;case 5:var jR=function(j7,j8,j9,j_,j$){var j6=caml_make_vect(5,0);caml_array_set(j6,0,j7);caml_array_set(j6,1,j8);caml_array_set(j6,2,j9);caml_array_set(j6,3,j_);caml_array_set(j6,4,j$);return gC(jC,ha,j6);};break;case 6:var jR=function(kb,kc,kd,ke,kf,kg){var ka=caml_make_vect(6,0);caml_array_set(ka,0,kb);caml_array_set(ka,1,kc);caml_array_set(ka,2,kd);caml_array_set(ka,3,ke);caml_array_set(ka,4,kf);caml_array_set(ka,5,kg);return gC(jC,ha,ka);};break;default:var jR=gC(jC,ha,[0]);}return jR;}function kz(ki){function kk(kh){return 0;}return km(kl,0,function(kj){return ki;},dV,dR,ef,kk);}function kv(kn){return e8(2*kn.getLen()|0);}function ks(kq,ko){var kp=e9(ko);ko[2]=0;return d8(kq,kp);}function ky(kr){var ku=d8(ks,kr);return km(kl,1,kv,e_,e$,function(kt){return 0;},ku);}function kK(kx){return gC(ky,function(kw){return kw;},kx);}function kJ(kA,kD){var kB=kA[2],kC=kA[1],kE=kD[2],kF=kD[1];if(1!==kF&&0!==kB){var kG=kB?kB[2]:i(ds),kI=[0,kF-1|0,kE],kH=kB?kB[1]:i(dr);return [0,kC,[0,kJ(kH,kI),kG]];}return [0,kC,[0,[0,kE,0],kB]];}var kL=[0,ad],Ac=[0,kL];function mD(kR,kO,kN,kM){var kP=[0,kO,kN,kM];if(28<=kN)var kQ=53<=kN?54<=kN?0:2:49<=kN?1:0;else if(12===kN)var kQ=1;else if(20<=kN)switch(kN-20|0){case 3:case 7:var kQ=1;break;case 0:case 1:var kQ=2;break;default:var kQ=0;}else var kQ=0;switch(kQ){case 1:if(-1===kR[6])throw [0,d,cq];var kS=kR[3];if(typeof kS==="number")switch(kS){case 8:case 9:case 15:break;case 0:return k0(kR,kP,23);case 1:return k1(kR,kP,23);case 2:return k2(kR,kP,23);case 3:return k3(kR,kP,23);case 7:return k4(kR,kP,23);case 10:return k5(kR,kP,23);case 11:return k6(kR,kP,23);case 12:return k7(kR,kP,23);case 13:return k8(kR,kP,23);case 16:return k9(kR,kP,23);case 17:return k_(kR,kP,23);case 18:return k$(kR,kP,23);case 19:return la(kR,kP,23);default:return lb(kR,kP,23);}else switch(kS[0]){case 1:return kT(kR,kP,23,kS[1]);case 2:return kU(kR,kP,23,kS[1]);case 3:return kV(kR,kP,23,kS[1]);case 4:return kW(kR,kP,23,kS[1]);case 5:return kX(kR,kP,23,kS[1]);case 6:return kY(kR,kP,23,kS[1]);case 7:break;default:return kZ(kR,kP,23,kS[1]);}if(-1===kR[6])throw [0,d,cp];kR[6]=-1;return lc(kR,kP,23);case 2:if(-1===kR[6])throw [0,d,co];var ld=kR[3];if(typeof ld==="number")switch(ld){case 0:return k0(kR,kP,21);case 1:return k1(kR,kP,21);case 2:return k2(kR,kP,21);case 3:return k3(kR,kP,21);case 7:return k4(kR,kP,21);case 8:var le=kP[1],lf=kP[2],lg=[0,kP[3],0];for(;;){var lh=[0,le,lf,lg],li=lf-20|0;if(li<0||1<li)if(33===li)var lj=0;else{var ll=lk(0),lj=1;}else{if(0!==li){var lm=lh[1],lp=[0,lm[3],lh[3]],lo=lm[2],ln=lm[1],le=ln,lf=lo,lg=lp;continue;}var lj=0;}if(!lj){if(-1===kR[6])throw [0,d,cN];var lq=kR[3];if(typeof lq==="number"&&8===lq){var ls=lr(kR);if(typeof ls==="number")switch(ls){case 0:var ll=k0(kR,lh,20),lu=1,lt=0;break;case 1:var ll=k1(kR,lh,20),lu=1,lt=0;break;case 2:var ll=k2(kR,lh,20),lu=1,lt=0;break;case 3:var ll=k3(kR,lh,20),lu=1,lt=0;break;case 7:var ll=k4(kR,lh,20),lu=1,lt=0;break;case 10:var ll=k5(kR,lh,20),lu=1,lt=0;break;case 11:var ll=k6(kR,lh,20),lu=1,lt=0;break;case 12:var ll=k7(kR,lh,20),lu=1,lt=0;break;case 13:var ll=k8(kR,lh,20),lu=1,lt=0;break;case 14:var lv=lh[1],lw=lh[2],lx=[0,lh[3],0];for(;;){if(20===lw){var lA=[0,lv[3],lx],lz=lv[2],ly=lv[1],lv=ly,lw=lz,lx=lA;continue;}if(53===lw){if(-1===kR[6])throw [0,d,cX];var lB=kR[3];if(typeof lB==="number"&&14===lB){lr(kR);var lC=lv[2],lD=[0,lv[1],lC,lx];if(19<=lC)if(54===lC){if(-1===kR[6])throw [0,d,cW];var lE=kR[3];if(typeof lE==="number")if(7<=lE)if(8<=lE)var lF=1;else{var lH=lG(kR,lD,19),lJ=1,lI=0,lF=0;}else if(4<=lE){if(-1===kR[6])throw [0,d,cV];kR[6]=-1;var lH=lc(kR,lD,19),lJ=1,lI=0,lF=0;}else var lF=1;else var lF=1;if(lF){var lH=lK(kR,lD,19),lJ=1,lI=0;}}else var lI=1;else if(17<=lC){if(-1===kR[6])throw [0,d,cU];var lL=kR[3];if(typeof lL==="number"&&!(9<=lL))switch(lL){case 4:case 5:case 6:if(-1===kR[6])throw [0,d,cT];kR[6]=-1;var lH=lc(kR,lD,17),lJ=1,lI=0,lM=0;break;case 8:var lH=lN(kR,lD,17),lJ=1,lI=0,lM=0;break;default:var lM=1;}else var lM=1;if(lM){var lH=lO(kR,lD,17),lJ=1,lI=0;}}else var lI=1;if(lI){var lH=lk(0),lJ=1;}}else var lJ=0;if(!lJ){if(-1===kR[6])throw [0,d,cS];kR[6]=-1;var lH=lc(kR,lv,lw);}}else var lH=lk(0);var ll=lH,lu=1,lt=0;break;}break;case 16:var ll=k9(kR,lh,20),lu=1,lt=0;break;case 17:var ll=k_(kR,lh,20),lu=1,lt=0;break;case 18:var ll=k$(kR,lh,20),lu=1,lt=0;break;case 19:var ll=la(kR,lh,20),lu=1,lt=0;break;default:var lt=1;}else switch(ls[0]){case 1:var ll=kT(kR,lh,20,ls[1]),lu=1,lt=0;break;case 2:var ll=kU(kR,lh,20,ls[1]),lu=1,lt=0;break;case 3:var ll=kV(kR,lh,20,ls[1]),lu=1,lt=0;break;case 4:var ll=kW(kR,lh,20,ls[1]),lu=1,lt=0;break;case 5:var ll=kX(kR,lh,20,ls[1]),lu=1,lt=0;break;case 6:var ll=kY(kR,lh,20,ls[1]),lu=1,lt=0;break;case 7:var lt=1;break;default:var ll=kZ(kR,lh,20,ls[1]),lu=1,lt=0;}if(lt){if(-1===kR[6])throw [0,d,cM];kR[6]=-1;var ll=lc(kR,lh,20),lu=1;}}else var lu=0;if(!lu){if(-1===kR[6])throw [0,d,cL];kR[6]=-1;var ll=lc(kR,lh[1],lh[2]);}}return ll;}case 10:return k5(kR,kP,21);case 11:return k6(kR,kP,21);case 12:return k7(kR,kP,21);case 13:return k8(kR,kP,21);case 16:return k9(kR,kP,21);case 17:return k_(kR,kP,21);case 18:return k$(kR,kP,21);case 19:return la(kR,kP,21);default:}else switch(ld[0]){case 1:return kT(kR,kP,21,ld[1]);case 2:return kU(kR,kP,21,ld[1]);case 3:return kV(kR,kP,21,ld[1]);case 4:return kW(kR,kP,21,ld[1]);case 5:return kX(kR,kP,21,ld[1]);case 6:return kY(kR,kP,21,ld[1]);case 7:break;default:return kZ(kR,kP,21,ld[1]);}if(-1===kR[6])throw [0,d,cn];kR[6]=-1;return lc(kR,kP,21);default:return lk(0);}}function mI(lT,lR,lQ,lP){var lS=[0,lR,lQ,lP];if(-1===lT[6])throw [0,d,cm];var lU=lT[3];if(typeof lU==="number")switch(lU){case 4:case 5:case 6:case 16:return l2(lT,lS,34);case 0:return l3(lT,lS,34);case 1:return l4(lT,lS,34);case 2:return k2(lT,lS,34);case 3:return k3(lT,lS,34);case 7:return k4(lT,lS,34);case 10:return l5(lT,lS,34);case 11:return l6(lT,lS,34);case 12:return l7(lT,lS,34);case 13:return l8(lT,lS,34);case 17:return l9(lT,lS,34);case 18:return l_(lT,lS,34);case 19:return l$(lT,lS,34);default:}else switch(lU[0]){case 1:return lV(lT,lS,34,lU[1]);case 2:return lW(lT,lS,34,lU[1]);case 3:return lX(lT,lS,34,lU[1]);case 4:return lY(lT,lS,34,lU[1]);case 5:return lZ(lT,lS,34,lU[1]);case 6:return l0(lT,lS,34,lU[1]);case 7:break;default:return l1(lT,lS,34,lU[1]);}if(-1===lT[6])throw [0,d,cl];lT[6]=-1;return lc(lT,lS,34);}function oj(me,mc,mb,ma){var md=[0,mc,mb,ma];if(-1===me[6])throw [0,d,ck];var mf=me[3];if(typeof mf==="number")switch(mf){case 4:case 5:case 6:case 18:return mn(me,md,29);case 0:return mo(me,md,29);case 1:return mp(me,md,29);case 2:return k2(me,md,29);case 3:return k3(me,md,29);case 7:return k4(me,md,29);case 10:return mq(me,md,29);case 11:return mr(me,md,29);case 12:return ms(me,md,29);case 13:return mt(me,md,29);case 16:return mu(me,md,29);case 17:return mv(me,md,29);case 19:return mw(me,md,29);default:}else switch(mf[0]){case 1:return mg(me,md,29,mf[1]);case 2:return mh(me,md,29,mf[1]);case 3:return mi(me,md,29,mf[1]);case 4:return mj(me,md,29,mf[1]);case 5:return mk(me,md,29,mf[1]);case 6:return ml(me,md,29,mf[1]);case 7:break;default:return mm(me,md,29,mf[1]);}if(-1===me[6])throw [0,d,cj];me[6]=-1;return lc(me,md,29);}function oz(mB,mz,my,mx){var mA=[0,mz,my,mx];if(-1===mB[6])throw [0,d,ci];var mC=mB[3];if(typeof mC==="number")switch(mC){case 0:return k0(mB,mA,12);case 1:return k1(mB,mA,12);case 2:return k2(mB,mA,12);case 3:return k3(mB,mA,12);case 7:return k4(mB,mA,12);case 10:return k5(mB,mA,12);case 11:return k6(mB,mA,12);case 12:return k7(mB,mA,12);case 13:return k8(mB,mA,12);case 14:return lb(mB,mA,12);case 16:return k9(mB,mA,12);case 17:return k_(mB,mA,12);case 18:return k$(mB,mA,12);case 19:return la(mB,mA,12);default:}else switch(mC[0]){case 1:return kT(mB,mA,12,mC[1]);case 2:return kU(mB,mA,12,mC[1]);case 3:return kV(mB,mA,12,mC[1]);case 4:return kW(mB,mA,12,mC[1]);case 5:return kX(mB,mA,12,mC[1]);case 6:return kY(mB,mA,12,mC[1]);case 7:break;default:return kZ(mB,mA,12,mC[1]);}if(-1===mB[6])throw [0,d,ch];mB[6]=-1;return lc(mB,mA,12);}function n8(mH,mG,mF,mE){return mD(mH,mG,mF,mE);}function mN(mM,mL,mK,mJ){return mI(mM,mL,mK,mJ);}function qb(mR,mQ,mP,mO){return mN(mR,mQ,mP,mO);}function lb(mY,mS,mU){var mT=mS,mV=mU,mW=0;for(;;){if(24<=mV)if(49<=mV)if(53<=mV)var mX=0;else switch(mV-49|0){case 1:if(-1===mY[6])throw [0,d,cI];var mZ=mY[3];if(typeof mZ==="number"&&5===mZ){lr(mY);var m0=mT[2],m1=mT[1];if(49<=m0)var m2=54<=m0?1:2;else if(28<=m0)var m2=1;else switch(m0){case 12:case 15:case 20:case 21:case 23:case 27:var m2=2;break;case 22:var m4=m3(mY,m1[1],m1[2],[10,m1[3],mW]),mX=1,m5=0,m2=0;break;case 24:var m6=m1[1],m4=m3(mY,m6[1],m6[2],[11,m1[3],mW]),mX=1,m5=0,m2=0;break;default:var m2=1;}switch(m2){case 1:var m4=lk(0),mX=1,m5=0;break;case 2:var m4=m3(mY,m1,m0,[9,40,mW,41]),mX=1,m5=0;break;default:}}else var m5=1;if(m5){if(-1===mY[6])throw [0,d,cH];mY[6]=-1;var m4=lc(mY,mT,mV),mX=1;}break;case 2:if(-1===mY[6])throw [0,d,cG];var m7=mY[3];if(typeof m7==="number"&&4===m7){lr(mY);var m8=mT[2],m9=[0,mT[1],m8,mW];if(49<=m8)var m_=54<=m8?1:2;else if(28<=m8)var m_=1;else switch(m8){case 12:case 15:case 20:case 21:case 23:case 27:var m_=2;break;case 25:if(-1===mY[6])throw [0,d,cF];var m$=mY[3];if(typeof m$==="number"&&12===m$){var m4=k7(mY,m9,24),mX=1,nb=0,m_=0,na=0;}else var na=1;if(na){if(-1===mY[6])throw [0,d,cE];mY[6]=-1;var m4=lc(mY,m9,24),mX=1,nb=0,m_=0;}break;default:var m_=1;}switch(m_){case 1:var m4=lk(0),mX=1,nb=0;break;case 2:if(-1===mY[6])throw [0,d,cD];var nc=mY[3];if(typeof nc==="number")switch(nc){case 9:case 15:var nd=1;break;case 12:var m4=k7(mY,m9,22),mX=1,nb=0,nd=0;break;default:var nd=2;}else var nd=7===nc[0]?1:2;switch(nd){case 1:if(-1===mY[6])throw [0,d,cC];mY[6]=-1;var m4=lc(mY,m9,22),mX=1,nb=0;break;case 2:var m4=m3(mY,m9[1],m9[2],[9,40,m9[3],41]),mX=1,nb=0;break;default:}break;default:}}else var nb=1;if(nb){if(-1===mY[6])throw [0,d,cB];mY[6]=-1;var m4=lc(mY,mT,mV),mX=1;}break;case 3:if(-1===mY[6])throw [0,d,cA];var ne=mY[3];if(typeof ne==="number"&&6===ne){lr(mY);var m4=m3(mY,mT[1],mT[2],[2,mW]),mX=1,nf=0;}else var nf=1;if(nf){if(-1===mY[6])throw [0,d,cz];mY[6]=-1;var m4=lc(mY,mT,mV),mX=1;}break;default:if(-1===mY[6])throw [0,d,cK];var ng=mY[3];if(typeof ng==="number"&&6===ng){lr(mY);var m4=m3(mY,mT[1],mT[2],[9,123,mW,125]),mX=1,nh=0;}else var nh=1;if(nh){if(-1===mY[6])throw [0,d,cJ];mY[6]=-1;var m4=lc(mY,mT,mV),mX=1;}}else if(27===mV){if(-1===mY[6])throw [0,d,cy];var ni=mY[3];if(typeof ni==="number"&&6===ni){lr(mY);var m4=m3(mY,mT[1],mT[2],[1,mW]),mX=1,nj=0;}else var nj=1;if(nj){if(-1===mY[6])throw [0,d,cx];mY[6]=-1;var m4=lc(mY,mT,mV),mX=1;}}else var mX=0;else if(12===mV){if(-1===mY[6])throw [0,d,cw];var nk=mY[3];if(typeof nk==="number"&&14===nk){lr(mY);var nl=mT[1],nm=nl[2],nn=[0,nl[1],nm,[0,mT[3],mW]];if(10<=nm)if(55<=nm)switch(nm-55|0){case 0:case 2:case 4:case 11:var no=2;break;default:var no=1;}else var no=1;else switch(nm){case 5:case 7:var no=1;break;case 9:if(-1===mY[6])throw [0,d,cv];var np=mY[3];if(typeof np==="number")switch(np){case 4:case 5:case 6:if(-1===mY[6])throw [0,d,cu];mY[6]=-1;var m4=lc(mY,nn,1),mX=1,ns=0,no=0,nr=0;break;case 0:var m4=nt(mY,nn,1),mX=1,ns=0,no=0,nr=0;break;case 2:var m4=nu(mY,nn,1),mX=1,ns=0,no=0,nr=0;break;case 3:var m4=nv(mY,nn,1),mX=1,ns=0,no=0,nr=0;break;case 7:var m4=lG(mY,nn,1),mX=1,ns=0,no=0,nr=0;break;case 8:var m4=lK(mY,nn,1),mX=1,ns=0,no=0,nr=0;break;case 9:var m4=nw(mY,nn,1),mX=1,ns=0,no=0,nr=0;break;case 14:var m4=nx(mY,nn,1),mX=1,ns=0,no=0,nr=0;break;case 15:var m4=ny(mY,nn,1),mX=1,ns=0,no=0,nr=0;break;default:var nr=1;}else if(7===np[0]){var m4=nq(mY,nn,1,np[1]),mX=1,ns=0,no=0,nr=0;}else var nr=1;if(nr){var m4=nz(mY,nn,1),mX=1,ns=0,no=0;}break;default:var no=2;}switch(no){case 1:var m4=lk(0),mX=1,ns=0;break;case 2:if(-1===mY[6])throw [0,d,ct];var nA=mY[3];if(typeof nA==="number")switch(nA){case 2:case 3:case 7:case 8:case 9:case 14:case 15:var nB=2;break;case 4:case 5:case 6:if(-1===mY[6])throw [0,d,cs];mY[6]=-1;var m4=lc(mY,nn,4),mX=1,ns=0,nB=0;break;case 0:var m4=nt(mY,nn,4),mX=1,ns=0,nB=0;break;default:var nB=1;}else var nB=7===nA[0]?2:1;switch(nB){case 1:var m4=nz(mY,nn,4),mX=1,ns=0;break;case 2:var nC=nn[1],nD=nn[2],nE=[0,nn[3],0];for(;;){var nF=[0,nC,nD,nE];if(9<=nD)if(55<=nD)switch(nD-55|0){case 0:case 2:case 4:case 11:var nG=1;break;default:var nG=0;}else var nG=0;else switch(nD){case 5:case 7:var nG=0;break;case 4:var nH=nF[1],nK=[0,nH[3],nF[3]],nJ=nH[2],nI=nH[1],nC=nI,nD=nJ,nE=nK;continue;case 6:if(-1===mY[6])throw [0,d,cR];var nL=mY[3];if(typeof nL==="number")switch(nL){case 3:case 7:case 8:case 9:case 14:case 15:var nM=2;break;case 2:var nN=nu(mY,nF,5),nG=2,nM=0;break;default:var nM=1;}else var nM=7===nL[0]?2:1;switch(nM){case 1:if(-1===mY[6])throw [0,d,cQ];mY[6]=-1;var nN=lc(mY,nF,5),nG=2;break;case 2:var nO=nF[1],nP=nO[1],nQ=nO[2],nR=[0,[0,nO[3],nF[3]],0];for(;;){var nS=[0,nP,nQ,nR];if(7<=nQ)if(9<=nQ)if(55<=nQ)switch(nQ-55|0){case 0:case 2:case 4:case 11:var nT=1;break;default:var nT=0;}else var nT=0;else var nT=1;else{if(5===nQ){var nU=nS[1],nV=nU[1],nY=[0,[0,nV[3],nU[3]],nS[3]],nX=nV[2],nW=nV[1],nP=nW,nQ=nX,nR=nY;continue;}var nT=4<=nQ?0:1;}if(nT){if(-1===mY[6])throw [0,d,cZ];var nZ=mY[3];if(typeof nZ==="number")switch(nZ){case 3:var n0=nv(mY,nS,11),n1=1;break;case 7:var n0=lG(mY,nS,11),n1=1;break;case 8:var n0=lK(mY,nS,11),n1=1;break;case 9:var n0=nw(mY,nS,11),n1=1;break;case 14:var n0=nx(mY,nS,11),n1=1;break;case 15:var n0=ny(mY,nS,11),n1=1;break;default:var n1=0;}else if(7===nZ[0]){var n0=nq(mY,nS,11,nZ[1]),n1=1;}else var n1=0;if(!n1){if(-1===mY[6])throw [0,d,cY];mY[6]=-1;var n0=lc(mY,nS,11);}}else var n0=lk(0);var nN=n0,nG=2;break;}break;default:}break;default:var nG=1;}switch(nG){case 1:if(-1===mY[6])throw [0,d,cP];var n2=mY[3];if(typeof n2==="number")switch(n2){case 2:var nN=nu(mY,nF,7),n3=1;break;case 3:var nN=nv(mY,nF,7),n3=1;break;case 7:var nN=lG(mY,nF,7),n3=1;break;case 8:var nN=lK(mY,nF,7),n3=1;break;case 9:var nN=nw(mY,nF,7),n3=1;break;case 14:var nN=nx(mY,nF,7),n3=1;break;case 15:var nN=ny(mY,nF,7),n3=1;break;default:var n3=0;}else if(7===n2[0]){var nN=nq(mY,nF,7,n2[1]),n3=1;}else var n3=0;if(!n3){if(-1===mY[6])throw [0,d,cO];mY[6]=-1;var nN=lc(mY,nF,7);}break;case 2:break;default:var nN=lk(0);}var m4=nN,mX=1,ns=0;break;}break;default:}break;default:}}else var ns=1;if(ns){if(-1===mY[6])throw [0,d,cr];mY[6]=-1;var m4=lc(mY,mT,mV),mX=1;}}else{if(23<=mV){var n6=[0,mT[3],mW],n5=mT[2],n4=mT[1],mT=n4,mV=n5,mW=n6;continue;}var mX=0;}if(!mX)var m4=lk(0);return m4;}}function k0(n7,n_,n9){lr(n7);return n8(n7,n_,n9,bW);}function k9(oc,oa,n$){var ob=[0,oa,n$],od=lr(oc);if(typeof od==="number")switch(od){case 0:return l3(oc,ob,48);case 1:return l4(oc,ob,48);case 2:return k2(oc,ob,48);case 3:return k3(oc,ob,48);case 7:return k4(oc,ob,48);case 10:return l5(oc,ob,48);case 11:return l6(oc,ob,48);case 12:return l7(oc,ob,48);case 13:return l8(oc,ob,48);case 16:return l2(oc,ob,48);case 17:return l9(oc,ob,48);case 18:return l_(oc,ob,48);case 19:return l$(oc,ob,48);default:}else switch(od[0]){case 1:return lV(oc,ob,48,od[1]);case 2:return lW(oc,ob,48,od[1]);case 3:return lX(oc,ob,48,od[1]);case 4:return lY(oc,ob,48,od[1]);case 5:return lZ(oc,ob,48,od[1]);case 6:return l0(oc,ob,48,od[1]);case 7:break;default:return l1(oc,ob,48,od[1]);}if(-1===oc[6])throw [0,d,bV];oc[6]=-1;return lc(oc,ob,48);}function k$(oh,of,oe){var og=[0,of,oe],oi=lr(oh);if(typeof oi==="number")switch(oi){case 0:return mo(oh,og,26);case 1:return mp(oh,og,26);case 2:return k2(oh,og,26);case 3:return k3(oh,og,26);case 7:return k4(oh,og,26);case 10:return mq(oh,og,26);case 11:return mr(oh,og,26);case 12:return ms(oh,og,26);case 13:return mt(oh,og,26);case 16:return mu(oh,og,26);case 17:return mv(oh,og,26);case 18:return mn(oh,og,26);case 19:return mw(oh,og,26);default:}else switch(oi[0]){case 1:return mg(oh,og,26,oi[1]);case 2:return mh(oh,og,26,oi[1]);case 3:return mi(oh,og,26,oi[1]);case 4:return mj(oh,og,26,oi[1]);case 5:return mk(oh,og,26,oi[1]);case 6:return ml(oh,og,26,oi[1]);case 7:break;default:return mm(oh,og,26,oi[1]);}if(-1===oh[6])throw [0,d,bU];oh[6]=-1;return lc(oh,og,26);}function os(on,om,ol,ok){return oj(on,om,ol,ok);}function s8(or,oq,oo,op){switch(oo){case 12:case 20:case 21:case 23:case 27:case 49:case 50:case 51:case 52:case 53:return n8(or,oq,oo,op);case 14:case 34:case 37:case 43:case 44:case 45:case 46:case 47:case 48:return mN(or,oq,oo,op);case 13:case 26:case 29:case 32:case 38:case 39:case 40:case 41:case 42:return os(or,oq,oo,op);default:return lk(0);}}function sk(ow,ov,ou,ot){return os(ow,ov,ou,ot);}function m3(oC,oB,ox,oA){if(49<=ox)var oy=54<=ox?0:1;else if(28<=ox)var oy=0;else switch(ox){case 12:case 20:case 21:case 23:case 27:var oy=1;break;case 15:return oz(oC,oB,ox,oA);default:var oy=0;}return oy?n8(oC,oB,ox,oA):lk(0);}function lO(oN,oD,oF){var oE=oD,oG=oF,oH=0;for(;;){var oI=[0,oE,oG,oH];if(17===oG){var oJ=oI[1],oM=[0,oJ[3],oI[3]],oL=oJ[2],oK=oJ[1],oE=oK,oG=oL,oH=oM;continue;}if(18===oG){if(-1===oN[6])throw [0,d,cg];var oO=oN[3];if(typeof oO==="number")if(7<=oO)if(8<=oO)var oP=0;else{var oQ=lG(oN,oI,16),oP=1;}else if(4<=oO){if(-1===oN[6])throw [0,d,cf];oN[6]=-1;var oQ=lc(oN,oI,16),oP=1;}else var oP=0;else var oP=0;if(!oP)var oQ=lK(oN,oI,16);}else var oQ=lk(0);return oQ;}}function lN(oU,oS,oR){var oT=[0,oS,oR],oV=lr(oU);if(typeof oV==="number")switch(oV){case 0:return k0(oU,oT,53);case 1:return k1(oU,oT,53);case 2:return k2(oU,oT,53);case 3:return k3(oU,oT,53);case 7:return k4(oU,oT,53);case 10:return k5(oU,oT,53);case 11:return k6(oU,oT,53);case 12:return k7(oU,oT,53);case 13:return k8(oU,oT,53);case 16:return k9(oU,oT,53);case 17:return k_(oU,oT,53);case 18:return k$(oU,oT,53);case 19:return la(oU,oT,53);default:}else switch(oV[0]){case 1:return kT(oU,oT,53,oV[1]);case 2:return kU(oU,oT,53,oV[1]);case 3:return kV(oU,oT,53,oV[1]);case 4:return kW(oU,oT,53,oV[1]);case 5:return kX(oU,oT,53,oV[1]);case 6:return kY(oU,oT,53,oV[1]);case 7:break;default:return kZ(oU,oT,53,oV[1]);}if(-1===oU[6])throw [0,d,br];oU[6]=-1;return lc(oU,oT,53);}function k1(o1,oW,oY){var oX=oW,oZ=oY;for(;;){var o0=[0,oX,oZ],o2=lr(o1);if(typeof o2==="number"){if(13===o2){var o3=lr(o1);if(typeof o3==="number")switch(o3){case 0:return k0(o1,o0,52);case 1:var o4=52,oX=o0,oZ=o4;continue;case 2:return k2(o1,o0,52);case 3:return k3(o1,o0,52);case 6:return lb(o1,o0,52);case 7:return k4(o1,o0,52);case 10:return k5(o1,o0,52);case 11:return k6(o1,o0,52);case 12:return k7(o1,o0,52);case 13:return k8(o1,o0,52);case 16:return k9(o1,o0,52);case 17:return k_(o1,o0,52);case 18:return k$(o1,o0,52);case 19:return la(o1,o0,52);default:}else switch(o3[0]){case 1:return kT(o1,o0,52,o3[1]);case 2:return kU(o1,o0,52,o3[1]);case 3:return kV(o1,o0,52,o3[1]);case 4:return kW(o1,o0,52,o3[1]);case 5:return kX(o1,o0,52,o3[1]);case 6:return kY(o1,o0,52,o3[1]);case 7:break;default:return kZ(o1,o0,52,o3[1]);}if(-1===o1[6])throw [0,d,bq];o1[6]=-1;return lc(o1,o0,52);}}else switch(o2[0]){case 4:lr(o1);return m3(o1,o0[1],o0[2],[2,[0,[4,o2[1]],0]]);case 6:lr(o1);return m3(o1,o0[1],o0[2],[2,[0,[3,o2[1]],0]]);default:}if(-1===o1[6])throw [0,d,bp];o1[6]=-1;return lc(o1,o0[1],o0[2]);}}function kZ(o5,o8,o7,o6){lr(o5);return m3(o5,o8,o7,[1,[0,[3,o6],0]]);}function kT(o9,pa,o$,o_){lr(o9);return m3(o9,pa,o$,[2,[0,[3,o_],0]]);}function kU(pb,pe,pd,pc){lr(pb);return m3(pb,pe,pd,[0,pc]);}function k5(pf,ph,pg){lr(pf);return m3(pf,ph,pg,bo);}function k6(pn,pi,pk){var pj=pi,pl=pk;for(;;){var pm=[0,pj,pl],po=lr(pn);if(typeof po==="number")switch(po){case 0:return k0(pn,pm,51);case 1:return k1(pn,pm,51);case 2:return k2(pn,pm,51);case 3:return k3(pn,pm,51);case 4:return lb(pn,pm,51);case 7:return k4(pn,pm,51);case 10:return k5(pn,pm,51);case 11:var pp=51,pj=pm,pl=pp;continue;case 12:return k7(pn,pm,51);case 13:return k8(pn,pm,51);case 16:return k9(pn,pm,51);case 17:return k_(pn,pm,51);case 18:return k$(pn,pm,51);case 19:return la(pn,pm,51);default:}else switch(po[0]){case 1:return kT(pn,pm,51,po[1]);case 2:return kU(pn,pm,51,po[1]);case 3:return kV(pn,pm,51,po[1]);case 4:return kW(pn,pm,51,po[1]);case 5:return kX(pn,pm,51,po[1]);case 6:return kY(pn,pm,51,po[1]);case 7:break;default:return kZ(pn,pm,51,po[1]);}if(-1===pn[6])throw [0,d,bn];pn[6]=-1;return lc(pn,pm,51);}}function k7(pv,pq,ps){var pr=pq,pt=ps;for(;;){var pu=[0,pr,pt],pw=lr(pv);if(typeof pw==="number")switch(pw){case 0:return k0(pv,pu,50);case 1:return k1(pv,pu,50);case 2:return k2(pv,pu,50);case 3:return k3(pv,pu,50);case 5:return lb(pv,pu,50);case 7:return k4(pv,pu,50);case 10:return k5(pv,pu,50);case 11:return k6(pv,pu,50);case 12:var px=50,pr=pu,pt=px;continue;case 13:return k8(pv,pu,50);case 16:return k9(pv,pu,50);case 17:return k_(pv,pu,50);case 18:return k$(pv,pu,50);case 19:return la(pv,pu,50);default:}else switch(pw[0]){case 1:return kT(pv,pu,50,pw[1]);case 2:return kU(pv,pu,50,pw[1]);case 3:return kV(pv,pu,50,pw[1]);case 4:return kW(pv,pu,50,pw[1]);case 5:return kX(pv,pu,50,pw[1]);case 6:return kY(pv,pu,50,pw[1]);case 7:break;default:return kZ(pv,pu,50,pw[1]);}if(-1===pv[6])throw [0,d,bm];pv[6]=-1;return lc(pv,pu,50);}}function k8(pD,py,pA){var pz=py,pB=pA;for(;;){var pC=[0,pz,pB],pE=lr(pD);if(typeof pE==="number")switch(pE){case 0:return k0(pD,pC,49);case 1:return k1(pD,pC,49);case 2:return k2(pD,pC,49);case 3:return k3(pD,pC,49);case 6:return lb(pD,pC,49);case 7:return k4(pD,pC,49);case 10:return k5(pD,pC,49);case 11:return k6(pD,pC,49);case 12:return k7(pD,pC,49);case 13:var pF=49,pz=pC,pB=pF;continue;case 16:return k9(pD,pC,49);case 17:return k_(pD,pC,49);case 18:return k$(pD,pC,49);case 19:return la(pD,pC,49);default:}else switch(pE[0]){case 1:return kT(pD,pC,49,pE[1]);case 2:return kU(pD,pC,49,pE[1]);case 3:return kV(pD,pC,49,pE[1]);case 4:return kW(pD,pC,49,pE[1]);case 5:return kX(pD,pC,49,pE[1]);case 6:return kY(pD,pC,49,pE[1]);case 7:break;default:return kZ(pD,pC,49,pE[1]);}if(-1===pD[6])throw [0,d,bl];pD[6]=-1;return lc(pD,pC,49);}}function kV(pG,pJ,pI,pH){lr(pG);return m3(pG,pJ,pI,[6,pH]);}function kW(pK,pN,pM,pL){lr(pK);return m3(pK,pN,pM,[4,pL]);}function kX(pO,pR,pQ,pP){lr(pO);return m3(pO,pR,pQ,[5,pP]);}function kY(pS,pV,pU,pT){lr(pS);return m3(pS,pV,pU,[3,pT]);}function l2(p3,pW,pY){var pX=pW,pZ=pY,p0=0;for(;;){var p1=pZ-14|0;if(p1<0||34<p1)var p2=0;else switch(p1){case 0:if(-1===p3[6])throw [0,d,ce];var p4=p3[3];if(typeof p4==="number"&&16===p4){lr(p3);var p5=oz(p3,pX[1],pX[2],[8,p0]),p2=1,p6=0;}else var p6=1;if(p6){if(-1===p3[6])throw [0,d,cd];p3[6]=-1;var p5=lc(p3,pX,pZ),p2=1;}break;case 20:var p9=[0,pX[3],p0],p8=pX[2],p7=pX[1],pX=p7,pZ=p8,p0=p9;continue;case 23:if(-1===p3[6])throw [0,d,cc];var p_=p3[3];if(typeof p_==="number"&&16===p_){lr(p3);var p5=oj(p3,pX[1],pX[2],[8,p0]),p2=1,p$=0;}else var p$=1;if(p$){if(-1===p3[6])throw [0,d,cb];p3[6]=-1;var p5=lc(p3,pX,pZ),p2=1;}break;case 29:if(-1===p3[6])throw [0,d,ca];var qa=p3[3];if(typeof qa==="number"&&6===qa){lr(p3);var p5=qb(p3,pX[1],pX[2],[1,p0]),p2=1,qc=0;}else var qc=1;if(qc){if(-1===p3[6])throw [0,d,b$];p3[6]=-1;var p5=lc(p3,pX,pZ),p2=1;}break;case 30:if(-1===p3[6])throw [0,d,b_];var qd=p3[3];if(typeof qd==="number"&&6===qd){lr(p3);var p5=qb(p3,pX[1],pX[2],[9,123,p0,125]),p2=1,qe=0;}else var qe=1;if(qe){if(-1===p3[6])throw [0,d,b9];p3[6]=-1;var p5=lc(p3,pX,pZ),p2=1;}break;case 31:if(-1===p3[6])throw [0,d,b8];var qf=p3[3];if(typeof qf==="number"&&5===qf){lr(p3);var qg=pX[2],qh=pX[1];if(33<=qg)if(49<=qg)var qi=1;else switch(qg-33|0){case 3:case 5:case 6:case 7:case 8:case 9:var qi=1;break;case 0:var p5=qb(p3,qh[1],qh[2],[10,qh[3],p0]),p2=1,qj=0,qi=0;break;case 2:var qk=qh[1],p5=qb(p3,qk[1],qk[2],[11,qh[3],p0]),p2=1,qj=0,qi=0;break;default:var qi=2;}else var qi=14===qg?2:1;switch(qi){case 1:var p5=lk(0),p2=1,qj=0;break;case 2:var p5=qb(p3,qh,qg,[9,40,p0,41]),p2=1,qj=0;break;default:}}else var qj=1;if(qj){if(-1===p3[6])throw [0,d,b7];p3[6]=-1;var p5=lc(p3,pX,pZ),p2=1;}break;case 32:if(-1===p3[6])throw [0,d,b6];var ql=p3[3];if(typeof ql==="number"&&4===ql){lr(p3);var qm=pX[2],qn=[0,pX[1],qm,p0],qo=qm-34|0;if(qo<0||14<qo)var qp=-20===qo?2:1;else if(9<=qo)var qp=2;else switch(qo){case 0:case 3:var qp=2;break;case 2:if(-1===p3[6])throw [0,d,b5];var qq=p3[3];if(typeof qq==="number"&&12===qq){var p5=l7(p3,qn,35),p2=1,qs=0,qp=0,qr=0;}else var qr=1;if(qr){if(-1===p3[6])throw [0,d,b4];p3[6]=-1;var p5=lc(p3,qn,35),p2=1,qs=0,qp=0;}break;default:var qp=1;}switch(qp){case 1:var p5=lk(0),p2=1,qs=0;break;case 2:if(-1===p3[6])throw [0,d,b3];var qt=p3[3];if(typeof qt==="number")switch(qt){case 8:case 9:case 14:case 15:var qu=1;break;case 12:var p5=l7(p3,qn,33),p2=1,qs=0,qu=0;break;default:var qu=2;}else var qu=7===qt[0]?1:2;switch(qu){case 1:if(-1===p3[6])throw [0,d,b2];p3[6]=-1;var p5=lc(p3,qn,33),p2=1,qs=0;break;case 2:var p5=qb(p3,qn[1],qn[2],[9,40,qn[3],41]),p2=1,qs=0;break;default:}break;default:}}else var qs=1;if(qs){if(-1===p3[6])throw [0,d,b1];p3[6]=-1;var p5=lc(p3,pX,pZ),p2=1;}break;case 33:if(-1===p3[6])throw [0,d,b0];var qv=p3[3];if(typeof qv==="number"&&6===qv){lr(p3);var p5=qb(p3,pX[1],pX[2],[2,p0]),p2=1,qw=0;}else var qw=1;if(qw){if(-1===p3[6])throw [0,d,bZ];p3[6]=-1;var p5=lc(p3,pX,pZ),p2=1;}break;case 34:if(-1===p3[6])throw [0,d,bY];var qx=p3[3];if(typeof qx==="number"&&16===qx){lr(p3);var p5=mD(p3,pX[1],pX[2],[8,p0]),p2=1,qy=0;}else var qy=1;if(qy){if(-1===p3[6])throw [0,d,bX];p3[6]=-1;var p5=lc(p3,pX,pZ),p2=1;}break;default:var p2=0;}if(!p2)var p5=lk(0);return p5;}}function l3(qz,qB,qA){lr(qz);return mN(qz,qB,qA,bk);}function l4(qH,qC,qE){var qD=qC,qF=qE;for(;;){var qG=[0,qD,qF],qI=lr(qH);if(typeof qI==="number"){if(13===qI){var qJ=lr(qH);if(typeof qJ==="number")switch(qJ){case 0:return l3(qH,qG,47);case 1:var qK=47,qD=qG,qF=qK;continue;case 2:return k2(qH,qG,47);case 3:return k3(qH,qG,47);case 6:return l2(qH,qG,47);case 7:return k4(qH,qG,47);case 10:return l5(qH,qG,47);case 11:return l6(qH,qG,47);case 12:return l7(qH,qG,47);case 13:return l8(qH,qG,47);case 17:return l9(qH,qG,47);case 18:return l_(qH,qG,47);case 19:return l$(qH,qG,47);default:}else switch(qJ[0]){case 1:return lV(qH,qG,47,qJ[1]);case 2:return lW(qH,qG,47,qJ[1]);case 3:return lX(qH,qG,47,qJ[1]);case 4:return lY(qH,qG,47,qJ[1]);case 5:return lZ(qH,qG,47,qJ[1]);case 6:return l0(qH,qG,47,qJ[1]);case 7:break;default:return l1(qH,qG,47,qJ[1]);}if(-1===qH[6])throw [0,d,bj];qH[6]=-1;return lc(qH,qG,47);}}else switch(qI[0]){case 4:lr(qH);return qb(qH,qG[1],qG[2],[2,[0,[4,qI[1]],0]]);case 6:lr(qH);return qb(qH,qG[1],qG[2],[2,[0,[3,qI[1]],0]]);default:}if(-1===qH[6])throw [0,d,bi];qH[6]=-1;return lc(qH,qG[1],qG[2]);}}function l1(qL,qO,qN,qM){lr(qL);return qb(qL,qO,qN,[1,[0,[3,qM],0]]);}function lV(qP,qS,qR,qQ){lr(qP);return qb(qP,qS,qR,[2,[0,[3,qQ],0]]);}function lW(qT,qW,qV,qU){lr(qT);return qb(qT,qW,qV,[0,qU]);}function l5(qX,qZ,qY){lr(qX);return qb(qX,qZ,qY,bh);}function l6(q5,q0,q2){var q1=q0,q3=q2;for(;;){var q4=[0,q1,q3],q6=lr(q5);if(typeof q6==="number")switch(q6){case 0:return l3(q5,q4,46);case 1:return l4(q5,q4,46);case 2:return k2(q5,q4,46);case 3:return k3(q5,q4,46);case 4:return l2(q5,q4,46);case 7:return k4(q5,q4,46);case 10:return l5(q5,q4,46);case 11:var q7=46,q1=q4,q3=q7;continue;case 12:return l7(q5,q4,46);case 13:return l8(q5,q4,46);case 17:return l9(q5,q4,46);case 18:return l_(q5,q4,46);case 19:return l$(q5,q4,46);default:}else switch(q6[0]){case 1:return lV(q5,q4,46,q6[1]);case 2:return lW(q5,q4,46,q6[1]);case 3:return lX(q5,q4,46,q6[1]);case 4:return lY(q5,q4,46,q6[1]);case 5:return lZ(q5,q4,46,q6[1]);case 6:return l0(q5,q4,46,q6[1]);case 7:break;default:return l1(q5,q4,46,q6[1]);}if(-1===q5[6])throw [0,d,bg];q5[6]=-1;return lc(q5,q4,46);}}function l7(rb,q8,q_){var q9=q8,q$=q_;for(;;){var ra=[0,q9,q$],rc=lr(rb);if(typeof rc==="number")switch(rc){case 0:return l3(rb,ra,45);case 1:return l4(rb,ra,45);case 2:return k2(rb,ra,45);case 3:return k3(rb,ra,45);case 5:return l2(rb,ra,45);case 7:return k4(rb,ra,45);case 10:return l5(rb,ra,45);case 11:return l6(rb,ra,45);case 12:var rd=45,q9=ra,q$=rd;continue;case 13:return l8(rb,ra,45);case 17:return l9(rb,ra,45);case 18:return l_(rb,ra,45);case 19:return l$(rb,ra,45);default:}else switch(rc[0]){case 1:return lV(rb,ra,45,rc[1]);case 2:return lW(rb,ra,45,rc[1]);case 3:return lX(rb,ra,45,rc[1]);case 4:return lY(rb,ra,45,rc[1]);case 5:return lZ(rb,ra,45,rc[1]);case 6:return l0(rb,ra,45,rc[1]);case 7:break;default:return l1(rb,ra,45,rc[1]);}if(-1===rb[6])throw [0,d,bf];rb[6]=-1;return lc(rb,ra,45);}}function l8(rj,re,rg){var rf=re,rh=rg;for(;;){var ri=[0,rf,rh],rk=lr(rj);if(typeof rk==="number")switch(rk){case 0:return l3(rj,ri,44);case 1:return l4(rj,ri,44);case 2:return k2(rj,ri,44);case 3:return k3(rj,ri,44);case 6:return l2(rj,ri,44);case 7:return k4(rj,ri,44);case 10:return l5(rj,ri,44);case 11:return l6(rj,ri,44);case 12:return l7(rj,ri,44);case 13:var rl=44,rf=ri,rh=rl;continue;case 17:return l9(rj,ri,44);case 18:return l_(rj,ri,44);case 19:return l$(rj,ri,44);default:}else switch(rk[0]){case 1:return lV(rj,ri,44,rk[1]);case 2:return lW(rj,ri,44,rk[1]);case 3:return lX(rj,ri,44,rk[1]);case 4:return lY(rj,ri,44,rk[1]);case 5:return lZ(rj,ri,44,rk[1]);case 6:return l0(rj,ri,44,rk[1]);case 7:break;default:return l1(rj,ri,44,rk[1]);}if(-1===rj[6])throw [0,d,be];rj[6]=-1;return lc(rj,ri,44);}}function lX(rm,rp,ro,rn){lr(rm);return qb(rm,rp,ro,[6,rn]);}function lY(rq,rt,rs,rr){lr(rq);return qb(rq,rt,rs,[4,rr]);}function lZ(ru,rx,rw,rv){lr(ru);return qb(ru,rx,rw,[5,rv]);}function l0(ry,rB,rA,rz){lr(ry);return qb(ry,rB,rA,[3,rz]);}function l9(rH,rC,rE){var rD=rC,rF=rE;for(;;){var rG=[0,rD,rF],rI=lr(rH);if(typeof rI==="number"){if(13===rI){var rJ=lr(rH);if(typeof rJ==="number")switch(rJ){case 0:return l3(rH,rG,43);case 1:return l4(rH,rG,43);case 2:return k2(rH,rG,43);case 3:return k3(rH,rG,43);case 6:return l2(rH,rG,43);case 7:return k4(rH,rG,43);case 10:return l5(rH,rG,43);case 11:return l6(rH,rG,43);case 12:return l7(rH,rG,43);case 13:return l8(rH,rG,43);case 17:var rK=43,rD=rG,rF=rK;continue;case 18:return l_(rH,rG,43);case 19:return l$(rH,rG,43);default:}else switch(rJ[0]){case 1:return lV(rH,rG,43,rJ[1]);case 2:return lW(rH,rG,43,rJ[1]);case 3:return lX(rH,rG,43,rJ[1]);case 4:return lY(rH,rG,43,rJ[1]);case 5:return lZ(rH,rG,43,rJ[1]);case 6:return l0(rH,rG,43,rJ[1]);case 7:break;default:return l1(rH,rG,43,rJ[1]);}if(-1===rH[6])throw [0,d,bd];rH[6]=-1;return lc(rH,rG,43);}}else switch(rI[0]){case 4:lr(rH);return qb(rH,rG[1],rG[2],[1,[0,[4,rI[1]],0]]);case 6:lr(rH);return qb(rH,rG[1],rG[2],[1,[0,[3,rI[1]],0]]);default:}if(-1===rH[6])throw [0,d,bc];rH[6]=-1;return lc(rH,rG[1],rG[2]);}}function l_(rO,rM,rL){var rN=[0,rM,rL],rP=lr(rO);if(typeof rP==="number")switch(rP){case 0:return mo(rO,rN,42);case 1:return mp(rO,rN,42);case 2:return k2(rO,rN,42);case 3:return k3(rO,rN,42);case 7:return k4(rO,rN,42);case 10:return mq(rO,rN,42);case 11:return mr(rO,rN,42);case 12:return ms(rO,rN,42);case 13:return mt(rO,rN,42);case 16:return mu(rO,rN,42);case 17:return mv(rO,rN,42);case 18:return mn(rO,rN,42);case 19:return mw(rO,rN,42);default:}else switch(rP[0]){case 1:return mg(rO,rN,42,rP[1]);case 2:return mh(rO,rN,42,rP[1]);case 3:return mi(rO,rN,42,rP[1]);case 4:return mj(rO,rN,42,rP[1]);case 5:return mk(rO,rN,42,rP[1]);case 6:return ml(rO,rN,42,rP[1]);case 7:break;default:return mm(rO,rN,42,rP[1]);}if(-1===rO[6])throw [0,d,bb];rO[6]=-1;return lc(rO,rN,42);}function l$(rT,rR,rQ){var rS=[0,rR,rQ],rU=lr(rT);if(typeof rU==="number")switch(rU){case 8:case 9:case 14:case 15:var rV=0;break;case 11:return l6(rT,rS,36);default:var rV=1;}else var rV=7===rU[0]?0:1;if(rV)return qb(rT,rS[1],rS[2],a$);if(-1===rT[6])throw [0,d,ba];rT[6]=-1;return lc(rT,rS,36);}function k_(r1,rW,rY){var rX=rW,rZ=rY;for(;;){var r0=[0,rX,rZ],r2=lr(r1);if(typeof r2==="number"){if(13===r2){var r3=lr(r1);if(typeof r3==="number")switch(r3){case 0:return k0(r1,r0,27);case 1:return k1(r1,r0,27);case 2:return k2(r1,r0,27);case 3:return k3(r1,r0,27);case 6:return lb(r1,r0,27);case 7:return k4(r1,r0,27);case 10:return k5(r1,r0,27);case 11:return k6(r1,r0,27);case 12:return k7(r1,r0,27);case 13:return k8(r1,r0,27);case 16:return k9(r1,r0,27);case 17:var r4=27,rX=r0,rZ=r4;continue;case 18:return k$(r1,r0,27);case 19:return la(r1,r0,27);default:}else switch(r3[0]){case 1:return kT(r1,r0,27,r3[1]);case 2:return kU(r1,r0,27,r3[1]);case 3:return kV(r1,r0,27,r3[1]);case 4:return kW(r1,r0,27,r3[1]);case 5:return kX(r1,r0,27,r3[1]);case 6:return kY(r1,r0,27,r3[1]);case 7:break;default:return kZ(r1,r0,27,r3[1]);}if(-1===r1[6])throw [0,d,a_];r1[6]=-1;return lc(r1,r0,27);}}else switch(r2[0]){case 4:lr(r1);return m3(r1,r0[1],r0[2],[1,[0,[4,r2[1]],0]]);case 6:lr(r1);return m3(r1,r0[1],r0[2],[1,[0,[3,r2[1]],0]]);default:}if(-1===r1[6])throw [0,d,a9];r1[6]=-1;return lc(r1,r0[1],r0[2]);}}function mn(sa,r5,r7){var r6=r5,r8=r7,r9=0;for(;;){var r_=r8-13|0;if(r_<0||29<r_)var r$=0;else switch(r_){case 0:if(-1===sa[6])throw [0,d,bT];var sb=sa[3];if(typeof sb==="number"&&18===sb){lr(sa);var sc=oz(sa,r6[1],r6[2],[7,r9]),r$=1,sd=0;}else var sd=1;if(sd){if(-1===sa[6])throw [0,d,bS];sa[6]=-1;var sc=lc(sa,r6,r8),r$=1;}break;case 13:if(-1===sa[6])throw [0,d,bR];var se=sa[3];if(typeof se==="number"&&18===se){lr(sa);var sc=mD(sa,r6[1],r6[2],[7,r9]),r$=1,sf=0;}else var sf=1;if(sf){if(-1===sa[6])throw [0,d,bQ];sa[6]=-1;var sc=lc(sa,r6,r8),r$=1;}break;case 16:var si=[0,r6[3],r9],sh=r6[2],sg=r6[1],r6=sg,r8=sh,r9=si;continue;case 19:if(-1===sa[6])throw [0,d,bP];var sj=sa[3];if(typeof sj==="number"&&6===sj){lr(sa);var sc=sk(sa,r6[1],r6[2],[1,r9]),r$=1,sl=0;}else var sl=1;if(sl){if(-1===sa[6])throw [0,d,bO];sa[6]=-1;var sc=lc(sa,r6,r8),r$=1;}break;case 25:if(-1===sa[6])throw [0,d,bN];var sm=sa[3];if(typeof sm==="number"&&6===sm){lr(sa);var sc=sk(sa,r6[1],r6[2],[9,123,r9,125]),r$=1,sn=0;}else var sn=1;if(sn){if(-1===sa[6])throw [0,d,bM];sa[6]=-1;var sc=lc(sa,r6,r8),r$=1;}break;case 26:if(-1===sa[6])throw [0,d,bL];var so=sa[3];if(typeof so==="number"&&5===so){lr(sa);var sp=r6[2],sq=r6[1],sr=sp-13|0;if(sr<0||29<sr)var ss=1;else switch(sr){case 0:case 13:case 16:case 19:case 25:case 26:case 27:case 28:case 29:var sc=sk(sa,sq,sp,[9,40,r9,41]),r$=1,st=0,ss=0;break;case 15:var sc=sk(sa,sq[1],sq[2],[10,sq[3],r9]),r$=1,st=0,ss=0;break;case 17:var su=sq[1],sc=sk(sa,su[1],su[2],[11,sq[3],r9]),r$=1,st=0,ss=0;break;default:var ss=1;}if(ss){var sc=lk(0),r$=1,st=0;}}else var st=1;if(st){if(-1===sa[6])throw [0,d,bK];sa[6]=-1;var sc=lc(sa,r6,r8),r$=1;}break;case 27:if(-1===sa[6])throw [0,d,bJ];var sv=sa[3];if(typeof sv==="number"&&4===sv){lr(sa);var sw=r6[2],sx=[0,r6[1],sw,r9],sy=sw-13|0;if(sy<0||29<sy)var sz=1;else switch(sy){case 0:case 13:case 16:case 19:case 25:case 26:case 27:case 28:case 29:if(-1===sa[6])throw [0,d,bG];var sA=sa[3];if(typeof sA==="number")switch(sA){case 8:case 9:case 14:case 15:var sB=1;break;case 12:var sc=ms(sa,sx,28),r$=1,sC=0,sz=0,sB=0;break;default:var sB=2;}else var sB=7===sA[0]?1:2;switch(sB){case 1:if(-1===sa[6])throw [0,d,bF];sa[6]=-1;var sc=lc(sa,sx,28),r$=1,sC=0,sz=0;break;case 2:var sc=sk(sa,sx[1],sx[2],[9,40,sx[3],41]),r$=1,sC=0,sz=0;break;default:}break;case 18:if(-1===sa[6])throw [0,d,bI];var sD=sa[3];if(typeof sD==="number"&&12===sD){var sc=ms(sa,sx,30),r$=1,sC=0,sz=0,sE=0;}else var sE=1;if(sE){if(-1===sa[6])throw [0,d,bH];sa[6]=-1;var sc=lc(sa,sx,30),r$=1,sC=0,sz=0;}break;default:var sz=1;}if(sz){var sc=lk(0),r$=1,sC=0;}}else var sC=1;if(sC){if(-1===sa[6])throw [0,d,bE];sa[6]=-1;var sc=lc(sa,r6,r8),r$=1;}break;case 28:if(-1===sa[6])throw [0,d,bD];var sF=sa[3];if(typeof sF==="number"&&6===sF){lr(sa);var sc=sk(sa,r6[1],r6[2],[2,r9]),r$=1,sG=0;}else var sG=1;if(sG){if(-1===sa[6])throw [0,d,bC];sa[6]=-1;var sc=lc(sa,r6,r8),r$=1;}break;case 29:if(-1===sa[6])throw [0,d,bB];var sH=sa[3];if(typeof sH==="number"&&18===sH){lr(sa);var sc=mI(sa,r6[1],r6[2],[7,r9]),r$=1,sI=0;}else var sI=1;if(sI){if(-1===sa[6])throw [0,d,bA];sa[6]=-1;var sc=lc(sa,r6,r8),r$=1;}break;default:var r$=0;}if(!r$)var sc=lk(0);return sc;}}function mo(sJ,sL,sK){lr(sJ);return os(sJ,sL,sK,a8);}function mp(sR,sM,sO){var sN=sM,sP=sO;for(;;){var sQ=[0,sN,sP],sS=lr(sR);if(typeof sS==="number"){if(13===sS){var sT=lr(sR);if(typeof sT==="number")switch(sT){case 0:return mo(sR,sQ,41);case 1:var sU=41,sN=sQ,sP=sU;continue;case 2:return k2(sR,sQ,41);case 3:return k3(sR,sQ,41);case 6:return mn(sR,sQ,41);case 7:return k4(sR,sQ,41);case 10:return mq(sR,sQ,41);case 11:return mr(sR,sQ,41);case 12:return ms(sR,sQ,41);case 13:return mt(sR,sQ,41);case 16:return mu(sR,sQ,41);case 17:return mv(sR,sQ,41);case 19:return mw(sR,sQ,41);default:}else switch(sT[0]){case 1:return mg(sR,sQ,41,sT[1]);case 2:return mh(sR,sQ,41,sT[1]);case 3:return mi(sR,sQ,41,sT[1]);case 4:return mj(sR,sQ,41,sT[1]);case 5:return mk(sR,sQ,41,sT[1]);case 6:return ml(sR,sQ,41,sT[1]);case 7:break;default:return mm(sR,sQ,41,sT[1]);}if(-1===sR[6])throw [0,d,a7];sR[6]=-1;return lc(sR,sQ,41);}}else switch(sS[0]){case 4:lr(sR);return sk(sR,sQ[1],sQ[2],[2,[0,[4,sS[1]],0]]);case 6:lr(sR);return sk(sR,sQ[1],sQ[2],[2,[0,[3,sS[1]],0]]);default:}if(-1===sR[6])throw [0,d,a6];sR[6]=-1;return lc(sR,sQ[1],sQ[2]);}}function mm(sV,sY,sX,sW){lr(sV);return sk(sV,sY,sX,[1,[0,[3,sW],0]]);}function mg(sZ,s2,s1,s0){lr(sZ);return sk(sZ,s2,s1,[2,[0,[3,s0],0]]);}function mh(s3,s6,s5,s4){lr(s3);return sk(s3,s6,s5,[0,s4]);}function k2(s7,s_,s9){lr(s7);return s8(s7,s_,s9,a5);}function k3(s$,tb,ta){lr(s$);return s8(s$,tb,ta,a4);}function k4(tc,te,td){lr(tc);return s8(tc,te,td,a3);}function mq(tf,th,tg){lr(tf);return sk(tf,th,tg,a2);}function mr(tn,ti,tk){var tj=ti,tl=tk;for(;;){var tm=[0,tj,tl],to=lr(tn);if(typeof to==="number")switch(to){case 0:return mo(tn,tm,40);case 1:return mp(tn,tm,40);case 2:return k2(tn,tm,40);case 3:return k3(tn,tm,40);case 4:return mn(tn,tm,40);case 7:return k4(tn,tm,40);case 10:return mq(tn,tm,40);case 11:var tp=40,tj=tm,tl=tp;continue;case 12:return ms(tn,tm,40);case 13:return mt(tn,tm,40);case 16:return mu(tn,tm,40);case 17:return mv(tn,tm,40);case 19:return mw(tn,tm,40);default:}else switch(to[0]){case 1:return mg(tn,tm,40,to[1]);case 2:return mh(tn,tm,40,to[1]);case 3:return mi(tn,tm,40,to[1]);case 4:return mj(tn,tm,40,to[1]);case 5:return mk(tn,tm,40,to[1]);case 6:return ml(tn,tm,40,to[1]);case 7:break;default:return mm(tn,tm,40,to[1]);}if(-1===tn[6])throw [0,d,a1];tn[6]=-1;return lc(tn,tm,40);}}function ms(tv,tq,ts){var tr=tq,tt=ts;for(;;){var tu=[0,tr,tt],tw=lr(tv);if(typeof tw==="number")switch(tw){case 0:return mo(tv,tu,39);case 1:return mp(tv,tu,39);case 2:return k2(tv,tu,39);case 3:return k3(tv,tu,39);case 5:return mn(tv,tu,39);case 7:return k4(tv,tu,39);case 10:return mq(tv,tu,39);case 11:return mr(tv,tu,39);case 12:var tx=39,tr=tu,tt=tx;continue;case 13:return mt(tv,tu,39);case 16:return mu(tv,tu,39);case 17:return mv(tv,tu,39);case 19:return mw(tv,tu,39);default:}else switch(tw[0]){case 1:return mg(tv,tu,39,tw[1]);case 2:return mh(tv,tu,39,tw[1]);case 3:return mi(tv,tu,39,tw[1]);case 4:return mj(tv,tu,39,tw[1]);case 5:return mk(tv,tu,39,tw[1]);case 6:return ml(tv,tu,39,tw[1]);case 7:break;default:return mm(tv,tu,39,tw[1]);}if(-1===tv[6])throw [0,d,a0];tv[6]=-1;return lc(tv,tu,39);}}function mt(tD,ty,tA){var tz=ty,tB=tA;for(;;){var tC=[0,tz,tB],tE=lr(tD);if(typeof tE==="number")switch(tE){case 0:return mo(tD,tC,38);case 1:return mp(tD,tC,38);case 2:return k2(tD,tC,38);case 3:return k3(tD,tC,38);case 6:return mn(tD,tC,38);case 7:return k4(tD,tC,38);case 10:return mq(tD,tC,38);case 11:return mr(tD,tC,38);case 12:return ms(tD,tC,38);case 13:var tF=38,tz=tC,tB=tF;continue;case 16:return mu(tD,tC,38);case 17:return mv(tD,tC,38);case 19:return mw(tD,tC,38);default:}else switch(tE[0]){case 1:return mg(tD,tC,38,tE[1]);case 2:return mh(tD,tC,38,tE[1]);case 3:return mi(tD,tC,38,tE[1]);case 4:return mj(tD,tC,38,tE[1]);case 5:return mk(tD,tC,38,tE[1]);case 6:return ml(tD,tC,38,tE[1]);case 7:break;default:return mm(tD,tC,38,tE[1]);}if(-1===tD[6])throw [0,d,aZ];tD[6]=-1;return lc(tD,tC,38);}}function mi(tG,tJ,tI,tH){lr(tG);return sk(tG,tJ,tI,[6,tH]);}function mj(tK,tN,tM,tL){lr(tK);return sk(tK,tN,tM,[4,tL]);}function mk(tO,tR,tQ,tP){lr(tO);return sk(tO,tR,tQ,[5,tP]);}function ml(tS,tV,tU,tT){lr(tS);return sk(tS,tV,tU,[3,tT]);}function mu(tZ,tX,tW){var tY=[0,tX,tW],t0=lr(tZ);if(typeof t0==="number")switch(t0){case 0:return l3(tZ,tY,37);case 1:return l4(tZ,tY,37);case 2:return k2(tZ,tY,37);case 3:return k3(tZ,tY,37);case 7:return k4(tZ,tY,37);case 10:return l5(tZ,tY,37);case 11:return l6(tZ,tY,37);case 12:return l7(tZ,tY,37);case 13:return l8(tZ,tY,37);case 16:return l2(tZ,tY,37);case 17:return l9(tZ,tY,37);case 18:return l_(tZ,tY,37);case 19:return l$(tZ,tY,37);default:}else switch(t0[0]){case 1:return lV(tZ,tY,37,t0[1]);case 2:return lW(tZ,tY,37,t0[1]);case 3:return lX(tZ,tY,37,t0[1]);case 4:return lY(tZ,tY,37,t0[1]);case 5:return lZ(tZ,tY,37,t0[1]);case 6:return l0(tZ,tY,37,t0[1]);case 7:break;default:return l1(tZ,tY,37,t0[1]);}if(-1===tZ[6])throw [0,d,aY];tZ[6]=-1;return lc(tZ,tY,37);}function mv(t6,t1,t3){var t2=t1,t4=t3;for(;;){var t5=[0,t2,t4],t7=lr(t6);if(typeof t7==="number"){if(13===t7){var t8=lr(t6);if(typeof t8==="number")switch(t8){case 0:return mo(t6,t5,32);case 1:return mp(t6,t5,32);case 2:return k2(t6,t5,32);case 3:return k3(t6,t5,32);case 6:return mn(t6,t5,32);case 7:return k4(t6,t5,32);case 10:return mq(t6,t5,32);case 11:return mr(t6,t5,32);case 12:return ms(t6,t5,32);case 13:return mt(t6,t5,32);case 16:return mu(t6,t5,32);case 17:var t9=32,t2=t5,t4=t9;continue;case 19:return mw(t6,t5,32);default:}else switch(t8[0]){case 1:return mg(t6,t5,32,t8[1]);case 2:return mh(t6,t5,32,t8[1]);case 3:return mi(t6,t5,32,t8[1]);case 4:return mj(t6,t5,32,t8[1]);case 5:return mk(t6,t5,32,t8[1]);case 6:return ml(t6,t5,32,t8[1]);case 7:break;default:return mm(t6,t5,32,t8[1]);}if(-1===t6[6])throw [0,d,aX];t6[6]=-1;return lc(t6,t5,32);}}else switch(t7[0]){case 4:lr(t6);return sk(t6,t5[1],t5[2],[1,[0,[4,t7[1]],0]]);case 6:lr(t6);return sk(t6,t5[1],t5[2],[1,[0,[3,t7[1]],0]]);default:}if(-1===t6[6])throw [0,d,aW];t6[6]=-1;return lc(t6,t5[1],t5[2]);}}function mw(ub,t$,t_){var ua=[0,t$,t_],uc=lr(ub);if(typeof uc==="number")switch(uc){case 8:case 9:case 14:case 15:var ud=0;break;case 11:return mr(ub,ua,31);default:var ud=1;}else var ud=7===uc[0]?0:1;if(ud)return sk(ub,ua[1],ua[2],aU);if(-1===ub[6])throw [0,d,aV];ub[6]=-1;return lc(ub,ua,31);}function la(uh,uf,ue){var ug=[0,uf,ue],ui=lr(uh);if(typeof ui==="number")switch(ui){case 9:case 15:var uj=0;break;case 11:return k6(uh,ug,25);default:var uj=1;}else var uj=7===ui[0]?0:1;if(uj)return m3(uh,ug[1],ug[2],aS);if(-1===uh[6])throw [0,d,aT];uh[6]=-1;return lc(uh,ug,25);}function nx(up,uk,um){var ul=uk,un=um;for(;;){var uo=[0,ul,un],uq=lr(up);if(typeof uq==="number")if(7<=uq){if(14===uq){var ur=10,ul=uo,un=ur;continue;}}else if(4<=uq){if(-1===up[6])throw [0,d,aR];up[6]=-1;return lc(up,uo,10);}var us=uo[1],ut=uo[2],uu=[0,0,0];for(;;){var uv=[0,us,ut,uu];if(12<=ut)var uw=0;else switch(ut){case 1:case 8:if(-1===up[6])throw [0,d,bv];var ux=up[3];if(typeof ux==="number")switch(ux){case 4:case 5:case 6:case 14:if(-1===up[6])throw [0,d,bu];up[6]=-1;var uy=lc(up,uv,2),uw=1,uz=0;break;case 0:var uy=nt(up,uv,2),uw=1,uz=0;break;case 2:var uy=nu(up,uv,2),uw=1,uz=0;break;case 3:var uy=nv(up,uv,2),uw=1,uz=0;break;case 7:var uy=lG(up,uv,2),uw=1,uz=0;break;case 8:var uy=lK(up,uv,2),uw=1,uz=0;break;case 9:var uy=nw(up,uv,2),uw=1,uz=0;break;case 15:var uy=ny(up,uv,2),uw=1,uz=0;break;default:var uz=1;}else if(7===ux[0]){var uy=nq(up,uv,2,ux[1]),uw=1,uz=0;}else var uz=1;if(uz){var uy=nz(up,uv,2),uw=1;}break;case 7:if(-1===up[6])throw [0,d,bz];var uA=up[3];if(typeof uA==="number")switch(uA){case 4:case 5:case 6:case 14:if(-1===up[6])throw [0,d,by];up[6]=-1;var uy=lc(up,uv,3),uw=1,uB=0;break;case 0:var uy=nt(up,uv,3),uw=1,uB=0;break;case 2:var uy=nu(up,uv,3),uw=1,uB=0;break;case 3:var uy=nv(up,uv,3),uw=1,uB=0;break;case 7:var uy=lG(up,uv,3),uw=1,uB=0;break;case 8:var uy=lK(up,uv,3),uw=1,uB=0;break;case 9:var uy=nw(up,uv,3),uw=1,uB=0;break;case 15:var uy=ny(up,uv,3),uw=1,uB=0;break;default:var uB=1;}else if(7===uA[0]){var uy=nq(up,uv,3,uA[1]),uw=1,uB=0;}else var uB=1;if(uB){var uy=nz(up,uv,3),uw=1;}break;case 10:var uC=uv[1],uF=[0,0,uv[3]],uE=uC[2],uD=uC[1],us=uD,ut=uE,uu=uF;continue;case 11:if(-1===up[6])throw [0,d,bx];var uG=up[3];if(typeof uG==="number")switch(uG){case 4:case 5:case 6:case 14:if(-1===up[6])throw [0,d,bw];up[6]=-1;var uy=lc(up,uv,0),uw=1,uH=0;break;case 0:var uy=nt(up,uv,0),uw=1,uH=0;break;case 2:var uy=nu(up,uv,0),uw=1,uH=0;break;case 3:var uy=nv(up,uv,0),uw=1,uH=0;break;case 7:var uy=lG(up,uv,0),uw=1,uH=0;break;case 8:var uy=lK(up,uv,0),uw=1,uH=0;break;case 9:var uy=nw(up,uv,0),uw=1,uH=0;break;case 15:var uy=ny(up,uv,0),uw=1,uH=0;break;default:var uH=1;}else if(7===uG[0]){var uy=nq(up,uv,0,uG[1]),uw=1,uH=0;}else var uH=1;if(uH){var uy=nz(up,uv,0),uw=1;}break;default:var uw=0;}if(!uw)var uy=lk(0);return uy;}}}function wd(uN,uM,uI,uL){if(12<=uI)if(55<=uI)switch(uI-55|0){case 0:case 2:case 4:case 11:var uJ=1;break;default:var uJ=0;}else var uJ=0;else switch(uI){case 0:case 2:case 3:var uJ=1;break;case 1:case 8:return uK(uN,uM,uI,uL);case 7:return uO(uN,uM,uI,uL);case 11:return uP(uN,uM,uI,uL);default:var uJ=0;}return uJ?uQ(uN,uM,uI,uL):lk(0);}function vH(u4,uT,uS,uR){var uU=[0,uT,uS,uR];if(20<=uS)if(55<=uS)switch(uS-55|0){case 0:case 2:case 4:case 11:var uV=1;break;default:var uV=0;}else var uV=0;else switch(uS){case 0:case 1:case 2:case 3:case 7:case 8:case 11:var uV=1;break;case 16:var uW=uU[1],uX=uW[3],uY=uW[1],uZ=uY[1],u0=uZ[3],u1=uZ[1],u2=uX?uY[3]?[4,[0,u0],uX]:[4,0,[0,u0,uX]]:[4,0,[0,u0,0]],u3=[0,u1[1],u1[2],u2];if(-1===u4[6])throw [0,d,aN];var u5=u4[3];if(typeof u5==="number")if(7<=u5){if(14===u5)return u6(u4,u3,56);}else if(4<=u5){if(-1===u4[6])throw [0,d,aM];u4[6]=-1;return lc(u4,u3,56);}return u7(u4,u3,56);case 19:if(-1===u4[6])throw [0,d,aL];var u8=u4[3];if(typeof u8==="number"&&!(9<=u8))switch(u8){case 4:case 5:case 6:if(-1===u4[6])throw [0,d,aK];u4[6]=-1;return lc(u4,uU,18);case 8:return lN(u4,uU,18);default:}return lO(u4,uU,18);default:var uV=0;}if(uV){if(-1===u4[6])throw [0,d,aJ];var u9=u4[3];if(typeof u9==="number"&&8===u9)return lN(u4,uU,54);if(-1===u4[6])throw [0,d,aI];u4[6]=-1;return lc(u4,uU,54);}return lk(0);}function wN(vc,va,u$,u_){var vb=[0,va,u$,u_];if(-1===vc[6])throw [0,d,aH];var vd=vc[3];if(typeof vd==="number")switch(vd){case 1:return k1(vc,vb,15);case 10:return k5(vc,vb,15);case 11:return k6(vc,vb,15);case 12:return k7(vc,vb,15);case 13:return k8(vc,vb,15);case 16:var ve=[0,vb,15],vf=lr(vc);if(typeof vf==="number")switch(vf){case 0:return l3(vc,ve,14);case 1:return l4(vc,ve,14);case 2:return k2(vc,ve,14);case 3:return k3(vc,ve,14);case 7:return k4(vc,ve,14);case 10:return l5(vc,ve,14);case 11:return l6(vc,ve,14);case 12:return l7(vc,ve,14);case 13:return l8(vc,ve,14);case 16:return l2(vc,ve,14);case 17:return l9(vc,ve,14);case 18:return l_(vc,ve,14);case 19:return l$(vc,ve,14);default:}else switch(vf[0]){case 1:return lV(vc,ve,14,vf[1]);case 2:return lW(vc,ve,14,vf[1]);case 3:return lX(vc,ve,14,vf[1]);case 4:return lY(vc,ve,14,vf[1]);case 5:return lZ(vc,ve,14,vf[1]);case 6:return l0(vc,ve,14,vf[1]);case 7:break;default:return l1(vc,ve,14,vf[1]);}if(-1===vc[6])throw [0,d,aG];vc[6]=-1;return lc(vc,ve,14);case 17:return k_(vc,vb,15);case 18:var vg=[0,vb,15],vh=lr(vc);if(typeof vh==="number")switch(vh){case 0:return mo(vc,vg,13);case 1:return mp(vc,vg,13);case 2:return k2(vc,vg,13);case 3:return k3(vc,vg,13);case 7:return k4(vc,vg,13);case 10:return mq(vc,vg,13);case 11:return mr(vc,vg,13);case 12:return ms(vc,vg,13);case 13:return mt(vc,vg,13);case 16:return mu(vc,vg,13);case 17:return mv(vc,vg,13);case 18:return mn(vc,vg,13);case 19:return mw(vc,vg,13);default:}else switch(vh[0]){case 1:return mg(vc,vg,13,vh[1]);case 2:return mh(vc,vg,13,vh[1]);case 3:return mi(vc,vg,13,vh[1]);case 4:return mj(vc,vg,13,vh[1]);case 5:return mk(vc,vg,13,vh[1]);case 6:return ml(vc,vg,13,vh[1]);case 7:break;default:return mm(vc,vg,13,vh[1]);}if(-1===vc[6])throw [0,d,aF];vc[6]=-1;return lc(vc,vg,13);case 19:return la(vc,vb,15);default:}else switch(vd[0]){case 1:return kT(vc,vb,15,vd[1]);case 2:return kU(vc,vb,15,vd[1]);case 3:return kV(vc,vb,15,vd[1]);case 4:return kW(vc,vb,15,vd[1]);case 5:return kX(vc,vb,15,vd[1]);case 6:return kY(vc,vb,15,vd[1]);case 7:break;default:return kZ(vc,vb,15,vd[1]);}if(-1===vc[6])throw [0,d,aE];vc[6]=-1;return lc(vc,vb,15);}function vz(vu,vi,vk){var vj=vi,vl=vk,vm=0;for(;;){var vn=[0,vj,vl,vm],vo=vl-61|0;if(vo<0||2<vo)var vp=lk(0);else{if(1===vo){var vq=vn[1],vt=[0,0,vn[3]],vs=vq[2],vr=vq[1],vj=vr,vl=vs,vm=vt;continue;}if(-1===vu[6])throw [0,d,aQ];var vv=vu[3];if(typeof vv==="number"&&7===vv){var vw=lr(vu);if(typeof vw==="number"){var vx=vw-7|0;if(vx<0||7<vx)var vy=1;else switch(vx){case 0:var vp=vz(vu,vn,61),vA=1,vy=0;break;case 3:var vp=vB(vu,vn,61),vA=1,vy=0;break;case 7:var vC=vn[1],vD=vn[2];for(;;){var vE=vD-61|0;if(vE<0||2<vE)var vF=0;else switch(vE){case 1:var vF=0;break;case 2:if(-1===vu[6])throw [0,d,bt];var vG=vu[3];if(typeof vG==="number"&&14===vG){lr(vu);var vI=vH(vu,vC[1],vC[2],[0,0]),vF=1,vJ=0;}else var vJ=1;if(vJ){if(-1===vu[6])throw [0,d,bs];vu[6]=-1;var vI=lc(vu,vC,vD),vF=1;}break;default:var vL=vC[2],vK=vC[1],vC=vK,vD=vL;continue;}if(!vF)var vI=lk(0);var vp=vI,vA=1,vy=0;break;}break;default:var vy=1;}}else var vy=1;if(vy){if(-1===vu[6])throw [0,d,aP];vu[6]=-1;var vp=lc(vu,vn,61),vA=1;}}else var vA=0;if(!vA){if(-1===vu[6])throw [0,d,aO];vu[6]=-1;var vp=lc(vu,vn[1],vn[2]);}}return vp;}}function vB(vR,vM,vO){var vN=vM,vP=vO;for(;;){var vQ=[0,vN,vP],vS=lr(vR);if(typeof vS==="number"){if(7===vS)return vz(vR,vQ,62);if(10===vS){var vT=62,vN=vQ,vP=vT;continue;}}if(-1===vR[6])throw [0,d,ay];vR[6]=-1;return lc(vR,vQ,62);}}function uP(v7,vU,v8,v4){var vV=vU[2],vW=vU[1],vZ=vU[3],v0=ae,v1=d_(function(vX){var vY=vX[2];return [0,ee(vX[1]),vY];},vZ);for(;;){if(v1){var v2=v1[2],v3=kJ(v0,v1[1]),v0=v3,v1=v2;continue;}var v5=[0,[1,v0],v4];if(9<=vV)if(55<=vV)switch(vV-55|0){case 0:case 2:case 4:case 11:var v6=1;break;default:var v6=0;}else var v6=0;else switch(vV){case 0:case 2:case 3:var v6=1;break;case 1:case 8:return uK(v7,vW,vV,v5);case 7:return uO(v7,vW,vV,v5);default:var v6=0;}return v6?uQ(v7,vW,vV,v5):lk(0);}}function uK(we,v_,v9,wb){if(1===v9){var v$=v_[1],wa=v_[3],wc=[0,[0,ee(v$[3]),wa],wb];return wd(we,v$[1],v$[2],wc);}if(8===v9){var wf=v_[1],wg=[0,[0,ee(wf[3]),ax],wb];return wd(we,wf[1],wf[2],wg);}return lk(0);}function uO(wn,wh,wo,wk){var wi=wh[2],wj=wh[1],wl=[0,[2,wh[3]],wk];if(9<=wi)if(55<=wi)switch(wi-55|0){case 0:case 2:case 4:case 11:var wm=1;break;default:var wm=0;}else var wm=0;else switch(wi){case 0:case 2:case 3:var wm=1;break;case 1:case 8:return uK(wn,wj,wi,wl);default:var wm=0;}return wm?uQ(wn,wj,wi,wl):lk(0);}function uQ(wA,wp,wr,wt){var wq=wp,ws=wr,wu=wt;for(;;){if(4<=ws){if(55<=ws)switch(ws-55|0){case 0:var wv=wq[1],ww=wv[2],wx=wv[1],wy=[0,wv[3],wu];if(12<=ww)if(55<=ww)switch(ww-55|0){case 0:case 2:case 4:case 11:var wz=1;break;default:var wz=0;}else var wz=0;else switch(ww){case 0:case 2:case 3:var wz=1;break;case 1:case 8:return uK(wA,wx,ww,wy);case 7:return uO(wA,wx,ww,wy);case 11:return uP(wA,wx,ww,wy);default:var wz=0;}if(wz){var wq=wx,ws=ww,wu=wy;continue;}return lk(0);case 2:var wB=wq[1],wC=wB[3],wD=wB[2],wE=wB[1],wF=[0,[3,wC[1],wC[2]],wu];if(12<=wD)if(55<=wD)switch(wD-55|0){case 0:case 2:case 4:case 11:var wG=1;break;default:var wG=0;}else var wG=0;else switch(wD){case 0:case 2:case 3:var wG=1;break;case 1:case 8:return uK(wA,wE,wD,wF);case 7:return uO(wA,wE,wD,wF);case 11:return uP(wA,wE,wD,wF);default:var wG=0;}if(wG){var wq=wE,ws=wD,wu=wF;continue;}return lk(0);case 4:var wH=wq[1],wI=wH[2],wJ=wH[1],wK=[0,0,wu];if(12<=wI)if(55<=wI)switch(wI-55|0){case 0:case 2:case 4:case 11:var wL=1;break;default:var wL=0;}else var wL=0;else switch(wI){case 0:case 2:case 3:var wL=1;break;case 1:case 8:return uK(wA,wJ,wI,wK);case 7:return uO(wA,wJ,wI,wK);case 11:return uP(wA,wJ,wI,wK);default:var wL=0;}if(wL){var wq=wJ,ws=wI,wu=wK;continue;}return lk(0);case 11:return wu;default:}}else switch(ws){case 2:return uK(wA,wq[1],wq[2],wu);case 3:return uO(wA,wq[1],wq[2],wu);case 1:break;default:return uP(wA,wq[1],wq[2],wu);}return lk(0);}}function lk(wM){gC(kz,dJ,aw);throw [0,d,av];}function nz(wQ,wP,wO){return wN(wQ,wP,wO,0);}function lK(wT,wS,wR){return vH(wT,wS,wR,0);}function nt(wU,wW,wV){lr(wU);return wN(wU,wW,wV,[0,0]);}function nu(w2,wX,wZ){var wY=wX,w0=wZ;for(;;){var w1=[0,wY,w0],w3=lr(w2);if(typeof w3==="number")switch(w3){case 3:case 4:case 5:case 6:case 7:case 8:case 9:case 14:case 15:var w4=0;break;case 2:var w5=65,wY=w1,w0=w5;continue;default:var w4=1;}else var w4=7===w3[0]?0:1;if(w4){var w6=w1[1],w7=w1[2],w8=[0,0,0];for(;;){var w9=[0,w6,w7,w8];if(4===w7)var w_=0;else{if(9<=w7)if(55<=w7)switch(w7-55|0){case 0:case 2:case 4:case 11:var w$=1;break;case 10:var xa=w9[1],xd=[0,0,w9[3]],xc=xa[2],xb=xa[1],w6=xb,w7=xc,w8=xd;continue;default:var w_=0,w$=0;}else{var w_=0,w$=0;}else if(6===w7){var w_=0,w$=0;}else var w$=1;if(w$){if(-1===w2[6])throw [0,d,aD];var xe=w2[3];if(typeof xe==="number")switch(xe){case 1:case 10:case 11:case 12:case 13:case 16:case 17:case 18:case 19:var xf=2;break;case 0:var xg=nt(w2,w9,6),w_=1,xf=0;break;default:var xf=1;}else var xf=7===xe[0]?1:2;switch(xf){case 1:if(-1===w2[6])throw [0,d,aC];w2[6]=-1;var xg=lc(w2,w9,6),w_=1;break;case 2:var xg=nz(w2,w9,6),w_=1;break;default:}}}if(!w_)var xg=lk(0);return xg;}}if(-1===w2[6])throw [0,d,au];w2[6]=-1;return lc(w2,w1,65);}}function nv(xm,xh,xj){var xi=xh,xk=xj;for(;;){var xl=[0,xi,xk],xn=lr(xm);if(typeof xn==="number")switch(xn){case 2:case 4:case 5:case 6:case 7:case 8:case 9:case 15:var xo=0;break;case 3:var xp=64,xi=xl,xk=xp;continue;default:var xo=1;}else var xo=7===xn[0]?0:1;if(xo){var xq=xl[1],xr=xl[2],xs=[0,0,0];for(;;){var xt=[0,xq,xr,xs];if(12<=xr)if(55<=xr)switch(xr-55|0){case 0:case 2:case 4:case 11:var xu=1;break;case 9:var xv=xt[1],xy=[0,0,xt[3]],xx=xv[2],xw=xv[1],xq=xw,xr=xx,xs=xy;continue;default:var xu=0;}else var xu=0;else switch(xr){case 4:case 5:case 6:case 9:case 10:var xu=0;break;default:var xu=1;}if(xu){if(-1===xm[6])throw [0,d,aB];var xz=xm[3];if(typeof xz==="number")switch(xz){case 1:case 10:case 11:case 12:case 13:case 16:case 17:case 18:case 19:var xA=1;break;case 0:var xB=nt(xm,xt,9),xA=2;break;case 14:var xC=[0,xt,9],xD=lr(xm);if(typeof xD==="number")switch(xD){case 4:case 5:case 6:if(-1===xm[6])throw [0,d,aA];xm[6]=-1;var xB=lc(xm,xC,8),xA=2,xE=0;break;case 0:var xB=nt(xm,xC,8),xA=2,xE=0;break;case 2:var xB=nu(xm,xC,8),xA=2,xE=0;break;case 3:var xB=nv(xm,xC,8),xA=2,xE=0;break;case 7:var xB=lG(xm,xC,8),xA=2,xE=0;break;case 8:var xB=lK(xm,xC,8),xA=2,xE=0;break;case 9:var xB=nw(xm,xC,8),xA=2,xE=0;break;case 14:var xB=nx(xm,xC,8),xA=2,xE=0;break;case 15:var xB=ny(xm,xC,8),xA=2,xE=0;break;default:var xE=1;}else if(7===xD[0]){var xB=nq(xm,xC,8,xD[1]),xA=2,xE=0;}else var xE=1;if(xE){var xB=nz(xm,xC,8),xA=2;}break;default:var xA=0;}else var xA=7===xz[0]?0:1;switch(xA){case 1:var xB=nz(xm,xt,9);break;case 2:break;default:if(-1===xm[6])throw [0,d,az];xm[6]=-1;var xB=lc(xm,xt,9);}}else var xB=lk(0);return xB;}}if(-1===xm[6])throw [0,d,at];xm[6]=-1;return lc(xm,xl,64);}}function lG(xI,xG,xF){var xH=[0,xG,xF],xJ=lr(xI);if(typeof xJ==="number"){if(7===xJ)return vz(xI,xH,63);if(10===xJ)return vB(xI,xH,63);}if(-1===xI[6])throw [0,d,as];xI[6]=-1;return lc(xI,xH,63);}function nw(xN,xL,xK){var xM=[0,xL,xK],xO=lr(xN);if(typeof xO==="number")if(7<=xO){if(14===xO)return u6(xN,xM,60);}else if(4<=xO){if(-1===xN[6])throw [0,d,ar];xN[6]=-1;return lc(xN,xM,60);}return u7(xN,xM,60);}function ny(xT,xS,xQ){var xP=0;if(12<=xQ)if(55<=xQ)switch(xQ-55|0){case 0:case 2:case 4:case 11:var xR=1;break;default:var xR=0;}else var xR=0;else switch(xQ){case 0:case 2:case 3:var xR=1;break;case 1:case 8:return uK(xT,xS,xQ,xP);case 7:return uO(xT,xS,xQ,xP);case 11:return uP(xT,xS,xQ,xP);default:var xR=0;}return xR?uQ(xT,xS,xQ,xP):lk(0);}function nq(xY,xW,xV,xU){var xX=[0,xW,xV,xU],xZ=lr(xY);if(typeof xZ==="number")if(7<=xZ){if(14===xZ)return u6(xY,xX,58);}else if(4<=xZ){if(-1===xY[6])throw [0,d,aq];xY[6]=-1;return lc(xY,xX,58);}return u7(xY,xX,58);}function lr(x0){var x1=x0[2],x2=d8(x0[1],x1);x0[3]=x2;x0[4]=x1[11];x0[5]=x1[12];var x3=x0[6]+1|0;if(0<=x3)x0[6]=x3;return x2;}function lc(Af,x4,x6){var x5=x4,x7=x6;for(;;)switch(x7){case 1:var x9=x5[2],x8=x5[1],x5=x8,x7=x9;continue;case 2:var x$=x5[2],x_=x5[1],x5=x_,x7=x$;continue;case 3:var yb=x5[2],ya=x5[1],x5=ya,x7=yb;continue;case 4:var yd=x5[2],yc=x5[1],x5=yc,x7=yd;continue;case 5:var yf=x5[2],ye=x5[1],x5=ye,x7=yf;continue;case 6:var yh=x5[2],yg=x5[1],x5=yg,x7=yh;continue;case 7:var yj=x5[2],yi=x5[1],x5=yi,x7=yj;continue;case 8:var yl=x5[2],yk=x5[1],x5=yk,x7=yl;continue;case 9:var yn=x5[2],ym=x5[1],x5=ym,x7=yn;continue;case 10:var yp=x5[2],yo=x5[1],x5=yo,x7=yp;continue;case 11:var yr=x5[2],yq=x5[1],x5=yq,x7=yr;continue;case 12:var yt=x5[2],ys=x5[1],x5=ys,x7=yt;continue;case 13:var yv=x5[2],yu=x5[1],x5=yu,x7=yv;continue;case 14:var yx=x5[2],yw=x5[1],x5=yw,x7=yx;continue;case 15:var yz=x5[2],yy=x5[1],x5=yy,x7=yz;continue;case 16:var yB=x5[2],yA=x5[1],x5=yA,x7=yB;continue;case 17:var yD=x5[2],yC=x5[1],x5=yC,x7=yD;continue;case 18:var yF=x5[2],yE=x5[1],x5=yE,x7=yF;continue;case 19:var yH=x5[2],yG=x5[1],x5=yG,x7=yH;continue;case 20:var yJ=x5[2],yI=x5[1],x5=yI,x7=yJ;continue;case 21:var yL=x5[2],yK=x5[1],x5=yK,x7=yL;continue;case 22:var yN=x5[2],yM=x5[1],x5=yM,x7=yN;continue;case 23:var yP=x5[2],yO=x5[1],x5=yO,x7=yP;continue;case 24:var yR=x5[2],yQ=x5[1],x5=yQ,x7=yR;continue;case 25:var yT=x5[2],yS=x5[1],x5=yS,x7=yT;continue;case 26:var yV=x5[2],yU=x5[1],x5=yU,x7=yV;continue;case 27:var yX=x5[2],yW=x5[1],x5=yW,x7=yX;continue;case 28:var yZ=x5[2],yY=x5[1],x5=yY,x7=yZ;continue;case 29:var y1=x5[2],y0=x5[1],x5=y0,x7=y1;continue;case 30:var y3=x5[2],y2=x5[1],x5=y2,x7=y3;continue;case 31:var y5=x5[2],y4=x5[1],x5=y4,x7=y5;continue;case 32:var y7=x5[2],y6=x5[1],x5=y6,x7=y7;continue;case 33:var y9=x5[2],y8=x5[1],x5=y8,x7=y9;continue;case 34:var y$=x5[2],y_=x5[1],x5=y_,x7=y$;continue;case 35:var zb=x5[2],za=x5[1],x5=za,x7=zb;continue;case 36:var zd=x5[2],zc=x5[1],x5=zc,x7=zd;continue;case 37:var zf=x5[2],ze=x5[1],x5=ze,x7=zf;continue;case 38:var zh=x5[2],zg=x5[1],x5=zg,x7=zh;continue;case 39:var zj=x5[2],zi=x5[1],x5=zi,x7=zj;continue;case 40:var zl=x5[2],zk=x5[1],x5=zk,x7=zl;continue;case 41:var zn=x5[2],zm=x5[1],x5=zm,x7=zn;continue;case 42:var zp=x5[2],zo=x5[1],x5=zo,x7=zp;continue;case 43:var zr=x5[2],zq=x5[1],x5=zq,x7=zr;continue;case 44:var zt=x5[2],zs=x5[1],x5=zs,x7=zt;continue;case 45:var zv=x5[2],zu=x5[1],x5=zu,x7=zv;continue;case 46:var zx=x5[2],zw=x5[1],x5=zw,x7=zx;continue;case 47:var zz=x5[2],zy=x5[1],x5=zy,x7=zz;continue;case 48:var zB=x5[2],zA=x5[1],x5=zA,x7=zB;continue;case 49:var zD=x5[2],zC=x5[1],x5=zC,x7=zD;continue;case 50:var zF=x5[2],zE=x5[1],x5=zE,x7=zF;continue;case 51:var zH=x5[2],zG=x5[1],x5=zG,x7=zH;continue;case 52:var zJ=x5[2],zI=x5[1],x5=zI,x7=zJ;continue;case 53:var zL=x5[2],zK=x5[1],x5=zK,x7=zL;continue;case 54:var zN=x5[2],zM=x5[1],x5=zM,x7=zN;continue;case 55:var zP=x5[2],zO=x5[1],x5=zO,x7=zP;continue;case 56:var zR=x5[2],zQ=x5[1],x5=zQ,x7=zR;continue;case 57:var zT=x5[2],zS=x5[1],x5=zS,x7=zT;continue;case 58:var zV=x5[2],zU=x5[1],x5=zU,x7=zV;continue;case 59:var zX=x5[2],zW=x5[1],x5=zW,x7=zX;continue;case 60:var zZ=x5[2],zY=x5[1],x5=zY,x7=zZ;continue;case 61:var z1=x5[2],z0=x5[1],x5=z0,x7=z1;continue;case 62:var z3=x5[2],z2=x5[1],x5=z2,x7=z3;continue;case 63:var z5=x5[2],z4=x5[1],x5=z4,x7=z5;continue;case 64:var z7=x5[2],z6=x5[1],x5=z6,x7=z7;continue;case 65:var z9=x5[2],z8=x5[1],x5=z8,x7=z9;continue;case 66:var z$=x5[2],z_=x5[1],x5=z_,x7=z$;continue;case 67:var Ab=x5[2],Aa=x5[1],x5=Aa,x7=Ab;continue;case 68:throw Ac;default:var Ae=x5[2],Ad=x5[1],x5=Ad,x7=Ae;continue;}}function u7(Am,Ag,Ai){var Ah=Ag,Aj=Ai,Ak=0;for(;;){var Al=[0,Ah,Aj,Ak];if(56<=Aj)switch(Aj-56|0){case 0:if(-1===Am[6])throw [0,d,ap];var An=Am[3];if(typeof An==="number")switch(An){case 4:case 5:case 6:case 14:if(-1===Am[6])throw [0,d,ao];Am[6]=-1;var Ao=lc(Am,Al,55),Aq=1,Ap=0;break;case 0:var Ao=nt(Am,Al,55),Aq=1,Ap=0;break;case 2:var Ao=nu(Am,Al,55),Aq=1,Ap=0;break;case 3:var Ao=nv(Am,Al,55),Aq=1,Ap=0;break;case 7:var Ao=lG(Am,Al,55),Aq=1,Ap=0;break;case 8:var Ao=lK(Am,Al,55),Aq=1,Ap=0;break;case 9:var Ao=nw(Am,Al,55),Aq=1,Ap=0;break;case 15:var Ao=ny(Am,Al,55),Aq=1,Ap=0;break;default:var Ap=1;}else if(7===An[0]){var Ao=nq(Am,Al,55,An[1]),Aq=1,Ap=0;}else var Ap=1;if(Ap){var Ao=nz(Am,Al,55),Aq=1;}break;case 2:if(-1===Am[6])throw [0,d,an];var Ar=Am[3];if(typeof Ar==="number")switch(Ar){case 4:case 5:case 6:case 14:if(-1===Am[6])throw [0,d,am];Am[6]=-1;var Ao=lc(Am,Al,57),Aq=1,As=0;break;case 0:var Ao=nt(Am,Al,57),Aq=1,As=0;break;case 2:var Ao=nu(Am,Al,57),Aq=1,As=0;break;case 3:var Ao=nv(Am,Al,57),Aq=1,As=0;break;case 7:var Ao=lG(Am,Al,57),Aq=1,As=0;break;case 8:var Ao=lK(Am,Al,57),Aq=1,As=0;break;case 9:var Ao=nw(Am,Al,57),Aq=1,As=0;break;case 15:var Ao=ny(Am,Al,57),Aq=1,As=0;break;default:var As=1;}else if(7===Ar[0]){var Ao=nq(Am,Al,57,Ar[1]),Aq=1,As=0;}else var As=1;if(As){var Ao=nz(Am,Al,57),Aq=1;}break;case 4:if(-1===Am[6])throw [0,d,al];var At=Am[3];if(typeof At==="number")switch(At){case 4:case 5:case 6:case 14:if(-1===Am[6])throw [0,d,ak];Am[6]=-1;var Ao=lc(Am,Al,59),Aq=1,Au=0;break;case 0:var Ao=nt(Am,Al,59),Aq=1,Au=0;break;case 2:var Ao=nu(Am,Al,59),Aq=1,Au=0;break;case 3:var Ao=nv(Am,Al,59),Aq=1,Au=0;break;case 7:var Ao=lG(Am,Al,59),Aq=1,Au=0;break;case 8:var Ao=lK(Am,Al,59),Aq=1,Au=0;break;case 9:var Ao=nw(Am,Al,59),Aq=1,Au=0;break;case 15:var Ao=ny(Am,Al,59),Aq=1,Au=0;break;default:var Au=1;}else if(7===At[0]){var Ao=nq(Am,Al,59,At[1]),Aq=1,Au=0;}else var Au=1;if(Au){var Ao=nz(Am,Al,59),Aq=1;}break;case 11:var Av=Al[1],Ay=[0,0,Al[3]],Ax=Av[2],Aw=Av[1],Ah=Aw,Aj=Ax,Ak=Ay;continue;case 12:if(-1===Am[6])throw [0,d,aj];var Az=Am[3];if(typeof Az==="number")switch(Az){case 4:case 5:case 6:case 14:if(-1===Am[6])throw [0,d,ai];Am[6]=-1;var Ao=lc(Am,Al,66),Aq=1,AA=0;break;case 0:var Ao=nt(Am,Al,66),Aq=1,AA=0;break;case 2:var Ao=nu(Am,Al,66),Aq=1,AA=0;break;case 3:var Ao=nv(Am,Al,66),Aq=1,AA=0;break;case 7:var Ao=lG(Am,Al,66),Aq=1,AA=0;break;case 8:var Ao=lK(Am,Al,66),Aq=1,AA=0;break;case 9:var Ao=nw(Am,Al,66),Aq=1,AA=0;break;case 15:var Ao=ny(Am,Al,66),Aq=1,AA=0;break;default:var AA=1;}else if(7===Az[0]){var Ao=nq(Am,Al,66,Az[1]),Aq=1,AA=0;}else var AA=1;if(AA){var Ao=nz(Am,Al,66),Aq=1;}break;default:var Aq=0;}else var Aq=0;if(!Aq)var Ao=lk(0);return Ao;}}function u6(AG,AB,AD){var AC=AB,AE=AD;for(;;){var AF=[0,AC,AE],AH=lr(AG);if(typeof AH==="number")if(7<=AH){if(14===AH){var AI=67,AC=AF,AE=AI;continue;}}else if(4<=AH){if(-1===AG[6])throw [0,d,ah];AG[6]=-1;return lc(AG,AF,67);}return u7(AG,AF,67);}}var AJ=[0,aa];function AO(AL){var AK=0;for(;;){var AM=eN(f,AK,AL);if(AM<0||31<AM){d8(AL[1],AL);var AK=AM;continue;}switch(AM){case 10:case 23:var AN=18;break;case 0:var AN=AO(AL);break;case 1:var AN=AP(1,AL);break;case 2:var AN=9;break;case 3:var AN=3;break;case 4:var AN=2;break;case 5:var AN=8;break;case 6:var AN=7;break;case 7:var AN=10;break;case 8:var AN=19;break;case 11:var AN=[1,eP(AL,AL[5]+1|0)];break;case 12:var AN=1;break;case 13:var AN=[0,eP(AL,AL[5]+1|0)];break;case 14:var AN=17;break;case 15:var AN=13;break;case 16:var AN=6;break;case 17:var AN=12;break;case 18:var AN=5;break;case 19:var AN=11;break;case 20:var AN=4;break;case 21:var AN=[4,eO(AL,AL[5]+1|0,AL[6]-1|0)];break;case 22:var AN=[5,eP(AL,AL[5]+1|0)];break;case 25:var AN=AQ(e8(16),AL);break;case 26:var AN=[2,eO(AL,AL[5],AL[6])];break;case 27:eQ(AL);var AN=14;break;case 28:var AN=0;break;case 29:var AN=15;break;case 30:var AN=[6,eP(AL,AL[5]+1|0)];break;case 31:var AR=eP(AL,AL[5]);throw [0,AJ,f9(kK,ac,AL[11][4],AR)];default:var AN=16;}return AN;}}function AP(AV,AT){var AS=41;for(;;){var AU=eN(f,AS,AT);if(AU<0||2<AU){d8(AT[1],AT);var AS=AU;continue;}switch(AU){case 1:var AW=1===AV?AO(AT):AP(AV-1|0,AT);break;case 2:var AW=AP(AV,AT);break;default:var AW=AP(AV+1|0,AT);}return AW;}}function AQ(A0,AY){var AX=47;for(;;){var AZ=eN(f,AX,AY);if(AZ<0||3<AZ){d8(AY[1],AY);var AX=AZ;continue;}switch(AZ){case 1:e_(A0,96);var A1=AQ(A0,AY);break;case 2:e$(A0,eO(AY,AY[5],AY[6]));var A1=AQ(A0,AY);break;case 3:eQ(AY);var A2=e8(16),A1=A3(e9(A0),A2,AY);break;default:var A1=[3,e9(A0)];}return A1;}}function A3(A8,A7,A5){var A4=53;for(;;){var A6=eN(f,A4,A5);if(A6<0||3<A6){d8(A5[1],A5);var A4=A6;continue;}switch(A6){case 1:eQ(A5);e_(A7,10);var A9=A3(A8,A7,A5);break;case 2:e_(A7,96);var A9=A3(A8,A7,A5);break;case 3:e$(A7,eO(A5,A5[5],A5[6]));var A9=A3(A8,A7,A5);break;default:if(caml_string_equal(eO(A5,A5[5],A5[6]-3|0),ab))eQ(A5);var A9=[7,[0,A8,e9(A7)]];}return A9;}}var Ca=caml_js_wrap_callback(function(A_){var A$=new MlWrappedString(A_),Bj=[0],Bi=1,Bh=0,Bg=0,Bf=0,Be=0,Bd=0,Bc=A$.getLen(),Bb=dG(A$,dh),Bk=[0,function(Ba){Ba[9]=1;return 0;},Bb,Bc,Bd,Be,Bf,Bg,Bh,Bi,Bj,e,e];try {var Bl=AO(Bk),Bm=[0,AO,Bk,Bl,Bk[11],Bk[12],dH],Bn=0;if(-1===Bm[6])throw [0,d,ag];var Bo=Bm[3];if(typeof Bo==="number")if(7<=Bo)if(14===Bo){var Bp=u6(Bm,Bn,68),Bq=1;}else var Bq=0;else if(4<=Bo){if(-1===Bm[6])throw [0,d,af];Bm[6]=-1;var Bp=lc(Bm,Bn,68),Bq=1;}else var Bq=0;else var Bq=0;if(!Bq)var Bp=u7(Bm,Bn,68);var Br=Bp;}catch(Bs){if(Bs[1]===AJ){f9(kz,dJ,l,Bs[2]);var Br=0;}else{if(Bs[1]!==kL)throw Bs;var Bt=Bk[11];Bu(kz,dJ,k,Bt[2],Bt[4]-Bt[3]|0);var Br=0;}}function B_(Bv){return d8(eh,d8(Bw,Bv));}function Bw(BG,Bx){if(typeof Bx==="number")return e$(BG,Q);else switch(Bx[0]){case 1:var BD=function(BC,By){var Bz=By[2],BA=By[1];if(Bz){BB(BC,BA);e$(BC,S);var BF=eg(Bz);eh(function(BE){e$(BC,U);BD(BC,BE);return e$(BC,T);},BF);return e$(BC,R);}return BB(BC,BA);};return BD(BG,Bx[1]);case 2:e$(BG,M);BB(BG,Bx[1]);return e$(BG,L);case 3:var BI=Bx[2],BH=Bx[1];e$(BG,o);e$(BG,BH);e$(BG,n);e$(BG,BI);return e$(BG,m);case 4:var BJ=Bx[1],BP=function(BK,BL,BO){e$(BK,W);eh(function(BN){e$(BK,dG(Z,dG(BL,_)));BM(BK,BN);return e$(BK,dG(X,dG(BL,Y)));},BO);return e$(BK,V);};e$(BG,K);if(BJ)BP(BG,J,BJ[1]);var BR=Bx[2];eh(function(BQ){return BP(BG,$,BQ);},BR);return e$(BG,I);default:var BS=Bx[1],BT=7<=BS?6:BS,BU=dG(O,dG(dI(BT),P));e_(BG,60);e$(BG,BU);BM(BG,Bx[2]);e$(BG,N);return e$(BG,BU);}}function BB(BW,BV){if(BV){BM(BW,BV[1]);var BY=BV[2];return eh(function(BX){e$(BW,H);return BM(BW,BX);},BY);}return BV;}function BM(B0,B9){return eh(function(BZ){switch(BZ[0]){case 1:e$(B0,G);BM(B0,BZ[1]);var B1=e$(B0,F);break;case 2:e$(B0,E);BM(B0,BZ[1]);var B1=e$(B0,D);break;case 3:var B2=BZ[1],B1=38===B2?e$(B0,C):e_(B0,B2);break;case 4:e_(B0,38);e$(B0,BZ[1]);var B1=e_(B0,59);break;case 5:var B3=BZ[1];e_(B0,38);try {var B4=c0;for(;;){if(!B4)throw [0,c];var B5=B4[1],B7=B4[2],B6=B5[2];if(0!==caml_compare(B5[1],B3)){var B4=B7;continue;}e$(B0,B6);break;}}catch(B8){if(B8[1]!==c)throw B8;i(dG(eu(1,B3),B));}var B1=e_(B0,59);break;case 6:e$(B0,A);e$(B0,BZ[1]);var B1=e$(B0,z);break;case 7:e$(B0,y);BM(B0,BZ[1]);var B1=e$(B0,x);break;case 8:e$(B0,w);BM(B0,BZ[1]);var B1=e$(B0,v);break;case 9:e_(B0,BZ[1]);BM(B0,BZ[2]);var B1=e_(B0,BZ[3]);break;case 10:e$(B0,u);BM(B0,BZ[2]);e$(B0,t);BM(B0,BZ[1]);var B1=e$(B0,s);break;case 11:e$(B0,r);BM(B0,BZ[2]);e$(B0,q);BM(B0,BZ[1]);var B1=e$(B0,p);break;default:var B1=e$(B0,BZ[1]);}return B1;},B9);}var B$=e8(16);gC(B_,B$,Br);return e9(B$).toString();});pastek_core[j.toString()]=Ca;dQ(0);return;}());
