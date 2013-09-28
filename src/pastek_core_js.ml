open Parser
open Lexer
open Html_of_core

let mk_html_of_js_string s =
  let ast = Parser.document Lexer.main (Lexing.from_string (Js.to_string s))
  in Js.string (Html_of_core.html_of_ast ast)

let _ = Js.Unsafe.set (Js.Unsafe.variable "pastek_core") (Js.string "mk_html") (Js.wrap_callback mk_html_of_js_string)
