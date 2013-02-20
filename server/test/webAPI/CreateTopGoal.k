Load("testClient.k");

void test() {
	HttpClient client = new CurlHttpClient("http://localhost/DCaseDB/application/api/api.cgi");
	String str = "{\"method\":\"CreateTopGoal\", \"params\":{\"Justification\":\"Sample Justification\", \"Description\"  :\"Sample Description\", \"Commiter\":\"uchida\", \"ProcessType\" : 1 }}";
	System.p(client.post(str));
}

test();
