Load("testClient.k");

void test() {
	HttpClient client = new CurlHttpClient("http://localhost/DCaseDB/application/api/api.cgi");
	String str = "{\"jsonrpc\":\"2.0\",\"version\":\"1.0\",\"method\":\"getNodeTreeFromSnapshotId\",\"params\":{ \"BelongedArgumentId\": 1 ,\"SnapshotId\":1}}";
	System.p(client.post(str));
}

test();
