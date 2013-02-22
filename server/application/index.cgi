#!/usr/local/bin/konoha

Load("base.k");

void main() {
	DCaseModel model = start();
	stdout.println("<h1>Argument List</h1>");
	stdout.println("<ul>");
	int[] argument_list = model.GetArgumentList();
	int i = 0;
	while(i < argument_list.getSize()) {
		stdout.println("<li><a href=\"tree.cgi?t=${argument_list[i]}\">${argument_list[i]}</a></li>");
		i = i + 1;
	}
	stdout.println("</ul>");
	end();
}

main();
