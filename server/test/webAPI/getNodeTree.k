Load("testClient.k");
Import("Type.Json");

void test() {
	HttpClient client = new CurlHttpClient("http://localhost/DCaseDB/application/api/api.cgi");
	String str = "{\"jsonrpc\":\"2.0\",\"version\":\"1.0\",\"method\":\"getNodeTree\",\"params\":{ \"BelongedArgumentId\": 1 }}";
	System.p(Json.parse(client.post(str)));
}

test();
