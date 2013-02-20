Load("testClient.k");

void test() {
	HttpClient client = new CurlHttpClient("http://localhost/DCaseDB/application/api/api.cgi");
	String str = "{\"jsonrpc\":\"2.0\",\"version\":\"1.0\",\"method\":\"Commit\",\"params\":{\"BelongedArgumentId\":28,\"commit\":[{\"branch-name\":\"mybranch\",\"command\":\"insert\",\"NodeList\":[{\"ParentNodeId\":76,\"NodeType\":\"Context\",\"Description\":\"test description\",\"ThisNodeId\":0,\"PrevNodeId\":0,\"BelongedArgumentId\":28,\"Children\":[],\"Attributes\":{\"hoge\":\"hogehjoh\"},\"NextNodeId\":0}]}]}}";

	System.p(client.post(str));
}

test();
