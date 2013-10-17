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
    var a = this.getFullBytes();
    try {
      return this.string = decodeURIComponent (escape(a));
    } catch (e){
      console.error("MlString.toJsString: wrong encoding for \"%s\" ", a);
      return a;
    }
  },
  toBytes:function() {
    if (this.string != null){
      try {
        var b = unescape (encodeURIComponent (this.string));
      } catch (e) {
        console.error("MlString.toBytes: wrong encoding for \"%s\" ", this.string);
        var b = this.string;
      }
    } else {
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
    if (this.len == null) this.toBytes();
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
function MlStringFromArray (a) {
  var len = a.length; this.array = a; this.len = this.last = len;
}
MlStringFromArray.prototype = new MlString ();
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
function caml_new_string(x){return new MlString(x);}
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
function caml_sys_const_word_size () { return 32; }
(function(){var c="",bR="\"",a5="'",bS="</",bn=">",g="number",a="parser.ml",o=caml_array_set,aT=caml_blit_string,ax=caml_create_string,bT=caml_format_float,a7=caml_format_int,bo=caml_is_printable,aI=caml_make_vect,b=caml_new_string,a6=caml_register_global;function p(a,b){return a.length==1?a(b):caml_call_gen(a,[b]);}function q(a,b,c){return a.length==2?a(b,c):caml_call_gen(a,[b,c]);}function u(a,b,c,d){return a.length==3?a(b,c,d):caml_call_gen(a,[b,c,d]);}var a8=[0,b("Failure")],bp=[0,b("Invalid_argument")],a$=[0,b("Not_found")],e=[0,b("Assert_failure")],bu=[0,b(c),1,0,0],a1=[0,b("\0\0\x0b\0\xe2\xff\x02\0\x04\0L\0l\0\xeb\xff\xec\xff\xed\xff\xef\xff\xf0\xff\xde\0\xe1\0\x01\0\xf7\xff\xf8\xff\xf9\xff\xfa\xff\xfb\xff\xfc\xff\xfd\xff\x05\0\x06\0\x02\0\x02\0\xe6\xff\xf4\xff\xf2\xff\x1d\x01\x81\x01\xcc\x01\xea\xff\xe1\xff\x0f\0\xfd\xff\t\0\x10\0\xff\xff\xfe\xff\x05\0\xfc\xff\x0e\0\x03\0\x04\0\xff\xff\x10\0\x11\0\x13\0\x18\0\x1a\0\x1f\0\xff\xff"),b("\xff\xff\x1f\0\xff\xff\x1b\0\x1c\0\x1a\0\x1f\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x0e\0\f\0\n\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x11\0\x01\0\0\0\t\0\xff\xff\xff\xff\xff\xff\xff\xff\x16\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x02\0\x02\0\xff\xff\xff\xff\x02\0\xff\xff\x02\0\x01\0\xff\xff\xff\xff\xff\xff\x03\0\x02\0\x01\0\xff\xff\xff\xff\xff\xff"),b("\x05\0\xff\xff\0\0\xff\xff\xff\xff\x05\0\xff\xff\0\0\0\0\0\0\0\0\0\0\x1c\0\x1b\0\xff\xff\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xff\xff\xff\xff\x18\0\xff\xff\0\0\0\0\0\0\xff\xff\xff\xff\xff\xff\0\0\0\0#\0\0\0\xff\xff\xff\xff\0\0\0\0*\0\0\0*\0\xff\xff\xff\xff\0\0/\0/\0\xff\xff\xff\xff\xff\xff\xff\xff\0\0"),b("\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x04\0\x03\0\x03\0\xff\xff\x04\0\x03\0)\0\0\0\0\0\0\0\0\0\0\0!\0\0\0\0\0\xff\xff\0\x001\0\xff\xff\0\0\0\0\0\0\0\0\x04\0\x0f\0\x03\0\x14\0\x04\0\0\0\x06\0\0\0\x16\0\t\0\x13\0\x11\0!\0\x10\0!\0\x17\0\x18\0!\0'\0!\0!\0!\0!\0%\0!\0$\0&\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xff\xff\xff\xff\0\0\0\0\0\0\0\0\b\0\x01\0\x07\0\f\0\r\0\x0e\0\x19\0\x1a\0,\0-\0+\0!\0!\0!\0!\0!\0!\0\xff\xff\xff\xff\xff\xff\xff\xff0\0\xff\xff\xff\xff3\0\xff\xff\xff\xff\xff\xff\xff\xff2\0\xff\xff3\0\x0b\0\x12\0\n\0\x15\x004\0\0\0\0\0\0\0\0\0\0\0\0\0!\0!\0!\0!\0\0\0\0\0\0\0\0\0\0\0\x1f\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\0\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\xff\xff\xff\xff\xff\xff\xff\xff\0\0\0\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\xff\xff\xff\xff\0\0\xff\xff\xff\xff\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xff\xff\0\0\x02\0\xff\xff\xff\xff\0\0\xff\xff\xff\xff\0\0\xff\xff\0\0\0\0\0\0\0\0\0\0\0\0\xff\xff\xff\xff\xff\xff\xff\xff\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xff\xff\0\0\0\0\xff\xff\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xff\xff\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\0\0 \0\xff\xff\0\0\0\0\xff\xff\0\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\0\0\0\0\0\0\0\0\0\0\0\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\0\0 \0\0\0\0\0\0\0\0\0\0\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\0\0\0\0\xff\xff\0\0\0\0\xff\xff\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\0\0\0\0\0\0\0\0\0\0\0\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0"),b("\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\0\0\0\0\x03\0\x18\0\x04\0\x04\0(\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x01\0\xff\xff\xff\xff*\0\xff\xff.\0/\0\xff\xff\xff\xff\xff\xff\xff\xff\0\0\0\0\x03\0\0\0\x04\0\xff\xff\0\0\xff\xff\0\0\0\0\0\0\0\0\x01\0\0\0\x01\0\x16\0\x17\0\x01\0$\0\x01\0\x01\0\x01\0\x01\0\"\0\x01\0\"\0%\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x05\0\x05\0\xff\xff\xff\xff\xff\xff\xff\xff\0\0\0\0\0\0\0\0\0\0\0\0\x0e\0\x19\0+\0,\0(\0\x01\0\x01\0\x01\0\x01\0\x01\0\x01\0\x05\0\x05\0*\0\x05\0.\0/\0\x05\x000\0\x05\0\x05\0\x05\0\x05\x001\0\x05\x002\0\0\0\0\0\0\0\0\x003\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x01\0\x01\0\x01\0\x01\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x06\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\xff\xff\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x05\0\x05\0\x05\0\x05\0\xff\xff\xff\xff\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\x06\0\f\0\f\0\xff\xff\r\0\r\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\f\0\xff\xff\0\0\r\0\x18\0\xff\xff\f\0(\0\xff\xff\r\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff*\0\"\0.\0/\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\f\0\xff\xff\xff\xff\r\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x05\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\xff\xff\x1d\0\f\0\xff\xff\xff\xff\r\0\xff\xff\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\x1d\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\xff\xff\x1e\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\xff\xff\xff\xff\f\0\xff\xff\xff\xff\r\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1e\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\x1f\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff"),b(c),b(c),b(c),b(c),b(c),b(c)];a6(6,a$);a6(5,[0,b("Division_by_zero")]);a6(3,bp);a6(2,a8);var bV=b("true"),bW=b("false"),bY=b("Pervasives.do_at_exit"),b2=b("tl"),b1=b("hd"),b5=b("\\b"),b6=b("\\t"),b7=b("\\n"),b8=b("\\r"),b4=b("\\\\"),b3=b("\\'"),b_=b("String.blit"),b9=b("String.sub"),b$=b(c),ca=b("Buffer.add: cannot grow buffer"),cq=b(c),cr=b(c),cu=b("%.12g"),cv=b(bR),cw=b(bR),cs=b(a5),ct=b(a5),cp=b("nan"),cn=b("neg_infinity"),co=b("infinity"),cm=b("."),cl=b("printf: bad positional specification (0)."),ck=b("%_"),ci=[0,b("printf.ml"),143,8],cg=b(a5),ch=b("Printf: premature end of format string '"),cc=b(a5),cd=b(" in format string '"),ce=b(", at char number "),cf=b("Printf: bad conversion %"),cb=b("Sformat.index_of_int: negative argument "),cB=[0,[0,65,b("#913")],[0,[0,66,b("#914")],[0,[0,71,b("#915")],[0,[0,68,b("#916")],[0,[0,69,b("#917")],[0,[0,90,b("#918")],[0,[0,84,b("#920")],[0,[0,73,b("#921")],[0,[0,75,b("#922")],[0,[0,76,b("#923")],[0,[0,77,b("#924")],[0,[0,78,b("#925")],[0,[0,88,b("#926")],[0,[0,79,b("#927")],[0,[0,80,b("#928")],[0,[0,82,b("#929")],[0,[0,83,b("#931")],[0,[0,85,b("#933")],[0,[0,67,b("#935")],[0,[0,87,b("#937")],[0,[0,89,b("#936")],[0,[0,97,b("#945")],[0,[0,98,b("#946")],[0,[0,103,b("#947")],[0,[0,100,b("#948")],[0,[0,101,b("#949")],[0,[0,122,b("#950")],[0,[0,116,b("#952")],[0,[0,105,b("#953")],[0,[0,107,b("#954")],[0,[0,108,b("#955")],[0,[0,109,b("#956")],[0,[0,110,b("#957")],[0,[0,120,b("#958")],[0,[0,111,b("#959")],[0,[0,112,b("#960")],[0,[0,114,b("#961")],[0,[0,115,b("#963")],[0,[0,117,b("#965")],[0,[0,99,b("#967")],[0,[0,119,b("#969")],[0,[0,121,b("#968")],0]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]],cF=[0,b(a),155,8],cG=[0,b(a),173,12],cH=[0,b(a),196,8],cI=[0,b(a),209,16],cJ=[0,b(a),217,20],cK=[0,b(a),222,16],cL=[0,b(a),230,20],cM=[0,b(a),236,12],cP=[0,b(a),285,8],cQ=[0,b(a),301,12],cN=[0,b(a),260,8],cO=[0,b(a),280,12],cR=[0,b(a),325,8],cS=[0,b(a),382,16],cT=[0,b(a),386,12],cU=[0,b(a),424,8],cV=[0,b(a),435,12],cW=[0,b(a),442,8],cX=[0,b(a),479,12],cY=[0,b(a),486,8],c1=[0,b(a),503,16],c2=[0,b(a),509,20],cZ=[0,b(a),514,16],c0=[0,b(a),525,20],c3=[0,b(a),531,12],c4=[0,b(a),538,8],c5=[0,b(a),549,12],c6=[0,b(a),406,8],c7=[0,b(a),417,12],c8=[0,b(a),556,8],c$=[0,b(a),587,16],da=[0,b(a),595,20],c9=[0,b(a),569,16],c_=[0,b(a),582,20],db=[0,b(a),601,12],de=[0,b(a),615,8],df=[0,b(a),661,12],dc=[0,b(a),666,8],dd=[0,b(a),715,12],dg=[0,b(a),725,4],dh=[0,b(a),769,8],di=[0,b(a),777,4],dj=[0,b(a),821,8],dk=[0,b(a),829,4],dl=[0,b(a),875,8],dm=[0,b(a),900,8],dn=[0,b(a),922,12],dr=[0,b(a),954,8],ds=[0,b(a),976,12],dp=[0,b(a),927,8],dq=[0,b(a),949,12],dt=[0,b(a),994,8],du=[0,b(a),1002,12],dv=[0,b(a),1206,8],dw=[0,b(a),1217,12],dx=[0,b(a),1020,8],dy=[0,b(a),1031,12],dz=[0,b(a),1038,8],dA=[0,b(a),1049,12],dB=[0,b(a),1056,8],dC=[0,b(a),1067,12],dD=[0,b(a),1074,8],dE=[0,b(a),1111,12],dF=[0,b(a),1118,8],dI=[0,b(a),1135,16],dJ=[0,b(a),1141,20],dG=[0,b(a),1146,16],dH=[0,b(a),1157,20],dK=[0,b(a),1163,12],dL=[0,b(a),1170,8],dM=[0,b(a),1181,12],dN=[0,b(a),1188,8],dO=[0,b(a),1199,12],dP=[3,32],dQ=[0,b(a),1299,8],dR=[0,b(a),1349,8],dS=[0,b(a),1551,8],dT=[0,b(a),1562,12],dU=[0,b(a),1533,8],dV=[0,b(a),1544,12],dW=[0,b(a),1359,8],dX=[0,b(a),1370,12],dY=[0,b(a),1383,8],dZ=[0,b(a),1394,12],d0=[0,b(a),1401,8],d1=[0,b(a),1438,12],d2=[0,b(a),1445,8],d5=[0,b(a),1462,16],d6=[0,b(a),1468,20],d3=[0,b(a),1473,16],d4=[0,b(a),1484,20],d7=[0,b(a),1490,12],d8=[0,b(a),1497,8],d9=[0,b(a),1508,12],d_=[0,b(a),1515,8],d$=[0,b(a),1526,12],ea=[0,b(a),1642,8],eb=[0,b(a),1652,8],ec=[0,b(a),1667,12],ed=[0,b(a),1736,8],ef=[0,b(a),1808,12],ee=[0,b(a),1812,8],eg=[3,45],eh=[0,b(a),1897,8],ei=[0,b(a),1949,8],ej=[0,b(a),2001,8],ek=[3,32],em=[0,b(a),2115,12],el=[0,b(a),2119,8],en=[3,45],eo=[0,b(a),2202,8],ep=[0,b(a),2252,8],eq=[0,b(a),2302,8],es=[0,b(a),2404,12],er=[0,b(a),2408,8],et=[0,b(a),2460,8],ev=[0,b(a),2477,8],eu=[3,33],ex=[0,b(a),2549,12],ew=[0,b(a),2553,8],ey=[3,32],eA=[0,b(a),2637,12],ez=[0,b(a),2641,8],eB=[3,42],eC=[3,35],eD=[3,43],eE=[3,45],eF=[0,b(a),2745,8],eG=[0,b(a),2795,8],eH=[0,b(a),2845,8],eI=[0,b(a),2927,8],eK=[0,b(a),2997,12],eJ=[0,b(a),3001,8],eM=[0,b(a),3020,8],eL=[3,33],eO=[0,b(a),3037,8],eN=[3,33],eP=[0,b(a),3054,8],eQ=[0,b(a),3060,12],eR=[0,b(a),3079,8],eS=[0,b(a),3100,16],eT=[0,b(a),3104,12],eW=[0,b(a),3177,8],eX=[0,b(a),3185,12],eY=[0,b(a),3153,8],eZ=[0,b(a),3161,12],eU=[0,b(a),3142,8],eV=[0,b(a),3148,12],e0=[0,b(a),3195,4],e2=[0,b(a),3299,12],e3=[0,b(a),3247,12],e1=[0,b(a),3327,8],e4=[0,b(a),3345,8],e5=[0,b(a),3362,8],e6=[0,b(a),3370,12],e7=[0,b(a),3389,8],e9=[0,b(a),3403,16],e8=[0,b(a),3411,12],e_=[0,b(a),3432,8],e$=[0,[0,b(c)],0],fa=b("Internal failure -- please contact the parser generator's developers.\n%!"),fb=[0,b(a),3609,4],fc=[0,b(a),3641,12],fd=[0,b(a),3645,8],fe=[0,b(a),3665,8],ff=[0,b(a),3683,8],fg=[0,b(a),3697,8],fh=[0,b(a),3737,8],fk=[0,b(a),3808,8],fl=[0,b(a),3830,12],fm=[0,b(a),3781,8],fn=[0,b(a),3803,12],fi=[0,b(a),3754,8],fj=[0,b(a),3776,12],fo=[0,b(a),3835,8],fp=[0,b(a),3857,12],fq=[0,b(a),4177,8],fr=[0,b(a),4193,4],fs=[0,b(a),4201,8],cD=[0,[0,[0,[0,b(c)],0],0],0],cC=b("Parser.Error"),fu=b("At offset %d: unexpected character '%c'.\n"),fv=b("\n"),ft=b("Lexer.Error"),fO=b("td"),fH=b(bn),fI=b("<"),fJ=b(bn),fK=b(bS),fG=b("<tr>"),fL=b("</tr>"),fB=b("<li>"),fC=b("</li>"),fA=b("<ul>"),fD=b("</ul>"),fw=b("<hr />"),fx=b(bn),fy=b("h"),fz=b(bS),fE=b("<p>"),fF=b("</p>"),fM=b("<table>"),fN=b("th"),fP=b("</table>"),fQ=b("<br />"),fR=b("<sup>"),fS=b("</sup>"),fT=b("<sub>"),fU=b("</sub>"),fV=b("&#38;"),fW=b(" is not greek letter shortcut."),fX=b("<code>"),fY=b("</code>"),fZ=b("<em>"),f0=b("</em>"),f1=b("<strong>"),f2=b("</strong>"),f3=b("<a href=\""),f4=b("\">"),f5=b("</a>"),f6=b("<img src=\""),f7=b("\" alt=\""),f8=b("\" />"),f9=b("<code data-pastek-cmd=\""),f_=b("\"><pre>"),f$=b("</pre></code>"),ga=b("%s%!"),gb=b("Line %d, column %d: syntax error.\n%!"),gd=b("mk_html");function aJ(a){throw [0,a8,a];}function aU(a){throw [0,bp,a];}var bU=(1<<31)-1|0;function n(a,b){var c=a.getLen(),e=b.getLen(),d=ax(c+e|0);aT(a,0,d,0,c);aT(b,0,d,c,e);return d;}function aV(a){return b(""+a);}var a9=caml_ml_open_descriptor_out(2);function bX(a,b){return caml_ml_output(a,b,0,b.getLen());}function bq(a){var b=caml_ml_out_channels_list(0);for(;;){if(b){var c=b[2];try {}catch(d){}var b=c;continue;}return 0;}}caml_register_named_value(bY,bq);function bZ(a,b){return caml_ml_output_char(a,b);}function b0(a){return caml_ml_flush(a);}function a_(a){var c=0,b=a;for(;;){if(b){var c=c+1|0,b=b[2];continue;}return c;}}function br(a){var b=a,c=0;for(;;){if(b){var d=[0,b[1],c],b=b[2],c=d;continue;}return c;}}function bs(a,b){if(b){var c=b[2],d=p(a,b[1]);return [0,d,bs(a,c)];}return 0;}function aK(a,b){var c=b;for(;;){if(c){var d=c[2];p(a,c[1]);var c=d;continue;}return 0;}}function aO(a,b){var c=ax(a);caml_fill_string(c,0,a,b);return c;}function aW(a,b,c){if(0<=b&&0<=c&&!((a.getLen()-c|0)<b)){var d=ax(c);aT(a,b,d,0,c);return d;}return aU(b9);}function aX(a,b,c,d,e){if(0<=e&&0<=b&&!((a.getLen()-e|0)<b)&&0<=d&&!((c.getLen()-e|0)<d))return aT(a,b,c,d,e);return aU(b_);}var bt=caml_sys_const_word_size(0),d=caml_mul(bt/8|0,(1<<(bt-10|0))-1|0)-1|0;function aY(a,b,c){var e=caml_lex_engine(a,b,c);if(0<=e){c[11]=c[12];var d=c[12];c[12]=[0,d[1],d[2],d[3],c[4]+c[6]|0];}return e;}function aP(a,b,c){var d=c-b|0,e=ax(d);aT(a[2],b,e,0,d);return e;}function aQ(a,b){return a[2].safeGet(b);}function aZ(a){var b=a[12];a[12]=[0,b[1],b[2]+1|0,b[4],b[4]];return 0;}function aL(a){var b=1<=a?a:1,c=d<b?d:b,e=ax(c);return [0,e,0,c,e];}function aE(a){return aW(a[1],0,a[2]);}function bv(a,b){var c=[0,a[3]];for(;;){if(c[1]<(a[2]+b|0)){c[1]=2*c[1]|0;continue;}if(d<c[1])if((a[2]+b|0)<=d)c[1]=d;else aJ(ca);var e=ax(c[1]);aX(a[1],0,e,0,a[2]);a[1]=e;a[3]=c[1];return 0;}}function v(a,b){var c=a[2];if(a[3]<=c)bv(a,1);a[1].safeSet(c,b);a[2]=c+1|0;return 0;}function i(a,b){var c=b.getLen(),d=a[2]+c|0;if(a[3]<d)bv(a,c);aX(b,0,a[1],a[2],c);a[2]=d;return 0;}function ba(a){return 0<=a?a:aJ(n(cb,aV(a)));}function bw(a,b){return ba(a+b|0);}var bx=p(bw,1);function by(a){return aW(a,0,a.getLen());}function bz(a,b,c){var d=n(cd,n(a,cc)),e=n(ce,n(aV(b),d));return aU(n(cf,n(aO(1,c),e)));}function aR(a,b,c){return bz(by(a),b,c);}function bb(a){return aU(n(ch,n(by(a),cg)));}function aF(f,b,c,d){function j(a){if((f.safeGet(a)-48|0)<0||9<(f.safeGet(a)-48|0))return a;var b=a+1|0;for(;;){var c=f.safeGet(b);if(48<=c){if(!(58<=c)){var b=b+1|0;continue;}var d=0;}else if(36===c){var e=b+1|0,d=1;}else var d=0;if(!d)var e=a;return e;}}var k=j(b+1|0),g=aL((c-k|0)+10|0);v(g,37);var a=k,h=br(d);for(;;){if(a<=c){var l=f.safeGet(a);if(42===l){if(h){var m=h[2];i(g,aV(h[1]));var a=j(a+1|0),h=m;continue;}throw [0,e,ci];}v(g,l);var a=a+1|0;continue;}return aE(g);}}function bA(a,b,c,d,e){var f=aF(b,c,d,e);if(78!==a&&110!==a)return f;f.safeSet(f.getLen()-1|0,117);return f;}function cj(m,q,c,d,e){var n=d.getLen();function o(a,b){var r=40===a?41:125;function k(a){var c=a;for(;;){if(n<=c)return p(m,d);if(37===d.safeGet(c)){var e=c+1|0;if(n<=e)var f=p(m,d);else{var g=d.safeGet(e),h=g-40|0;if(h<0||1<h){var l=h-83|0;if(l<0||2<l)var j=1;else switch(l){case 1:var j=1;break;case 2:var i=1,j=0;break;default:var i=0,j=0;}if(j){var f=k(e+1|0),i=2;}}else var i=0===h?0:1;switch(i){case 1:var f=g===r?e+1|0:u(q,d,b,g);break;case 2:break;default:var f=k(o(g,e+1|0)+1|0);}}return f;}var c=c+1|0;continue;}}return k(b);}return o(c,e);}function bB(a){return u(cj,bb,aR,a);}function bC(i,b,c){var l=i.getLen()-1|0;function r(a){var k=a;a:for(;;){if(k<l){if(37===i.safeGet(k)){var e=0,h=k+1|0;for(;;){if(l<h)var w=bb(i);else{var m=i.safeGet(h);if(58<=m){if(95===m){var e=1,h=h+1|0;continue;}}else if(32<=m)switch(m-32|0){case 1:case 2:case 4:case 5:case 6:case 7:case 8:case 9:case 12:case 15:break;case 0:case 3:case 11:case 13:var h=h+1|0;continue;case 10:var h=u(b,e,h,105);continue;default:var h=h+1|0;continue;}var d=h;b:for(;;){if(l<d)var f=bb(i);else{var j=i.safeGet(d);if(126<=j)var g=0;else switch(j){case 78:case 88:case 100:case 105:case 111:case 117:case 120:var f=u(b,e,d,105),g=1;break;case 69:case 70:case 71:case 101:case 102:case 103:var f=u(b,e,d,102),g=1;break;case 33:case 37:case 44:case 64:var f=d+1|0,g=1;break;case 83:case 91:case 115:var f=u(b,e,d,115),g=1;break;case 97:case 114:case 116:var f=u(b,e,d,j),g=1;break;case 76:case 108:case 110:var s=d+1|0;if(l<s){var f=u(b,e,d,105),g=1;}else{var o=i.safeGet(s)-88|0;if(o<0||32<o)var p=1;else switch(o){case 0:case 12:case 17:case 23:case 29:case 32:var f=q(c,u(b,e,d,j),105),g=1,p=0;break;default:var p=1;}if(p){var f=u(b,e,d,105),g=1;}}break;case 67:case 99:var f=u(b,e,d,99),g=1;break;case 66:case 98:var f=u(b,e,d,66),g=1;break;case 41:case 125:var f=u(b,e,d,j),g=1;break;case 40:var f=r(u(b,e,d,j)),g=1;break;case 123:var t=u(b,e,d,j),v=u(bB,j,i,t),n=t;for(;;){if(n<(v-2|0)){var n=q(c,n,i.safeGet(n));continue;}var d=v-1|0;continue b;}default:var g=0;}if(!g)var f=aR(i,d,j);}var w=f;break;}}var k=w;continue a;}}var k=k+1|0;continue;}return k;}}r(0);return 0;}function bD(a){var d=[0,0,0,0];function b(a,b,c){var f=41!==c?1:0,g=f?125!==c?1:0:f;if(g){var e=97===c?2:1;if(114===c)d[3]=d[3]+1|0;if(a)d[2]=d[2]+e|0;else d[1]=d[1]+e|0;}return b+1|0;}bC(a,b,function(a,b){return a+1|0;});return d[1];}function bE(a,b,c){var h=a.safeGet(c);if((h-48|0)<0||9<(h-48|0))return q(b,0,c);var e=h-48|0,d=c+1|0;for(;;){var f=a.safeGet(d);if(48<=f){if(!(58<=f)){var e=(10*e|0)+(f-48|0)|0,d=d+1|0;continue;}var g=0;}else if(36===f)if(0===e){var i=aJ(cl),g=1;}else{var i=q(b,[0,ba(e-1|0)],d+1|0),g=1;}else var g=0;if(!g)var i=q(b,0,c);return i;}}function w(a,b){return a?b:p(bx,b);}function bF(a,b){return a?a[1]:b;}function bG(aJ,b,c,d,e,f,g){var F=p(b,g);function af(a){return q(d,F,a);}function aK(a,b,k,aI){var h=k.getLen();function G(j,b){var o=b;for(;;){if(h<=o)return p(a,F);var d=k.safeGet(o);if(37===d){var m=function(a,b){return caml_array_get(aI,bF(a,b));},as=function(g,f,c,d){var a=d;for(;;){var aa=k.safeGet(a)-32|0;if(!(aa<0||25<aa))switch(aa){case 1:case 2:case 4:case 5:case 6:case 7:case 8:case 9:case 12:case 15:break;case 10:return bE(k,function(a,b){var d=[0,m(a,f),c];return as(g,w(a,f),d,b);},a+1|0);default:var a=a+1|0;continue;}var r=k.safeGet(a);if(124<=r)var h=0;else switch(r){case 78:case 88:case 100:case 105:case 111:case 117:case 120:var a$=m(g,f),ba=a7(bA(r,k,o,a,c),a$),j=s(w(g,f),ba,a+1|0),h=1;break;case 69:case 71:case 101:case 102:case 103:var a2=m(g,f),a3=bT(aF(k,o,a,c),a2),j=s(w(g,f),a3,a+1|0),h=1;break;case 76:case 108:case 110:var ad=k.safeGet(a+1|0)-88|0;if(ad<0||32<ad)var ag=1;else switch(ad){case 0:case 12:case 17:case 23:case 29:case 32:var U=a+1|0,ae=r-108|0;if(ae<0||2<ae)var ah=0;else{switch(ae){case 1:var ah=0,ai=0;break;case 2:var a_=m(g,f),az=a7(aF(k,o,U,c),a_),ai=1;break;default:var a9=m(g,f),az=a7(aF(k,o,U,c),a9),ai=1;}if(ai){var ay=az,ah=1;}}if(!ah){var a6=m(g,f),ay=caml_int64_format(aF(k,o,U,c),a6);}var j=s(w(g,f),ay,U+1|0),h=1,ag=0;break;default:var ag=1;}if(ag){var a4=m(g,f),a5=a7(bA(110,k,o,a,c),a4),j=s(w(g,f),a5,a+1|0),h=1;}break;case 37:case 64:var j=s(f,aO(1,r),a+1|0),h=1;break;case 83:case 115:var B=m(g,f);if(115===r)var C=B;else{var b=[0,0],al=B.getLen()-1|0,aN=0;if(!(al<0)){var N=aN;for(;;){var A=B.safeGet(N),bg=14<=A?34===A?1:92===A?1:0:11<=A?13<=A?1:0:8<=A?1:0,aS=bg?2:bo(A)?1:4;b[1]=b[1]+aS|0;var aT=N+1|0;if(al!==N){var N=aT;continue;}break;}}if(b[1]===B.getLen())var aB=B;else{var l=ax(b[1]);b[1]=0;var am=B.getLen()-1|0,aP=0;if(!(am<0)){var M=aP;for(;;){var z=B.safeGet(M),D=z-34|0;if(D<0||58<D)if(-20<=D)var V=1;else{switch(D+34|0){case 8:l.safeSet(b[1],92);b[1]++;l.safeSet(b[1],98);var L=1;break;case 9:l.safeSet(b[1],92);b[1]++;l.safeSet(b[1],116);var L=1;break;case 10:l.safeSet(b[1],92);b[1]++;l.safeSet(b[1],110);var L=1;break;case 13:l.safeSet(b[1],92);b[1]++;l.safeSet(b[1],114);var L=1;break;default:var V=1,L=0;}if(L)var V=0;}else var V=(D-1|0)<0||56<(D-1|0)?(l.safeSet(b[1],92),b[1]++,l.safeSet(b[1],z),0):1;if(V)if(bo(z))l.safeSet(b[1],z);else{l.safeSet(b[1],92);b[1]++;l.safeSet(b[1],48+(z/100|0)|0);b[1]++;l.safeSet(b[1],48+((z/10|0)%10|0)|0);b[1]++;l.safeSet(b[1],48+(z%10|0)|0);}b[1]++;var aQ=M+1|0;if(am!==M){var M=aQ;continue;}break;}}var aB=l;}var C=n(cw,n(aB,cv));}if(a===(o+1|0))var aA=C;else{var K=aF(k,o,a,c);try {var W=0,x=1;for(;;){if(K.getLen()<=x)var ao=[0,0,W];else{var X=K.safeGet(x);if(49<=X)if(58<=X)var aj=0;else{var ao=[0,caml_int_of_string(aW(K,x,(K.getLen()-x|0)-1|0)),W],aj=1;}else{if(45===X){var W=1,x=x+1|0;continue;}var aj=0;}if(!aj){var x=x+1|0;continue;}}var Z=ao;break;}}catch(an){if(an[1]!==a8)throw an;var Z=bz(K,0,115);}var O=Z[1],E=C.getLen(),aU=Z[2],P=0,aV=32;if(O===E&&0===P){var _=C,aM=1;}else var aM=0;if(!aM)if(O<=E)var _=aW(C,P,E);else{var Y=aO(O,aV);if(aU)aX(C,P,Y,0,E);else aX(C,P,Y,O-E|0,E);var _=Y;}var aA=_;}var j=s(w(g,f),aA,a+1|0),h=1;break;case 67:case 99:var t=m(g,f);if(99===r)var av=aO(1,t);else{if(39===t)var y=b3;else if(92===t)var y=b4;else{if(14<=t)var H=0;else switch(t){case 8:var y=b5,H=1;break;case 9:var y=b6,H=1;break;case 10:var y=b7,H=1;break;case 13:var y=b8,H=1;break;default:var H=0;}if(!H)if(bo(t)){var ak=ax(1);ak.safeSet(0,t);var y=ak;}else{var I=ax(4);I.safeSet(0,92);I.safeSet(1,48+(t/100|0)|0);I.safeSet(2,48+((t/10|0)%10|0)|0);I.safeSet(3,48+(t%10|0)|0);var y=I;}}var av=n(ct,n(y,cs));}var j=s(w(g,f),av,a+1|0),h=1;break;case 66:case 98:var a0=a+1|0,a1=m(g,f)?bV:bW,j=s(w(g,f),a1,a0),h=1;break;case 40:case 123:var T=m(g,f),at=u(bB,r,k,a+1|0);if(123===r){var Q=aL(T.getLen()),ap=function(a,b){v(Q,b);return a+1|0;};bC(T,function(a,b,c){if(a)i(Q,ck);else v(Q,37);return ap(b,c);},ap);var aY=aE(Q),j=s(w(g,f),aY,at),h=1;}else{var au=w(g,f),bf=bw(bD(T),au),j=aK(function(a){return G(bf,at);},au,T,aI),h=1;}break;case 33:p(e,F);var j=G(f,a+1|0),h=1;break;case 41:var j=s(f,cq,a+1|0),h=1;break;case 44:var j=s(f,cr,a+1|0),h=1;break;case 70:var ab=m(g,f);if(0===c)var aw=cu;else{var $=aF(k,o,a,c);if(70===r)$.safeSet($.getLen()-1|0,103);var aw=$;}var ar=caml_classify_float(ab);if(3===ar)var ac=ab<0?cn:co;else if(4<=ar)var ac=cp;else{var S=bT(aw,ab),R=0,aZ=S.getLen();for(;;){if(aZ<=R)var aq=n(S,cm);else{var J=S.safeGet(R)-46|0,bh=J<0||23<J?55===J?1:0:(J-1|0)<0||21<(J-1|0)?1:0;if(!bh){var R=R+1|0;continue;}var aq=S;}var ac=aq;break;}}var j=s(w(g,f),ac,a+1|0),h=1;break;case 91:var j=aR(k,a,r),h=1;break;case 97:var aC=m(g,f),aD=p(bx,bF(g,f)),aG=m(0,aD),bb=a+1|0,bc=w(g,aD);if(aJ)af(q(aC,0,aG));else q(aC,F,aG);var j=G(bc,bb),h=1;break;case 114:var j=aR(k,a,r),h=1;break;case 116:var aH=m(g,f),bd=a+1|0,be=w(g,f);if(aJ)af(p(aH,0));else p(aH,F);var j=G(be,bd),h=1;break;default:var h=0;}if(!h)var j=aR(k,a,r);return j;}},f=o+1|0,g=0;return bE(k,function(a,b){return as(a,j,g,b);},f);}q(c,F,d);var o=o+1|0;continue;}}function s(a,b,c){af(b);return G(a,c);}return G(b,0);}var h=q(aK,f,ba(0)),j=bD(g);if(j<0||6<j){var k=function(f,b){if(j<=f){var i=aI(j,0),l=function(a,b){return o(i,(j-a|0)-1|0,b);},c=0,a=b;for(;;){if(a){var d=a[2],e=a[1];if(d){l(c,e);var c=c+1|0,a=d;continue;}l(c,e);}return q(h,g,i);}}return function(a){return k(f+1|0,[0,a,b]);};},a=k(0,0);}else switch(j){case 1:var a=function(a){var b=aI(1,0);o(b,0,a);return q(h,g,b);};break;case 2:var a=function(a,b){var c=aI(2,0);o(c,0,a);o(c,1,b);return q(h,g,c);};break;case 3:var a=function(a,b,c){var d=aI(3,0);o(d,0,a);o(d,1,b);o(d,2,c);return q(h,g,d);};break;case 4:var a=function(a,b,c,d){var e=aI(4,0);o(e,0,a);o(e,1,b);o(e,2,c);o(e,3,d);return q(h,g,e);};break;case 5:var a=function(a,b,c,d,e){var f=aI(5,0);o(f,0,a);o(f,1,b);o(f,2,c);o(f,3,d);o(f,4,e);return q(h,g,f);};break;case 6:var a=function(a,b,c,d,e,f){var i=aI(6,0);o(i,0,a);o(i,1,b);o(i,2,c);o(i,3,d);o(i,4,e);o(i,5,f);return q(h,g,i);};break;default:var a=q(h,g,[0]);}return a;}function bc(b){function a(a){return 0;}return function(a,b,c,d,e,f,g){return a.length==6?a(b,c,d,e,f,g):caml_call_gen(a,[b,c,d,e,f,g]);}(bG,0,function(a){return b;},bZ,bX,b0,a);}function cx(a){return aL(2*a.getLen()|0);}function cy(a,b){var c=aE(b);b[2]=0;return p(a,c);}function cz(a){var b=p(cy,a);return function(a,b,c,d,e,f,g){return a.length==6?a(b,c,d,e,f,g):caml_call_gen(a,[b,c,d,e,f,g]);}(bG,1,cx,v,i,function(a){return 0;},b);}function cA(a){return q(cz,function(a){return a;},a);}function bH(a,b){var c=a[2],d=a[1],e=b[2],f=b[1];if(1!==f&&0!==c){var g=c?c[2]:aJ(b2),h=[0,f-1|0,e],i=c?c[1]:aJ(b1);return [0,d,[0,bH(i,h),g]];}return [0,d,[0,[0,e,0],c]];}var bI=[0,cC],cE=[0,bI];function bd(a,b,c,d){var i=[0,b,c,d];if(27<=c)var S=52<=c?53<=c?0:2:48<=c?1:0;else if(11===c)var S=1;else if(19<=c)switch(c-19|0){case 3:case 7:var S=1;break;case 0:case 1:var S=2;break;default:var S=0;}else var S=0;switch(S){case 1:if(-1===a[6])throw [0,e,de];var t=a[3];if(typeof t===g)switch(t){case 2:case 9:case 15:break;case 0:return K(a,i,22);case 1:return N(a,i,22);case 3:return k(a,i,22);case 4:return l(a,i,22);case 8:return m(a,i,22);case 10:return B(a,i,22);case 11:return C(a,i,22);case 12:return x(a,i,22);case 13:return O(a,i,22);case 16:return L(a,i,22);case 17:return Q(a,i,22);case 18:return M(a,i,22);case 19:return H(a,i,22);default:return aG(a,i,22);}else switch(t[0]){case 1:return z(a,i,22,t[1]);case 2:return A(a,i,22,t[1]);case 3:return D(a,i,22,t[1]);case 4:return E(a,i,22,t[1]);case 5:return F(a,i,22,t[1]);case 6:return G(a,i,22,t[1]);case 7:break;default:return y(a,i,22,t[1]);}if(-1===a[6])throw [0,e,df];a[6]=-1;return h(a,i,22);case 2:if(-1===a[6])throw [0,e,dc];var s=a[3];if(typeof s===g)switch(s){case 0:return K(a,i,20);case 1:return N(a,i,20);case 3:return k(a,i,20);case 4:return l(a,i,20);case 8:return m(a,i,20);case 9:var ae=i[1],$=i[2],ad=[0,i[3],0];for(;;){var n=[0,ae,$,ad],X=$-19|0;if(X<0||1<X)if(33===X)var ab=0;else{var o=j(0),ab=1;}else{if(0!==X){var aa=n[1],ae=aa[1],$=aa[2],ad=[0,aa[3],n[3]];continue;}var ab=0;}if(!ab){if(-1===a[6])throw [0,e,cR];var af=a[3];if(typeof af===g&&9===af){var r=f(a);if(typeof r===g)switch(r){case 0:var o=K(a,n,19),p=1,q=0;break;case 1:var o=N(a,n,19),p=1,q=0;break;case 3:var o=k(a,n,19),p=1,q=0;break;case 4:var o=l(a,n,19),p=1,q=0;break;case 8:var o=m(a,n,19),p=1,q=0;break;case 10:var o=B(a,n,19),p=1,q=0;break;case 11:var o=C(a,n,19),p=1,q=0;break;case 12:var o=x(a,n,19),p=1,q=0;break;case 13:var o=O(a,n,19),p=1,q=0;break;case 14:var P=n[1],U=n[2],Z=[0,n[3],0];for(;;){if(19===U){var ag=[0,P[3],Z],ah=P[2],P=P[1],U=ah,Z=ag;continue;}if(52===U){if(-1===a[6])throw [0,e,cH];var ac=a[3];if(typeof ac===g&&14===ac){f(a);var V=P[2],R=[0,P[1],V,Z];if(18<=V)if(53===V){if(-1===a[6])throw [0,e,cI];var W=a[3];if(typeof W===g)if(8<=W)if(9<=W)var T=1;else{var u=J(a,R,18),v=1,w=0,T=0;}else if(5<=W){if(-1===a[6])throw [0,e,cJ];a[6]=-1;var u=h(a,R,18),v=1,w=0,T=0;}else var T=1;else var T=1;if(T){var u=I(a,R,18),v=1,w=0;}}else var w=1;else if(16<=V){if(-1===a[6])throw [0,e,cK];var _=a[3];if(typeof _===g&&!(10<=_))switch(_){case 5:case 6:case 7:if(-1===a[6])throw [0,e,cL];a[6]=-1;var u=h(a,R,16),v=1,w=0,Y=0;break;case 9:var u=bk(a,R,16),v=1,w=0,Y=0;break;default:var Y=1;}else var Y=1;if(Y){var u=bL(a,R,16),v=1,w=0;}}else var w=1;if(w){var u=j(0),v=1;}}else var v=0;if(!v){if(-1===a[6])throw [0,e,cM];a[6]=-1;var u=h(a,P,U);}}else var u=j(0);var o=u,p=1,q=0;break;}break;case 16:var o=L(a,n,19),p=1,q=0;break;case 17:var o=Q(a,n,19),p=1,q=0;break;case 18:var o=M(a,n,19),p=1,q=0;break;case 19:var o=H(a,n,19),p=1,q=0;break;default:var q=1;}else switch(r[0]){case 1:var o=z(a,n,19,r[1]),p=1,q=0;break;case 2:var o=A(a,n,19,r[1]),p=1,q=0;break;case 3:var o=D(a,n,19,r[1]),p=1,q=0;break;case 4:var o=E(a,n,19,r[1]),p=1,q=0;break;case 5:var o=F(a,n,19,r[1]),p=1,q=0;break;case 6:var o=G(a,n,19,r[1]),p=1,q=0;break;case 7:var q=1;break;default:var o=y(a,n,19,r[1]),p=1,q=0;}if(q){if(-1===a[6])throw [0,e,cS];a[6]=-1;var o=h(a,n,19),p=1;}}else var p=0;if(!p){if(-1===a[6])throw [0,e,cT];a[6]=-1;var o=h(a,n[1],n[2]);}}return o;}case 10:return B(a,i,20);case 11:return C(a,i,20);case 12:return x(a,i,20);case 13:return O(a,i,20);case 16:return L(a,i,20);case 17:return Q(a,i,20);case 18:return M(a,i,20);case 19:return H(a,i,20);default:}else switch(s[0]){case 1:return z(a,i,20,s[1]);case 2:return A(a,i,20,s[1]);case 3:return D(a,i,20,s[1]);case 4:return E(a,i,20,s[1]);case 5:return F(a,i,20,s[1]);case 6:return G(a,i,20,s[1]);case 7:break;default:return y(a,i,20,s[1]);}if(-1===a[6])throw [0,e,dd];a[6]=-1;return h(a,i,20);default:return j(0);}}function bJ(a,b,c,d){var f=[0,b,c,d];if(-1===a[6])throw [0,e,dg];var i=a[3];if(typeof i===g)switch(i){case 5:case 6:case 7:case 16:return U(a,f,33);case 0:return V(a,f,33);case 1:return ay(a,f,33);case 3:return k(a,f,33);case 4:return l(a,f,33);case 8:return m(a,f,33);case 10:return Z(a,f,33);case 11:return _(a,f,33);case 12:return P(a,f,33);case 13:return az(a,f,33);case 17:return aA(a,f,33);case 18:return ad(a,f,33);case 19:return ae(a,f,33);default:}else switch(i[0]){case 1:return X(a,f,33,i[1]);case 2:return Y(a,f,33,i[1]);case 3:return $(a,f,33,i[1]);case 4:return aa(a,f,33,i[1]);case 5:return ab(a,f,33,i[1]);case 6:return ac(a,f,33,i[1]);case 7:break;default:return W(a,f,33,i[1]);}if(-1===a[6])throw [0,e,dh];a[6]=-1;return h(a,f,33);}function bK(a,b,c,d){var f=[0,b,c,d];if(-1===a[6])throw [0,e,di];var i=a[3];if(typeof i===g)switch(i){case 5:case 6:case 7:case 18:return af(a,f,28);case 0:return ag(a,f,28);case 1:return aB(a,f,28);case 3:return k(a,f,28);case 4:return l(a,f,28);case 8:return m(a,f,28);case 10:return ak(a,f,28);case 11:return al(a,f,28);case 12:return R(a,f,28);case 13:return aC(a,f,28);case 16:return aq(a,f,28);case 17:return aD(a,f,28);case 19:return ar(a,f,28);default:}else switch(i[0]){case 1:return ai(a,f,28,i[1]);case 2:return aj(a,f,28,i[1]);case 3:return am(a,f,28,i[1]);case 4:return an(a,f,28,i[1]);case 5:return ao(a,f,28,i[1]);case 6:return ap(a,f,28,i[1]);case 7:break;default:return ah(a,f,28,i[1]);}if(-1===a[6])throw [0,e,dj];a[6]=-1;return h(a,f,28);}function be(a,b,c,d){var f=[0,b,c,d];if(-1===a[6])throw [0,e,dk];var i=a[3];if(typeof i===g)switch(i){case 0:return K(a,f,11);case 1:return N(a,f,11);case 3:return k(a,f,11);case 4:return l(a,f,11);case 8:return m(a,f,11);case 10:return B(a,f,11);case 11:return C(a,f,11);case 12:return x(a,f,11);case 13:return O(a,f,11);case 14:return aG(a,f,11);case 16:return L(a,f,11);case 17:return Q(a,f,11);case 18:return M(a,f,11);case 19:return H(a,f,11);default:}else switch(i[0]){case 1:return z(a,f,11,i[1]);case 2:return A(a,f,11,i[1]);case 3:return D(a,f,11,i[1]);case 4:return E(a,f,11,i[1]);case 5:return F(a,f,11,i[1]);case 6:return G(a,f,11,i[1]);case 7:break;default:return y(a,f,11,i[1]);}if(-1===a[6])throw [0,e,dl];a[6]=-1;return h(a,f,11);}function bf(a,b,c,d){return bd(a,b,c,d);}function bg(a,b,c,d){return bJ(a,b,c,d);}function r(a,b,c,d){return bg(a,b,c,d);}function aG(a,b,c){var k=b,m=c,p=0;for(;;){if(23<=m)if(48<=m)if(52<=m)var d=0;else switch(m-48|0){case 1:if(-1===a[6])throw [0,e,cW];var ag=a[3];if(typeof ag===g&&6===ag){f(a);var G=k[2],D=k[1];if(48<=G)var E=53<=G?1:2;else if(27<=G)var E=1;else switch(G){case 11:case 14:case 19:case 20:case 22:case 26:var E=2;break;case 21:var i=t(a,D[1],D[2],[10,D[3],p]),d=1,L=0,E=0;break;case 23:var ah=D[1],i=t(a,ah[1],ah[2],[11,D[3],p]),d=1,L=0,E=0;break;default:var E=1;}switch(E){case 1:var i=j(0),d=1,L=0;break;case 2:var i=t(a,D,G,[9,40,p,41]),d=1,L=0;break;default:}}else var L=1;if(L){if(-1===a[6])throw [0,e,cX];a[6]=-1;var i=h(a,k,m),d=1;}break;case 2:if(-1===a[6])throw [0,e,cY];var ai=a[3];if(typeof ai===g&&5===ai){f(a);var H=k[2],z=[0,k[1],H,p];if(48<=H)var F=53<=H?1:2;else if(27<=H)var F=1;else switch(H){case 11:case 14:case 19:case 20:case 22:case 26:var F=2;break;case 24:if(-1===a[6])throw [0,e,c1];var aj=a[3];if(typeof aj===g&&12===aj){var i=x(a,z,23),d=1,A=0,F=0,ao=0;}else var ao=1;if(ao){if(-1===a[6])throw [0,e,c2];a[6]=-1;var i=h(a,z,23),d=1,A=0,F=0;}break;default:var F=1;}switch(F){case 1:var i=j(0),d=1,A=0;break;case 2:if(-1===a[6])throw [0,e,cZ];var _=a[3];if(typeof _===g)switch(_){case 2:case 15:var U=1;break;case 12:var i=x(a,z,21),d=1,A=0,U=0;break;default:var U=2;}else var U=7===_[0]?1:2;switch(U){case 1:if(-1===a[6])throw [0,e,c0];a[6]=-1;var i=h(a,z,21),d=1,A=0;break;case 2:var i=t(a,z[1],z[2],[9,40,z[3],41]),d=1,A=0;break;default:}break;default:}}else var A=1;if(A){if(-1===a[6])throw [0,e,c3];a[6]=-1;var i=h(a,k,m),d=1;}break;case 3:if(-1===a[6])throw [0,e,c4];var ak=a[3];if(typeof ak===g&&7===ak){f(a);var i=t(a,k[1],k[2],[2,p]),d=1,ap=0;}else var ap=1;if(ap){if(-1===a[6])throw [0,e,c5];a[6]=-1;var i=h(a,k,m),d=1;}break;default:if(-1===a[6])throw [0,e,cU];var af=a[3];if(typeof af===g&&7===af){f(a);var i=t(a,k[1],k[2],[9,123,p,125]),d=1,aq=0;}else var aq=1;if(aq){if(-1===a[6])throw [0,e,cV];a[6]=-1;var i=h(a,k,m),d=1;}}else if(26===m){if(-1===a[6])throw [0,e,c6];var al=a[3];if(typeof al===g&&7===al){f(a);var i=t(a,k[1],k[2],[1,p]),d=1,ar=0;}else var ar=1;if(ar){if(-1===a[6])throw [0,e,c7];a[6]=-1;var i=h(a,k,m),d=1;}}else var d=0;else if(11===m){if(-1===a[6])throw [0,e,c8];var am=a[3];if(typeof am===g&&14===am){f(a);var an=k[1],K=an[2],s=[0,an[1],K,[0,k[3],p]];if(10<=K)if(54<=K)switch(K-54|0){case 0:case 2:case 9:case 14:var w=2;break;default:var w=1;}else var w=1;else switch(K){case 1:case 4:case 6:case 8:var w=1;break;case 9:if(-1===a[6])throw [0,e,c$];var R=a[3];if(typeof R===g)if(8<=R)if(14===R){var i=aS(a,s,1),d=1,u=0,w=0,M=0;}else var M=1;else if(5<=R){if(-1===a[6])throw [0,e,da];a[6]=-1;var i=h(a,s,1),d=1,u=0,w=0,M=0;}else var M=1;else var M=1;if(M){var i=aN(a,s,1),d=1,u=0,w=0;}break;default:var w=2;}switch(w){case 1:var i=j(0),d=1,u=0;break;case 2:if(-1===a[6])throw [0,e,c9];var $=a[3];if(typeof $===g)switch($){case 2:case 3:case 4:case 8:case 9:case 14:case 15:var N=2;break;case 5:case 6:case 7:if(-1===a[6])throw [0,e,c_];a[6]=-1;var i=h(a,s,3),d=1,u=0,N=0;break;case 0:var i=T(a,s,3),d=1,u=0,N=0;break;default:var N=1;}else var N=7===$[0]?2:1;switch(N){case 1:var i=S(a,s,3),d=1,u=0;break;case 2:var ae=s[1],C=s[2],ad=[0,s[3],0];for(;;){var l=[0,ae,C,ad];if(8<=C)if(54<=C)switch(C-54|0){case 0:case 2:case 9:case 14:var y=1;break;default:var y=0;}else var y=0;else switch(C){case 0:case 2:case 7:var y=1;break;case 3:var X=l[1],ae=X[1],C=X[2],ad=[0,X[3],l[3]];continue;case 5:if(-1===a[6])throw [0,e,cP];var Y=a[3];if(typeof Y===g)switch(Y){case 2:case 4:case 8:case 9:case 14:case 15:var V=2;break;case 3:var n=at(a,l,4),y=2,V=0;break;default:var V=1;}else var V=7===Y[0]?2:1;switch(V){case 1:if(-1===a[6])throw [0,e,cQ];a[6]=-1;var n=h(a,l,4),y=2;break;case 2:var Z=l[1],ab=Z[1],B=Z[2],aa=[0,[0,Z[3],l[3]],0];for(;;){var o=[0,ab,B,aa];if(8<=B)if(54<=B)switch(B-54|0){case 0:case 2:case 9:case 14:var O=1;break;default:var O=0;}else var O=0;else switch(B){case 1:case 3:case 5:var O=0;break;case 4:var ac=o[1],W=ac[1],ab=W[1],B=W[2],aa=[0,[0,W[3],ac[3]],o[3]];continue;default:var O=1;}if(O){if(-1===a[6])throw [0,e,cF];var P=a[3];if(typeof P===g)switch(P){case 2:var r=as(a,o,10),v=1;break;case 4:var r=au(a,o,10),v=1;break;case 8:var r=J(a,o,10),v=1;break;case 9:var r=I(a,o,10),v=1;break;case 14:var r=bj(a,o,10),v=1;break;case 15:var r=av(a,o,10),v=1;break;default:var v=0;}else if(7===P[0]){var r=aw(a,o,10,P[1]),v=1;}else var v=0;if(!v){if(-1===a[6])throw [0,e,cG];a[6]=-1;var r=h(a,o,10);}}else var r=j(0);var n=r,y=2;break;}break;default:}break;default:var y=0;}switch(y){case 1:if(-1===a[6])throw [0,e,cN];var Q=a[3];if(typeof Q===g)switch(Q){case 2:var n=as(a,l,6),q=1;break;case 3:var n=at(a,l,6),q=1;break;case 4:var n=au(a,l,6),q=1;break;case 8:var n=J(a,l,6),q=1;break;case 9:var n=I(a,l,6),q=1;break;case 14:var n=bj(a,l,6),q=1;break;case 15:var n=av(a,l,6),q=1;break;default:var q=0;}else if(7===Q[0]){var n=aw(a,l,6,Q[1]),q=1;}else var q=0;if(!q){if(-1===a[6])throw [0,e,cO];a[6]=-1;var n=h(a,l,6);}break;case 2:break;default:var n=j(0);}var i=n,d=1,u=0;break;}break;default:}break;default:}}else var u=1;if(u){if(-1===a[6])throw [0,e,db];a[6]=-1;var i=h(a,k,m),d=1;}}else{if(22<=m){var ax=[0,k[3],p],ay=k[2],k=k[1],m=ay,p=ax;continue;}var d=0;}if(!d)var i=j(0);return i;}}function K(a,b,c){f(a);return bf(a,b,c,dP);}function L(a,b,c){var d=[0,b,c],i=f(a);if(typeof i===g)switch(i){case 0:return V(a,d,47);case 1:return ay(a,d,47);case 3:return k(a,d,47);case 4:return l(a,d,47);case 8:return m(a,d,47);case 10:return Z(a,d,47);case 11:return _(a,d,47);case 12:return P(a,d,47);case 13:return az(a,d,47);case 16:return U(a,d,47);case 17:return aA(a,d,47);case 18:return ad(a,d,47);case 19:return ae(a,d,47);default:}else switch(i[0]){case 1:return X(a,d,47,i[1]);case 2:return Y(a,d,47,i[1]);case 3:return $(a,d,47,i[1]);case 4:return aa(a,d,47,i[1]);case 5:return ab(a,d,47,i[1]);case 6:return ac(a,d,47,i[1]);case 7:break;default:return W(a,d,47,i[1]);}if(-1===a[6])throw [0,e,dQ];a[6]=-1;return h(a,d,47);}function M(a,b,c){var d=[0,b,c],i=f(a);if(typeof i===g)switch(i){case 0:return ag(a,d,25);case 1:return aB(a,d,25);case 3:return k(a,d,25);case 4:return l(a,d,25);case 8:return m(a,d,25);case 10:return ak(a,d,25);case 11:return al(a,d,25);case 12:return R(a,d,25);case 13:return aC(a,d,25);case 16:return aq(a,d,25);case 17:return aD(a,d,25);case 18:return af(a,d,25);case 19:return ar(a,d,25);default:}else switch(i[0]){case 1:return ai(a,d,25,i[1]);case 2:return aj(a,d,25,i[1]);case 3:return am(a,d,25,i[1]);case 4:return an(a,d,25,i[1]);case 5:return ao(a,d,25,i[1]);case 6:return ap(a,d,25,i[1]);case 7:break;default:return ah(a,d,25,i[1]);}if(-1===a[6])throw [0,e,dR];a[6]=-1;return h(a,d,25);}function bh(a,b,c,d){return bK(a,b,c,d);}function bi(a,b,c,d){if(11<=c)switch(c-11|0){case 0:case 8:case 9:case 11:case 15:case 37:case 38:case 39:case 40:case 41:return bf(a,b,c,d);case 2:case 22:case 25:case 31:case 32:case 33:case 34:case 35:case 36:return bg(a,b,c,d);case 1:case 14:case 17:case 20:case 26:case 27:case 28:case 29:case 30:return bh(a,b,c,d);default:}return j(0);}function s(a,b,c,d){return bh(a,b,c,d);}function t(a,b,c,d){if(48<=c)var e=53<=c?0:1;else if(27<=c)var e=0;else switch(c){case 11:case 19:case 20:case 22:case 26:var e=1;break;case 14:return be(a,b,c,d);default:var e=0;}return e?bf(a,b,c,d):j(0);}function bj(a,b,c){var y=b,x=c;for(;;){var s=[0,y,x],t=f(a);if(typeof t===g)if(8<=t){if(14===t){var y=s,x=64;continue;}}else if(5<=t){if(-1===a[6])throw [0,e,ea];a[6]=-1;return h(a,s,64);}var v=s[1],o=s[2],u=[0,0,0];for(;;){var d=[0,v,o,u];if(11<=o){if(64===o){var w=d[1],v=w[1],o=w[2],u=[0,0,d[3]];continue;}if(65===o){if(-1===a[6])throw [0,e,dm];var p=a[3];if(typeof p===g)switch(p){case 5:case 6:case 7:case 14:if(-1===a[6])throw [0,e,dn];a[6]=-1;var k=h(a,d,63),i=1,l=0;break;case 0:var k=T(a,d,63),i=1,l=0;break;case 2:var k=as(a,d,63),i=1,l=0;break;case 3:var k=at(a,d,63),i=1,l=0;break;case 4:var k=au(a,d,63),i=1,l=0;break;case 8:var k=J(a,d,63),i=1,l=0;break;case 9:var k=I(a,d,63),i=1,l=0;break;case 15:var k=av(a,d,63),i=1,l=0;break;default:var l=1;}else if(7===p[0]){var k=aw(a,d,63,p[1]),i=1,l=0;}else var l=1;if(l){var k=S(a,d,63),i=1;}}else var i=0;}else if(6===o){if(-1===a[6])throw [0,e,dp];var q=a[3];if(typeof q===g)switch(q){case 5:case 6:case 7:case 14:if(-1===a[6])throw [0,e,dq];a[6]=-1;var k=h(a,d,2),i=1,m=0;break;case 0:var k=T(a,d,2),i=1,m=0;break;case 2:var k=as(a,d,2),i=1,m=0;break;case 3:var k=at(a,d,2),i=1,m=0;break;case 4:var k=au(a,d,2),i=1,m=0;break;case 8:var k=J(a,d,2),i=1,m=0;break;case 9:var k=I(a,d,2),i=1,m=0;break;case 15:var k=av(a,d,2),i=1,m=0;break;default:var m=1;}else if(7===q[0]){var k=aw(a,d,2,q[1]),i=1,m=0;}else var m=1;if(m){var k=S(a,d,2),i=1;}}else if(10<=o){if(-1===a[6])throw [0,e,dr];var r=a[3];if(typeof r===g)switch(r){case 5:case 6:case 7:case 14:if(-1===a[6])throw [0,e,ds];a[6]=-1;var k=h(a,d,0),i=1,n=0;break;case 0:var k=T(a,d,0),i=1,n=0;break;case 2:var k=as(a,d,0),i=1,n=0;break;case 3:var k=at(a,d,0),i=1,n=0;break;case 4:var k=au(a,d,0),i=1,n=0;break;case 8:var k=J(a,d,0),i=1,n=0;break;case 9:var k=I(a,d,0),i=1,n=0;break;case 15:var k=av(a,d,0),i=1,n=0;break;default:var n=1;}else if(7===r[0]){var k=aw(a,d,0,r[1]),i=1,n=0;}else var n=1;if(n){var k=S(a,d,0),i=1;}}else var i=0;if(!i)var k=j(0);return k;}}}function bL(a,b,c){var o=b,i=c,n=0;for(;;){var d=[0,o,i,n];if(16===i){var m=d[1],o=m[1],i=m[2],n=[0,m[3],d[3]];continue;}if(17===i){if(-1===a[6])throw [0,e,dt];var k=a[3];if(typeof k===g)if(8<=k)if(9<=k)var f=0;else{var l=J(a,d,15),f=1;}else if(5<=k){if(-1===a[6])throw [0,e,du];a[6]=-1;var l=h(a,d,15),f=1;}else var f=0;else var f=0;if(!f)var l=I(a,d,15);}else var l=j(0);return l;}}function bk(a,b,c){var d=[0,b,c],i=f(a);if(typeof i===g)switch(i){case 0:return K(a,d,52);case 1:return N(a,d,52);case 3:return k(a,d,52);case 4:return l(a,d,52);case 8:return m(a,d,52);case 10:return B(a,d,52);case 11:return C(a,d,52);case 12:return x(a,d,52);case 13:return O(a,d,52);case 16:return L(a,d,52);case 17:return Q(a,d,52);case 18:return M(a,d,52);case 19:return H(a,d,52);default:}else switch(i[0]){case 1:return z(a,d,52,i[1]);case 2:return A(a,d,52,i[1]);case 3:return D(a,d,52,i[1]);case 4:return E(a,d,52,i[1]);case 5:return F(a,d,52,i[1]);case 6:return G(a,d,52,i[1]);case 7:break;default:return y(a,d,52,i[1]);}if(-1===a[6])throw [0,e,ed];a[6]=-1;return h(a,d,52);}function N(a,b,c){var o=b,n=c;for(;;){var d=[0,o,n],j=f(a);if(typeof j===g){if(13===j){var i=f(a);if(typeof i===g)switch(i){case 0:return K(a,d,51);case 1:var o=d,n=51;continue;case 3:return k(a,d,51);case 4:return l(a,d,51);case 7:return aG(a,d,51);case 8:return m(a,d,51);case 10:return B(a,d,51);case 11:return C(a,d,51);case 12:return x(a,d,51);case 13:return O(a,d,51);case 16:return L(a,d,51);case 17:return Q(a,d,51);case 18:return M(a,d,51);case 19:return H(a,d,51);default:}else switch(i[0]){case 1:return z(a,d,51,i[1]);case 2:return A(a,d,51,i[1]);case 3:return D(a,d,51,i[1]);case 4:return E(a,d,51,i[1]);case 5:return F(a,d,51,i[1]);case 6:return G(a,d,51,i[1]);case 7:break;default:return y(a,d,51,i[1]);}if(-1===a[6])throw [0,e,ef];a[6]=-1;return h(a,d,51);}}else switch(j[0]){case 4:f(a);return t(a,d[1],d[2],[2,[0,[4,j[1]],0]]);case 6:f(a);return t(a,d[1],d[2],[2,[0,[3,j[1]],0]]);default:}if(-1===a[6])throw [0,e,ee];a[6]=-1;return h(a,d[1],d[2]);}}function y(a,b,c,d){f(a);return t(a,b,c,[1,[0,[3,d],0]]);}function z(a,b,c,d){f(a);return t(a,b,c,[2,[0,[3,d],0]]);}function A(a,b,c,d){f(a);return t(a,b,c,[0,d]);}function B(a,b,c){f(a);return t(a,b,c,eg);}function C(a,b,c){var n=b,j=c;for(;;){var d=[0,n,j],i=f(a);if(typeof i===g)switch(i){case 0:return K(a,d,50);case 1:return N(a,d,50);case 3:return k(a,d,50);case 4:return l(a,d,50);case 5:return aG(a,d,50);case 8:return m(a,d,50);case 10:return B(a,d,50);case 11:var n=d,j=50;continue;case 12:return x(a,d,50);case 13:return O(a,d,50);case 16:return L(a,d,50);case 17:return Q(a,d,50);case 18:return M(a,d,50);case 19:return H(a,d,50);default:}else switch(i[0]){case 1:return z(a,d,50,i[1]);case 2:return A(a,d,50,i[1]);case 3:return D(a,d,50,i[1]);case 4:return E(a,d,50,i[1]);case 5:return F(a,d,50,i[1]);case 6:return G(a,d,50,i[1]);case 7:break;default:return y(a,d,50,i[1]);}if(-1===a[6])throw [0,e,eh];a[6]=-1;return h(a,d,50);}}function x(a,b,c){var n=b,j=c;for(;;){var d=[0,n,j],i=f(a);if(typeof i===g)switch(i){case 0:return K(a,d,49);case 1:return N(a,d,49);case 3:return k(a,d,49);case 4:return l(a,d,49);case 6:return aG(a,d,49);case 8:return m(a,d,49);case 10:return B(a,d,49);case 11:return C(a,d,49);case 12:var n=d,j=49;continue;case 13:return O(a,d,49);case 16:return L(a,d,49);case 17:return Q(a,d,49);case 18:return M(a,d,49);case 19:return H(a,d,49);default:}else switch(i[0]){case 1:return z(a,d,49,i[1]);case 2:return A(a,d,49,i[1]);case 3:return D(a,d,49,i[1]);case 4:return E(a,d,49,i[1]);case 5:return F(a,d,49,i[1]);case 6:return G(a,d,49,i[1]);case 7:break;default:return y(a,d,49,i[1]);}if(-1===a[6])throw [0,e,ei];a[6]=-1;return h(a,d,49);}}function O(a,b,c){var n=b,j=c;for(;;){var d=[0,n,j],i=f(a);if(typeof i===g)switch(i){case 0:return K(a,d,48);case 1:return N(a,d,48);case 3:return k(a,d,48);case 4:return l(a,d,48);case 7:return aG(a,d,48);case 8:return m(a,d,48);case 10:return B(a,d,48);case 11:return C(a,d,48);case 12:return x(a,d,48);case 13:var n=d,j=48;continue;case 16:return L(a,d,48);case 17:return Q(a,d,48);case 18:return M(a,d,48);case 19:return H(a,d,48);default:}else switch(i[0]){case 1:return z(a,d,48,i[1]);case 2:return A(a,d,48,i[1]);case 3:return D(a,d,48,i[1]);case 4:return E(a,d,48,i[1]);case 5:return F(a,d,48,i[1]);case 6:return G(a,d,48,i[1]);case 7:break;default:return y(a,d,48,i[1]);}if(-1===a[6])throw [0,e,ej];a[6]=-1;return h(a,d,48);}}function D(a,b,c,d){f(a);return t(a,b,c,[6,d]);}function E(a,b,c,d){f(a);return t(a,b,c,[4,d]);}function F(a,b,c,d){f(a);return t(a,b,c,[5,d]);}function G(a,b,c,d){f(a);return t(a,b,c,[3,d]);}function U(a,b,c){var d=b,m=c,l=0;for(;;){var x=m-13|0;if(x<0||34<x)var i=0;else switch(x){case 0:if(-1===a[6])throw [0,e,dv];var z=a[3];if(typeof z===g&&16===z){f(a);var k=be(a,d[1],d[2],[8,l]),i=1,K=0;}else var K=1;if(K){if(-1===a[6])throw [0,e,dw];a[6]=-1;var k=h(a,d,m),i=1;}break;case 20:var S=[0,d[3],l],T=d[2],d=d[1],m=T,l=S;continue;case 23:if(-1===a[6])throw [0,e,dx];var A=a[3];if(typeof A===g&&16===A){f(a);var k=bK(a,d[1],d[2],[8,l]),i=1,L=0;}else var L=1;if(L){if(-1===a[6])throw [0,e,dy];a[6]=-1;var k=h(a,d,m),i=1;}break;case 29:if(-1===a[6])throw [0,e,dz];var B=a[3];if(typeof B===g&&7===B){f(a);var k=r(a,d[1],d[2],[1,l]),i=1,M=0;}else var M=1;if(M){if(-1===a[6])throw [0,e,dA];a[6]=-1;var k=h(a,d,m),i=1;}break;case 30:if(-1===a[6])throw [0,e,dB];var C=a[3];if(typeof C===g&&7===C){f(a);var k=r(a,d[1],d[2],[9,123,l,125]),i=1,N=0;}else var N=1;if(N){if(-1===a[6])throw [0,e,dC];a[6]=-1;var k=h(a,d,m),i=1;}break;case 31:if(-1===a[6])throw [0,e,dD];var D=a[3];if(typeof D===g&&6===D){f(a);var t=d[2],p=d[1];if(32<=t)if(48<=t)var q=1;else switch(t-32|0){case 3:case 5:case 6:case 7:case 8:case 9:var q=1;break;case 0:var k=r(a,p[1],p[2],[10,p[3],l]),i=1,v=0,q=0;break;case 2:var E=p[1],k=r(a,E[1],E[2],[11,p[3],l]),i=1,v=0,q=0;break;default:var q=2;}else var q=13===t?2:1;switch(q){case 1:var k=j(0),i=1,v=0;break;case 2:var k=r(a,p,t,[9,40,l,41]),i=1,v=0;break;default:}}else var v=1;if(v){if(-1===a[6])throw [0,e,dE];a[6]=-1;var k=h(a,d,m),i=1;}break;case 32:if(-1===a[6])throw [0,e,dF];var F=a[3];if(typeof F===g&&5===F){f(a);var G=d[2],n=[0,d[1],G,l],u=G-33|0;if(u<0||14<u)var s=-20===u?2:1;else if(9<=u)var s=2;else switch(u){case 0:case 3:var s=2;break;case 2:if(-1===a[6])throw [0,e,dI];var H=a[3];if(typeof H===g&&12===H){var k=P(a,n,34),i=1,o=0,s=0,O=0;}else var O=1;if(O){if(-1===a[6])throw [0,e,dJ];a[6]=-1;var k=h(a,n,34),i=1,o=0,s=0;}break;default:var s=1;}switch(s){case 1:var k=j(0),i=1,o=0;break;case 2:if(-1===a[6])throw [0,e,dG];var y=a[3];if(typeof y===g)switch(y){case 2:case 9:case 14:case 15:var w=1;break;case 12:var k=P(a,n,32),i=1,o=0,w=0;break;default:var w=2;}else var w=7===y[0]?1:2;switch(w){case 1:if(-1===a[6])throw [0,e,dH];a[6]=-1;var k=h(a,n,32),i=1,o=0;break;case 2:var k=r(a,n[1],n[2],[9,40,n[3],41]),i=1,o=0;break;default:}break;default:}}else var o=1;if(o){if(-1===a[6])throw [0,e,dK];a[6]=-1;var k=h(a,d,m),i=1;}break;case 33:if(-1===a[6])throw [0,e,dL];var I=a[3];if(typeof I===g&&7===I){f(a);var k=r(a,d[1],d[2],[2,l]),i=1,Q=0;}else var Q=1;if(Q){if(-1===a[6])throw [0,e,dM];a[6]=-1;var k=h(a,d,m),i=1;}break;case 34:if(-1===a[6])throw [0,e,dN];var J=a[3];if(typeof J===g&&16===J){f(a);var k=bd(a,d[1],d[2],[8,l]),i=1,R=0;}else var R=1;if(R){if(-1===a[6])throw [0,e,dO];a[6]=-1;var k=h(a,d,m),i=1;}break;default:var i=0;}if(!i)var k=j(0);return k;}}function V(a,b,c){f(a);return bg(a,b,c,ek);}function ay(a,b,c){var o=b,n=c;for(;;){var d=[0,o,n],j=f(a);if(typeof j===g){if(13===j){var i=f(a);if(typeof i===g)switch(i){case 0:return V(a,d,46);case 1:var o=d,n=46;continue;case 3:return k(a,d,46);case 4:return l(a,d,46);case 7:return U(a,d,46);case 8:return m(a,d,46);case 10:return Z(a,d,46);case 11:return _(a,d,46);case 12:return P(a,d,46);case 13:return az(a,d,46);case 17:return aA(a,d,46);case 18:return ad(a,d,46);case 19:return ae(a,d,46);default:}else switch(i[0]){case 1:return X(a,d,46,i[1]);case 2:return Y(a,d,46,i[1]);case 3:return $(a,d,46,i[1]);case 4:return aa(a,d,46,i[1]);case 5:return ab(a,d,46,i[1]);case 6:return ac(a,d,46,i[1]);case 7:break;default:return W(a,d,46,i[1]);}if(-1===a[6])throw [0,e,em];a[6]=-1;return h(a,d,46);}}else switch(j[0]){case 4:f(a);return r(a,d[1],d[2],[2,[0,[4,j[1]],0]]);case 6:f(a);return r(a,d[1],d[2],[2,[0,[3,j[1]],0]]);default:}if(-1===a[6])throw [0,e,el];a[6]=-1;return h(a,d[1],d[2]);}}function W(a,b,c,d){f(a);return r(a,b,c,[1,[0,[3,d],0]]);}function X(a,b,c,d){f(a);return r(a,b,c,[2,[0,[3,d],0]]);}function Y(a,b,c,d){f(a);return r(a,b,c,[0,d]);}function Z(a,b,c){f(a);return r(a,b,c,en);}function _(a,b,c){var n=b,j=c;for(;;){var d=[0,n,j],i=f(a);if(typeof i===g)switch(i){case 0:return V(a,d,45);case 1:return ay(a,d,45);case 3:return k(a,d,45);case 4:return l(a,d,45);case 5:return U(a,d,45);case 8:return m(a,d,45);case 10:return Z(a,d,45);case 11:var n=d,j=45;continue;case 12:return P(a,d,45);case 13:return az(a,d,45);case 17:return aA(a,d,45);case 18:return ad(a,d,45);case 19:return ae(a,d,45);default:}else switch(i[0]){case 1:return X(a,d,45,i[1]);case 2:return Y(a,d,45,i[1]);case 3:return $(a,d,45,i[1]);case 4:return aa(a,d,45,i[1]);case 5:return ab(a,d,45,i[1]);case 6:return ac(a,d,45,i[1]);case 7:break;default:return W(a,d,45,i[1]);}if(-1===a[6])throw [0,e,eo];a[6]=-1;return h(a,d,45);}}function P(a,b,c){var n=b,j=c;for(;;){var d=[0,n,j],i=f(a);if(typeof i===g)switch(i){case 0:return V(a,d,44);case 1:return ay(a,d,44);case 3:return k(a,d,44);case 4:return l(a,d,44);case 6:return U(a,d,44);case 8:return m(a,d,44);case 10:return Z(a,d,44);case 11:return _(a,d,44);case 12:var n=d,j=44;continue;case 13:return az(a,d,44);case 17:return aA(a,d,44);case 18:return ad(a,d,44);case 19:return ae(a,d,44);default:}else switch(i[0]){case 1:return X(a,d,44,i[1]);case 2:return Y(a,d,44,i[1]);case 3:return $(a,d,44,i[1]);case 4:return aa(a,d,44,i[1]);case 5:return ab(a,d,44,i[1]);case 6:return ac(a,d,44,i[1]);case 7:break;default:return W(a,d,44,i[1]);}if(-1===a[6])throw [0,e,ep];a[6]=-1;return h(a,d,44);}}function az(a,b,c){var n=b,j=c;for(;;){var d=[0,n,j],i=f(a);if(typeof i===g)switch(i){case 0:return V(a,d,43);case 1:return ay(a,d,43);case 3:return k(a,d,43);case 4:return l(a,d,43);case 7:return U(a,d,43);case 8:return m(a,d,43);case 10:return Z(a,d,43);case 11:return _(a,d,43);case 12:return P(a,d,43);case 13:var n=d,j=43;continue;case 17:return aA(a,d,43);case 18:return ad(a,d,43);case 19:return ae(a,d,43);default:}else switch(i[0]){case 1:return X(a,d,43,i[1]);case 2:return Y(a,d,43,i[1]);case 3:return $(a,d,43,i[1]);case 4:return aa(a,d,43,i[1]);case 5:return ab(a,d,43,i[1]);case 6:return ac(a,d,43,i[1]);case 7:break;default:return W(a,d,43,i[1]);}if(-1===a[6])throw [0,e,eq];a[6]=-1;return h(a,d,43);}}function $(a,b,c,d){f(a);return r(a,b,c,[6,d]);}function aa(a,b,c,d){f(a);return r(a,b,c,[4,d]);}function ab(a,b,c,d){f(a);return r(a,b,c,[5,d]);}function ac(a,b,c,d){f(a);return r(a,b,c,[3,d]);}function aA(a,b,c){var o=b,n=c;for(;;){var d=[0,o,n],j=f(a);if(typeof j===g){if(13===j){var i=f(a);if(typeof i===g)switch(i){case 0:return V(a,d,42);case 1:return ay(a,d,42);case 3:return k(a,d,42);case 4:return l(a,d,42);case 7:return U(a,d,42);case 8:return m(a,d,42);case 10:return Z(a,d,42);case 11:return _(a,d,42);case 12:return P(a,d,42);case 13:return az(a,d,42);case 17:var o=d,n=42;continue;case 18:return ad(a,d,42);case 19:return ae(a,d,42);default:}else switch(i[0]){case 1:return X(a,d,42,i[1]);case 2:return Y(a,d,42,i[1]);case 3:return $(a,d,42,i[1]);case 4:return aa(a,d,42,i[1]);case 5:return ab(a,d,42,i[1]);case 6:return ac(a,d,42,i[1]);case 7:break;default:return W(a,d,42,i[1]);}if(-1===a[6])throw [0,e,es];a[6]=-1;return h(a,d,42);}}else switch(j[0]){case 4:f(a);return r(a,d[1],d[2],[1,[0,[4,j[1]],0]]);case 6:f(a);return r(a,d[1],d[2],[1,[0,[3,j[1]],0]]);default:}if(-1===a[6])throw [0,e,er];a[6]=-1;return h(a,d[1],d[2]);}}function ad(a,b,c){var d=[0,b,c],i=f(a);if(typeof i===g)switch(i){case 0:return ag(a,d,41);case 1:return aB(a,d,41);case 3:return k(a,d,41);case 4:return l(a,d,41);case 8:return m(a,d,41);case 10:return ak(a,d,41);case 11:return al(a,d,41);case 12:return R(a,d,41);case 13:return aC(a,d,41);case 16:return aq(a,d,41);case 17:return aD(a,d,41);case 18:return af(a,d,41);case 19:return ar(a,d,41);default:}else switch(i[0]){case 1:return ai(a,d,41,i[1]);case 2:return aj(a,d,41,i[1]);case 3:return am(a,d,41,i[1]);case 4:return an(a,d,41,i[1]);case 5:return ao(a,d,41,i[1]);case 6:return ap(a,d,41,i[1]);case 7:break;default:return ah(a,d,41,i[1]);}if(-1===a[6])throw [0,e,et];a[6]=-1;return h(a,d,41);}function ae(a,b,c){var d=[0,b,c],i=f(a);if(typeof i===g)switch(i){case 2:case 9:case 14:case 15:var j=0;break;case 11:return _(a,d,35);default:var j=1;}else var j=7===i[0]?0:1;if(j)return r(a,d[1],d[2],eu);if(-1===a[6])throw [0,e,ev];a[6]=-1;return h(a,d,35);}function Q(a,b,c){var o=b,n=c;for(;;){var d=[0,o,n],j=f(a);if(typeof j===g){if(13===j){var i=f(a);if(typeof i===g)switch(i){case 0:return K(a,d,26);case 1:return N(a,d,26);case 3:return k(a,d,26);case 4:return l(a,d,26);case 7:return aG(a,d,26);case 8:return m(a,d,26);case 10:return B(a,d,26);case 11:return C(a,d,26);case 12:return x(a,d,26);case 13:return O(a,d,26);case 16:return L(a,d,26);case 17:var o=d,n=26;continue;case 18:return M(a,d,26);case 19:return H(a,d,26);default:}else switch(i[0]){case 1:return z(a,d,26,i[1]);case 2:return A(a,d,26,i[1]);case 3:return D(a,d,26,i[1]);case 4:return E(a,d,26,i[1]);case 5:return F(a,d,26,i[1]);case 6:return G(a,d,26,i[1]);case 7:break;default:return y(a,d,26,i[1]);}if(-1===a[6])throw [0,e,ex];a[6]=-1;return h(a,d,26);}}else switch(j[0]){case 4:f(a);return t(a,d[1],d[2],[1,[0,[4,j[1]],0]]);case 6:f(a);return t(a,d[1],d[2],[1,[0,[3,j[1]],0]]);default:}if(-1===a[6])throw [0,e,ew];a[6]=-1;return h(a,d[1],d[2]);}}function af(a,b,c){var d=b,m=c,l=0;for(;;){if(42<=m)var i=0;else switch(m){case 12:if(-1===a[6])throw [0,e,dS];var y=a[3];if(typeof y===g&&18===y){f(a);var k=be(a,d[1],d[2],[7,l]),i=1,K=0;}else var K=1;if(K){if(-1===a[6])throw [0,e,dT];a[6]=-1;var k=h(a,d,m),i=1;}break;case 25:if(-1===a[6])throw [0,e,dU];var z=a[3];if(typeof z===g&&18===z){f(a);var k=bd(a,d[1],d[2],[7,l]),i=1,L=0;}else var L=1;if(L){if(-1===a[6])throw [0,e,dV];a[6]=-1;var k=h(a,d,m),i=1;}break;case 28:var S=[0,d[3],l],T=d[2],d=d[1],m=T,l=S;continue;case 31:if(-1===a[6])throw [0,e,dW];var A=a[3];if(typeof A===g&&7===A){f(a);var k=s(a,d[1],d[2],[1,l]),i=1,M=0;}else var M=1;if(M){if(-1===a[6])throw [0,e,dX];a[6]=-1;var k=h(a,d,m),i=1;}break;case 37:if(-1===a[6])throw [0,e,dY];var B=a[3];if(typeof B===g&&7===B){f(a);var k=s(a,d[1],d[2],[9,123,l,125]),i=1,N=0;}else var N=1;if(N){if(-1===a[6])throw [0,e,dZ];a[6]=-1;var k=h(a,d,m),i=1;}break;case 38:if(-1===a[6])throw [0,e,d0];var C=a[3];if(typeof C===g&&6===C){f(a);var D=d[2],q=d[1],v=D-12|0;if(v<0||29<v)var t=1;else switch(v){case 0:case 13:case 16:case 19:case 25:case 26:case 27:case 28:case 29:var k=s(a,q,D,[9,40,l,41]),i=1,r=0,t=0;break;case 15:var k=s(a,q[1],q[2],[10,q[3],l]),i=1,r=0,t=0;break;case 17:var E=q[1],k=s(a,E[1],E[2],[11,q[3],l]),i=1,r=0,t=0;break;default:var t=1;}if(t){var k=j(0),i=1,r=0;}}else var r=1;if(r){if(-1===a[6])throw [0,e,d1];a[6]=-1;var k=h(a,d,m),i=1;}break;case 39:if(-1===a[6])throw [0,e,d2];var F=a[3];if(typeof F===g&&5===F){f(a);var G=d[2],n=[0,d[1],G,l],w=G-12|0;if(w<0||29<w)var p=1;else switch(w){case 0:case 13:case 16:case 19:case 25:case 26:case 27:case 28:case 29:if(-1===a[6])throw [0,e,d3];var x=a[3];if(typeof x===g)switch(x){case 2:case 9:case 14:case 15:var u=1;break;case 12:var k=R(a,n,27),i=1,o=0,p=0,u=0;break;default:var u=2;}else var u=7===x[0]?1:2;switch(u){case 1:if(-1===a[6])throw [0,e,d4];a[6]=-1;var k=h(a,n,27),i=1,o=0,p=0;break;case 2:var k=s(a,n[1],n[2],[9,40,n[3],41]),i=1,o=0,p=0;break;default:}break;case 18:if(-1===a[6])throw [0,e,d5];var H=a[3];if(typeof H===g&&12===H){var k=R(a,n,29),i=1,o=0,p=0,O=0;}else var O=1;if(O){if(-1===a[6])throw [0,e,d6];a[6]=-1;var k=h(a,n,29),i=1,o=0,p=0;}break;default:var p=1;}if(p){var k=j(0),i=1,o=0;}}else var o=1;if(o){if(-1===a[6])throw [0,e,d7];a[6]=-1;var k=h(a,d,m),i=1;}break;case 40:if(-1===a[6])throw [0,e,d8];var I=a[3];if(typeof I===g&&7===I){f(a);var k=s(a,d[1],d[2],[2,l]),i=1,P=0;}else var P=1;if(P){if(-1===a[6])throw [0,e,d9];a[6]=-1;var k=h(a,d,m),i=1;}break;case 41:if(-1===a[6])throw [0,e,d_];var J=a[3];if(typeof J===g&&18===J){f(a);var k=bJ(a,d[1],d[2],[7,l]),i=1,Q=0;}else var Q=1;if(Q){if(-1===a[6])throw [0,e,d$];a[6]=-1;var k=h(a,d,m),i=1;}break;default:var i=0;}if(!i)var k=j(0);return k;}}function ag(a,b,c){f(a);return bh(a,b,c,ey);}function aB(a,b,c){var o=b,n=c;for(;;){var d=[0,o,n],j=f(a);if(typeof j===g){if(13===j){var i=f(a);if(typeof i===g)switch(i){case 0:return ag(a,d,40);case 1:var o=d,n=40;continue;case 3:return k(a,d,40);case 4:return l(a,d,40);case 7:return af(a,d,40);case 8:return m(a,d,40);case 10:return ak(a,d,40);case 11:return al(a,d,40);case 12:return R(a,d,40);case 13:return aC(a,d,40);case 16:return aq(a,d,40);case 17:return aD(a,d,40);case 19:return ar(a,d,40);default:}else switch(i[0]){case 1:return ai(a,d,40,i[1]);case 2:return aj(a,d,40,i[1]);case 3:return am(a,d,40,i[1]);case 4:return an(a,d,40,i[1]);case 5:return ao(a,d,40,i[1]);case 6:return ap(a,d,40,i[1]);case 7:break;default:return ah(a,d,40,i[1]);}if(-1===a[6])throw [0,e,eA];a[6]=-1;return h(a,d,40);}}else switch(j[0]){case 4:f(a);return s(a,d[1],d[2],[2,[0,[4,j[1]],0]]);case 6:f(a);return s(a,d[1],d[2],[2,[0,[3,j[1]],0]]);default:}if(-1===a[6])throw [0,e,ez];a[6]=-1;return h(a,d[1],d[2]);}}function ah(a,b,c,d){f(a);return s(a,b,c,[1,[0,[3,d],0]]);}function ai(a,b,c,d){f(a);return s(a,b,c,[2,[0,[3,d],0]]);}function aj(a,b,c,d){f(a);return s(a,b,c,[0,d]);}function k(a,b,c){f(a);return bi(a,b,c,eB);}function l(a,b,c){f(a);return bi(a,b,c,eC);}function m(a,b,c){f(a);return bi(a,b,c,eD);}function ak(a,b,c){f(a);return s(a,b,c,eE);}function al(a,b,c){var n=b,j=c;for(;;){var d=[0,n,j],i=f(a);if(typeof i===g)switch(i){case 0:return ag(a,d,39);case 1:return aB(a,d,39);case 3:return k(a,d,39);case 4:return l(a,d,39);case 5:return af(a,d,39);case 8:return m(a,d,39);case 10:return ak(a,d,39);case 11:var n=d,j=39;continue;case 12:return R(a,d,39);case 13:return aC(a,d,39);case 16:return aq(a,d,39);case 17:return aD(a,d,39);case 19:return ar(a,d,39);default:}else switch(i[0]){case 1:return ai(a,d,39,i[1]);case 2:return aj(a,d,39,i[1]);case 3:return am(a,d,39,i[1]);case 4:return an(a,d,39,i[1]);case 5:return ao(a,d,39,i[1]);case 6:return ap(a,d,39,i[1]);case 7:break;default:return ah(a,d,39,i[1]);}if(-1===a[6])throw [0,e,eF];a[6]=-1;return h(a,d,39);}}function R(a,b,c){var n=b,j=c;for(;;){var d=[0,n,j],i=f(a);if(typeof i===g)switch(i){case 0:return ag(a,d,38);case 1:return aB(a,d,38);case 3:return k(a,d,38);case 4:return l(a,d,38);case 6:return af(a,d,38);case 8:return m(a,d,38);case 10:return ak(a,d,38);case 11:return al(a,d,38);case 12:var n=d,j=38;continue;case 13:return aC(a,d,38);case 16:return aq(a,d,38);case 17:return aD(a,d,38);case 19:return ar(a,d,38);default:}else switch(i[0]){case 1:return ai(a,d,38,i[1]);case 2:return aj(a,d,38,i[1]);case 3:return am(a,d,38,i[1]);case 4:return an(a,d,38,i[1]);case 5:return ao(a,d,38,i[1]);case 6:return ap(a,d,38,i[1]);case 7:break;default:return ah(a,d,38,i[1]);}if(-1===a[6])throw [0,e,eG];a[6]=-1;return h(a,d,38);}}function aC(a,b,c){var n=b,j=c;for(;;){var d=[0,n,j],i=f(a);if(typeof i===g)switch(i){case 0:return ag(a,d,37);case 1:return aB(a,d,37);case 3:return k(a,d,37);case 4:return l(a,d,37);case 7:return af(a,d,37);case 8:return m(a,d,37);case 10:return ak(a,d,37);case 11:return al(a,d,37);case 12:return R(a,d,37);case 13:var n=d,j=37;continue;case 16:return aq(a,d,37);case 17:return aD(a,d,37);case 19:return ar(a,d,37);default:}else switch(i[0]){case 1:return ai(a,d,37,i[1]);case 2:return aj(a,d,37,i[1]);case 3:return am(a,d,37,i[1]);case 4:return an(a,d,37,i[1]);case 5:return ao(a,d,37,i[1]);case 6:return ap(a,d,37,i[1]);case 7:break;default:return ah(a,d,37,i[1]);}if(-1===a[6])throw [0,e,eH];a[6]=-1;return h(a,d,37);}}function am(a,b,c,d){f(a);return s(a,b,c,[6,d]);}function an(a,b,c,d){f(a);return s(a,b,c,[4,d]);}function ao(a,b,c,d){f(a);return s(a,b,c,[5,d]);}function ap(a,b,c,d){f(a);return s(a,b,c,[3,d]);}function aq(a,b,c){var d=[0,b,c],i=f(a);if(typeof i===g)switch(i){case 0:return V(a,d,36);case 1:return ay(a,d,36);case 3:return k(a,d,36);case 4:return l(a,d,36);case 8:return m(a,d,36);case 10:return Z(a,d,36);case 11:return _(a,d,36);case 12:return P(a,d,36);case 13:return az(a,d,36);case 16:return U(a,d,36);case 17:return aA(a,d,36);case 18:return ad(a,d,36);case 19:return ae(a,d,36);default:}else switch(i[0]){case 1:return X(a,d,36,i[1]);case 2:return Y(a,d,36,i[1]);case 3:return $(a,d,36,i[1]);case 4:return aa(a,d,36,i[1]);case 5:return ab(a,d,36,i[1]);case 6:return ac(a,d,36,i[1]);case 7:break;default:return W(a,d,36,i[1]);}if(-1===a[6])throw [0,e,eI];a[6]=-1;return h(a,d,36);}function aD(a,b,c){var o=b,n=c;for(;;){var d=[0,o,n],j=f(a);if(typeof j===g){if(13===j){var i=f(a);if(typeof i===g)switch(i){case 0:return ag(a,d,31);case 1:return aB(a,d,31);case 3:return k(a,d,31);case 4:return l(a,d,31);case 7:return af(a,d,31);case 8:return m(a,d,31);case 10:return ak(a,d,31);case 11:return al(a,d,31);case 12:return R(a,d,31);case 13:return aC(a,d,31);case 16:return aq(a,d,31);case 17:var o=d,n=31;continue;case 19:return ar(a,d,31);default:}else switch(i[0]){case 1:return ai(a,d,31,i[1]);case 2:return aj(a,d,31,i[1]);case 3:return am(a,d,31,i[1]);case 4:return an(a,d,31,i[1]);case 5:return ao(a,d,31,i[1]);case 6:return ap(a,d,31,i[1]);case 7:break;default:return ah(a,d,31,i[1]);}if(-1===a[6])throw [0,e,eK];a[6]=-1;return h(a,d,31);}}else switch(j[0]){case 4:f(a);return s(a,d[1],d[2],[1,[0,[4,j[1]],0]]);case 6:f(a);return s(a,d[1],d[2],[1,[0,[3,j[1]],0]]);default:}if(-1===a[6])throw [0,e,eJ];a[6]=-1;return h(a,d[1],d[2]);}}function ar(a,b,c){var d=[0,b,c],i=f(a);if(typeof i===g)switch(i){case 2:case 9:case 14:case 15:var j=0;break;case 11:return al(a,d,30);default:var j=1;}else var j=7===i[0]?0:1;if(j)return s(a,d[1],d[2],eL);if(-1===a[6])throw [0,e,eM];a[6]=-1;return h(a,d,30);}function H(a,b,c){var d=[0,b,c],i=f(a);if(typeof i===g)switch(i){case 2:case 15:var j=0;break;case 11:return C(a,d,24);default:var j=1;}else var j=7===i[0]?0:1;if(j)return t(a,d[1],d[2],eN);if(-1===a[6])throw [0,e,eO];a[6]=-1;return h(a,d,24);}function bM(a,b,c,d){if(11<=c)if(54<=c)switch(c-54|0){case 0:case 2:case 9:case 14:var e=1;break;default:var e=0;}else var e=0;else switch(c){case 0:case 2:case 7:var e=1;break;case 6:return aH(a,b,c,d);case 10:return aM(a,b,c,d);default:var e=0;}return e?a0(a,b,c,d):j(0);}function bN(a,b,c,d){var f=[0,b,c,d];if(19<=c)if(54<=c)switch(c-54|0){case 0:case 2:case 9:case 14:var i=1;break;default:var i=0;}else var i=0;else switch(c){case 0:case 2:case 6:case 7:case 10:var i=1;break;case 15:var q=f[1],l=q[3],r=q[1],s=r[1],m=s[3],t=s[1],u=l?r[3]?[4,[0,m],l]:[4,0,[0,m,l]]:[4,0,[0,m,0]],n=[0,t[1],t[2],u];if(-1===a[6])throw [0,e,eW];var k=a[3];if(typeof k===g)if(8<=k){if(14===k)return aS(a,n,55);}else if(5<=k){if(-1===a[6])throw [0,e,eX];a[6]=-1;return h(a,n,55);}return aN(a,n,55);case 18:if(-1===a[6])throw [0,e,eY];var o=a[3];if(typeof o===g&&!(10<=o))switch(o){case 5:case 6:case 7:if(-1===a[6])throw [0,e,eZ];a[6]=-1;return h(a,f,17);case 9:return bk(a,f,17);default:}return bL(a,f,17);default:var i=0;}if(i){if(-1===a[6])throw [0,e,eU];var p=a[3];if(typeof p===g&&9===p)return bk(a,f,53);if(-1===a[6])throw [0,e,eV];a[6]=-1;return h(a,f,53);}return j(0);}function bO(a,b,c,d){var n=[0,b,c,d];if(-1===a[6])throw [0,e,e0];var o=a[3];if(typeof o===g)switch(o){case 1:return N(a,n,14);case 10:return B(a,n,14);case 11:return C(a,n,14);case 12:return x(a,n,14);case 13:return O(a,n,14);case 16:var i=[0,n,14],p=f(a);if(typeof p===g)switch(p){case 0:return V(a,i,13);case 1:return ay(a,i,13);case 3:return k(a,i,13);case 4:return l(a,i,13);case 8:return m(a,i,13);case 10:return Z(a,i,13);case 11:return _(a,i,13);case 12:return P(a,i,13);case 13:return az(a,i,13);case 16:return U(a,i,13);case 17:return aA(a,i,13);case 18:return ad(a,i,13);case 19:return ae(a,i,13);default:}else switch(p[0]){case 1:return X(a,i,13,p[1]);case 2:return Y(a,i,13,p[1]);case 3:return $(a,i,13,p[1]);case 4:return aa(a,i,13,p[1]);case 5:return ab(a,i,13,p[1]);case 6:return ac(a,i,13,p[1]);case 7:break;default:return W(a,i,13,p[1]);}if(-1===a[6])throw [0,e,e2];a[6]=-1;return h(a,i,13);case 17:return Q(a,n,14);case 18:var j=[0,n,14],q=f(a);if(typeof q===g)switch(q){case 0:return ag(a,j,12);case 1:return aB(a,j,12);case 3:return k(a,j,12);case 4:return l(a,j,12);case 8:return m(a,j,12);case 10:return ak(a,j,12);case 11:return al(a,j,12);case 12:return R(a,j,12);case 13:return aC(a,j,12);case 16:return aq(a,j,12);case 17:return aD(a,j,12);case 18:return af(a,j,12);case 19:return ar(a,j,12);default:}else switch(q[0]){case 1:return ai(a,j,12,q[1]);case 2:return aj(a,j,12,q[1]);case 3:return am(a,j,12,q[1]);case 4:return an(a,j,12,q[1]);case 5:return ao(a,j,12,q[1]);case 6:return ap(a,j,12,q[1]);case 7:break;default:return ah(a,j,12,q[1]);}if(-1===a[6])throw [0,e,e3];a[6]=-1;return h(a,j,12);case 19:return H(a,n,14);default:}else switch(o[0]){case 1:return z(a,n,14,o[1]);case 2:return A(a,n,14,o[1]);case 3:return D(a,n,14,o[1]);case 4:return E(a,n,14,o[1]);case 5:return F(a,n,14,o[1]);case 6:return G(a,n,14,o[1]);case 7:break;default:return y(a,n,14,o[1]);}if(-1===a[6])throw [0,e,e1];a[6]=-1;return h(a,n,14);}function bl(a,b,c){var w=b,q=c,v=0;for(;;){var d=[0,w,q,v],r=q-58|0;if(r<0||2<r)var k=j(0);else{if(1===r){var x=d[1],w=x[1],q=x[2],v=[0,0,d[3]];continue;}if(-1===a[6])throw [0,e,eR];var y=a[3];if(typeof y===g&&8===y){var s=f(a);if(typeof s===g&&8<=s)switch(s-8|0){case 0:var k=bl(a,d,58),l=1,m=0;break;case 2:var k=bP(a,d,58),l=1,m=0;break;case 6:var i=d[1],o=d[2];for(;;){var p=o-58|0;if(p<0||2<p)var n=0;else switch(p){case 1:var n=0;break;case 2:if(-1===a[6])throw [0,e,eb];var u=a[3];if(typeof u===g&&14===u){f(a);var t=bN(a,i[1],i[2],[0,0]),n=1,z=0;}else var z=1;if(z){if(-1===a[6])throw [0,e,ec];a[6]=-1;var t=h(a,i,o),n=1;}break;default:var A=i[2],i=i[1],o=A;continue;}if(!n)var t=j(0);var k=t,l=1,m=0;break;}break;default:var m=1;}else var m=1;if(m){if(-1===a[6])throw [0,e,eS];a[6]=-1;var k=h(a,d,58),l=1;}}else var l=0;if(!l){if(-1===a[6])throw [0,e,eT];a[6]=-1;var k=h(a,d[1],d[2]);}}return k;}}function bP(a,b,c){var k=b,j=c;for(;;){var d=[0,k,j],l=f(a);if(typeof l===g){var i=l-8|0;if(!(i<0||2<i))switch(i){case 1:break;case 2:var k=d,j=59;continue;default:return bl(a,d,59);}}if(-1===a[6])throw [0,e,e_];a[6]=-1;return h(a,d,59);}}function aM(a,b,c,d){var e=b[2],i=b[1],m=b[3],h=cD,g=bs(function(a){var b=a[2];return [0,a_(a[1]),b];},m);for(;;){if(g){var l=g[2],h=bH(h,g[1]),g=l;continue;}var k=[0,[1,h],d];if(8<=e)if(54<=e)switch(e-54|0){case 0:case 2:case 9:case 14:var f=1;break;default:var f=0;}else var f=0;else switch(e){case 0:case 2:case 7:var f=1;break;case 6:return aH(a,i,e,k);default:var f=0;}return f?a0(a,i,e,k):j(0);}}function aH(a,b,c,d){return a0(a,b[1],b[2],[0,[2,b[3]],d]);}function a0(a,b,c,d){var e=b,g=c,f=d;for(;;){if(8<=g){if(54<=g)switch(g-54|0){case 0:var o=e[1],h=o[2],p=o[1],q=[0,o[3],f];if(11<=h)if(54<=h)switch(h-54|0){case 0:case 2:case 9:case 14:var l=1;break;default:var l=0;}else var l=0;else switch(h){case 0:case 2:case 7:var l=1;break;case 6:return aH(a,p,h,q);case 10:return aM(a,p,h,q);default:var l=0;}if(l){var e=p,g=h,f=q;continue;}return j(0);case 2:var r=e[1],z=r[3],i=r[2],s=r[1],t=[0,[3,z[1],z[2]],f];if(11<=i)if(54<=i)switch(i-54|0){case 0:case 2:case 9:case 14:var m=1;break;default:var m=0;}else var m=0;else switch(i){case 0:case 2:case 7:var m=1;break;case 6:return aH(a,s,i,t);case 10:return aM(a,s,i,t);default:var m=0;}if(m){var e=s,g=i,f=t;continue;}return j(0);case 9:var A=e[1][1],k=A[2],u=A[1],v=[0,0,f];if(11<=k)if(54<=k)switch(k-54|0){case 0:case 2:case 9:case 14:var n=1;break;default:var n=0;}else var n=0;else switch(k){case 0:case 2:case 7:var n=1;break;case 6:return aH(a,u,k,v);case 10:return aM(a,u,k,v);default:var n=0;}if(n){var e=u,g=k,f=v;continue;}return j(0);case 14:return f;default:}}else switch(g){case 0:return aM(a,e[1],e[2],f);case 2:return aH(a,e[1],e[2],f);case 7:var B=e[2],w=e[1];if(1===B){var x=w[1],C=w[3],D=[0,[0,a_(x[3]),C],f];return bM(a,x[1],x[2],D);}if(8===B){var y=w[1],E=[0,[0,a_(y[3]),e$],f];return bM(a,y[1],y[2],E);}return j(0);default:}return j(0);}}function j(a){q(bc,a9,fa);throw [0,e,fb];}function S(a,b,c){return bO(a,b,c,0);}function I(a,b,c){return bN(a,b,c,0);}function T(a,b,c){f(a);return bO(a,b,c,[0,0]);}function as(a,b,c){var l=[0,b,c],v=f(a);if(typeof v===g&&2===v){var w=f(a);if(typeof w===g&&2===w){var u=l,t=67;for(;;){var k=[0,u,t],m=f(a);if(typeof m===g){if(2===m){var u=k,t=66;continue;}if(14===m){var q=k[1],d=k[2],p=[0,0,0];for(;;){var i=[0,q,d,p];if(66===d){var r=i[1],q=r[1],d=r[2],p=[0,0,i[3]];continue;}if(67===d){if(-1===a[6])throw [0,e,eP];var s=a[3];if(typeof s===g&&14===s){var n=bj(a,i,65),y=1;}else var y=0;if(!y){if(-1===a[6])throw [0,e,eQ];a[6]=-1;var n=h(a,i,65);}}else var n=j(0);var x=n,o=1;break;}}else var o=0;}else var o=0;if(!o){if(-1===a[6])throw [0,e,e4];a[6]=-1;var x=h(a,k,66);}return x;}}if(-1===a[6])throw [0,e,fc];a[6]=-1;return h(a,l,67);}if(-1===a[6])throw [0,e,fd];a[6]=-1;return h(a,l[1],l[2]);}function at(a,b,c){var v=b,u=c;for(;;){var l=[0,v,u],p=f(a);if(typeof p===g)switch(p){case 2:case 4:case 5:case 6:case 7:case 8:case 9:case 14:case 15:var q=0;break;case 3:var v=l,u=62;continue;default:var q=1;}else var q=7===p[0]?0:1;if(q){var s=l[1],d=l[2],r=[0,0,0];for(;;){var i=[0,s,d,r];if(8<=d)if(54<=d)switch(d-54|0){case 0:case 2:case 9:case 14:var k=1;break;case 8:var t=i[1],s=t[1],d=t[2],r=[0,0,i[3]];continue;default:var k=0;}else var k=0;else switch(d){case 1:case 3:case 5:var k=0;break;default:var k=1;}if(k){if(-1===a[6])throw [0,e,e5];var o=a[3];if(typeof o===g)switch(o){case 1:case 10:case 11:case 12:case 13:case 16:case 17:case 18:case 19:var n=1;break;case 0:var m=T(a,i,5),n=2;break;default:var n=0;}else var n=7===o[0]?0:1;switch(n){case 1:var m=S(a,i,5);break;case 2:break;default:if(-1===a[6])throw [0,e,e6];a[6]=-1;var m=h(a,i,5);}}else var m=j(0);return m;}}if(-1===a[6])throw [0,e,fe];a[6]=-1;return h(a,l,62);}}function au(a,b,c){var y=b,x=c;for(;;){var p=[0,y,x],s=f(a);if(typeof s===g)switch(s){case 2:case 3:case 5:case 6:case 7:case 8:case 9:case 15:var t=0;break;case 4:var y=p,x=61;continue;default:var t=1;}else var t=7===s[0]?0:1;if(t){var v=p[1],k=p[2],u=[0,0,0];for(;;){var l=[0,v,k,u];if(11<=k)if(54<=k)switch(k-54|0){case 0:case 2:case 9:case 14:var m=1;break;case 7:var w=l[1],v=w[1],k=w[2],u=[0,0,l[3]];continue;default:var m=0;}else var m=0;else switch(k){case 0:case 2:case 6:case 7:case 10:var m=1;break;default:var m=0;}if(m){if(-1===a[6])throw [0,e,e7];var q=a[3];if(typeof q===g)switch(q){case 1:case 10:case 11:case 12:case 13:case 16:case 17:case 18:case 19:var i=1;break;case 0:var d=T(a,l,9),i=2;break;case 14:var r=[0,l,9],o=f(a);if(typeof o===g)if(8<=o)if(14===o){var d=aS(a,r,8),i=2,n=0;}else var n=1;else if(5<=o){if(-1===a[6])throw [0,e,e9];a[6]=-1;var d=h(a,r,8),i=2,n=0;}else var n=1;else var n=1;if(n){var d=aN(a,r,8),i=2;}break;default:var i=0;}else var i=7===q[0]?0:1;switch(i){case 1:var d=S(a,l,9);break;case 2:break;default:if(-1===a[6])throw [0,e,e8];a[6]=-1;var d=h(a,l,9);}}else var d=j(0);return d;}}if(-1===a[6])throw [0,e,ff];a[6]=-1;return h(a,p,61);}}function J(a,b,c){var d=[0,b,c],j=f(a);if(typeof j===g){var i=j-8|0;if(!(i<0||2<i))switch(i){case 1:break;case 2:return bP(a,d,60);default:return bl(a,d,60);}}if(-1===a[6])throw [0,e,fg];a[6]=-1;return h(a,d,60);}function av(a,b,c){var e=0;if(11<=c)if(54<=c)switch(c-54|0){case 0:case 2:case 9:case 14:var d=1;break;default:var d=0;}else var d=0;else switch(c){case 0:case 2:case 7:var d=1;break;case 6:return aH(a,b,c,e);case 10:return aM(a,b,c,e);default:var d=0;}return d?a0(a,b,c,e):j(0);}function aw(a,b,c,d){var j=[0,b,c,d],i=f(a);if(typeof i===g)if(8<=i){if(14===i)return aS(a,j,57);}else if(5<=i){if(-1===a[6])throw [0,e,fh];a[6]=-1;return h(a,j,57);}return aN(a,j,57);}function f(a){var b=a[2],c=p(a[1],b);a[3]=c;a[4]=b[11];a[5]=b[12];var d=a[6]+1|0;if(0<=d)a[6]=d;return c;}function h(a,b,c){var d=b,e=c;for(;;)switch(e){case 1:var g=d[2],d=d[1],e=g;continue;case 2:var h=d[2],d=d[1],e=h;continue;case 3:var i=d[2],d=d[1],e=i;continue;case 4:var j=d[2],d=d[1],e=j;continue;case 5:var k=d[2],d=d[1],e=k;continue;case 6:var l=d[2],d=d[1],e=l;continue;case 7:var m=d[2],d=d[1],e=m;continue;case 8:var n=d[2],d=d[1],e=n;continue;case 9:var o=d[2],d=d[1],e=o;continue;case 10:var p=d[2],d=d[1],e=p;continue;case 11:var q=d[2],d=d[1],e=q;continue;case 12:var r=d[2],d=d[1],e=r;continue;case 13:var s=d[2],d=d[1],e=s;continue;case 14:var t=d[2],d=d[1],e=t;continue;case 15:var u=d[2],d=d[1],e=u;continue;case 16:var v=d[2],d=d[1],e=v;continue;case 17:var w=d[2],d=d[1],e=w;continue;case 18:var x=d[2],d=d[1],e=x;continue;case 19:var y=d[2],d=d[1],e=y;continue;case 20:var z=d[2],d=d[1],e=z;continue;case 21:var A=d[2],d=d[1],e=A;continue;case 22:var B=d[2],d=d[1],e=B;continue;case 23:var C=d[2],d=d[1],e=C;continue;case 24:var D=d[2],d=d[1],e=D;continue;case 25:var E=d[2],d=d[1],e=E;continue;case 26:var F=d[2],d=d[1],e=F;continue;case 27:var G=d[2],d=d[1],e=G;continue;case 28:var H=d[2],d=d[1],e=H;continue;case 29:var I=d[2],d=d[1],e=I;continue;case 30:var J=d[2],d=d[1],e=J;continue;case 31:var K=d[2],d=d[1],e=K;continue;case 32:var L=d[2],d=d[1],e=L;continue;case 33:var M=d[2],d=d[1],e=M;continue;case 34:var N=d[2],d=d[1],e=N;continue;case 35:var O=d[2],d=d[1],e=O;continue;case 36:var P=d[2],d=d[1],e=P;continue;case 37:var Q=d[2],d=d[1],e=Q;continue;case 38:var R=d[2],d=d[1],e=R;continue;case 39:var S=d[2],d=d[1],e=S;continue;case 40:var T=d[2],d=d[1],e=T;continue;case 41:var U=d[2],d=d[1],e=U;continue;case 42:var V=d[2],d=d[1],e=V;continue;case 43:var W=d[2],d=d[1],e=W;continue;case 44:var X=d[2],d=d[1],e=X;continue;case 45:var Y=d[2],d=d[1],e=Y;continue;case 46:var Z=d[2],d=d[1],e=Z;continue;case 47:var _=d[2],d=d[1],e=_;continue;case 48:var $=d[2],d=d[1],e=$;continue;case 49:var aa=d[2],d=d[1],e=aa;continue;case 50:var ab=d[2],d=d[1],e=ab;continue;case 51:var ac=d[2],d=d[1],e=ac;continue;case 52:var ad=d[2],d=d[1],e=ad;continue;case 53:var ae=d[2],d=d[1],e=ae;continue;case 54:var af=d[2],d=d[1],e=af;continue;case 55:var ag=d[2],d=d[1],e=ag;continue;case 56:var ah=d[2],d=d[1],e=ah;continue;case 57:var ai=d[2],d=d[1],e=ai;continue;case 58:var aj=d[2],d=d[1],e=aj;continue;case 59:var ak=d[2],d=d[1],e=ak;continue;case 60:var al=d[2],d=d[1],e=al;continue;case 61:var am=d[2],d=d[1],e=am;continue;case 62:var an=d[2],d=d[1],e=an;continue;case 63:var ao=d[2],d=d[1],e=ao;continue;case 64:var ap=d[2],d=d[1],e=ap;continue;case 65:var aq=d[2],d=d[1],e=aq;continue;case 66:var ar=d[2],d=d[1],e=ar;continue;case 67:var as=d[2],d=d[1],e=as;continue;case 68:var at=d[2],d=d[1],e=at;continue;case 69:var au=d[2],d=d[1],e=au;continue;case 70:throw cE;default:var f=d[2],d=d[1],e=f;continue;}}function aN(a,b,c){var v=b,o=c,u=0;for(;;){var f=[0,v,o,u];if(9<=o)if(69<=o){if(!(70<=o)){var w=f[1],v=w[1],o=w[2],u=[0,0,f[3]];continue;}if(-1===a[6])throw [0,e,fi];var p=a[3];if(typeof p===g)switch(p){case 5:case 6:case 7:case 14:if(-1===a[6])throw [0,e,fj];a[6]=-1;var i=h(a,f,68),d=1,k=0;break;case 0:var i=T(a,f,68),d=1,k=0;break;case 2:var i=as(a,f,68),d=1,k=0;break;case 3:var i=at(a,f,68),d=1,k=0;break;case 4:var i=au(a,f,68),d=1,k=0;break;case 8:var i=J(a,f,68),d=1,k=0;break;case 9:var i=I(a,f,68),d=1,k=0;break;case 15:var i=av(a,f,68),d=1,k=0;break;default:var k=1;}else if(7===p[0]){var i=aw(a,f,68,p[1]),d=1,k=0;}else var k=1;if(k){var i=S(a,f,68),d=1;}}else{var t=o-55|0;if(t<0||2<t)var d=0;else switch(t){case 1:var d=0;break;case 2:if(-1===a[6])throw [0,e,fm];var r=a[3];if(typeof r===g)switch(r){case 5:case 6:case 7:case 14:if(-1===a[6])throw [0,e,fn];a[6]=-1;var i=h(a,f,56),d=1,l=0;break;case 0:var i=T(a,f,56),d=1,l=0;break;case 2:var i=as(a,f,56),d=1,l=0;break;case 3:var i=at(a,f,56),d=1,l=0;break;case 4:var i=au(a,f,56),d=1,l=0;break;case 8:var i=J(a,f,56),d=1,l=0;break;case 9:var i=I(a,f,56),d=1,l=0;break;case 15:var i=av(a,f,56),d=1,l=0;break;default:var l=1;}else if(7===r[0]){var i=aw(a,f,56,r[1]),d=1,l=0;}else var l=1;if(l){var i=S(a,f,56),d=1;}break;default:if(-1===a[6])throw [0,e,fk];var q=a[3];if(typeof q===g)switch(q){case 5:case 6:case 7:case 14:if(-1===a[6])throw [0,e,fl];a[6]=-1;var i=h(a,f,54),d=1,m=0;break;case 0:var i=T(a,f,54),d=1,m=0;break;case 2:var i=as(a,f,54),d=1,m=0;break;case 3:var i=at(a,f,54),d=1,m=0;break;case 4:var i=au(a,f,54),d=1,m=0;break;case 8:var i=J(a,f,54),d=1,m=0;break;case 9:var i=I(a,f,54),d=1,m=0;break;case 15:var i=av(a,f,54),d=1,m=0;break;default:var m=1;}else if(7===q[0]){var i=aw(a,f,54,q[1]),d=1,m=0;}else var m=1;if(m){var i=S(a,f,54),d=1;}}}else{if(1===o||8<=o)var x=1;else{var d=0,x=0;}if(x){if(-1===a[6])throw [0,e,fo];var s=a[3];if(typeof s===g)switch(s){case 5:case 6:case 7:case 14:if(-1===a[6])throw [0,e,fp];a[6]=-1;var i=h(a,f,7),d=1,n=0;break;case 0:var i=T(a,f,7),d=1,n=0;break;case 2:var i=as(a,f,7),d=1,n=0;break;case 3:var i=at(a,f,7),d=1,n=0;break;case 4:var i=au(a,f,7),d=1,n=0;break;case 8:var i=J(a,f,7),d=1,n=0;break;case 9:var i=I(a,f,7),d=1,n=0;break;case 15:var i=av(a,f,7),d=1,n=0;break;default:var n=1;}else if(7===s[0]){var i=aw(a,f,7,s[1]),d=1,n=0;}else var n=1;if(n){var i=S(a,f,7),d=1;}}}if(!d)var i=j(0);return i;}}function aS(a,b,c){var k=b,j=c;for(;;){var i=[0,k,j],d=f(a);if(typeof d===g)if(8<=d){if(14===d){var k=i,j=69;continue;}}else if(5<=d){if(-1===a[6])throw [0,e,fq];a[6]=-1;return h(a,i,69);}return aN(a,i,69);}}var bQ=[0,ft];function a2(a){var d=0;for(;;){var c=aY(a1,d,a);if(c<0||31<c){p(a[1],a);var d=c;continue;}switch(c){case 10:case 23:var b=18;break;case 0:var b=a2(a);break;case 1:var b=a3(1,a);break;case 2:var b=2;break;case 3:var b=4;break;case 4:var b=3;break;case 5:var b=9;break;case 6:var b=8;break;case 7:var b=10;break;case 8:var b=19;break;case 11:var b=[1,aQ(a,a[5]+1|0)];break;case 12:var b=1;break;case 13:var b=[0,aQ(a,a[5]+1|0)];break;case 14:var b=17;break;case 15:var b=13;break;case 16:var b=7;break;case 17:var b=12;break;case 18:var b=6;break;case 19:var b=11;break;case 20:var b=5;break;case 21:var b=[4,aP(a,a[5]+1|0,a[6]-1|0)];break;case 22:var b=[5,aQ(a,a[5]+1|0)];break;case 25:var b=bm(aL(16),a);break;case 26:var b=[2,aP(a,a[5],a[6])];break;case 27:aZ(a);var b=14;break;case 28:var b=0;break;case 29:var b=15;break;case 30:var b=[6,aQ(a,a[5]+1|0)];break;case 31:var e=aQ(a,a[5]);throw [0,bQ,u(cA,fu,a[11][4],e)];default:var b=16;}return b;}}function a3(a,b){var e=34;for(;;){var c=aY(a1,e,b);if(c<0||2<c){p(b[1],b);var e=c;continue;}switch(c){case 1:var d=1===a?a2(b):a3(a-1|0,b);break;case 2:var d=a3(a,b);break;default:var d=a3(a+1|0,b);}return d;}}function bm(a,b){var e=40;for(;;){var d=aY(a1,e,b);if(d<0||3<d){p(b[1],b);var e=d;continue;}switch(d){case 1:v(a,96);var c=bm(a,b);break;case 2:i(a,aP(b,b[5],b[6]));var c=bm(a,b);break;case 3:aZ(b);var f=aL(16),c=a4(aE(a),f,b);break;default:var c=[3,aE(a)];}return c;}}function a4(a,b,c){var f=46;for(;;){var e=aY(a1,f,c);if(e<0||3<e){p(c[1],c);var f=e;continue;}switch(e){case 1:aZ(c);v(b,10);var d=a4(a,b,c);break;case 2:v(b,96);var d=a4(a,b,c);break;case 3:i(b,aP(c,c[5],c[6]));var d=a4(a,b,c);break;default:if(caml_string_equal(aP(c,c[5],c[6]-3|0),fv))aZ(c);var d=[7,[0,a,aE(b)]];}return d;}}var gc=caml_js_wrap_callback(function(a){var w=new MlWrappedString(a),x=[0],y=1,z=0,A=0,B=0,C=0,D=0,E=w.getLen(),F=n(w,b$),c=[0,function(a){a[9]=1;return 0;},F,E,D,C,B,A,z,y,x,bu,bu];try {var G=a2(c),b=[0,a2,c,G,c[11],c[12],bU],m=0;if(-1===b[6])throw [0,e,fr];var j=b[3];if(typeof j===g)if(8<=j)if(14===j){var r=aS(b,m,70),f=1;}else var f=0;else if(5<=j){if(-1===b[6])throw [0,e,fs];b[6]=-1;var r=h(b,m,70),f=1;}else var f=0;else var f=0;if(!f)var r=aN(b,m,70);var s=r;}catch(k){if(k[1]===bQ){u(bc,a9,ga,k[2]);var s=0;}else{if(k[1]!==bI)throw k;var l=c[11];(function(a,b,c,d,e){return a.length==4?a(b,c,d,e):caml_call_gen(a,[b,c,d,e]);}(bc,a9,gb,l[2],l[4]-l[3]|0));var s=0;}}function H(a){return p(aK,p(I,a));}function I(c,b){if(typeof b===g)return i(c,fw);else switch(b[0]){case 1:var f=function(c,b){var a=b[2],d=b[1];if(a){o(c,d);i(c,fA);var e=br(a);aK(function(a){i(c,fB);f(c,a);return i(c,fC);},e);return i(c,fD);}return o(c,d);};return f(c,b[1]);case 2:i(c,fE);o(c,b[1]);return i(c,fF);case 3:var l=b[2],m=b[1];i(c,f9);i(c,m);i(c,f_);i(c,l);return i(c,f$);case 4:var h=b[1],j=function(e,b,c){i(e,fG);aK(function(a){i(e,n(fI,n(b,fH)));d(e,a);return i(e,n(fK,n(b,fJ)));},c);return i(e,fL);};i(c,fM);if(h)j(c,fN,h[1]);var p=b[2];aK(function(a){return j(c,fO,a);},p);return i(c,fP);default:var a=b[1],k=7<=a?6:a,e=n(fy,n(aV(k),fx));v(c,60);i(c,e);d(c,b[2]);i(c,fz);return i(c,e);}}function o(c,b){if(b){d(c,b[1]);var a=b[2];return aK(function(a){i(c,fQ);return d(c,a);},a);}return b;}function d(c,b){return aK(function(a){switch(a[0]){case 1:i(c,fR);d(c,a[1]);var b=i(c,fS);break;case 2:i(c,fT);d(c,a[1]);var b=i(c,fU);break;case 3:var g=a[1],b=38===g?i(c,fV):v(c,g);break;case 4:v(c,38);i(c,a[1]);var b=v(c,59);break;case 5:var h=a[1];v(c,38);try {var e=cB;for(;;){if(!e)throw [0,a$];var f=e[1],k=e[2],l=f[2];if(0!==caml_compare(f[1],h)){var e=k;continue;}i(c,l);break;}}catch(j){if(j[1]!==a$)throw j;aJ(n(aO(1,h),fW));}var b=v(c,59);break;case 6:i(c,fX);i(c,a[1]);var b=i(c,fY);break;case 7:i(c,fZ);d(c,a[1]);var b=i(c,f0);break;case 8:i(c,f1);d(c,a[1]);var b=i(c,f2);break;case 9:v(c,a[1]);d(c,a[2]);var b=v(c,a[3]);break;case 10:i(c,f3);d(c,a[2]);i(c,f4);d(c,a[1]);var b=i(c,f5);break;case 11:i(c,f6);d(c,a[2]);i(c,f7);d(c,a[1]);var b=i(c,f8);break;default:var b=i(c,a[1]);}return b;},b);}var t=aL(16);q(H,t,s);return aE(t).toString();});pastek_core[gd.toString()]=gc;bq(0);return;}());
