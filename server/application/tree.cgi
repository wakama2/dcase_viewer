#!/usr/local/bin/konoha

Load("base.k");

void main() {
	DCaseModel model = start();
	String mtd_type = System.getenv("REQUEST_METHOD");
	int param = 0;
	int hist_id = 0;
	if(mtd_type == "GET") {
		String query = System.getenv("QUERY_STRING");
		String[] query_list = query.split("&");
		String[] p = query_list[0].split("=");
		if(p[0] == "t") {
			param = p[1].toint();
		}
		if(query_list.getSize() == 2) {
			String[] h = query_list[1].split("=");
			if(h[0] == "h") {
				hist_id = h[1].toint();
			}
		}
	}
	stdout.println("<h1>Tree Data</h1>");
	stdout.println("<p>");
	if(param != 0 && hist_id != 0) {
		stdout.println(model.getNodeTree(param,hist_id));
	} else if(param != 0 && hist_id == 0) {
		stdout.println(model.getNodeTree(param));
	}
	stdout.println("</p>");
	stdout.println("<h2>TimeLine</h2>");
	int[] timeline = model.getSnapshotList(param);
	int i = 0;
	while(i < timeline.getSize()) {
		stdout.println("<a href=\"tree.cgi?t=${param}&h=${timeline[i]}\">${timeline[i]}</a> ");
		i = i + 1;
	}
	end();
}

main();
