Import("Type.Json");
Import("MiniKonoha.NameSpace");
Import("MiniKonoha.Map");
Import("JavaScript.Array");
Import("Syntax.JavaStyleClass");
Import("Syntax.JavaNewArray");
Import("Syntax.CStyleWhile");

class JsonRPCServer {
	Map[Func[void, Json]] functions;

	JsonRPCServer() {
		functions = new Map[Func[void, Json]]();
	}

	void dispatch(Json request) {
	}

	void registerFunction(String key, Func[void, Json] func) {
		functions[key] = func;
	}
}

Json createMessage(Json result) {
	Json json = new Json();
	json.setString("jsonrpc", "2.0");
	json.setString("version", "0.0");
	json.set("result", result);
	return json;
}
