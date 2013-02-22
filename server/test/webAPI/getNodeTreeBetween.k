Load("testClient.k");

void test() {
	HttpClient client = new CurlHttpClient("http://localhost/DCaseDB/application/api/api.cgi");
	String str = "{\"jsonrpc\":\"2.0\",\"version\":\"1.0\",\"method\":\"getNodeTreeBetween\",\"params\":{ \"BelongedArgumentId\": 25 ,\"StartId\":35,\"EndId\":36}}";
	System.p(client.post(str));
}

test();
