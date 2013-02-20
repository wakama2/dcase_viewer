Load("testClient.k");

void test() {
	HttpClient client = new CurlHttpClient("http://localhost/DCaseDB/application/api/api.cgi");
	String str = "{\"method\":\"FindContextByAttribute\",\"params\":{\"SearchText\":\"hoge\"}}";
	System.p(client.post(str));
}

test();
