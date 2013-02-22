Import("Lib.Curl");
Import("MiniKonoha.Map");
Import("JavaScript.Array");
Import("Syntax.JavaStyleClass");
Import("Syntax.CStyleWhile");
Import("Syntax.StringInterpolation");

class HttpClient {
	String url = "";
	@Virtual String perform() { return ""; }
	@Virtual String post(String params) { return ""}
	@Virtual String get(Map[String] fields)  { return ""}
}

class CurlHttpClient extends HttpClient {
	Curl curl;
	CurlHttpClient(String url) {
		this.url = url;
		this.curl = new Curl();
		this.curl.setOpt(CURLOPT_URL, url);
	}
	String perform() {
		return curl.receiveString();
	}
	String CreateParam(Map[String] map) {
		int i = 0;
		String[] keys = map.keys();
		String param = "";
		while (i < keys.getSize()) {
			if (i != 0) {
				param = param + "&";
			}
			String key = keys[i];
			/* FIXME Escaping key and value */
			param = param + "${key}=${map.get(key)}";
			i = i + 1;
		}
		return param;
	}
	String post(String params) {
		curl.setOpt(CURLOPT_POST, true);
		//String param = CreateParam(fields);
		curl.setOpt(CURLOPT_POSTFIELDS, params);
		return perform();
	}

	String get(Map[String] fields) {
		curl.setOpt(CURLOPT_GET, true);
		if (fields.getSize() > 0) {
			String param = CreateParam(fields);
			curl.setOpt(CURLOPT_URL, url+"?"+param);
		}
	}
}
