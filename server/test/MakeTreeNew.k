Import("Deos.DCaseCloud");
Import("JavaStyle.Object");
Import("Type.Json");
Import("JavaScript.Array");

Json SetNode(String NodeType, int ParentNodeId, int ThisNodeId, int BelongedArgumentId,  String description) {
	Json node = new Json();
	node.setString("NodeType"       , NodeType);
	node.setInt("ParentNodeId"      , ParentNodeId);
	node.setInt("ThisNodeId"        , ThisNodeId);
	node.setInt("BelongedArgumentId", BelongedArgumentId);
	node.set("Children"             , new Json([]));
	node.setString("Description"    , description);
	return node;
}

void GenerateTree1(DCaseModel model) {
	int id = model.CreateTopGoal("D-Script must work", 1, "TopGoal justification.", "sample commiter");
	Json nodeTree = model.GetNodeTree(id);
	int top_id = nodeTree.getInt("TopGoalId");
	System.p(top_id);

	Json json = new Json();
	Json commit = new Json([]);
	Json commitObj1 = new Json();
	commitObj1.setString("branch-name","D-script");
	commitObj1.setString("command","insert");
	Json commitObj1_nodelist = new Json([]);

	commitObj1_nodelist.add(nodeTree);

	Json c2 = SetNode("Context", top_id, -2, id, "sudo reboot -h now");
	commitObj1_nodelist.add(c2);

	Json s1 = SetNode("Strategy", top_id, -3, id, "Argument by precondition/postcondition");
	commitObj1_nodelist.add(s1);

	Json g3 = SetNode("Goal", -3, -4, id, "web server must be alive before the fact");
	commitObj1_nodelist.add(g3);

	Json g4 = SetNode("Goal", -3, -5, id, "web server must be alive after the fact");
	commitObj1_nodelist.add(g4);

	Json e2 = SetNode("Evidence", -4, -6, id, "telnet @{IP} @{PORT}");
	commitObj1_nodelist.add(e2);

	Json e3 = SetNode("Evidence", -5, -7, id, "telnet @{IP} @{PORT}");
	commitObj1_nodelist.add(e3);

	commitObj1.set("NodeList", commitObj1_nodelist);
	commit.add(commitObj1);
	json.set("commit", commit);
	model.Commit(id, json.get("commit"));

	System.p(model.GetNodeTree(id));

}

void GenerateTree2(DCaseModel model) {
	int id = model.CreateTopGoal("reboot must work", 2, "TopGoal justification.", "sample commiter");
	Json nodeTree = model.GetNodeTree(id);
	int top_id = nodeTree.getInt("TopGoalId");

	Json json = new Json();
	Json commit = new Json([]);
	Json commitObj1 = new Json();
	commitObj1.setString("branch-name","D-script");
	commitObj1.setString("command","insert");
	Json commitObj1_nodelist = new Json([]);

	commitObj1_nodelist.add(nodeTree);

	Json c1 = SetNode("Context", id, -2, id, "@IP: 192.168.0.10 @PORT: 8080");
	commitObj1_nodelist.add(c1);

	Json e1 = SetNode("Evidence", id, -3, id, "sudo reboot -h now");
	commitObj1_nodelist.add(e1);

	commitObj1.set("NodeList", commitObj1_nodelist);
	commit.add(commitObj1);
	json.set("commit", commit);
	model.Commit(id, json.get("commit"));

	System.p(model.GetNodeTree(id));

}

void main() {
	DCaseModel model = new DCaseModel("dcasedb", "dcasedb");
	GenerateTree1(model);
	GenerateTree2(model);
}

main();
