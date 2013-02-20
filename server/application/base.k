Import("Type.Json");
Import("Type.File");
Import("posix.process");
Import("JavaScript.String");
Import("JavaScript.Array");
Import("Syntax.CStyleWhile");
Import("Syntax.StringInterpolation");
Load("../DCaseCloud_glue.k");

DCaseModel start() {
	stdout.println("Content-Type: text/html; charset=utf-8\n\n");
	stdout.println("<html>");
	stdout.println("<head>");
	stdout.println("<title>D-Case Cloud</title>");
	stdout.println("</head>");
	stdout.println("<body>");
	return new DCaseModel("dcasedb","dcasedb");
}

void end() {
	stdout.println("</body></html>");
}
