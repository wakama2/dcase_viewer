Import("Deos.DCaseCloud");
Import("Type.Json");
Import("Syntax.CStyleFor");
Import("Common.StringUtil");
Import("JavaScript.String");
Import("Syntax.CStyleWhile");
Import("Syntax.GlobalVariable");
Import("MiniKonoha.NameSpace");
Import("JavaScript.Array");
Import("Syntax.Null");

const tab = "\t";

boolean IsGoal(Json node) {

	return 	node.getString("NodeType") == "Goal";
}

boolean IsStrategy(Json node) {

	return 	node.getString("NodeType") == "Strategy";
}

boolean IsContext(Json node) {

	return 	node.getString("NodeType") == "Context";
}

boolean IsEvidence(Json node) {

	return 	node.getString("NodeType") == "Evidence";
}

String EmitIndent(int level) {

	int i = 0;
	String indent = "";
	while(i < level) {
		indent = indent + tab;
		i = i + 1;
	}
	return indent;
}

Json GenerateGoalCode(DCaseModel model, int node_id, int level) {
	Json topNode = model.getNode(node_id);
	Json children_id = topNode.get("Children");
	int childrenNum = topNode.get("Children").getSize();
	String indent = "";

	if(IsEvidence(topNode)) {
		String evidence = topNode.getString("Description");
		indent = EmitIndent(level + 1);
		System.p(indent + evidence);
		indent = EmitIndent(level);
		System.p(indent + "}");
	}

	if(childrenNum == 0 && IsGoal(topNode)) {
		indent = EmitIndent(level);
		System.p(indent + "assure " + topNode.get("Description") + " {");
	}

	if(childrenNum == 1 && IsGoal(topNode)) {
		indent = EmitIndent(level);
		System.p(indent + "assure "  + topNode.get("Description") + " {");
		return GenerateGoalCode(model, children_id[0].toint(), level);;
	}

	int i = 0;
	while(i < childrenNum) {
		if(IsGoal(model.getNode(children_id[i].toint()))) {
			indent = EmitIndent(level + 1);
			System.p(indent + "assure " + model.getNode(node_id).getString("Description") + " {");
		}
		else if(IsContext(model.getNode(children_id[i].toint()))) {
			i = i + 1;
			continue;
		}
		else if(IsStrategy(model.getNode(children_id[i].toint()))) {
			Json strategy = model.getNode(children_id[i].toint());
			Json strategy_child_id = strategy.get("Children");
			indent = EmitIndent(level);
			System.p(indent + "strategy pre {");
			GenerateGoalCode(model, strategy_child_id[0].toint(), level + 1);
			System.p(indent + "}");
			System.p(indent + "strategy post {");
			GenerateGoalCode(model, strategy_child_id[1].toint(), level + 1);
			System.p(indent + "}");
		}
		i = i + 1;
	}
}
           
void GenerateAssureCode(DCaseModel model) {

	Json nodelist = model.getNodeTree(2).get("NodeList"); //seach Argument which contains Top Goal that we argue.
	String indent = EmitIndent(0);
	int i;

	while(i < nodelist.getSize()) {
		if(IsGoal(nodelist[i])) {
			System.p("assure " + nodelist[i].getString("Description") + " {");
			System.p(tab +  nodelist[i+3].getString("Description"));
			System.p("}");
		}
		i = i + 1;
	}
	System.p("argue " + nodelist[0].getString("Description") + " {");
	GenerateGoalCode(model, 1, 1);
	System.p("}");
}

void main() {

	DCaseModel model = new DCaseModel("dcasedb", "dcasedb");
	GenerateAssureCode(model);
}

main();
