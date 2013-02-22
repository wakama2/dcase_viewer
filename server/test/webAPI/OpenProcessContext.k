Load("testClient.k");

void test() {
	HttpClient client = new CurlHttpClient("http://localhost/DCaseDB/application/api/api.cgi");
	String str = "{\"jsonrpc\":\"2.0\",\"version\":\"1.0\",\"method\" :\"OpenProcessContext\",\"params\" :{\"Justification\" : \"Sample Justification\",\"ProcessType\"    : 2,\"BelongedArgumentId\" : 26,\"Commiter\" : \"uchida\"}}";
	System.p(client.post(str));
}

test();
