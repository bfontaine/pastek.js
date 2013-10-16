CORE_FILES=\
sugar.cmo \
AST.cmo \
parser.cmo \
lexer.cmo \
html.cmo \
pastek_core.cmo

# You need to set this variable to the path of pastek core
CORE_DIR=

OCAMLC=ocamlfind ocamlc
FLAGS=-package js_of_ocaml -package js_of_ocaml.syntax -syntax camlp4o -linkpkg -I $(CORE_DIR)/src

JSOFOCAML=js_of_ocaml

JSBYTE=pastek_core_js.byte
JSTMP=pastek_core_js.js
JS=pastek.js

# COMPILATION RULES #

.PHONY: 

all: $(JSBYTE) $(JSTMP) $(JS)

$(JSBYTE): pastek_core_js.ml
	make -C $(CORE_DIR) pastek
	$(OCAMLC) $(FLAGS) $(CORE_FILES) $< -o $@

$(JSTMP): $(JSBYTE)
	$(JSOFOCAML) $<

$(JS): $(JSTMP)
	@echo 'var pastek_core = {};' \
	| cat - $< > $@ \

clean:
	rm -f $(JSBYTE) $(JSTMP) $(JS)
	rm -f *.cmo *.cmi *~
