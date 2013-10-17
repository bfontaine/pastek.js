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
(function(){var c="",bS="\"",a7="'",bT="</",bo=">",g="number",a="parser.ml",o=caml_array_set,aT=caml_blit_string,ax=caml_create_string,bU=caml_format_float,a9=caml_format_int,bp=caml_is_printable,aJ=caml_make_vect,b=caml_new_string,a8=caml_register_global;function p(a,b){return a.length==1?a(b):caml_call_gen(a,[b]);}function q(a,b,c){return a.length==2?a(b,c):caml_call_gen(a,[b,c]);}function u(a,b,c,d){return a.length==3?a(b,c,d):caml_call_gen(a,[b,c,d]);}var a_=[0,b("Failure")],bq=[0,b("Invalid_argument")],bb=[0,b("Not_found")],e=[0,b("Assert_failure")],bv=[0,b(c),1,0,0],a3=[0,b("\0\0\xe2\xff\x02\0\x04\0\x0e\0N\0\xeb\xff\xec\xff\xed\xff\xef\xff\xf0\xffO\0\xc2\0\x01\0\xf7\xff\xf8\xff\xf9\xff\xfa\xff\xfb\xff\xfc\xff\xc4\0\x02\0\x06\0\x02\0\xe1\xff\x01\0\0\0\0\0\x01\0\0\0\x01\0\x03\0\x05\0\x05\0\xfd\xff\b\0\xe6\xff\xf4\xff\xf2\xff\x12\x01b\x01\xad\x01\xea\xff\x0b\0\xfd\xff\t\0\x10\0\xff\xff\xfe\xff\x13\0\xfc\xff\x14\0\x16\0\x17\0\xff\xffL\0o\0\x18\0\x1a\0(\0,\0\xff\xff"),b("\xff\xff\xff\xff\x1b\0\x1c\0\x1a\0\x1f\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x0e\0\f\0\n\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x1f\0\x11\0\x01\0\0\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\t\0\xff\xff\xff\xff\xff\xff\xff\xff\x16\0\xff\xff\xff\xff\xff\xff\xff\xff\x02\0\x02\0\xff\xff\xff\xff\x02\0\xff\xff\x02\0\x01\0\xff\xff\xff\xff\xff\xff\x03\0\x02\0\x01\0\xff\xff\xff\xff\xff\xff"),b("\x04\0\0\0\xff\xff\xff\xff\x04\0\xff\xff\0\0\0\0\0\0\0\0\0\0&\0%\0\xff\xff\0\0\0\0\0\0\0\0\0\0\0\0\xff\xff\xff\xff\xff\xff\x17\0\0\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\0\0\xff\xff\0\0\0\0\0\0\xff\xff\xff\xff\xff\xff\0\0,\0\0\0\xff\xff\xff\xff\0\0\0\x003\0\0\x003\0\xff\xff\xff\xff\0\x008\x008\0\xff\xff\xff\xff\xff\xff\xff\xff\0\0"),b("\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x03\0\x02\0\x02\0\xff\xff\x03\0\x02\0\"\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xff\xff\xff\xff\0\0\0\0\0\0\0\x002\0\xff\xff\0\0\x03\0\x0e\0\x02\0\x13\0\x03\0\0\0\x05\0\0\0\x15\0\b\0\x12\0\x10\0\x16\0\x0f\0\xff\xff\xff\xff\x17\0\xff\xff0\0.\0\xff\xff-\0\xff\xff\xff\xff\xff\xff\xff\xff/\0\xff\xff\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0:\0\0\0\xff\xff\xff\xff\0\0\x07\0\x14\0\x06\0\x0b\0\f\0\r\0#\0\x1a\0\x1d\0 \0\x1c\0\x1f\0\x1b\0$\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff!\0)\0\x1e\x004\0\xff\xff\xff\xff5\x006\0<\0\xff\xff;\0\n\0\x11\0\t\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0<\0\xff\xff\xff\xff\xff\xff=\0\0\0\0\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0\0\0\0\0\xff\xff9\0\0\0\0\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0\0\0\xff\xff\xff\xff\xff\xff\0\0\x18\0\xff\xff\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xff\xff\0\0\0\0\x18\0\0\0\x18\0\xff\xff\0\0\x18\0\0\0\x18\0\x18\0\x18\0\x18\0\0\0\x18\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x01\0\0\0\xff\xff\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xff\xff\0\0\0\0\xff\xff\0\0\0\0\0\0\0\0\xff\xff\xff\xff\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xff\xff\x18\0\x18\0\x18\0\x18\0\x18\0\x18\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x19\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xff\xff\0\0\x18\0\x18\0\x18\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0\xff\xff*\0\0\0\xff\xff\0\0\0\0\0\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0\0\0\0\0\xff\xff\0\0\0\0\0\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0\0\0\0\0\0\0\0\0\0\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0\0\0*\0\0\0\0\0\0\0\0\0\0\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0\0\0\0\0\0\0\0\0\0\0\xff\xff'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0\0\0\0\0\0\0\0\0\0\0\0\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0"),b("\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\0\0\0\0\x02\0\x17\0\x03\0\x03\0!\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x04\0\x04\0\xff\xff\xff\xff\xff\xff\xff\xff1\x003\0\xff\xff\0\0\0\0\x02\0\0\0\x03\0\xff\xff\0\0\xff\xff\0\0\0\0\0\0\0\0\x15\0\0\0\x04\0\x04\0\x16\0\x04\0-\0+\0\x04\0+\0\x04\0\x04\0\x04\0\x04\0.\0\x04\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff7\0\xff\xff\x0b\0\x0b\0\xff\xff\0\0\0\0\0\0\0\0\0\0\0\0\r\0\x19\0\x1c\0\x1f\0\x1b\0\x1e\0\x1a\0#\0\x04\0\x04\0\x04\0\x04\0\x04\0\x04\0\x0b\0 \0\x05\0\x1d\x001\x003\0\x0b\x004\x005\x009\x008\0:\0\0\0\0\0\0\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0;\0\x04\0\x04\0\x04\0<\0\xff\xff\xff\xff\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\xff\xff\xff\xff\x0b\x007\0\xff\xff\xff\xff\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\x05\0\xff\xff\x0b\0\f\0\f\0\xff\xff\x14\x008\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\f\0\xff\xff\xff\xff\x14\0\xff\xff\x14\0\f\0\xff\xff\x14\0\xff\xff\x14\0\x14\0\x14\0\x14\0\xff\xff\x14\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\0\0\xff\xff\x17\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff+\0\xff\xff\xff\xff\x04\0\xff\xff\xff\xff\xff\xff\xff\xff1\x003\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\f\0\x14\0\x14\0\x14\0\x14\0\x14\0\x14\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x14\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\f\0\xff\xff\x14\0\x14\0\x14\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\x007\0'\0\xff\xff\x0b\0\xff\xff\xff\xff\xff\xff'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0\xff\xff\xff\xff8\0\xff\xff\xff\xff\xff\xff'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0'\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0\xff\xff(\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\f\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0(\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0)\0\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff"),b(c),b(c),b(c),b(c),b(c),b(c)];a8(6,bb);a8(5,[0,b("Division_by_zero")]);a8(3,bq);a8(2,a_);var bW=b("true"),bX=b("false"),bZ=b("Pervasives.do_at_exit"),b3=b("tl"),b2=b("hd"),b6=b("\\b"),b7=b("\\t"),b8=b("\\n"),b9=b("\\r"),b5=b("\\\\"),b4=b("\\'"),b$=b("String.blit"),b_=b("String.sub"),ca=b(c),cb=b("Buffer.add: cannot grow buffer"),cr=b(c),cs=b(c),cv=b("%.12g"),cw=b(bS),cx=b(bS),ct=b(a7),cu=b(a7),cq=b("nan"),co=b("neg_infinity"),cp=b("infinity"),cn=b("."),cm=b("printf: bad positional specification (0)."),cl=b("%_"),cj=[0,b("printf.ml"),143,8],ch=b(a7),ci=b("Printf: premature end of format string '"),cd=b(a7),ce=b(" in format string '"),cf=b(", at char number "),cg=b("Printf: bad conversion %"),cc=b("Sformat.index_of_int: negative argument "),cC=[0,[0,65,b("#913")],[0,[0,66,b("#914")],[0,[0,71,b("#915")],[0,[0,68,b("#916")],[0,[0,69,b("#917")],[0,[0,90,b("#918")],[0,[0,84,b("#920")],[0,[0,73,b("#921")],[0,[0,75,b("#922")],[0,[0,76,b("#923")],[0,[0,77,b("#924")],[0,[0,78,b("#925")],[0,[0,88,b("#926")],[0,[0,79,b("#927")],[0,[0,80,b("#928")],[0,[0,82,b("#929")],[0,[0,83,b("#931")],[0,[0,85,b("#933")],[0,[0,67,b("#935")],[0,[0,87,b("#937")],[0,[0,89,b("#936")],[0,[0,97,b("#945")],[0,[0,98,b("#946")],[0,[0,103,b("#947")],[0,[0,100,b("#948")],[0,[0,101,b("#949")],[0,[0,122,b("#950")],[0,[0,116,b("#952")],[0,[0,105,b("#953")],[0,[0,107,b("#954")],[0,[0,108,b("#955")],[0,[0,109,b("#956")],[0,[0,110,b("#957")],[0,[0,120,b("#958")],[0,[0,111,b("#959")],[0,[0,112,b("#960")],[0,[0,114,b("#961")],[0,[0,115,b("#963")],[0,[0,117,b("#965")],[0,[0,99,b("#967")],[0,[0,119,b("#969")],[0,[0,121,b("#968")],0]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]],cG=[0,b(a),153,8],cH=[0,b(a),171,12],cI=[0,b(a),194,8],cJ=[0,b(a),207,16],cK=[0,b(a),215,20],cL=[0,b(a),220,16],cM=[0,b(a),228,20],cN=[0,b(a),234,12],cQ=[0,b(a),283,8],cR=[0,b(a),299,12],cO=[0,b(a),258,8],cP=[0,b(a),278,12],cS=[0,b(a),323,8],cT=[0,b(a),380,16],cU=[0,b(a),384,12],cV=[0,b(a),422,8],cW=[0,b(a),433,12],cX=[0,b(a),440,8],cY=[0,b(a),477,12],cZ=[0,b(a),484,8],c2=[0,b(a),501,16],c3=[0,b(a),507,20],c0=[0,b(a),512,16],c1=[0,b(a),523,20],c4=[0,b(a),529,12],c5=[0,b(a),536,8],c6=[0,b(a),547,12],c7=[0,b(a),404,8],c8=[0,b(a),415,12],c9=[0,b(a),554,8],da=[0,b(a),585,16],db=[0,b(a),609,20],c_=[0,b(a),567,16],c$=[0,b(a),580,20],dc=[0,b(a),615,12],df=[0,b(a),629,8],dg=[0,b(a),675,12],dd=[0,b(a),680,8],de=[0,b(a),729,12],dh=[0,b(a),739,4],di=[0,b(a),783,8],dj=[0,b(a),791,4],dk=[0,b(a),835,8],dl=[0,b(a),843,4],dm=[0,b(a),889,8],dn=[0,b(a),913,8],dp=[0,b(a),921,12],dq=[0,b(a),1125,8],dr=[0,b(a),1136,12],ds=[0,b(a),939,8],dt=[0,b(a),950,12],du=[0,b(a),957,8],dv=[0,b(a),968,12],dw=[0,b(a),975,8],dx=[0,b(a),986,12],dy=[0,b(a),993,8],dz=[0,b(a),1030,12],dA=[0,b(a),1037,8],dD=[0,b(a),1054,16],dE=[0,b(a),1060,20],dB=[0,b(a),1065,16],dC=[0,b(a),1076,20],dF=[0,b(a),1082,12],dG=[0,b(a),1089,8],dH=[0,b(a),1100,12],dI=[0,b(a),1107,8],dJ=[0,b(a),1118,12],dK=[3,32],dL=[0,b(a),1218,8],dM=[0,b(a),1268,8],dN=[0,b(a),1470,8],dO=[0,b(a),1481,12],dP=[0,b(a),1452,8],dQ=[0,b(a),1463,12],dR=[0,b(a),1278,8],dS=[0,b(a),1289,12],dT=[0,b(a),1302,8],dU=[0,b(a),1313,12],dV=[0,b(a),1320,8],dW=[0,b(a),1357,12],dX=[0,b(a),1364,8],d0=[0,b(a),1381,16],d1=[0,b(a),1387,20],dY=[0,b(a),1392,16],dZ=[0,b(a),1403,20],d2=[0,b(a),1409,12],d3=[0,b(a),1416,8],d4=[0,b(a),1427,12],d5=[0,b(a),1434,8],d6=[0,b(a),1445,12],d9=[0,b(a),1560,8],d_=[0,b(a),1582,12],d$=[0,b(a),1614,8],ea=[0,b(a),1636,12],d7=[0,b(a),1587,8],d8=[0,b(a),1609,12],eb=[0,b(a),1648,8],ec=[0,b(a),1663,12],ed=[0,b(a),1732,8],ef=[0,b(a),1804,12],ee=[0,b(a),1808,8],eg=[3,45],eh=[0,b(a),1893,8],ei=[0,b(a),1945,8],ej=[0,b(a),1997,8],ek=[3,32],em=[0,b(a),2111,12],el=[0,b(a),2115,8],en=[3,45],eo=[0,b(a),2198,8],ep=[0,b(a),2248,8],eq=[0,b(a),2298,8],es=[0,b(a),2400,12],er=[0,b(a),2404,8],et=[0,b(a),2456,8],ev=[0,b(a),2473,8],eu=[3,33],ex=[0,b(a),2545,12],ew=[0,b(a),2549,8],ey=[3,32],eA=[0,b(a),2633,12],ez=[0,b(a),2637,8],eB=[3,42],eC=[3,35],eD=[3,43],eE=[3,45],eF=[0,b(a),2741,8],eG=[0,b(a),2791,8],eH=[0,b(a),2841,8],eI=[0,b(a),2923,8],eK=[0,b(a),2993,12],eJ=[0,b(a),2997,8],eM=[0,b(a),3016,8],eL=[3,33],eO=[0,b(a),3033,8],eN=[3,33],eP=[0,b(a),3051,8],eQ=[0,b(a),3068,8],eR=[0,b(a),3089,16],eS=[0,b(a),3093,12],eV=[0,b(a),3172,8],eW=[0,b(a),3180,12],eX=[0,b(a),3148,8],eY=[0,b(a),3156,12],eT=[0,b(a),3137,8],eU=[0,b(a),3143,12],eZ=[0,b(a),3190,4],e1=[0,b(a),3294,12],e2=[0,b(a),3242,12],e0=[0,b(a),3322,8],e3=[0,b(a),3339,8],e4=[0,b(a),3347,12],e5=[0,b(a),3366,8],e7=[0,b(a),3396,16],e6=[0,b(a),3404,12],e8=[0,b(a),3425,8],e9=[0,[0,b(c)],0],e_=b("Internal failure -- please contact the parser generator's developers.\n%!"),e$=[0,b(a),3640,4],fa=[0,b(a),3674,8],fb=[0,b(a),3692,8],fc=[0,b(a),3706,8],fd=[0,b(a),3720,8],fe=[0,b(a),3766,8],ff=[0,b(a),3864,8],fg=[0,b(a),3886,12],fh=[0,b(a),3837,8],fi=[0,b(a),3859,12],fj=[0,b(a),3810,8],fk=[0,b(a),3832,12],fl=[0,b(a),3783,8],fm=[0,b(a),3805,12],fn=[0,b(a),4198,8],fo=[0,b(a),4214,4],fp=[0,b(a),4222,8],cE=[0,[0,[0,[0,b(c)],0],0],0],cD=b("Parser.Error"),fr=b("At offset %d: unexpected character '%c'.\n"),fs=b("\n"),fq=b("Lexer.Error"),fL=b("td"),fE=b(bo),fF=b("<"),fG=b(bo),fH=b(bT),fD=b("<tr>"),fI=b("</tr>"),fy=b("<li>"),fz=b("</li>"),fx=b("<ul>"),fA=b("</ul>"),ft=b("<div style=\"page-break-after:always;\"></div>"),fu=b(bo),fv=b("h"),fw=b(bT),fB=b("<p>"),fC=b("</p>"),fJ=b("<table>"),fK=b("th"),fM=b("</table>"),fN=b("<br />"),fO=b("<sup>"),fP=b("</sup>"),fQ=b("<sub>"),fR=b("</sub>"),fS=b("&#38;"),fT=b(" is not greek letter shortcut."),fU=b("<code>"),fV=b("</code>"),fW=b("<em>"),fX=b("</em>"),fY=b("<strong>"),fZ=b("</strong>"),f0=b("<a href=\""),f1=b("\">"),f2=b("</a>"),f3=b("<img src=\""),f4=b("\" alt=\""),f5=b("\" />"),f6=b("<code data-pastek-cmd=\""),f7=b("\"><pre>"),f8=b("</pre></code>"),f9=b("%s%!"),f_=b("Line %d, column %d: syntax error.\n%!"),ga=b("mk_html");function aK(a){throw [0,a_,a];}function aU(a){throw [0,bq,a];}var bV=(1<<31)-1|0;function n(a,b){var c=a.getLen(),e=b.getLen(),d=ax(c+e|0);aT(a,0,d,0,c);aT(b,0,d,c,e);return d;}function aV(a){return b(""+a);}var a$=caml_ml_open_descriptor_out(2);function bY(a,b){return caml_ml_output(a,b,0,b.getLen());}function br(a){var b=caml_ml_out_channels_list(0);for(;;){if(b){var c=b[2];try {}catch(d){}var b=c;continue;}return 0;}}caml_register_named_value(bZ,br);function b0(a,b){return caml_ml_output_char(a,b);}function b1(a){return caml_ml_flush(a);}function ba(a){var c=0,b=a;for(;;){if(b){var c=c+1|0,b=b[2];continue;}return c;}}function bs(a){var b=a,c=0;for(;;){if(b){var d=[0,b[1],c],b=b[2],c=d;continue;}return c;}}function bt(a,b){if(b){var c=b[2],d=p(a,b[1]);return [0,d,bt(a,c)];}return 0;}function aL(a,b){var c=b;for(;;){if(c){var d=c[2];p(a,c[1]);var c=d;continue;}return 0;}}function aO(a,b){var c=ax(a);caml_fill_string(c,0,a,b);return c;}function aW(a,b,c){if(0<=b&&0<=c&&!((a.getLen()-c|0)<b)){var d=ax(c);aT(a,b,d,0,c);return d;}return aU(b_);}function aX(a,b,c,d,e){if(0<=e&&0<=b&&!((a.getLen()-e|0)<b)&&0<=d&&!((c.getLen()-e|0)<d))return aT(a,b,c,d,e);return aU(b$);}var bu=caml_sys_const_word_size(0),d=caml_mul(bu/8|0,(1<<(bu-10|0))-1|0)-1|0;function aY(a,b,c){var e=caml_lex_engine(a,b,c);if(0<=e){c[11]=c[12];var d=c[12];c[12]=[0,d[1],d[2],d[3],c[4]+c[6]|0];}return e;}function aP(a,b,c){var d=c-b|0,e=ax(d);aT(a[2],b,e,0,d);return e;}function aQ(a,b){return a[2].safeGet(b);}function aZ(a){var b=a[12];a[12]=[0,b[1],b[2]+1|0,b[4],b[4]];return 0;}function aM(a){var b=1<=a?a:1,c=d<b?d:b,e=ax(c);return [0,e,0,c,e];}function aF(a){return aW(a[1],0,a[2]);}function bw(a,b){var c=[0,a[3]];for(;;){if(c[1]<(a[2]+b|0)){c[1]=2*c[1]|0;continue;}if(d<c[1])if((a[2]+b|0)<=d)c[1]=d;else aK(cb);var e=ax(c[1]);aX(a[1],0,e,0,a[2]);a[1]=e;a[3]=c[1];return 0;}}function v(a,b){var c=a[2];if(a[3]<=c)bw(a,1);a[1].safeSet(c,b);a[2]=c+1|0;return 0;}function i(a,b){var c=b.getLen(),d=a[2]+c|0;if(a[3]<d)bw(a,c);aX(b,0,a[1],a[2],c);a[2]=d;return 0;}function bc(a){return 0<=a?a:aK(n(cc,aV(a)));}function bx(a,b){return bc(a+b|0);}var by=p(bx,1);function bz(a){return aW(a,0,a.getLen());}function bA(a,b,c){var d=n(ce,n(a,cd)),e=n(cf,n(aV(b),d));return aU(n(cg,n(aO(1,c),e)));}function aR(a,b,c){return bA(bz(a),b,c);}function bd(a){return aU(n(ci,n(bz(a),ch)));}function aG(f,b,c,d){function j(a){if((f.safeGet(a)-48|0)<0||9<(f.safeGet(a)-48|0))return a;var b=a+1|0;for(;;){var c=f.safeGet(b);if(48<=c){if(!(58<=c)){var b=b+1|0;continue;}var d=0;}else if(36===c){var e=b+1|0,d=1;}else var d=0;if(!d)var e=a;return e;}}var k=j(b+1|0),g=aM((c-k|0)+10|0);v(g,37);var a=k,h=bs(d);for(;;){if(a<=c){var l=f.safeGet(a);if(42===l){if(h){var m=h[2];i(g,aV(h[1]));var a=j(a+1|0),h=m;continue;}throw [0,e,cj];}v(g,l);var a=a+1|0;continue;}return aF(g);}}function bB(a,b,c,d,e){var f=aG(b,c,d,e);if(78!==a&&110!==a)return f;f.safeSet(f.getLen()-1|0,117);return f;}function ck(m,q,c,d,e){var n=d.getLen();function o(a,b){var r=40===a?41:125;function k(a){var c=a;for(;;){if(n<=c)return p(m,d);if(37===d.safeGet(c)){var e=c+1|0;if(n<=e)var f=p(m,d);else{var g=d.safeGet(e),h=g-40|0;if(h<0||1<h){var l=h-83|0;if(l<0||2<l)var j=1;else switch(l){case 1:var j=1;break;case 2:var i=1,j=0;break;default:var i=0,j=0;}if(j){var f=k(e+1|0),i=2;}}else var i=0===h?0:1;switch(i){case 1:var f=g===r?e+1|0:u(q,d,b,g);break;case 2:break;default:var f=k(o(g,e+1|0)+1|0);}}return f;}var c=c+1|0;continue;}}return k(b);}return o(c,e);}function bC(a){return u(ck,bd,aR,a);}function bD(i,b,c){var l=i.getLen()-1|0;function r(a){var k=a;a:for(;;){if(k<l){if(37===i.safeGet(k)){var e=0,h=k+1|0;for(;;){if(l<h)var w=bd(i);else{var m=i.safeGet(h);if(58<=m){if(95===m){var e=1,h=h+1|0;continue;}}else if(32<=m)switch(m-32|0){case 1:case 2:case 4:case 5:case 6:case 7:case 8:case 9:case 12:case 15:break;case 0:case 3:case 11:case 13:var h=h+1|0;continue;case 10:var h=u(b,e,h,105);continue;default:var h=h+1|0;continue;}var d=h;b:for(;;){if(l<d)var f=bd(i);else{var j=i.safeGet(d);if(126<=j)var g=0;else switch(j){case 78:case 88:case 100:case 105:case 111:case 117:case 120:var f=u(b,e,d,105),g=1;break;case 69:case 70:case 71:case 101:case 102:case 103:var f=u(b,e,d,102),g=1;break;case 33:case 37:case 44:case 64:var f=d+1|0,g=1;break;case 83:case 91:case 115:var f=u(b,e,d,115),g=1;break;case 97:case 114:case 116:var f=u(b,e,d,j),g=1;break;case 76:case 108:case 110:var s=d+1|0;if(l<s){var f=u(b,e,d,105),g=1;}else{var o=i.safeGet(s)-88|0;if(o<0||32<o)var p=1;else switch(o){case 0:case 12:case 17:case 23:case 29:case 32:var f=q(c,u(b,e,d,j),105),g=1,p=0;break;default:var p=1;}if(p){var f=u(b,e,d,105),g=1;}}break;case 67:case 99:var f=u(b,e,d,99),g=1;break;case 66:case 98:var f=u(b,e,d,66),g=1;break;case 41:case 125:var f=u(b,e,d,j),g=1;break;case 40:var f=r(u(b,e,d,j)),g=1;break;case 123:var t=u(b,e,d,j),v=u(bC,j,i,t),n=t;for(;;){if(n<(v-2|0)){var n=q(c,n,i.safeGet(n));continue;}var d=v-1|0;continue b;}default:var g=0;}if(!g)var f=aR(i,d,j);}var w=f;break;}}var k=w;continue a;}}var k=k+1|0;continue;}return k;}}r(0);return 0;}function bE(a){var d=[0,0,0,0];function b(a,b,c){var f=41!==c?1:0,g=f?125!==c?1:0:f;if(g){var e=97===c?2:1;if(114===c)d[3]=d[3]+1|0;if(a)d[2]=d[2]+e|0;else d[1]=d[1]+e|0;}return b+1|0;}bD(a,b,function(a,b){return a+1|0;});return d[1];}function bF(a,b,c){var h=a.safeGet(c);if((h-48|0)<0||9<(h-48|0))return q(b,0,c);var e=h-48|0,d=c+1|0;for(;;){var f=a.safeGet(d);if(48<=f){if(!(58<=f)){var e=(10*e|0)+(f-48|0)|0,d=d+1|0;continue;}var g=0;}else if(36===f)if(0===e){var i=aK(cm),g=1;}else{var i=q(b,[0,bc(e-1|0)],d+1|0),g=1;}else var g=0;if(!g)var i=q(b,0,c);return i;}}function w(a,b){return a?b:p(by,b);}function bG(a,b){return a?a[1]:b;}function bH(aI,b,c,d,e,f,g){var F=p(b,g);function af(a){return q(d,F,a);}function aK(a,b,k,aJ){var h=k.getLen();function G(j,b){var o=b;for(;;){if(h<=o)return p(a,F);var d=k.safeGet(o);if(37===d){var m=function(a,b){return caml_array_get(aJ,bG(a,b));},as=function(g,f,c,d){var a=d;for(;;){var aa=k.safeGet(a)-32|0;if(!(aa<0||25<aa))switch(aa){case 1:case 2:case 4:case 5:case 6:case 7:case 8:case 9:case 12:case 15:break;case 10:return bF(k,function(a,b){var d=[0,m(a,f),c];return as(g,w(a,f),d,b);},a+1|0);default:var a=a+1|0;continue;}var r=k.safeGet(a);if(124<=r)var h=0;else switch(r){case 78:case 88:case 100:case 105:case 111:case 117:case 120:var a$=m(g,f),ba=a9(bB(r,k,o,a,c),a$),j=s(w(g,f),ba,a+1|0),h=1;break;case 69:case 71:case 101:case 102:case 103:var a2=m(g,f),a3=bU(aG(k,o,a,c),a2),j=s(w(g,f),a3,a+1|0),h=1;break;case 76:case 108:case 110:var ad=k.safeGet(a+1|0)-88|0;if(ad<0||32<ad)var ag=1;else switch(ad){case 0:case 12:case 17:case 23:case 29:case 32:var U=a+1|0,ae=r-108|0;if(ae<0||2<ae)var ah=0;else{switch(ae){case 1:var ah=0,ai=0;break;case 2:var a8=m(g,f),az=a9(aG(k,o,U,c),a8),ai=1;break;default:var a7=m(g,f),az=a9(aG(k,o,U,c),a7),ai=1;}if(ai){var ay=az,ah=1;}}if(!ah){var a6=m(g,f),ay=caml_int64_format(aG(k,o,U,c),a6);}var j=s(w(g,f),ay,U+1|0),h=1,ag=0;break;default:var ag=1;}if(ag){var a4=m(g,f),a5=a9(bB(110,k,o,a,c),a4),j=s(w(g,f),a5,a+1|0),h=1;}break;case 37:case 64:var j=s(f,aO(1,r),a+1|0),h=1;break;case 83:case 115:var B=m(g,f);if(115===r)var C=B;else{var b=[0,0],al=B.getLen()-1|0,aN=0;if(!(al<0)){var N=aN;for(;;){var A=B.safeGet(N),bg=14<=A?34===A?1:92===A?1:0:11<=A?13<=A?1:0:8<=A?1:0,aS=bg?2:bp(A)?1:4;b[1]=b[1]+aS|0;var aT=N+1|0;if(al!==N){var N=aT;continue;}break;}}if(b[1]===B.getLen())var aB=B;else{var l=ax(b[1]);b[1]=0;var am=B.getLen()-1|0,aP=0;if(!(am<0)){var M=aP;for(;;){var z=B.safeGet(M),D=z-34|0;if(D<0||58<D)if(-20<=D)var V=1;else{switch(D+34|0){case 8:l.safeSet(b[1],92);b[1]++;l.safeSet(b[1],98);var L=1;break;case 9:l.safeSet(b[1],92);b[1]++;l.safeSet(b[1],116);var L=1;break;case 10:l.safeSet(b[1],92);b[1]++;l.safeSet(b[1],110);var L=1;break;case 13:l.safeSet(b[1],92);b[1]++;l.safeSet(b[1],114);var L=1;break;default:var V=1,L=0;}if(L)var V=0;}else var V=(D-1|0)<0||56<(D-1|0)?(l.safeSet(b[1],92),b[1]++,l.safeSet(b[1],z),0):1;if(V)if(bp(z))l.safeSet(b[1],z);else{l.safeSet(b[1],92);b[1]++;l.safeSet(b[1],48+(z/100|0)|0);b[1]++;l.safeSet(b[1],48+((z/10|0)%10|0)|0);b[1]++;l.safeSet(b[1],48+(z%10|0)|0);}b[1]++;var aQ=M+1|0;if(am!==M){var M=aQ;continue;}break;}}var aB=l;}var C=n(cx,n(aB,cw));}if(a===(o+1|0))var aA=C;else{var K=aG(k,o,a,c);try {var W=0,x=1;for(;;){if(K.getLen()<=x)var ao=[0,0,W];else{var X=K.safeGet(x);if(49<=X)if(58<=X)var aj=0;else{var ao=[0,caml_int_of_string(aW(K,x,(K.getLen()-x|0)-1|0)),W],aj=1;}else{if(45===X){var W=1,x=x+1|0;continue;}var aj=0;}if(!aj){var x=x+1|0;continue;}}var Z=ao;break;}}catch(an){if(an[1]!==a_)throw an;var Z=bA(K,0,115);}var O=Z[1],E=C.getLen(),aU=Z[2],P=0,aV=32;if(O===E&&0===P){var _=C,aL=1;}else var aL=0;if(!aL)if(O<=E)var _=aW(C,P,E);else{var Y=aO(O,aV);if(aU)aX(C,P,Y,0,E);else aX(C,P,Y,O-E|0,E);var _=Y;}var aA=_;}var j=s(w(g,f),aA,a+1|0),h=1;break;case 67:case 99:var t=m(g,f);if(99===r)var av=aO(1,t);else{if(39===t)var y=b4;else if(92===t)var y=b5;else{if(14<=t)var H=0;else switch(t){case 8:var y=b6,H=1;break;case 9:var y=b7,H=1;break;case 10:var y=b8,H=1;break;case 13:var y=b9,H=1;break;default:var H=0;}if(!H)if(bp(t)){var ak=ax(1);ak.safeSet(0,t);var y=ak;}else{var I=ax(4);I.safeSet(0,92);I.safeSet(1,48+(t/100|0)|0);I.safeSet(2,48+((t/10|0)%10|0)|0);I.safeSet(3,48+(t%10|0)|0);var y=I;}}var av=n(cu,n(y,ct));}var j=s(w(g,f),av,a+1|0),h=1;break;case 66:case 98:var a0=a+1|0,a1=m(g,f)?bW:bX,j=s(w(g,f),a1,a0),h=1;break;case 40:case 123:var T=m(g,f),at=u(bC,r,k,a+1|0);if(123===r){var Q=aM(T.getLen()),ap=function(a,b){v(Q,b);return a+1|0;};bD(T,function(a,b,c){if(a)i(Q,cl);else v(Q,37);return ap(b,c);},ap);var aY=aF(Q),j=s(w(g,f),aY,at),h=1;}else{var au=w(g,f),bf=bx(bE(T),au),j=aK(function(a){return G(bf,at);},au,T,aJ),h=1;}break;case 33:p(e,F);var j=G(f,a+1|0),h=1;break;case 41:var j=s(f,cr,a+1|0),h=1;break;case 44:var j=s(f,cs,a+1|0),h=1;break;case 70:var ab=m(g,f);if(0===c)var aw=cv;else{var $=aG(k,o,a,c);if(70===r)$.safeSet($.getLen()-1|0,103);var aw=$;}var ar=caml_classify_float(ab);if(3===ar)var ac=ab<0?co:cp;else if(4<=ar)var ac=cq;else{var S=bU(aw,ab),R=0,aZ=S.getLen();for(;;){if(aZ<=R)var aq=n(S,cn);else{var J=S.safeGet(R)-46|0,bh=J<0||23<J?55===J?1:0:(J-1|0)<0||21<(J-1|0)?1:0;if(!bh){var R=R+1|0;continue;}var aq=S;}var ac=aq;break;}}var j=s(w(g,f),ac,a+1|0),h=1;break;case 91:var j=aR(k,a,r),h=1;break;case 97:var aC=m(g,f),aD=p(by,bG(g,f)),aE=m(0,aD),bb=a+1|0,bc=w(g,aD);if(aI)af(q(aC,0,aE));else q(aC,F,aE);var j=G(bc,bb),h=1;break;case 114:var j=aR(k,a,r),h=1;break;case 116:var aH=m(g,f),bd=a+1|0,be=w(g,f);if(aI)af(p(aH,0));else p(aH,F);var j=G(be,bd),h=1;break;default:var h=0;}if(!h)var j=aR(k,a,r);return j;}},f=o+1|0,g=0;return bF(k,function(a,b){return as(a,j,g,b);},f);}q(c,F,d);var o=o+1|0;continue;}}function s(a,b,c){af(b);return G(a,c);}return G(b,0);}var h=q(aK,f,bc(0)),j=bE(g);if(j<0||6<j){var k=function(f,b){if(j<=f){var i=aJ(j,0),l=function(a,b){return o(i,(j-a|0)-1|0,b);},c=0,a=b;for(;;){if(a){var d=a[2],e=a[1];if(d){l(c,e);var c=c+1|0,a=d;continue;}l(c,e);}return q(h,g,i);}}return function(a){return k(f+1|0,[0,a,b]);};},a=k(0,0);}else switch(j){case 1:var a=function(a){var b=aJ(1,0);o(b,0,a);return q(h,g,b);};break;case 2:var a=function(a,b){var c=aJ(2,0);o(c,0,a);o(c,1,b);return q(h,g,c);};break;case 3:var a=function(a,b,c){var d=aJ(3,0);o(d,0,a);o(d,1,b);o(d,2,c);return q(h,g,d);};break;case 4:var a=function(a,b,c,d){var e=aJ(4,0);o(e,0,a);o(e,1,b);o(e,2,c);o(e,3,d);return q(h,g,e);};break;case 5:var a=function(a,b,c,d,e){var f=aJ(5,0);o(f,0,a);o(f,1,b);o(f,2,c);o(f,3,d);o(f,4,e);return q(h,g,f);};break;case 6:var a=function(a,b,c,d,e,f){var i=aJ(6,0);o(i,0,a);o(i,1,b);o(i,2,c);o(i,3,d);o(i,4,e);o(i,5,f);return q(h,g,i);};break;default:var a=q(h,g,[0]);}return a;}function be(b){function a(a){return 0;}return function(a,b,c,d,e,f,g){return a.length==6?a(b,c,d,e,f,g):caml_call_gen(a,[b,c,d,e,f,g]);}(bH,0,function(a){return b;},b0,bY,b1,a);}function cy(a){return aM(2*a.getLen()|0);}function cz(a,b){var c=aF(b);b[2]=0;return p(a,c);}function cA(a){var b=p(cz,a);return function(a,b,c,d,e,f,g){return a.length==6?a(b,c,d,e,f,g):caml_call_gen(a,[b,c,d,e,f,g]);}(bH,1,cy,v,i,function(a){return 0;},b);}function cB(a){return q(cA,function(a){return a;},a);}function bI(a,b){var c=a[2],d=a[1],e=b[2],f=b[1];if(1!==f&&0!==c){var g=c?c[2]:aK(b3),h=[0,f-1|0,e],i=c?c[1]:aK(b2);return [0,d,[0,bI(i,h),g]];}return [0,d,[0,[0,e,0],c]];}var bJ=[0,cD],cF=[0,bJ];function bf(a,b,c,d){var i=[0,b,c,d];if(28<=c)var M=53<=c?54<=c?0:2:49<=c?1:0;else if(12===c)var M=1;else if(20<=c)switch(c-20|0){case 3:case 7:var M=1;break;case 0:case 1:var M=2;break;default:var M=0;}else var M=0;switch(M){case 1:if(-1===a[6])throw [0,e,df];var t=a[3];if(typeof t===g)switch(t){case 8:case 9:case 15:break;case 0:return R(a,i,23);case 1:return U(a,i,23);case 2:return k(a,i,23);case 3:return l(a,i,23);case 7:return m(a,i,23);case 10:return F(a,i,23);case 11:return G(a,i,23);case 12:return z(a,i,23);case 13:return V(a,i,23);case 16:return S(a,i,23);case 17:return X(a,i,23);case 18:return T(a,i,23);case 19:return L(a,i,23);default:return aH(a,i,23);}else switch(t[0]){case 1:return D(a,i,23,t[1]);case 2:return E(a,i,23,t[1]);case 3:return H(a,i,23,t[1]);case 4:return I(a,i,23,t[1]);case 5:return J(a,i,23,t[1]);case 6:return K(a,i,23,t[1]);case 7:break;default:return C(a,i,23,t[1]);}if(-1===a[6])throw [0,e,dg];a[6]=-1;return h(a,i,23);case 2:if(-1===a[6])throw [0,e,dd];var s=a[3];if(typeof s===g)switch(s){case 0:return R(a,i,21);case 1:return U(a,i,21);case 2:return k(a,i,21);case 3:return l(a,i,21);case 7:return m(a,i,21);case 8:var ae=i[1],$=i[2],ad=[0,i[3],0];for(;;){var n=[0,ae,$,ad],W=$-20|0;if(W<0||1<W)if(33===W)var ab=0;else{var o=j(0),ab=1;}else{if(0!==W){var aa=n[1],ae=aa[1],$=aa[2],ad=[0,aa[3],n[3]];continue;}var ab=0;}if(!ab){if(-1===a[6])throw [0,e,cS];var af=a[3];if(typeof af===g&&8===af){var r=f(a);if(typeof r===g)switch(r){case 0:var o=R(a,n,20),p=1,q=0;break;case 1:var o=U(a,n,20),p=1,q=0;break;case 2:var o=k(a,n,20),p=1,q=0;break;case 3:var o=l(a,n,20),p=1,q=0;break;case 7:var o=m(a,n,20),p=1,q=0;break;case 10:var o=F(a,n,20),p=1,q=0;break;case 11:var o=G(a,n,20),p=1,q=0;break;case 12:var o=z(a,n,20),p=1,q=0;break;case 13:var o=V(a,n,20),p=1,q=0;break;case 14:var A=n[1],O=n[2],Z=[0,n[3],0];for(;;){if(20===O){var ag=[0,A[3],Z],ah=A[2],A=A[1],O=ah,Z=ag;continue;}if(53===O){if(-1===a[6])throw [0,e,cI];var ac=a[3];if(typeof ac===g&&14===ac){f(a);var P=A[2],B=[0,A[1],P,Z];if(19<=P)if(54===P){if(-1===a[6])throw [0,e,cJ];var Q=a[3];if(typeof Q===g)if(7<=Q)if(8<=Q)var N=1;else{var u=y(a,B,19),v=1,w=0,N=0;}else if(4<=Q){if(-1===a[6])throw [0,e,cK];a[6]=-1;var u=h(a,B,19),v=1,w=0,N=0;}else var N=1;else var N=1;if(N){var u=x(a,B,19),v=1,w=0;}}else var w=1;else if(17<=P){if(-1===a[6])throw [0,e,cL];var _=a[3];if(typeof _===g&&!(9<=_))switch(_){case 4:case 5:case 6:if(-1===a[6])throw [0,e,cM];a[6]=-1;var u=h(a,B,17),v=1,w=0,Y=0;break;case 8:var u=bl(a,B,17),v=1,w=0,Y=0;break;default:var Y=1;}else var Y=1;if(Y){var u=bM(a,B,17),v=1,w=0;}}else var w=1;if(w){var u=j(0),v=1;}}else var v=0;if(!v){if(-1===a[6])throw [0,e,cN];a[6]=-1;var u=h(a,A,O);}}else var u=j(0);var o=u,p=1,q=0;break;}break;case 16:var o=S(a,n,20),p=1,q=0;break;case 17:var o=X(a,n,20),p=1,q=0;break;case 18:var o=T(a,n,20),p=1,q=0;break;case 19:var o=L(a,n,20),p=1,q=0;break;default:var q=1;}else switch(r[0]){case 1:var o=D(a,n,20,r[1]),p=1,q=0;break;case 2:var o=E(a,n,20,r[1]),p=1,q=0;break;case 3:var o=H(a,n,20,r[1]),p=1,q=0;break;case 4:var o=I(a,n,20,r[1]),p=1,q=0;break;case 5:var o=J(a,n,20,r[1]),p=1,q=0;break;case 6:var o=K(a,n,20,r[1]),p=1,q=0;break;case 7:var q=1;break;default:var o=C(a,n,20,r[1]),p=1,q=0;}if(q){if(-1===a[6])throw [0,e,cT];a[6]=-1;var o=h(a,n,20),p=1;}}else var p=0;if(!p){if(-1===a[6])throw [0,e,cU];a[6]=-1;var o=h(a,n[1],n[2]);}}return o;}case 10:return F(a,i,21);case 11:return G(a,i,21);case 12:return z(a,i,21);case 13:return V(a,i,21);case 16:return S(a,i,21);case 17:return X(a,i,21);case 18:return T(a,i,21);case 19:return L(a,i,21);default:}else switch(s[0]){case 1:return D(a,i,21,s[1]);case 2:return E(a,i,21,s[1]);case 3:return H(a,i,21,s[1]);case 4:return I(a,i,21,s[1]);case 5:return J(a,i,21,s[1]);case 6:return K(a,i,21,s[1]);case 7:break;default:return C(a,i,21,s[1]);}if(-1===a[6])throw [0,e,de];a[6]=-1;return h(a,i,21);default:return j(0);}}function bK(a,b,c,d){var f=[0,b,c,d];if(-1===a[6])throw [0,e,dh];var i=a[3];if(typeof i===g)switch(i){case 4:case 5:case 6:case 16:return Z(a,f,34);case 0:return _(a,f,34);case 1:return ay(a,f,34);case 2:return k(a,f,34);case 3:return l(a,f,34);case 7:return m(a,f,34);case 10:return ac(a,f,34);case 11:return ad(a,f,34);case 12:return W(a,f,34);case 13:return az(a,f,34);case 17:return aA(a,f,34);case 18:return ai(a,f,34);case 19:return aj(a,f,34);default:}else switch(i[0]){case 1:return aa(a,f,34,i[1]);case 2:return ab(a,f,34,i[1]);case 3:return ae(a,f,34,i[1]);case 4:return af(a,f,34,i[1]);case 5:return ag(a,f,34,i[1]);case 6:return ah(a,f,34,i[1]);case 7:break;default:return $(a,f,34,i[1]);}if(-1===a[6])throw [0,e,di];a[6]=-1;return h(a,f,34);}function bL(a,b,c,d){var f=[0,b,c,d];if(-1===a[6])throw [0,e,dj];var i=a[3];if(typeof i===g)switch(i){case 4:case 5:case 6:case 18:return ak(a,f,29);case 0:return al(a,f,29);case 1:return aB(a,f,29);case 2:return k(a,f,29);case 3:return l(a,f,29);case 7:return m(a,f,29);case 10:return ap(a,f,29);case 11:return aq(a,f,29);case 12:return Y(a,f,29);case 13:return aC(a,f,29);case 16:return av(a,f,29);case 17:return aD(a,f,29);case 19:return aw(a,f,29);default:}else switch(i[0]){case 1:return an(a,f,29,i[1]);case 2:return ao(a,f,29,i[1]);case 3:return ar(a,f,29,i[1]);case 4:return as(a,f,29,i[1]);case 5:return at(a,f,29,i[1]);case 6:return au(a,f,29,i[1]);case 7:break;default:return am(a,f,29,i[1]);}if(-1===a[6])throw [0,e,dk];a[6]=-1;return h(a,f,29);}function bg(a,b,c,d){var f=[0,b,c,d];if(-1===a[6])throw [0,e,dl];var i=a[3];if(typeof i===g)switch(i){case 0:return R(a,f,12);case 1:return U(a,f,12);case 2:return k(a,f,12);case 3:return l(a,f,12);case 7:return m(a,f,12);case 10:return F(a,f,12);case 11:return G(a,f,12);case 12:return z(a,f,12);case 13:return V(a,f,12);case 14:return aH(a,f,12);case 16:return S(a,f,12);case 17:return X(a,f,12);case 18:return T(a,f,12);case 19:return L(a,f,12);default:}else switch(i[0]){case 1:return D(a,f,12,i[1]);case 2:return E(a,f,12,i[1]);case 3:return H(a,f,12,i[1]);case 4:return I(a,f,12,i[1]);case 5:return J(a,f,12,i[1]);case 6:return K(a,f,12,i[1]);case 7:break;default:return C(a,f,12,i[1]);}if(-1===a[6])throw [0,e,dm];a[6]=-1;return h(a,f,12);}function bh(a,b,c,d){return bf(a,b,c,d);}function bi(a,b,c,d){return bK(a,b,c,d);}function r(a,b,c,d){return bi(a,b,c,d);}function aH(a,b,c){var k=b,p=c,u=0;for(;;){if(24<=p)if(49<=p)if(53<=p)var d=0;else switch(p-49|0){case 1:if(-1===a[6])throw [0,e,cX];var al=a[3];if(typeof al===g&&5===al){f(a);var L=k[2],I=k[1];if(49<=L)var J=54<=L?1:2;else if(28<=L)var J=1;else switch(L){case 12:case 15:case 20:case 21:case 23:case 27:var J=2;break;case 22:var i=t(a,I[1],I[2],[10,I[3],u]),d=1,T=0,J=0;break;case 24:var am=I[1],i=t(a,am[1],am[2],[11,I[3],u]),d=1,T=0,J=0;break;default:var J=1;}switch(J){case 1:var i=j(0),d=1,T=0;break;case 2:var i=t(a,I,L,[9,40,u,41]),d=1,T=0;break;default:}}else var T=1;if(T){if(-1===a[6])throw [0,e,cY];a[6]=-1;var i=h(a,k,p),d=1;}break;case 2:if(-1===a[6])throw [0,e,cZ];var an=a[3];if(typeof an===g&&4===an){f(a);var R=k[2],F=[0,k[1],R,u];if(49<=R)var K=54<=R?1:2;else if(28<=R)var K=1;else switch(R){case 12:case 15:case 20:case 21:case 23:case 27:var K=2;break;case 25:if(-1===a[6])throw [0,e,c2];var ao=a[3];if(typeof ao===g&&12===ao){var i=z(a,F,24),d=1,G=0,K=0,at=0;}else var at=1;if(at){if(-1===a[6])throw [0,e,c3];a[6]=-1;var i=h(a,F,24),d=1,G=0,K=0;}break;default:var K=1;}switch(K){case 1:var i=j(0),d=1,G=0;break;case 2:if(-1===a[6])throw [0,e,c0];var ad=a[3];if(typeof ad===g)switch(ad){case 9:case 15:var Z=1;break;case 12:var i=z(a,F,22),d=1,G=0,Z=0;break;default:var Z=2;}else var Z=7===ad[0]?1:2;switch(Z){case 1:if(-1===a[6])throw [0,e,c1];a[6]=-1;var i=h(a,F,22),d=1,G=0;break;case 2:var i=t(a,F[1],F[2],[9,40,F[3],41]),d=1,G=0;break;default:}break;default:}}else var G=1;if(G){if(-1===a[6])throw [0,e,c4];a[6]=-1;var i=h(a,k,p),d=1;}break;case 3:if(-1===a[6])throw [0,e,c5];var ap=a[3];if(typeof ap===g&&6===ap){f(a);var i=t(a,k[1],k[2],[2,u]),d=1,au=0;}else var au=1;if(au){if(-1===a[6])throw [0,e,c6];a[6]=-1;var i=h(a,k,p),d=1;}break;default:if(-1===a[6])throw [0,e,cV];var ak=a[3];if(typeof ak===g&&6===ak){f(a);var i=t(a,k[1],k[2],[9,123,u,125]),d=1,av=0;}else var av=1;if(av){if(-1===a[6])throw [0,e,cW];a[6]=-1;var i=h(a,k,p),d=1;}}else if(27===p){if(-1===a[6])throw [0,e,c7];var aq=a[3];if(typeof aq===g&&6===aq){f(a);var i=t(a,k[1],k[2],[1,u]),d=1,aw=0;}else var aw=1;if(aw){if(-1===a[6])throw [0,e,c8];a[6]=-1;var i=h(a,k,p),d=1;}}else var d=0;else if(12===p){if(-1===a[6])throw [0,e,c9];var ar=a[3];if(typeof ar===g&&14===ar){f(a);var as=k[1],S=as[2],l=[0,as[1],S,[0,k[3],u]];if(10<=S)if(55<=S)switch(S-55|0){case 0:case 2:case 4:case 11:var n=2;break;default:var n=1;}else var n=1;else switch(S){case 5:case 7:var n=1;break;case 9:if(-1===a[6])throw [0,e,da];var Y=a[3];if(typeof Y===g)switch(Y){case 4:case 5:case 6:if(-1===a[6])throw [0,e,db];a[6]=-1;var i=h(a,l,1),d=1,m=0,n=0,r=0;break;case 0:var i=B(a,l,1),d=1,m=0,n=0,r=0;break;case 2:var i=M(a,l,1),d=1,m=0,n=0,r=0;break;case 3:var i=N(a,l,1),d=1,m=0,n=0,r=0;break;case 7:var i=y(a,l,1),d=1,m=0,n=0,r=0;break;case 8:var i=x(a,l,1),d=1,m=0,n=0,r=0;break;case 9:var i=O(a,l,1),d=1,m=0,n=0,r=0;break;case 14:var i=a0(a,l,1),d=1,m=0,n=0,r=0;break;case 15:var i=P(a,l,1),d=1,m=0,n=0,r=0;break;default:var r=1;}else if(7===Y[0]){var i=Q(a,l,1,Y[1]),d=1,m=0,n=0,r=0;}else var r=1;if(r){var i=A(a,l,1),d=1,m=0,n=0;}break;default:var n=2;}switch(n){case 1:var i=j(0),d=1,m=0;break;case 2:if(-1===a[6])throw [0,e,c_];var ae=a[3];if(typeof ae===g)switch(ae){case 2:case 3:case 7:case 8:case 9:case 14:case 15:var U=2;break;case 4:case 5:case 6:if(-1===a[6])throw [0,e,c$];a[6]=-1;var i=h(a,l,4),d=1,m=0,U=0;break;case 0:var i=B(a,l,4),d=1,m=0,U=0;break;default:var U=1;}else var U=7===ae[0]?2:1;switch(U){case 1:var i=A(a,l,4),d=1,m=0;break;case 2:var aj=l[1],H=l[2],ai=[0,l[3],0];for(;;){var o=[0,aj,H,ai];if(9<=H)if(55<=H)switch(H-55|0){case 0:case 2:case 4:case 11:var E=1;break;default:var E=0;}else var E=0;else switch(H){case 5:case 7:var E=0;break;case 4:var aa=o[1],aj=aa[1],H=aa[2],ai=[0,aa[3],o[3]];continue;case 6:if(-1===a[6])throw [0,e,cQ];var ab=a[3];if(typeof ab===g)switch(ab){case 3:case 7:case 8:case 9:case 14:case 15:var _=2;break;case 2:var q=M(a,o,5),E=2,_=0;break;default:var _=1;}else var _=7===ab[0]?2:1;switch(_){case 1:if(-1===a[6])throw [0,e,cR];a[6]=-1;var q=h(a,o,5),E=2;break;case 2:var ac=o[1],ag=ac[1],D=ac[2],af=[0,[0,ac[3],o[3]],0];for(;;){var s=[0,ag,D,af];if(7<=D)if(9<=D)if(55<=D)switch(D-55|0){case 0:case 2:case 4:case 11:var V=1;break;default:var V=0;}else var V=0;else var V=1;else{if(5===D){var ah=s[1],$=ah[1],ag=$[1],D=$[2],af=[0,[0,$[3],ah[3]],s[3]];continue;}var V=4<=D?0:1;}if(V){if(-1===a[6])throw [0,e,cG];var W=a[3];if(typeof W===g)switch(W){case 3:var w=N(a,s,11),C=1;break;case 7:var w=y(a,s,11),C=1;break;case 8:var w=x(a,s,11),C=1;break;case 9:var w=O(a,s,11),C=1;break;case 14:var w=a0(a,s,11),C=1;break;case 15:var w=P(a,s,11),C=1;break;default:var C=0;}else if(7===W[0]){var w=Q(a,s,11,W[1]),C=1;}else var C=0;if(!C){if(-1===a[6])throw [0,e,cH];a[6]=-1;var w=h(a,s,11);}}else var w=j(0);var q=w,E=2;break;}break;default:}break;default:var E=1;}switch(E){case 1:if(-1===a[6])throw [0,e,cO];var X=a[3];if(typeof X===g)switch(X){case 2:var q=M(a,o,7),v=1;break;case 3:var q=N(a,o,7),v=1;break;case 7:var q=y(a,o,7),v=1;break;case 8:var q=x(a,o,7),v=1;break;case 9:var q=O(a,o,7),v=1;break;case 14:var q=a0(a,o,7),v=1;break;case 15:var q=P(a,o,7),v=1;break;default:var v=0;}else if(7===X[0]){var q=Q(a,o,7,X[1]),v=1;}else var v=0;if(!v){if(-1===a[6])throw [0,e,cP];a[6]=-1;var q=h(a,o,7);}break;case 2:break;default:var q=j(0);}var i=q,d=1,m=0;break;}break;default:}break;default:}}else var m=1;if(m){if(-1===a[6])throw [0,e,dc];a[6]=-1;var i=h(a,k,p),d=1;}}else{if(23<=p){var ax=[0,k[3],u],ay=k[2],k=k[1],p=ay,u=ax;continue;}var d=0;}if(!d)var i=j(0);return i;}}function R(a,b,c){f(a);return bh(a,b,c,dK);}function S(a,b,c){var d=[0,b,c],i=f(a);if(typeof i===g)switch(i){case 0:return _(a,d,48);case 1:return ay(a,d,48);case 2:return k(a,d,48);case 3:return l(a,d,48);case 7:return m(a,d,48);case 10:return ac(a,d,48);case 11:return ad(a,d,48);case 12:return W(a,d,48);case 13:return az(a,d,48);case 16:return Z(a,d,48);case 17:return aA(a,d,48);case 18:return ai(a,d,48);case 19:return aj(a,d,48);default:}else switch(i[0]){case 1:return aa(a,d,48,i[1]);case 2:return ab(a,d,48,i[1]);case 3:return ae(a,d,48,i[1]);case 4:return af(a,d,48,i[1]);case 5:return ag(a,d,48,i[1]);case 6:return ah(a,d,48,i[1]);case 7:break;default:return $(a,d,48,i[1]);}if(-1===a[6])throw [0,e,dL];a[6]=-1;return h(a,d,48);}function T(a,b,c){var d=[0,b,c],i=f(a);if(typeof i===g)switch(i){case 0:return al(a,d,26);case 1:return aB(a,d,26);case 2:return k(a,d,26);case 3:return l(a,d,26);case 7:return m(a,d,26);case 10:return ap(a,d,26);case 11:return aq(a,d,26);case 12:return Y(a,d,26);case 13:return aC(a,d,26);case 16:return av(a,d,26);case 17:return aD(a,d,26);case 18:return ak(a,d,26);case 19:return aw(a,d,26);default:}else switch(i[0]){case 1:return an(a,d,26,i[1]);case 2:return ao(a,d,26,i[1]);case 3:return ar(a,d,26,i[1]);case 4:return as(a,d,26,i[1]);case 5:return at(a,d,26,i[1]);case 6:return au(a,d,26,i[1]);case 7:break;default:return am(a,d,26,i[1]);}if(-1===a[6])throw [0,e,dM];a[6]=-1;return h(a,d,26);}function bj(a,b,c,d){return bL(a,b,c,d);}function bk(a,b,c,d){switch(c){case 12:case 20:case 21:case 23:case 27:case 49:case 50:case 51:case 52:case 53:return bh(a,b,c,d);case 14:case 34:case 37:case 43:case 44:case 45:case 46:case 47:case 48:return bi(a,b,c,d);case 13:case 26:case 29:case 32:case 38:case 39:case 40:case 41:case 42:return bj(a,b,c,d);default:return j(0);}}function s(a,b,c,d){return bj(a,b,c,d);}function t(a,b,c,d){if(49<=c)var e=54<=c?0:1;else if(28<=c)var e=0;else switch(c){case 12:case 20:case 21:case 23:case 27:var e=1;break;case 15:return bg(a,b,c,d);default:var e=0;}return e?bh(a,b,c,d):j(0);}function bM(a,b,c){var o=b,i=c,n=0;for(;;){var d=[0,o,i,n];if(17===i){var m=d[1],o=m[1],i=m[2],n=[0,m[3],d[3]];continue;}if(18===i){if(-1===a[6])throw [0,e,dn];var k=a[3];if(typeof k===g)if(7<=k)if(8<=k)var f=0;else{var l=y(a,d,16),f=1;}else if(4<=k){if(-1===a[6])throw [0,e,dp];a[6]=-1;var l=h(a,d,16),f=1;}else var f=0;else var f=0;if(!f)var l=x(a,d,16);}else var l=j(0);return l;}}function bl(a,b,c){var d=[0,b,c],i=f(a);if(typeof i===g)switch(i){case 0:return R(a,d,53);case 1:return U(a,d,53);case 2:return k(a,d,53);case 3:return l(a,d,53);case 7:return m(a,d,53);case 10:return F(a,d,53);case 11:return G(a,d,53);case 12:return z(a,d,53);case 13:return V(a,d,53);case 16:return S(a,d,53);case 17:return X(a,d,53);case 18:return T(a,d,53);case 19:return L(a,d,53);default:}else switch(i[0]){case 1:return D(a,d,53,i[1]);case 2:return E(a,d,53,i[1]);case 3:return H(a,d,53,i[1]);case 4:return I(a,d,53,i[1]);case 5:return J(a,d,53,i[1]);case 6:return K(a,d,53,i[1]);case 7:break;default:return C(a,d,53,i[1]);}if(-1===a[6])throw [0,e,ed];a[6]=-1;return h(a,d,53);}function U(a,b,c){var o=b,n=c;for(;;){var d=[0,o,n],j=f(a);if(typeof j===g){if(13===j){var i=f(a);if(typeof i===g)switch(i){case 0:return R(a,d,52);case 1:var o=d,n=52;continue;case 2:return k(a,d,52);case 3:return l(a,d,52);case 6:return aH(a,d,52);case 7:return m(a,d,52);case 10:return F(a,d,52);case 11:return G(a,d,52);case 12:return z(a,d,52);case 13:return V(a,d,52);case 16:return S(a,d,52);case 17:return X(a,d,52);case 18:return T(a,d,52);case 19:return L(a,d,52);default:}else switch(i[0]){case 1:return D(a,d,52,i[1]);case 2:return E(a,d,52,i[1]);case 3:return H(a,d,52,i[1]);case 4:return I(a,d,52,i[1]);case 5:return J(a,d,52,i[1]);case 6:return K(a,d,52,i[1]);case 7:break;default:return C(a,d,52,i[1]);}if(-1===a[6])throw [0,e,ef];a[6]=-1;return h(a,d,52);}}else switch(j[0]){case 4:f(a);return t(a,d[1],d[2],[2,[0,[4,j[1]],0]]);case 6:f(a);return t(a,d[1],d[2],[2,[0,[3,j[1]],0]]);default:}if(-1===a[6])throw [0,e,ee];a[6]=-1;return h(a,d[1],d[2]);}}function C(a,b,c,d){f(a);return t(a,b,c,[1,[0,[3,d],0]]);}function D(a,b,c,d){f(a);return t(a,b,c,[2,[0,[3,d],0]]);}function E(a,b,c,d){f(a);return t(a,b,c,[0,d]);}function F(a,b,c){f(a);return t(a,b,c,eg);}function G(a,b,c){var n=b,j=c;for(;;){var d=[0,n,j],i=f(a);if(typeof i===g)switch(i){case 0:return R(a,d,51);case 1:return U(a,d,51);case 2:return k(a,d,51);case 3:return l(a,d,51);case 4:return aH(a,d,51);case 7:return m(a,d,51);case 10:return F(a,d,51);case 11:var n=d,j=51;continue;case 12:return z(a,d,51);case 13:return V(a,d,51);case 16:return S(a,d,51);case 17:return X(a,d,51);case 18:return T(a,d,51);case 19:return L(a,d,51);default:}else switch(i[0]){case 1:return D(a,d,51,i[1]);case 2:return E(a,d,51,i[1]);case 3:return H(a,d,51,i[1]);case 4:return I(a,d,51,i[1]);case 5:return J(a,d,51,i[1]);case 6:return K(a,d,51,i[1]);case 7:break;default:return C(a,d,51,i[1]);}if(-1===a[6])throw [0,e,eh];a[6]=-1;return h(a,d,51);}}function z(a,b,c){var n=b,j=c;for(;;){var d=[0,n,j],i=f(a);if(typeof i===g)switch(i){case 0:return R(a,d,50);case 1:return U(a,d,50);case 2:return k(a,d,50);case 3:return l(a,d,50);case 5:return aH(a,d,50);case 7:return m(a,d,50);case 10:return F(a,d,50);case 11:return G(a,d,50);case 12:var n=d,j=50;continue;case 13:return V(a,d,50);case 16:return S(a,d,50);case 17:return X(a,d,50);case 18:return T(a,d,50);case 19:return L(a,d,50);default:}else switch(i[0]){case 1:return D(a,d,50,i[1]);case 2:return E(a,d,50,i[1]);case 3:return H(a,d,50,i[1]);case 4:return I(a,d,50,i[1]);case 5:return J(a,d,50,i[1]);case 6:return K(a,d,50,i[1]);case 7:break;default:return C(a,d,50,i[1]);}if(-1===a[6])throw [0,e,ei];a[6]=-1;return h(a,d,50);}}function V(a,b,c){var n=b,j=c;for(;;){var d=[0,n,j],i=f(a);if(typeof i===g)switch(i){case 0:return R(a,d,49);case 1:return U(a,d,49);case 2:return k(a,d,49);case 3:return l(a,d,49);case 6:return aH(a,d,49);case 7:return m(a,d,49);case 10:return F(a,d,49);case 11:return G(a,d,49);case 12:return z(a,d,49);case 13:var n=d,j=49;continue;case 16:return S(a,d,49);case 17:return X(a,d,49);case 18:return T(a,d,49);case 19:return L(a,d,49);default:}else switch(i[0]){case 1:return D(a,d,49,i[1]);case 2:return E(a,d,49,i[1]);case 3:return H(a,d,49,i[1]);case 4:return I(a,d,49,i[1]);case 5:return J(a,d,49,i[1]);case 6:return K(a,d,49,i[1]);case 7:break;default:return C(a,d,49,i[1]);}if(-1===a[6])throw [0,e,ej];a[6]=-1;return h(a,d,49);}}function H(a,b,c,d){f(a);return t(a,b,c,[6,d]);}function I(a,b,c,d){f(a);return t(a,b,c,[4,d]);}function J(a,b,c,d){f(a);return t(a,b,c,[5,d]);}function K(a,b,c,d){f(a);return t(a,b,c,[3,d]);}function Z(a,b,c){var d=b,m=c,l=0;for(;;){var x=m-14|0;if(x<0||34<x)var i=0;else switch(x){case 0:if(-1===a[6])throw [0,e,dq];var z=a[3];if(typeof z===g&&16===z){f(a);var k=bg(a,d[1],d[2],[8,l]),i=1,K=0;}else var K=1;if(K){if(-1===a[6])throw [0,e,dr];a[6]=-1;var k=h(a,d,m),i=1;}break;case 20:var R=[0,d[3],l],S=d[2],d=d[1],m=S,l=R;continue;case 23:if(-1===a[6])throw [0,e,ds];var A=a[3];if(typeof A===g&&16===A){f(a);var k=bL(a,d[1],d[2],[8,l]),i=1,L=0;}else var L=1;if(L){if(-1===a[6])throw [0,e,dt];a[6]=-1;var k=h(a,d,m),i=1;}break;case 29:if(-1===a[6])throw [0,e,du];var B=a[3];if(typeof B===g&&6===B){f(a);var k=r(a,d[1],d[2],[1,l]),i=1,M=0;}else var M=1;if(M){if(-1===a[6])throw [0,e,dv];a[6]=-1;var k=h(a,d,m),i=1;}break;case 30:if(-1===a[6])throw [0,e,dw];var C=a[3];if(typeof C===g&&6===C){f(a);var k=r(a,d[1],d[2],[9,123,l,125]),i=1,N=0;}else var N=1;if(N){if(-1===a[6])throw [0,e,dx];a[6]=-1;var k=h(a,d,m),i=1;}break;case 31:if(-1===a[6])throw [0,e,dy];var D=a[3];if(typeof D===g&&5===D){f(a);var t=d[2],p=d[1];if(33<=t)if(49<=t)var q=1;else switch(t-33|0){case 3:case 5:case 6:case 7:case 8:case 9:var q=1;break;case 0:var k=r(a,p[1],p[2],[10,p[3],l]),i=1,v=0,q=0;break;case 2:var E=p[1],k=r(a,E[1],E[2],[11,p[3],l]),i=1,v=0,q=0;break;default:var q=2;}else var q=14===t?2:1;switch(q){case 1:var k=j(0),i=1,v=0;break;case 2:var k=r(a,p,t,[9,40,l,41]),i=1,v=0;break;default:}}else var v=1;if(v){if(-1===a[6])throw [0,e,dz];a[6]=-1;var k=h(a,d,m),i=1;}break;case 32:if(-1===a[6])throw [0,e,dA];var F=a[3];if(typeof F===g&&4===F){f(a);var G=d[2],n=[0,d[1],G,l],u=G-34|0;if(u<0||14<u)var s=-20===u?2:1;else if(9<=u)var s=2;else switch(u){case 0:case 3:var s=2;break;case 2:if(-1===a[6])throw [0,e,dD];var H=a[3];if(typeof H===g&&12===H){var k=W(a,n,35),i=1,o=0,s=0,O=0;}else var O=1;if(O){if(-1===a[6])throw [0,e,dE];a[6]=-1;var k=h(a,n,35),i=1,o=0,s=0;}break;default:var s=1;}switch(s){case 1:var k=j(0),i=1,o=0;break;case 2:if(-1===a[6])throw [0,e,dB];var y=a[3];if(typeof y===g)switch(y){case 8:case 9:case 14:case 15:var w=1;break;case 12:var k=W(a,n,33),i=1,o=0,w=0;break;default:var w=2;}else var w=7===y[0]?1:2;switch(w){case 1:if(-1===a[6])throw [0,e,dC];a[6]=-1;var k=h(a,n,33),i=1,o=0;break;case 2:var k=r(a,n[1],n[2],[9,40,n[3],41]),i=1,o=0;break;default:}break;default:}}else var o=1;if(o){if(-1===a[6])throw [0,e,dF];a[6]=-1;var k=h(a,d,m),i=1;}break;case 33:if(-1===a[6])throw [0,e,dG];var I=a[3];if(typeof I===g&&6===I){f(a);var k=r(a,d[1],d[2],[2,l]),i=1,P=0;}else var P=1;if(P){if(-1===a[6])throw [0,e,dH];a[6]=-1;var k=h(a,d,m),i=1;}break;case 34:if(-1===a[6])throw [0,e,dI];var J=a[3];if(typeof J===g&&16===J){f(a);var k=bf(a,d[1],d[2],[8,l]),i=1,Q=0;}else var Q=1;if(Q){if(-1===a[6])throw [0,e,dJ];a[6]=-1;var k=h(a,d,m),i=1;}break;default:var i=0;}if(!i)var k=j(0);return k;}}function _(a,b,c){f(a);return bi(a,b,c,ek);}function ay(a,b,c){var o=b,n=c;for(;;){var d=[0,o,n],j=f(a);if(typeof j===g){if(13===j){var i=f(a);if(typeof i===g)switch(i){case 0:return _(a,d,47);case 1:var o=d,n=47;continue;case 2:return k(a,d,47);case 3:return l(a,d,47);case 6:return Z(a,d,47);case 7:return m(a,d,47);case 10:return ac(a,d,47);case 11:return ad(a,d,47);case 12:return W(a,d,47);case 13:return az(a,d,47);case 17:return aA(a,d,47);case 18:return ai(a,d,47);case 19:return aj(a,d,47);default:}else switch(i[0]){case 1:return aa(a,d,47,i[1]);case 2:return ab(a,d,47,i[1]);case 3:return ae(a,d,47,i[1]);case 4:return af(a,d,47,i[1]);case 5:return ag(a,d,47,i[1]);case 6:return ah(a,d,47,i[1]);case 7:break;default:return $(a,d,47,i[1]);}if(-1===a[6])throw [0,e,em];a[6]=-1;return h(a,d,47);}}else switch(j[0]){case 4:f(a);return r(a,d[1],d[2],[2,[0,[4,j[1]],0]]);case 6:f(a);return r(a,d[1],d[2],[2,[0,[3,j[1]],0]]);default:}if(-1===a[6])throw [0,e,el];a[6]=-1;return h(a,d[1],d[2]);}}function $(a,b,c,d){f(a);return r(a,b,c,[1,[0,[3,d],0]]);}function aa(a,b,c,d){f(a);return r(a,b,c,[2,[0,[3,d],0]]);}function ab(a,b,c,d){f(a);return r(a,b,c,[0,d]);}function ac(a,b,c){f(a);return r(a,b,c,en);}function ad(a,b,c){var n=b,j=c;for(;;){var d=[0,n,j],i=f(a);if(typeof i===g)switch(i){case 0:return _(a,d,46);case 1:return ay(a,d,46);case 2:return k(a,d,46);case 3:return l(a,d,46);case 4:return Z(a,d,46);case 7:return m(a,d,46);case 10:return ac(a,d,46);case 11:var n=d,j=46;continue;case 12:return W(a,d,46);case 13:return az(a,d,46);case 17:return aA(a,d,46);case 18:return ai(a,d,46);case 19:return aj(a,d,46);default:}else switch(i[0]){case 1:return aa(a,d,46,i[1]);case 2:return ab(a,d,46,i[1]);case 3:return ae(a,d,46,i[1]);case 4:return af(a,d,46,i[1]);case 5:return ag(a,d,46,i[1]);case 6:return ah(a,d,46,i[1]);case 7:break;default:return $(a,d,46,i[1]);}if(-1===a[6])throw [0,e,eo];a[6]=-1;return h(a,d,46);}}function W(a,b,c){var n=b,j=c;for(;;){var d=[0,n,j],i=f(a);if(typeof i===g)switch(i){case 0:return _(a,d,45);case 1:return ay(a,d,45);case 2:return k(a,d,45);case 3:return l(a,d,45);case 5:return Z(a,d,45);case 7:return m(a,d,45);case 10:return ac(a,d,45);case 11:return ad(a,d,45);case 12:var n=d,j=45;continue;case 13:return az(a,d,45);case 17:return aA(a,d,45);case 18:return ai(a,d,45);case 19:return aj(a,d,45);default:}else switch(i[0]){case 1:return aa(a,d,45,i[1]);case 2:return ab(a,d,45,i[1]);case 3:return ae(a,d,45,i[1]);case 4:return af(a,d,45,i[1]);case 5:return ag(a,d,45,i[1]);case 6:return ah(a,d,45,i[1]);case 7:break;default:return $(a,d,45,i[1]);}if(-1===a[6])throw [0,e,ep];a[6]=-1;return h(a,d,45);}}function az(a,b,c){var n=b,j=c;for(;;){var d=[0,n,j],i=f(a);if(typeof i===g)switch(i){case 0:return _(a,d,44);case 1:return ay(a,d,44);case 2:return k(a,d,44);case 3:return l(a,d,44);case 6:return Z(a,d,44);case 7:return m(a,d,44);case 10:return ac(a,d,44);case 11:return ad(a,d,44);case 12:return W(a,d,44);case 13:var n=d,j=44;continue;case 17:return aA(a,d,44);case 18:return ai(a,d,44);case 19:return aj(a,d,44);default:}else switch(i[0]){case 1:return aa(a,d,44,i[1]);case 2:return ab(a,d,44,i[1]);case 3:return ae(a,d,44,i[1]);case 4:return af(a,d,44,i[1]);case 5:return ag(a,d,44,i[1]);case 6:return ah(a,d,44,i[1]);case 7:break;default:return $(a,d,44,i[1]);}if(-1===a[6])throw [0,e,eq];a[6]=-1;return h(a,d,44);}}function ae(a,b,c,d){f(a);return r(a,b,c,[6,d]);}function af(a,b,c,d){f(a);return r(a,b,c,[4,d]);}function ag(a,b,c,d){f(a);return r(a,b,c,[5,d]);}function ah(a,b,c,d){f(a);return r(a,b,c,[3,d]);}function aA(a,b,c){var o=b,n=c;for(;;){var d=[0,o,n],j=f(a);if(typeof j===g){if(13===j){var i=f(a);if(typeof i===g)switch(i){case 0:return _(a,d,43);case 1:return ay(a,d,43);case 2:return k(a,d,43);case 3:return l(a,d,43);case 6:return Z(a,d,43);case 7:return m(a,d,43);case 10:return ac(a,d,43);case 11:return ad(a,d,43);case 12:return W(a,d,43);case 13:return az(a,d,43);case 17:var o=d,n=43;continue;case 18:return ai(a,d,43);case 19:return aj(a,d,43);default:}else switch(i[0]){case 1:return aa(a,d,43,i[1]);case 2:return ab(a,d,43,i[1]);case 3:return ae(a,d,43,i[1]);case 4:return af(a,d,43,i[1]);case 5:return ag(a,d,43,i[1]);case 6:return ah(a,d,43,i[1]);case 7:break;default:return $(a,d,43,i[1]);}if(-1===a[6])throw [0,e,es];a[6]=-1;return h(a,d,43);}}else switch(j[0]){case 4:f(a);return r(a,d[1],d[2],[1,[0,[4,j[1]],0]]);case 6:f(a);return r(a,d[1],d[2],[1,[0,[3,j[1]],0]]);default:}if(-1===a[6])throw [0,e,er];a[6]=-1;return h(a,d[1],d[2]);}}function ai(a,b,c){var d=[0,b,c],i=f(a);if(typeof i===g)switch(i){case 0:return al(a,d,42);case 1:return aB(a,d,42);case 2:return k(a,d,42);case 3:return l(a,d,42);case 7:return m(a,d,42);case 10:return ap(a,d,42);case 11:return aq(a,d,42);case 12:return Y(a,d,42);case 13:return aC(a,d,42);case 16:return av(a,d,42);case 17:return aD(a,d,42);case 18:return ak(a,d,42);case 19:return aw(a,d,42);default:}else switch(i[0]){case 1:return an(a,d,42,i[1]);case 2:return ao(a,d,42,i[1]);case 3:return ar(a,d,42,i[1]);case 4:return as(a,d,42,i[1]);case 5:return at(a,d,42,i[1]);case 6:return au(a,d,42,i[1]);case 7:break;default:return am(a,d,42,i[1]);}if(-1===a[6])throw [0,e,et];a[6]=-1;return h(a,d,42);}function aj(a,b,c){var d=[0,b,c],i=f(a);if(typeof i===g)switch(i){case 8:case 9:case 14:case 15:var j=0;break;case 11:return ad(a,d,36);default:var j=1;}else var j=7===i[0]?0:1;if(j)return r(a,d[1],d[2],eu);if(-1===a[6])throw [0,e,ev];a[6]=-1;return h(a,d,36);}function X(a,b,c){var o=b,n=c;for(;;){var d=[0,o,n],j=f(a);if(typeof j===g){if(13===j){var i=f(a);if(typeof i===g)switch(i){case 0:return R(a,d,27);case 1:return U(a,d,27);case 2:return k(a,d,27);case 3:return l(a,d,27);case 6:return aH(a,d,27);case 7:return m(a,d,27);case 10:return F(a,d,27);case 11:return G(a,d,27);case 12:return z(a,d,27);case 13:return V(a,d,27);case 16:return S(a,d,27);case 17:var o=d,n=27;continue;case 18:return T(a,d,27);case 19:return L(a,d,27);default:}else switch(i[0]){case 1:return D(a,d,27,i[1]);case 2:return E(a,d,27,i[1]);case 3:return H(a,d,27,i[1]);case 4:return I(a,d,27,i[1]);case 5:return J(a,d,27,i[1]);case 6:return K(a,d,27,i[1]);case 7:break;default:return C(a,d,27,i[1]);}if(-1===a[6])throw [0,e,ex];a[6]=-1;return h(a,d,27);}}else switch(j[0]){case 4:f(a);return t(a,d[1],d[2],[1,[0,[4,j[1]],0]]);case 6:f(a);return t(a,d[1],d[2],[1,[0,[3,j[1]],0]]);default:}if(-1===a[6])throw [0,e,ew];a[6]=-1;return h(a,d[1],d[2]);}}function ak(a,b,c){var d=b,m=c,l=0;for(;;){var v=m-13|0;if(v<0||29<v)var i=0;else switch(v){case 0:if(-1===a[6])throw [0,e,dN];var z=a[3];if(typeof z===g&&18===z){f(a);var k=bg(a,d[1],d[2],[7,l]),i=1,L=0;}else var L=1;if(L){if(-1===a[6])throw [0,e,dO];a[6]=-1;var k=h(a,d,m),i=1;}break;case 13:if(-1===a[6])throw [0,e,dP];var A=a[3];if(typeof A===g&&18===A){f(a);var k=bf(a,d[1],d[2],[7,l]),i=1,M=0;}else var M=1;if(M){if(-1===a[6])throw [0,e,dQ];a[6]=-1;var k=h(a,d,m),i=1;}break;case 16:var S=[0,d[3],l],T=d[2],d=d[1],m=T,l=S;continue;case 19:if(-1===a[6])throw [0,e,dR];var B=a[3];if(typeof B===g&&6===B){f(a);var k=s(a,d[1],d[2],[1,l]),i=1,N=0;}else var N=1;if(N){if(-1===a[6])throw [0,e,dS];a[6]=-1;var k=h(a,d,m),i=1;}break;case 25:if(-1===a[6])throw [0,e,dT];var C=a[3];if(typeof C===g&&6===C){f(a);var k=s(a,d[1],d[2],[9,123,l,125]),i=1,O=0;}else var O=1;if(O){if(-1===a[6])throw [0,e,dU];a[6]=-1;var k=h(a,d,m),i=1;}break;case 26:if(-1===a[6])throw [0,e,dV];var D=a[3];if(typeof D===g&&5===D){f(a);var E=d[2],q=d[1],w=E-13|0;if(w<0||29<w)var t=1;else switch(w){case 0:case 13:case 16:case 19:case 25:case 26:case 27:case 28:case 29:var k=s(a,q,E,[9,40,l,41]),i=1,r=0,t=0;break;case 15:var k=s(a,q[1],q[2],[10,q[3],l]),i=1,r=0,t=0;break;case 17:var F=q[1],k=s(a,F[1],F[2],[11,q[3],l]),i=1,r=0,t=0;break;default:var t=1;}if(t){var k=j(0),i=1,r=0;}}else var r=1;if(r){if(-1===a[6])throw [0,e,dW];a[6]=-1;var k=h(a,d,m),i=1;}break;case 27:if(-1===a[6])throw [0,e,dX];var G=a[3];if(typeof G===g&&4===G){f(a);var H=d[2],n=[0,d[1],H,l],x=H-13|0;if(x<0||29<x)var p=1;else switch(x){case 0:case 13:case 16:case 19:case 25:case 26:case 27:case 28:case 29:if(-1===a[6])throw [0,e,dY];var y=a[3];if(typeof y===g)switch(y){case 8:case 9:case 14:case 15:var u=1;break;case 12:var k=Y(a,n,28),i=1,o=0,p=0,u=0;break;default:var u=2;}else var u=7===y[0]?1:2;switch(u){case 1:if(-1===a[6])throw [0,e,dZ];a[6]=-1;var k=h(a,n,28),i=1,o=0,p=0;break;case 2:var k=s(a,n[1],n[2],[9,40,n[3],41]),i=1,o=0,p=0;break;default:}break;case 18:if(-1===a[6])throw [0,e,d0];var I=a[3];if(typeof I===g&&12===I){var k=Y(a,n,30),i=1,o=0,p=0,P=0;}else var P=1;if(P){if(-1===a[6])throw [0,e,d1];a[6]=-1;var k=h(a,n,30),i=1,o=0,p=0;}break;default:var p=1;}if(p){var k=j(0),i=1,o=0;}}else var o=1;if(o){if(-1===a[6])throw [0,e,d2];a[6]=-1;var k=h(a,d,m),i=1;}break;case 28:if(-1===a[6])throw [0,e,d3];var J=a[3];if(typeof J===g&&6===J){f(a);var k=s(a,d[1],d[2],[2,l]),i=1,Q=0;}else var Q=1;if(Q){if(-1===a[6])throw [0,e,d4];a[6]=-1;var k=h(a,d,m),i=1;}break;case 29:if(-1===a[6])throw [0,e,d5];var K=a[3];if(typeof K===g&&18===K){f(a);var k=bK(a,d[1],d[2],[7,l]),i=1,R=0;}else var R=1;if(R){if(-1===a[6])throw [0,e,d6];a[6]=-1;var k=h(a,d,m),i=1;}break;default:var i=0;}if(!i)var k=j(0);return k;}}function al(a,b,c){f(a);return bj(a,b,c,ey);}function aB(a,b,c){var o=b,n=c;for(;;){var d=[0,o,n],j=f(a);if(typeof j===g){if(13===j){var i=f(a);if(typeof i===g)switch(i){case 0:return al(a,d,41);case 1:var o=d,n=41;continue;case 2:return k(a,d,41);case 3:return l(a,d,41);case 6:return ak(a,d,41);case 7:return m(a,d,41);case 10:return ap(a,d,41);case 11:return aq(a,d,41);case 12:return Y(a,d,41);case 13:return aC(a,d,41);case 16:return av(a,d,41);case 17:return aD(a,d,41);case 19:return aw(a,d,41);default:}else switch(i[0]){case 1:return an(a,d,41,i[1]);case 2:return ao(a,d,41,i[1]);case 3:return ar(a,d,41,i[1]);case 4:return as(a,d,41,i[1]);case 5:return at(a,d,41,i[1]);case 6:return au(a,d,41,i[1]);case 7:break;default:return am(a,d,41,i[1]);}if(-1===a[6])throw [0,e,eA];a[6]=-1;return h(a,d,41);}}else switch(j[0]){case 4:f(a);return s(a,d[1],d[2],[2,[0,[4,j[1]],0]]);case 6:f(a);return s(a,d[1],d[2],[2,[0,[3,j[1]],0]]);default:}if(-1===a[6])throw [0,e,ez];a[6]=-1;return h(a,d[1],d[2]);}}function am(a,b,c,d){f(a);return s(a,b,c,[1,[0,[3,d],0]]);}function an(a,b,c,d){f(a);return s(a,b,c,[2,[0,[3,d],0]]);}function ao(a,b,c,d){f(a);return s(a,b,c,[0,d]);}function k(a,b,c){f(a);return bk(a,b,c,eB);}function l(a,b,c){f(a);return bk(a,b,c,eC);}function m(a,b,c){f(a);return bk(a,b,c,eD);}function ap(a,b,c){f(a);return s(a,b,c,eE);}function aq(a,b,c){var n=b,j=c;for(;;){var d=[0,n,j],i=f(a);if(typeof i===g)switch(i){case 0:return al(a,d,40);case 1:return aB(a,d,40);case 2:return k(a,d,40);case 3:return l(a,d,40);case 4:return ak(a,d,40);case 7:return m(a,d,40);case 10:return ap(a,d,40);case 11:var n=d,j=40;continue;case 12:return Y(a,d,40);case 13:return aC(a,d,40);case 16:return av(a,d,40);case 17:return aD(a,d,40);case 19:return aw(a,d,40);default:}else switch(i[0]){case 1:return an(a,d,40,i[1]);case 2:return ao(a,d,40,i[1]);case 3:return ar(a,d,40,i[1]);case 4:return as(a,d,40,i[1]);case 5:return at(a,d,40,i[1]);case 6:return au(a,d,40,i[1]);case 7:break;default:return am(a,d,40,i[1]);}if(-1===a[6])throw [0,e,eF];a[6]=-1;return h(a,d,40);}}function Y(a,b,c){var n=b,j=c;for(;;){var d=[0,n,j],i=f(a);if(typeof i===g)switch(i){case 0:return al(a,d,39);case 1:return aB(a,d,39);case 2:return k(a,d,39);case 3:return l(a,d,39);case 5:return ak(a,d,39);case 7:return m(a,d,39);case 10:return ap(a,d,39);case 11:return aq(a,d,39);case 12:var n=d,j=39;continue;case 13:return aC(a,d,39);case 16:return av(a,d,39);case 17:return aD(a,d,39);case 19:return aw(a,d,39);default:}else switch(i[0]){case 1:return an(a,d,39,i[1]);case 2:return ao(a,d,39,i[1]);case 3:return ar(a,d,39,i[1]);case 4:return as(a,d,39,i[1]);case 5:return at(a,d,39,i[1]);case 6:return au(a,d,39,i[1]);case 7:break;default:return am(a,d,39,i[1]);}if(-1===a[6])throw [0,e,eG];a[6]=-1;return h(a,d,39);}}function aC(a,b,c){var n=b,j=c;for(;;){var d=[0,n,j],i=f(a);if(typeof i===g)switch(i){case 0:return al(a,d,38);case 1:return aB(a,d,38);case 2:return k(a,d,38);case 3:return l(a,d,38);case 6:return ak(a,d,38);case 7:return m(a,d,38);case 10:return ap(a,d,38);case 11:return aq(a,d,38);case 12:return Y(a,d,38);case 13:var n=d,j=38;continue;case 16:return av(a,d,38);case 17:return aD(a,d,38);case 19:return aw(a,d,38);default:}else switch(i[0]){case 1:return an(a,d,38,i[1]);case 2:return ao(a,d,38,i[1]);case 3:return ar(a,d,38,i[1]);case 4:return as(a,d,38,i[1]);case 5:return at(a,d,38,i[1]);case 6:return au(a,d,38,i[1]);case 7:break;default:return am(a,d,38,i[1]);}if(-1===a[6])throw [0,e,eH];a[6]=-1;return h(a,d,38);}}function ar(a,b,c,d){f(a);return s(a,b,c,[6,d]);}function as(a,b,c,d){f(a);return s(a,b,c,[4,d]);}function at(a,b,c,d){f(a);return s(a,b,c,[5,d]);}function au(a,b,c,d){f(a);return s(a,b,c,[3,d]);}function av(a,b,c){var d=[0,b,c],i=f(a);if(typeof i===g)switch(i){case 0:return _(a,d,37);case 1:return ay(a,d,37);case 2:return k(a,d,37);case 3:return l(a,d,37);case 7:return m(a,d,37);case 10:return ac(a,d,37);case 11:return ad(a,d,37);case 12:return W(a,d,37);case 13:return az(a,d,37);case 16:return Z(a,d,37);case 17:return aA(a,d,37);case 18:return ai(a,d,37);case 19:return aj(a,d,37);default:}else switch(i[0]){case 1:return aa(a,d,37,i[1]);case 2:return ab(a,d,37,i[1]);case 3:return ae(a,d,37,i[1]);case 4:return af(a,d,37,i[1]);case 5:return ag(a,d,37,i[1]);case 6:return ah(a,d,37,i[1]);case 7:break;default:return $(a,d,37,i[1]);}if(-1===a[6])throw [0,e,eI];a[6]=-1;return h(a,d,37);}function aD(a,b,c){var o=b,n=c;for(;;){var d=[0,o,n],j=f(a);if(typeof j===g){if(13===j){var i=f(a);if(typeof i===g)switch(i){case 0:return al(a,d,32);case 1:return aB(a,d,32);case 2:return k(a,d,32);case 3:return l(a,d,32);case 6:return ak(a,d,32);case 7:return m(a,d,32);case 10:return ap(a,d,32);case 11:return aq(a,d,32);case 12:return Y(a,d,32);case 13:return aC(a,d,32);case 16:return av(a,d,32);case 17:var o=d,n=32;continue;case 19:return aw(a,d,32);default:}else switch(i[0]){case 1:return an(a,d,32,i[1]);case 2:return ao(a,d,32,i[1]);case 3:return ar(a,d,32,i[1]);case 4:return as(a,d,32,i[1]);case 5:return at(a,d,32,i[1]);case 6:return au(a,d,32,i[1]);case 7:break;default:return am(a,d,32,i[1]);}if(-1===a[6])throw [0,e,eK];a[6]=-1;return h(a,d,32);}}else switch(j[0]){case 4:f(a);return s(a,d[1],d[2],[1,[0,[4,j[1]],0]]);case 6:f(a);return s(a,d[1],d[2],[1,[0,[3,j[1]],0]]);default:}if(-1===a[6])throw [0,e,eJ];a[6]=-1;return h(a,d[1],d[2]);}}function aw(a,b,c){var d=[0,b,c],i=f(a);if(typeof i===g)switch(i){case 8:case 9:case 14:case 15:var j=0;break;case 11:return aq(a,d,31);default:var j=1;}else var j=7===i[0]?0:1;if(j)return s(a,d[1],d[2],eL);if(-1===a[6])throw [0,e,eM];a[6]=-1;return h(a,d,31);}function L(a,b,c){var d=[0,b,c],i=f(a);if(typeof i===g)switch(i){case 9:case 15:var j=0;break;case 11:return G(a,d,25);default:var j=1;}else var j=7===i[0]?0:1;if(j)return t(a,d[1],d[2],eN);if(-1===a[6])throw [0,e,eO];a[6]=-1;return h(a,d,25);}function a0(a,b,c){var C=b,z=c;for(;;){var s=[0,C,z],t=f(a);if(typeof t===g)if(7<=t){if(14===t){var C=s,z=10;continue;}}else if(4<=t){if(-1===a[6])throw [0,e,eP];a[6]=-1;return h(a,s,10);}var v=s[1],o=s[2],u=[0,0,0];for(;;){var d=[0,v,o,u];if(12<=o)var i=0;else switch(o){case 1:case 8:if(-1===a[6])throw [0,e,d7];var p=a[3];if(typeof p===g)switch(p){case 4:case 5:case 6:case 14:if(-1===a[6])throw [0,e,d8];a[6]=-1;var k=h(a,d,2),i=1,l=0;break;case 0:var k=B(a,d,2),i=1,l=0;break;case 2:var k=M(a,d,2),i=1,l=0;break;case 3:var k=N(a,d,2),i=1,l=0;break;case 7:var k=y(a,d,2),i=1,l=0;break;case 8:var k=x(a,d,2),i=1,l=0;break;case 9:var k=O(a,d,2),i=1,l=0;break;case 15:var k=P(a,d,2),i=1,l=0;break;default:var l=1;}else if(7===p[0]){var k=Q(a,d,2,p[1]),i=1,l=0;}else var l=1;if(l){var k=A(a,d,2),i=1;}break;case 7:if(-1===a[6])throw [0,e,d9];var q=a[3];if(typeof q===g)switch(q){case 4:case 5:case 6:case 14:if(-1===a[6])throw [0,e,d_];a[6]=-1;var k=h(a,d,3),i=1,m=0;break;case 0:var k=B(a,d,3),i=1,m=0;break;case 2:var k=M(a,d,3),i=1,m=0;break;case 3:var k=N(a,d,3),i=1,m=0;break;case 7:var k=y(a,d,3),i=1,m=0;break;case 8:var k=x(a,d,3),i=1,m=0;break;case 9:var k=O(a,d,3),i=1,m=0;break;case 15:var k=P(a,d,3),i=1,m=0;break;default:var m=1;}else if(7===q[0]){var k=Q(a,d,3,q[1]),i=1,m=0;}else var m=1;if(m){var k=A(a,d,3),i=1;}break;case 10:var w=d[1],v=w[1],o=w[2],u=[0,0,d[3]];continue;case 11:if(-1===a[6])throw [0,e,d$];var r=a[3];if(typeof r===g)switch(r){case 4:case 5:case 6:case 14:if(-1===a[6])throw [0,e,ea];a[6]=-1;var k=h(a,d,0),i=1,n=0;break;case 0:var k=B(a,d,0),i=1,n=0;break;case 2:var k=M(a,d,0),i=1,n=0;break;case 3:var k=N(a,d,0),i=1,n=0;break;case 7:var k=y(a,d,0),i=1,n=0;break;case 8:var k=x(a,d,0),i=1,n=0;break;case 9:var k=O(a,d,0),i=1,n=0;break;case 15:var k=P(a,d,0),i=1,n=0;break;default:var n=1;}else if(7===r[0]){var k=Q(a,d,0,r[1]),i=1,n=0;}else var n=1;if(n){var k=A(a,d,0),i=1;}break;default:var i=0;}if(!i)var k=j(0);return k;}}}function bN(a,b,c,d){if(12<=c)if(55<=c)switch(c-55|0){case 0:case 2:case 4:case 11:var e=1;break;default:var e=0;}else var e=0;else switch(c){case 0:case 2:case 3:var e=1;break;case 1:case 8:return aE(a,b,c,d);case 7:return aI(a,b,c,d);case 11:return aN(a,b,c,d);default:var e=0;}return e?a1(a,b,c,d):j(0);}function bO(a,b,c,d){var f=[0,b,c,d];if(20<=c)if(55<=c)switch(c-55|0){case 0:case 2:case 4:case 11:var i=1;break;default:var i=0;}else var i=0;else switch(c){case 0:case 1:case 2:case 3:case 7:case 8:case 11:var i=1;break;case 16:var q=f[1],l=q[3],r=q[1],s=r[1],m=s[3],t=s[1],u=l?r[3]?[4,[0,m],l]:[4,0,[0,m,l]]:[4,0,[0,m,0]],n=[0,t[1],t[2],u];if(-1===a[6])throw [0,e,eV];var k=a[3];if(typeof k===g)if(7<=k){if(14===k)return a2(a,n,56);}else if(4<=k){if(-1===a[6])throw [0,e,eW];a[6]=-1;return h(a,n,56);}return aS(a,n,56);case 19:if(-1===a[6])throw [0,e,eX];var o=a[3];if(typeof o===g&&!(9<=o))switch(o){case 4:case 5:case 6:if(-1===a[6])throw [0,e,eY];a[6]=-1;return h(a,f,18);case 8:return bl(a,f,18);default:}return bM(a,f,18);default:var i=0;}if(i){if(-1===a[6])throw [0,e,eT];var p=a[3];if(typeof p===g&&8===p)return bl(a,f,54);if(-1===a[6])throw [0,e,eU];a[6]=-1;return h(a,f,54);}return j(0);}function bP(a,b,c,d){var n=[0,b,c,d];if(-1===a[6])throw [0,e,eZ];var o=a[3];if(typeof o===g)switch(o){case 1:return U(a,n,15);case 10:return F(a,n,15);case 11:return G(a,n,15);case 12:return z(a,n,15);case 13:return V(a,n,15);case 16:var i=[0,n,15],p=f(a);if(typeof p===g)switch(p){case 0:return _(a,i,14);case 1:return ay(a,i,14);case 2:return k(a,i,14);case 3:return l(a,i,14);case 7:return m(a,i,14);case 10:return ac(a,i,14);case 11:return ad(a,i,14);case 12:return W(a,i,14);case 13:return az(a,i,14);case 16:return Z(a,i,14);case 17:return aA(a,i,14);case 18:return ai(a,i,14);case 19:return aj(a,i,14);default:}else switch(p[0]){case 1:return aa(a,i,14,p[1]);case 2:return ab(a,i,14,p[1]);case 3:return ae(a,i,14,p[1]);case 4:return af(a,i,14,p[1]);case 5:return ag(a,i,14,p[1]);case 6:return ah(a,i,14,p[1]);case 7:break;default:return $(a,i,14,p[1]);}if(-1===a[6])throw [0,e,e1];a[6]=-1;return h(a,i,14);case 17:return X(a,n,15);case 18:var j=[0,n,15],q=f(a);if(typeof q===g)switch(q){case 0:return al(a,j,13);case 1:return aB(a,j,13);case 2:return k(a,j,13);case 3:return l(a,j,13);case 7:return m(a,j,13);case 10:return ap(a,j,13);case 11:return aq(a,j,13);case 12:return Y(a,j,13);case 13:return aC(a,j,13);case 16:return av(a,j,13);case 17:return aD(a,j,13);case 18:return ak(a,j,13);case 19:return aw(a,j,13);default:}else switch(q[0]){case 1:return an(a,j,13,q[1]);case 2:return ao(a,j,13,q[1]);case 3:return ar(a,j,13,q[1]);case 4:return as(a,j,13,q[1]);case 5:return at(a,j,13,q[1]);case 6:return au(a,j,13,q[1]);case 7:break;default:return am(a,j,13,q[1]);}if(-1===a[6])throw [0,e,e2];a[6]=-1;return h(a,j,13);case 19:return L(a,n,15);default:}else switch(o[0]){case 1:return D(a,n,15,o[1]);case 2:return E(a,n,15,o[1]);case 3:return H(a,n,15,o[1]);case 4:return I(a,n,15,o[1]);case 5:return J(a,n,15,o[1]);case 6:return K(a,n,15,o[1]);case 7:break;default:return C(a,n,15,o[1]);}if(-1===a[6])throw [0,e,e0];a[6]=-1;return h(a,n,15);}function bm(a,b,c){var w=b,q=c,v=0;for(;;){var d=[0,w,q,v],r=q-61|0;if(r<0||2<r)var k=j(0);else{if(1===r){var x=d[1],w=x[1],q=x[2],v=[0,0,d[3]];continue;}if(-1===a[6])throw [0,e,eQ];var y=a[3];if(typeof y===g&&7===y){var z=f(a);if(typeof z===g){var s=z-7|0;if(s<0||7<s)var l=1;else switch(s){case 0:var k=bm(a,d,61),m=1,l=0;break;case 3:var k=bQ(a,d,61),m=1,l=0;break;case 7:var i=d[1],o=d[2];for(;;){var p=o-61|0;if(p<0||2<p)var n=0;else switch(p){case 1:var n=0;break;case 2:if(-1===a[6])throw [0,e,eb];var u=a[3];if(typeof u===g&&14===u){f(a);var t=bO(a,i[1],i[2],[0,0]),n=1,A=0;}else var A=1;if(A){if(-1===a[6])throw [0,e,ec];a[6]=-1;var t=h(a,i,o),n=1;}break;default:var B=i[2],i=i[1],o=B;continue;}if(!n)var t=j(0);var k=t,m=1,l=0;break;}break;default:var l=1;}}else var l=1;if(l){if(-1===a[6])throw [0,e,eR];a[6]=-1;var k=h(a,d,61),m=1;}}else var m=0;if(!m){if(-1===a[6])throw [0,e,eS];a[6]=-1;var k=h(a,d[1],d[2]);}}return k;}}function bQ(a,b,c){var k=b,j=c;for(;;){var d=[0,k,j],i=f(a);if(typeof i===g){if(7===i)return bm(a,d,62);if(10===i){var k=d,j=62;continue;}}if(-1===a[6])throw [0,e,e8];a[6]=-1;return h(a,d,62);}}function aN(a,b,c,d){var e=b[2],i=b[1],m=b[3],h=cE,g=bt(function(a){var b=a[2];return [0,ba(a[1]),b];},m);for(;;){if(g){var l=g[2],h=bI(h,g[1]),g=l;continue;}var k=[0,[1,h],d];if(9<=e)if(55<=e)switch(e-55|0){case 0:case 2:case 4:case 11:var f=1;break;default:var f=0;}else var f=0;else switch(e){case 0:case 2:case 3:var f=1;break;case 1:case 8:return aE(a,i,e,k);case 7:return aI(a,i,e,k);default:var f=0;}return f?a1(a,i,e,k):j(0);}}function aE(a,b,c,d){if(1===c){var e=b[1],g=b[3],h=[0,[0,ba(e[3]),g],d];return bN(a,e[1],e[2],h);}if(8===c){var f=b[1],i=[0,[0,ba(f[3]),e9],d];return bN(a,f[1],f[2],i);}return j(0);}function aI(a,b,c,d){var e=b[2],g=b[1],h=[0,[2,b[3]],d];if(9<=e)if(55<=e)switch(e-55|0){case 0:case 2:case 4:case 11:var f=1;break;default:var f=0;}else var f=0;else switch(e){case 0:case 2:case 3:var f=1;break;case 1:case 8:return aE(a,g,e,h);default:var f=0;}return f?a1(a,g,e,h):j(0);}function a1(a,b,c,d){var e=b,k=c,f=d;for(;;){if(4<=k){if(55<=k)switch(k-55|0){case 0:var u=e[1],g=u[2],o=u[1],p=[0,u[3],f];if(12<=g)if(55<=g)switch(g-55|0){case 0:case 2:case 4:case 11:var l=1;break;default:var l=0;}else var l=0;else switch(g){case 0:case 2:case 3:var l=1;break;case 1:case 8:return aE(a,o,g,p);case 7:return aI(a,o,g,p);case 11:return aN(a,o,g,p);default:var l=0;}if(l){var e=o,k=g,f=p;continue;}return j(0);case 2:var v=e[1],w=v[3],h=v[2],q=v[1],r=[0,[3,w[1],w[2]],f];if(12<=h)if(55<=h)switch(h-55|0){case 0:case 2:case 4:case 11:var m=1;break;default:var m=0;}else var m=0;else switch(h){case 0:case 2:case 3:var m=1;break;case 1:case 8:return aE(a,q,h,r);case 7:return aI(a,q,h,r);case 11:return aN(a,q,h,r);default:var m=0;}if(m){var e=q,k=h,f=r;continue;}return j(0);case 4:var x=e[1],i=x[2],s=x[1],t=[0,0,f];if(12<=i)if(55<=i)switch(i-55|0){case 0:case 2:case 4:case 11:var n=1;break;default:var n=0;}else var n=0;else switch(i){case 0:case 2:case 3:var n=1;break;case 1:case 8:return aE(a,s,i,t);case 7:return aI(a,s,i,t);case 11:return aN(a,s,i,t);default:var n=0;}if(n){var e=s,k=i,f=t;continue;}return j(0);case 11:return f;default:}}else switch(k){case 2:return aE(a,e[1],e[2],f);case 3:return aI(a,e[1],e[2],f);case 1:break;default:return aN(a,e[1],e[2],f);}return j(0);}}function j(a){q(be,a$,e_);throw [0,e,e$];}function A(a,b,c){return bP(a,b,c,0);}function x(a,b,c){return bO(a,b,c,0);}function B(a,b,c){f(a);return bP(a,b,c,[0,0]);}function M(a,b,c){var w=b,v=c;for(;;){var m=[0,w,v],q=f(a);if(typeof q===g)switch(q){case 3:case 4:case 5:case 6:case 7:case 8:case 9:case 14:case 15:var r=0;break;case 2:var w=m,v=65;continue;default:var r=1;}else var r=7===q[0]?0:1;if(r){var t=m[1],d=m[2],s=[0,0,0];for(;;){var k=[0,t,d,s];if(4===d)var i=0;else{if(9<=d)if(55<=d)switch(d-55|0){case 0:case 2:case 4:case 11:var l=1;break;case 10:var u=k[1],t=u[1],d=u[2],s=[0,0,k[3]];continue;default:var i=0,l=0;}else{var i=0,l=0;}else if(6===d){var i=0,l=0;}else var l=1;if(l){if(-1===a[6])throw [0,e,e3];var p=a[3];if(typeof p===g)switch(p){case 1:case 10:case 11:case 12:case 13:case 16:case 17:case 18:case 19:var o=2;break;case 0:var n=B(a,k,6),i=1,o=0;break;default:var o=1;}else var o=7===p[0]?1:2;switch(o){case 1:if(-1===a[6])throw [0,e,e4];a[6]=-1;var n=h(a,k,6),i=1;break;case 2:var n=A(a,k,6),i=1;break;default:}}}if(!i)var n=j(0);return n;}}if(-1===a[6])throw [0,e,fa];a[6]=-1;return h(a,m,65);}}function N(a,b,c){var C=b,z=c;for(;;){var q=[0,C,z],s=f(a);if(typeof s===g)switch(s){case 2:case 4:case 5:case 6:case 7:case 8:case 9:case 15:var t=0;break;case 3:var C=q,z=64;continue;default:var t=1;}else var t=7===s[0]?0:1;if(t){var v=q[1],m=q[2],u=[0,0,0];for(;;){var n=[0,v,m,u];if(12<=m)if(55<=m)switch(m-55|0){case 0:case 2:case 4:case 11:var o=1;break;case 9:var w=n[1],v=w[1],m=w[2],u=[0,0,n[3]];continue;default:var o=0;}else var o=0;else switch(m){case 4:case 5:case 6:case 9:case 10:var o=0;break;default:var o=1;}if(o){if(-1===a[6])throw [0,e,e5];var r=a[3];if(typeof r===g)switch(r){case 1:case 10:case 11:case 12:case 13:case 16:case 17:case 18:case 19:var i=1;break;case 0:var d=B(a,n,9),i=2;break;case 14:var l=[0,n,9],p=f(a);if(typeof p===g)switch(p){case 4:case 5:case 6:if(-1===a[6])throw [0,e,e7];a[6]=-1;var d=h(a,l,8),i=2,k=0;break;case 0:var d=B(a,l,8),i=2,k=0;break;case 2:var d=M(a,l,8),i=2,k=0;break;case 3:var d=N(a,l,8),i=2,k=0;break;case 7:var d=y(a,l,8),i=2,k=0;break;case 8:var d=x(a,l,8),i=2,k=0;break;case 9:var d=O(a,l,8),i=2,k=0;break;case 14:var d=a0(a,l,8),i=2,k=0;break;case 15:var d=P(a,l,8),i=2,k=0;break;default:var k=1;}else if(7===p[0]){var d=Q(a,l,8,p[1]),i=2,k=0;}else var k=1;if(k){var d=A(a,l,8),i=2;}break;default:var i=0;}else var i=7===r[0]?0:1;switch(i){case 1:var d=A(a,n,9);break;case 2:break;default:if(-1===a[6])throw [0,e,e6];a[6]=-1;var d=h(a,n,9);}}else var d=j(0);return d;}}if(-1===a[6])throw [0,e,fb];a[6]=-1;return h(a,q,64);}}function y(a,b,c){var d=[0,b,c],i=f(a);if(typeof i===g){if(7===i)return bm(a,d,63);if(10===i)return bQ(a,d,63);}if(-1===a[6])throw [0,e,fc];a[6]=-1;return h(a,d,63);}function O(a,b,c){var i=[0,b,c],d=f(a);if(typeof d===g)if(7<=d){if(14===d)return a2(a,i,60);}else if(4<=d){if(-1===a[6])throw [0,e,fd];a[6]=-1;return h(a,i,60);}return aS(a,i,60);}function P(a,b,c){var e=0;if(12<=c)if(55<=c)switch(c-55|0){case 0:case 2:case 4:case 11:var d=1;break;default:var d=0;}else var d=0;else switch(c){case 0:case 2:case 3:var d=1;break;case 1:case 8:return aE(a,b,c,e);case 7:return aI(a,b,c,e);case 11:return aN(a,b,c,e);default:var d=0;}return d?a1(a,b,c,e):j(0);}function Q(a,b,c,d){var j=[0,b,c,d],i=f(a);if(typeof i===g)if(7<=i){if(14===i)return a2(a,j,58);}else if(4<=i){if(-1===a[6])throw [0,e,fe];a[6]=-1;return h(a,j,58);}return aS(a,j,58);}function f(a){var b=a[2],c=p(a[1],b);a[3]=c;a[4]=b[11];a[5]=b[12];var d=a[6]+1|0;if(0<=d)a[6]=d;return c;}function h(a,b,c){var d=b,e=c;for(;;)switch(e){case 1:var g=d[2],d=d[1],e=g;continue;case 2:var h=d[2],d=d[1],e=h;continue;case 3:var i=d[2],d=d[1],e=i;continue;case 4:var j=d[2],d=d[1],e=j;continue;case 5:var k=d[2],d=d[1],e=k;continue;case 6:var l=d[2],d=d[1],e=l;continue;case 7:var m=d[2],d=d[1],e=m;continue;case 8:var n=d[2],d=d[1],e=n;continue;case 9:var o=d[2],d=d[1],e=o;continue;case 10:var p=d[2],d=d[1],e=p;continue;case 11:var q=d[2],d=d[1],e=q;continue;case 12:var r=d[2],d=d[1],e=r;continue;case 13:var s=d[2],d=d[1],e=s;continue;case 14:var t=d[2],d=d[1],e=t;continue;case 15:var u=d[2],d=d[1],e=u;continue;case 16:var v=d[2],d=d[1],e=v;continue;case 17:var w=d[2],d=d[1],e=w;continue;case 18:var x=d[2],d=d[1],e=x;continue;case 19:var y=d[2],d=d[1],e=y;continue;case 20:var z=d[2],d=d[1],e=z;continue;case 21:var A=d[2],d=d[1],e=A;continue;case 22:var B=d[2],d=d[1],e=B;continue;case 23:var C=d[2],d=d[1],e=C;continue;case 24:var D=d[2],d=d[1],e=D;continue;case 25:var E=d[2],d=d[1],e=E;continue;case 26:var F=d[2],d=d[1],e=F;continue;case 27:var G=d[2],d=d[1],e=G;continue;case 28:var H=d[2],d=d[1],e=H;continue;case 29:var I=d[2],d=d[1],e=I;continue;case 30:var J=d[2],d=d[1],e=J;continue;case 31:var K=d[2],d=d[1],e=K;continue;case 32:var L=d[2],d=d[1],e=L;continue;case 33:var M=d[2],d=d[1],e=M;continue;case 34:var N=d[2],d=d[1],e=N;continue;case 35:var O=d[2],d=d[1],e=O;continue;case 36:var P=d[2],d=d[1],e=P;continue;case 37:var Q=d[2],d=d[1],e=Q;continue;case 38:var R=d[2],d=d[1],e=R;continue;case 39:var S=d[2],d=d[1],e=S;continue;case 40:var T=d[2],d=d[1],e=T;continue;case 41:var U=d[2],d=d[1],e=U;continue;case 42:var V=d[2],d=d[1],e=V;continue;case 43:var W=d[2],d=d[1],e=W;continue;case 44:var X=d[2],d=d[1],e=X;continue;case 45:var Y=d[2],d=d[1],e=Y;continue;case 46:var Z=d[2],d=d[1],e=Z;continue;case 47:var _=d[2],d=d[1],e=_;continue;case 48:var $=d[2],d=d[1],e=$;continue;case 49:var aa=d[2],d=d[1],e=aa;continue;case 50:var ab=d[2],d=d[1],e=ab;continue;case 51:var ac=d[2],d=d[1],e=ac;continue;case 52:var ad=d[2],d=d[1],e=ad;continue;case 53:var ae=d[2],d=d[1],e=ae;continue;case 54:var af=d[2],d=d[1],e=af;continue;case 55:var ag=d[2],d=d[1],e=ag;continue;case 56:var ah=d[2],d=d[1],e=ah;continue;case 57:var ai=d[2],d=d[1],e=ai;continue;case 58:var aj=d[2],d=d[1],e=aj;continue;case 59:var ak=d[2],d=d[1],e=ak;continue;case 60:var al=d[2],d=d[1],e=al;continue;case 61:var am=d[2],d=d[1],e=am;continue;case 62:var an=d[2],d=d[1],e=an;continue;case 63:var ao=d[2],d=d[1],e=ao;continue;case 64:var ap=d[2],d=d[1],e=ap;continue;case 65:var aq=d[2],d=d[1],e=aq;continue;case 66:var ar=d[2],d=d[1],e=ar;continue;case 67:var as=d[2],d=d[1],e=as;continue;case 68:throw cF;default:var f=d[2],d=d[1],e=f;continue;}}function aS(a,b,c){var u=b,o=c,t=0;for(;;){var d=[0,u,o,t];if(56<=o)switch(o-56|0){case 0:if(-1===a[6])throw [0,e,ff];var p=a[3];if(typeof p===g)switch(p){case 4:case 5:case 6:case 14:if(-1===a[6])throw [0,e,fg];a[6]=-1;var i=h(a,d,55),f=1,k=0;break;case 0:var i=B(a,d,55),f=1,k=0;break;case 2:var i=M(a,d,55),f=1,k=0;break;case 3:var i=N(a,d,55),f=1,k=0;break;case 7:var i=y(a,d,55),f=1,k=0;break;case 8:var i=x(a,d,55),f=1,k=0;break;case 9:var i=O(a,d,55),f=1,k=0;break;case 15:var i=P(a,d,55),f=1,k=0;break;default:var k=1;}else if(7===p[0]){var i=Q(a,d,55,p[1]),f=1,k=0;}else var k=1;if(k){var i=A(a,d,55),f=1;}break;case 2:if(-1===a[6])throw [0,e,fh];var q=a[3];if(typeof q===g)switch(q){case 4:case 5:case 6:case 14:if(-1===a[6])throw [0,e,fi];a[6]=-1;var i=h(a,d,57),f=1,l=0;break;case 0:var i=B(a,d,57),f=1,l=0;break;case 2:var i=M(a,d,57),f=1,l=0;break;case 3:var i=N(a,d,57),f=1,l=0;break;case 7:var i=y(a,d,57),f=1,l=0;break;case 8:var i=x(a,d,57),f=1,l=0;break;case 9:var i=O(a,d,57),f=1,l=0;break;case 15:var i=P(a,d,57),f=1,l=0;break;default:var l=1;}else if(7===q[0]){var i=Q(a,d,57,q[1]),f=1,l=0;}else var l=1;if(l){var i=A(a,d,57),f=1;}break;case 4:if(-1===a[6])throw [0,e,fj];var r=a[3];if(typeof r===g)switch(r){case 4:case 5:case 6:case 14:if(-1===a[6])throw [0,e,fk];a[6]=-1;var i=h(a,d,59),f=1,m=0;break;case 0:var i=B(a,d,59),f=1,m=0;break;case 2:var i=M(a,d,59),f=1,m=0;break;case 3:var i=N(a,d,59),f=1,m=0;break;case 7:var i=y(a,d,59),f=1,m=0;break;case 8:var i=x(a,d,59),f=1,m=0;break;case 9:var i=O(a,d,59),f=1,m=0;break;case 15:var i=P(a,d,59),f=1,m=0;break;default:var m=1;}else if(7===r[0]){var i=Q(a,d,59,r[1]),f=1,m=0;}else var m=1;if(m){var i=A(a,d,59),f=1;}break;case 11:var v=d[1],u=v[1],o=v[2],t=[0,0,d[3]];continue;case 12:if(-1===a[6])throw [0,e,fl];var s=a[3];if(typeof s===g)switch(s){case 4:case 5:case 6:case 14:if(-1===a[6])throw [0,e,fm];a[6]=-1;var i=h(a,d,66),f=1,n=0;break;case 0:var i=B(a,d,66),f=1,n=0;break;case 2:var i=M(a,d,66),f=1,n=0;break;case 3:var i=N(a,d,66),f=1,n=0;break;case 7:var i=y(a,d,66),f=1,n=0;break;case 8:var i=x(a,d,66),f=1,n=0;break;case 9:var i=O(a,d,66),f=1,n=0;break;case 15:var i=P(a,d,66),f=1,n=0;break;default:var n=1;}else if(7===s[0]){var i=Q(a,d,66,s[1]),f=1,n=0;}else var n=1;if(n){var i=A(a,d,66),f=1;}break;default:var f=0;}else var f=0;if(!f)var i=j(0);return i;}}function a2(a,b,c){var k=b,j=c;for(;;){var i=[0,k,j],d=f(a);if(typeof d===g)if(7<=d){if(14===d){var k=i,j=67;continue;}}else if(4<=d){if(-1===a[6])throw [0,e,fn];a[6]=-1;return h(a,i,67);}return aS(a,i,67);}}var bR=[0,fq];function a4(a){var d=0;for(;;){var c=aY(a3,d,a);if(c<0||31<c){p(a[1],a);var d=c;continue;}switch(c){case 10:case 23:var b=18;break;case 0:var b=a4(a);break;case 1:var b=a5(1,a);break;case 2:var b=9;break;case 3:var b=3;break;case 4:var b=2;break;case 5:var b=8;break;case 6:var b=7;break;case 7:var b=10;break;case 8:var b=19;break;case 11:var b=[1,aQ(a,a[5]+1|0)];break;case 12:var b=1;break;case 13:var b=[0,aQ(a,a[5]+1|0)];break;case 14:var b=17;break;case 15:var b=13;break;case 16:var b=6;break;case 17:var b=12;break;case 18:var b=5;break;case 19:var b=11;break;case 20:var b=4;break;case 21:var b=[4,aP(a,a[5]+1|0,a[6]-1|0)];break;case 22:var b=[5,aQ(a,a[5]+1|0)];break;case 25:var b=bn(aM(16),a);break;case 26:var b=[2,aP(a,a[5],a[6])];break;case 27:aZ(a);var b=14;break;case 28:var b=0;break;case 29:var b=15;break;case 30:var b=[6,aQ(a,a[5]+1|0)];break;case 31:var e=aQ(a,a[5]);throw [0,bR,u(cB,fr,a[11][4],e)];default:var b=16;}return b;}}function a5(a,b){var e=43;for(;;){var c=aY(a3,e,b);if(c<0||2<c){p(b[1],b);var e=c;continue;}switch(c){case 1:var d=1===a?a4(b):a5(a-1|0,b);break;case 2:var d=a5(a,b);break;default:var d=a5(a+1|0,b);}return d;}}function bn(a,b){var e=49;for(;;){var d=aY(a3,e,b);if(d<0||3<d){p(b[1],b);var e=d;continue;}switch(d){case 1:v(a,96);var c=bn(a,b);break;case 2:i(a,aP(b,b[5],b[6]));var c=bn(a,b);break;case 3:aZ(b);var f=aM(16),c=a6(aF(a),f,b);break;default:var c=[3,aF(a)];}return c;}}function a6(a,b,c){var f=55;for(;;){var e=aY(a3,f,c);if(e<0||3<e){p(c[1],c);var f=e;continue;}switch(e){case 1:aZ(c);v(b,10);var d=a6(a,b,c);break;case 2:v(b,96);var d=a6(a,b,c);break;case 3:i(b,aP(c,c[5],c[6]));var d=a6(a,b,c);break;default:if(caml_string_equal(aP(c,c[5],c[6]-3|0),fs))aZ(c);var d=[7,[0,a,aF(b)]];}return d;}}var f$=caml_js_wrap_callback(function(a){var w=new MlWrappedString(a),x=[0],y=1,z=0,A=0,B=0,C=0,D=0,E=w.getLen(),F=n(w,ca),c=[0,function(a){a[9]=1;return 0;},F,E,D,C,B,A,z,y,x,bv,bv];try {var G=a4(c),b=[0,a4,c,G,c[11],c[12],bV],m=0;if(-1===b[6])throw [0,e,fo];var j=b[3];if(typeof j===g)if(7<=j)if(14===j){var r=a2(b,m,68),f=1;}else var f=0;else if(4<=j){if(-1===b[6])throw [0,e,fp];b[6]=-1;var r=h(b,m,68),f=1;}else var f=0;else var f=0;if(!f)var r=aS(b,m,68);var s=r;}catch(k){if(k[1]===bR){u(be,a$,f9,k[2]);var s=0;}else{if(k[1]!==bJ)throw k;var l=c[11];(function(a,b,c,d,e){return a.length==4?a(b,c,d,e):caml_call_gen(a,[b,c,d,e]);}(be,a$,f_,l[2],l[4]-l[3]|0));var s=0;}}function H(a){return p(aL,p(I,a));}function I(c,b){if(typeof b===g)return i(c,ft);else switch(b[0]){case 1:var f=function(c,b){var a=b[2],d=b[1];if(a){o(c,d);i(c,fx);var e=bs(a);aL(function(a){i(c,fy);f(c,a);return i(c,fz);},e);return i(c,fA);}return o(c,d);};return f(c,b[1]);case 2:i(c,fB);o(c,b[1]);return i(c,fC);case 3:var l=b[2],m=b[1];i(c,f6);i(c,m);i(c,f7);i(c,l);return i(c,f8);case 4:var h=b[1],j=function(e,b,c){i(e,fD);aL(function(a){i(e,n(fF,n(b,fE)));d(e,a);return i(e,n(fH,n(b,fG)));},c);return i(e,fI);};i(c,fJ);if(h)j(c,fK,h[1]);var p=b[2];aL(function(a){return j(c,fL,a);},p);return i(c,fM);default:var a=b[1],k=7<=a?6:a,e=n(fv,n(aV(k),fu));v(c,60);i(c,e);d(c,b[2]);i(c,fw);return i(c,e);}}function o(c,b){if(b){d(c,b[1]);var a=b[2];return aL(function(a){i(c,fN);return d(c,a);},a);}return b;}function d(c,b){return aL(function(a){switch(a[0]){case 1:i(c,fO);d(c,a[1]);var b=i(c,fP);break;case 2:i(c,fQ);d(c,a[1]);var b=i(c,fR);break;case 3:var g=a[1],b=38===g?i(c,fS):v(c,g);break;case 4:v(c,38);i(c,a[1]);var b=v(c,59);break;case 5:var h=a[1];v(c,38);try {var e=cC;for(;;){if(!e)throw [0,bb];var f=e[1],k=e[2],l=f[2];if(0!==caml_compare(f[1],h)){var e=k;continue;}i(c,l);break;}}catch(j){if(j[1]!==bb)throw j;aK(n(aO(1,h),fT));}var b=v(c,59);break;case 6:i(c,fU);i(c,a[1]);var b=i(c,fV);break;case 7:i(c,fW);d(c,a[1]);var b=i(c,fX);break;case 8:i(c,fY);d(c,a[1]);var b=i(c,fZ);break;case 9:v(c,a[1]);d(c,a[2]);var b=v(c,a[3]);break;case 10:i(c,f0);d(c,a[2]);i(c,f1);d(c,a[1]);var b=i(c,f2);break;case 11:i(c,f3);d(c,a[2]);i(c,f4);d(c,a[1]);var b=i(c,f5);break;default:var b=i(c,a[1]);}return b;},b);}var t=aM(16);q(H,t,s);return aF(t).toString();});pastek_core[ga.toString()]=f$;br(0);return;}());
