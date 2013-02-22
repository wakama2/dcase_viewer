#!/usr/local/bin/konoha


Import("Type.Json");
Import("Type.File");
Import("Syntax.CStyleWhile");
Import("Syntax.Null");
Import("Java.Class");
Import("JavaScript.Array");
Import("JavaScript.String");
Import("posix.process");

Load("methods.k");

String getMsg() {
	String mtd_type = System.getenv("REQUEST_METHOD");
	if (mtd_type != "POST") {
		// ERROR Handling: only POST Method is available
	}
	String query = "";
	String ln;
	FILE f = stdin;
	while ((ln = f.readLine()) != null) {
		query = query + ln;
	}
	return query;//.slice(5);
}

void main() {
	Json j = Json.parse(getMsg());
	JsonRPCServer api = new JsonRPCServer();
	api.registerFunctions();
	//if (!method.paramCheck(j.get("params"))) {
		// error handling
	//}
	stdout.print("Content-Type: application/json; charset=utf-8\n\n");
	api.dispatch(j.getString("method"),j.get("params"));
}

main();
