Load("testClient.k");

void test() {
	HttpClient client = new CurlHttpClient("http://localhost/DCaseDB/application/api/api.cgi");
	String str = "{\"method\":\"getArgumentList\",\"params\":{}}";
	System.p(client.post(str));
}

test();
