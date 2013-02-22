Import("Deos.DCaseCloud");
Import("Type.Json");
Import("JavaScript.Array");

void main() {
	DCaseModel model = new DCaseModel("dcasedb","dcasedb");
	int id = model.CreateTopGoal("description test",1,"this is the test justification","foo commiter");
	System.p(id);
	Json nodeTree = model.GetNodeTree(id);
	System.p(nodeTree);
	int top_id = nodeTree.getInt("TopGoalId");
	System.p(model.GetNode(top_id));

	Json json = new Json();
	Json commit = new Json([]);
	Json commitObj1 = new Json();
	commitObj1.setString("branch-name","mybranch");
	commitObj1.setString("command","insert");
	Json commitObj1_nodelist = new Json([]);

	Json json_node1 = new Json();
	json_node1.setString("NodeType"       , "Context");
	json_node1.setInt("ParentNodeId"      , top_id);
	json_node1.setInt("ThisNodeId"        , 0);
	json_node1.setInt("PrevNodeId"        , 0);
	json_node1.setInt("NextNodeId"        , 0);
	json_node1.setInt("BelongedArgumentId", id);
	json_node1.set("Children"             , new Json([]));
	json_node1.setString("Description"    , "test description");
	Json attr = new Json();
	attr.setString("hoge","hogehjoh");
	json_node1.set("Attributes"           , attr);

	commitObj1_nodelist.add(json_node1);
	commitObj1.set("NodeList",commitObj1_nodelist);
	commit.add(commitObj1);
	json.set("commit",commit);
	System.p(json);

	model.Commit(id,json.get("commit"));
	System.p(model.GetNodeTree(id));
}
main();
