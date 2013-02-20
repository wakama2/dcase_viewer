Load("testClient.k");

void test() {
	HttpClient client = new CurlHttpClient("http://localhost/DCaseDB/application/api/api.cgi");
	String str =  "{\"method\":\"FindNodeByDescription\",\"params\":{\"SearchText\":\"test\"}}";
	System.p(client.post(str));
}

test();
