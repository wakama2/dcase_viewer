Import("MiniKonoha.NameSpace");
Import("JavaScript.Array");
Import("JavaStyle.Object");
Import("Syntax.StringInterpolation");
Import("Syntax.GlobalVariable");
Import("Syntax.JavaStyleClass");
Import("Syntax.CStyleWhile");
Import("Type.File");
Import("Type.Json");
Import("MiniKonoha.Map");
Import("Deos.DCaseCloud");

Json createMessage(Json result) {
	Json json = new Json();
	json.setString("jsonrpc", "2.0");
	json.setString("version", "1.0");
	json.set("result", result);
	return json;
}

DCaseModel model = new DCaseModel("dcasedb", "dcasedb");

const IntList=Array[int];
@Public IntList ConvertToIntList(Json json) {
	IntList a = [];
	int i, length = json.getSize();
	while (i < length) {
		a.add(json.getInt(i));
		i = i + 1;
	}
	return a;
}

@Public Json ConvertFromIntList(int[] intlist) {
	Json a = new Json([]);
	int i, length = intlist.getSize();
	while (i < length) {
		a.add(intlist[i]);
		i = i + 1;
	}
	return a;
}

void CreateTopGoal (Json request) {
	String Justification = request.getString("Justification");
	String Description = request.getString("Description");
	String Commiter = request.getString("Commiter");
	int processType = request.getInt("ProcessType");
	int ArgumentId = global.model.CreateTopGoal(Description,processType,Justification,Commiter);
	Json res = new Json();
	res.setInt("BelongedArgumentId",ArgumentId);
	Json response = createMessage(res);
	stdout.print(response);
}

/*
//FIXME
void DeleteLink (Json request) {
	int ParentNodeId = request.getInt("ParentNodeId");
	Json TargetNode = request.get("TargetNode");
	Json response = createMessage("FIXME");
	stdout.print(response);
}

//FIXME
void NewLink (Json request) {
	int ParentNodeId = request.getInt("ParentNodeId");
	int TargetNodeId = request.getInt("TargetNodeId");
	Json response = createMessage("FIXME");
	stdout.print(response);
}
*/

/*
//Private for web API
void CreateNode (Json request) {
	int BelongedArgumentId = request.getInt("BelongedArgumentId");
	Json json = request.get("Node");
	Json response = createMessage("FIXME");
	stdout.print(response);
}

void UpdateNode (Json request) {
	int BelongedArgumentId = request.getInt("BelongedArgumentId");
	Json json = request.get("json");
	Json response = createMessage("FIXME");
	stdout.print(response);
}

void DeleteNode (Json request) {
	int BelongedArgumentId = request.getInt("BelongedArgumentId");
	Json json = request.get("json");
	Json response = createMessage("FIXME");
	stdout.print(response);
}
*/

/*
//TODO
void FindNodeFrom (Json request) {
	String NodeType = request.getString("NodeType");
	int NodeIdSearchFrom = request.getInt("NodeIdSearchFrom");
	int[] res = global.model.FindNodeFrom(NodeType, NodeIdSearchFrom);
	Json response = createMessage(ConvertFromIntList(res));
	stdout.print(response);
}
*/

void FindNodeByDescription (Json request) {
	String SearchText = request.getString("SearchText");
	int[] res = global.model.FindNodeByDescription(SearchText);
	Json res_json = new Json();
	res_json.set("NodeIdList",ConvertFromIntList(res));
	Json response = createMessage(res_json);
	stdout.print(response);
}

void FindContextByAttribute (Json request) {
	String SearchText = request.getString("SearchText");
	int[] res = global.model.FindContextByProperty(SearchText);
	Json res_json = new Json();
	res_json.set("NodeIdList",ConvertFromIntList(res));
	Json response = createMessage(res_json);
	stdout.print(response);
}

void Commit (Json request) {
	int BelongedArgumentId = request.getInt("BelongedArgumentId");
	Json args = request.get("commit");
	if(request.hasKey("ProcessId")) {
		global.model.Commit(BelongedArgumentId,request.getInt("ProcessId"), args);
	} else {
		global.model.Commit(BelongedArgumentId,args);
	}
	Json response = createMessage(new Json()); //FIXME Response is void
	stdout.print(response);
}

void getNode (Json request) {
	int node_id = request.getInt("NodeId");
	Json node = global.model.getNode(node_id);
	Json res = new Json();
	res.set("Node",node);
	Json response = createMessage(res);
	stdout.print(response);
}

void getArgumentList (Json request) {
	int[] argumentIdList = global.model.getArgumentList();
	Json res = new Json();
	res.set("ArgumentIdList", ConvertFromIntList(argumentIdList));
	Json response = createMessage(res);
	stdout.print(response);
}

void getNodeTree (Json request) {
	int BelongedArgumentId = request.getInt("BelongedArgumentId");
	Json NodeTree = global.model.getNodeTree(BelongedArgumentId);
	Json res = new Json();
	res.set("Tree",NodeTree);
	Json response = createMessage(res);
	stdout.print(response);
}

void getNodeTreeFromSnapshotId (Json request) {
	int BelongedArgumentId = request.getInt("BelongedArgumentId");
	int SnapshotId = request.getInt("SnapshotId");
	Json NodeTree = global.model.getNodeTree(BelongedArgumentId,SnapshotId);
	Json res = new Json();
	res.set("Tree",NodeTree);
	Json response = createMessage(res);
	stdout.print(response);
}

void getNodeTreeBetween (Json request) {
	int BelongedArgumentId = request.getInt("BelongedArgumentId");
	int snapshot_start_id = request.getInt("StartId");
	int snapshot_end_id = request.getInt("EndId");
	Json NodeTree = global.model.getNodeTree(BelongedArgumentId,snapshot_start_id,snapshot_end_id);
	Json res = new Json();
	res.set("Tree",NodeTree); //FIXME
	Json response = createMessage(res);
	stdout.print(response);
}

void OpenProcessContext (Json request) {
	String Justification = request.getString("Justification");
	int process_type = request.getInt("ProcessType");
	int BelongedArgumentId = request.getInt("BelongedArgumentId");
	String commiter_name = request.getString("Commiter");
	int processId = global.model.OpenProcessContext(BelongedArgumentId,process_type,Justification,commiter_name);
	Json res = Json.parse("{\"ProcessId\":${processId}}");
	Json response = createMessage(res);
	stdout.print(response);
}

//FIXME
void CloseProcessContext (Json request) {
	int BelongedArgumentId = request.getInt("BelongedArgumentId");
	int process_id = request.getInt("ProcessId");
	String Justification = request.getString("Justification");
	Json response = createMessage(new Json());
	stdout.print(response);
}

void getProcessContextIds (Json request) {
	int BelongedArgumentId = request.getInt("BelongedArgumentId");
	int[] res = global.model.getProcessContextIds(BelongedArgumentId);
	Json res_json = new Json();
	res_json.set("ProcessIdList",ConvertFromIntList(res));
	Json response = createMessage(res_json);
	stdout.print(response);
}

void getSnapshotList (Json request) {
	int BelongedArgumentId = request.getInt("BelongedArgumentId");
	Json res = global.model.getSnapshotList(BelongedArgumentId);
	Json res_json = new Json();
	res_json.set("SnapshotList",res);
	Json response = createMessage(res_json);
	stdout.print(response);
}

void getSnapshotIds (Json request) {
	int BelongedArgumentId = request.getInt("BelongedArgumentId");
	int[] res = global.model.getSnapshotIds(BelongedArgumentId);
	Json res_json = new Json();
	res_json.set("SnapshotIdList",ConvertFromIntList(res));
	Json response = createMessage(res_json);
	stdout.print(response);
}

/*
//TODO
void getContext (Json request) {
	int NodeId = request.getInt("NodeId");
	Json response = createMessage("FIXME");
	stdout.print(response);
}
*/

void Support (Json request) {
	int EvidenceNodeId = request.getInt("EvidenceNodeId");
	int ArgumentId = request.getInt("BelongedArgumentId");
	int ProcessId = request.getInt("ProcessId");
	int res = global.model.Support(EvidenceNodeId, ArgumentId, ProcessId);
	Json response = createMessage(Json.parse("{\"NodeId\":${res}}"));
	stdout.print(response);
}

void Rebuttal (Json request) {
	int EvidenceNodeId = request.getInt("EvidenceNodeId");
	int ArgumentId = request.getInt("BelongedArgumentId");
	int ProcessId = request.getInt("ProcessId");
	String Diagnosis = request.getString("Diagnosis");
	int res = global.model.Support(EvidenceNodeId, ArgumentId, ProcessId, Diagnosis);
	Json response = createMessage(Json.parse("{\"NodeId\":${res}}"));
	stdout.print(response);
}

class JsonRPCServer {
	Map[Func[void, Json]] functions;

	JsonRPCServer() {
		functions = new Map[Func[void, Json]]();
	}

	void dispatch(String key,Json request) {
		Func[void, Json] f = this.functions.get(key);
		f(request);
	}

	void registerFunctions() {
		this.functions.set("CreateTopGoal"        ,CreateTopGoal);
		//this.functions.set("DeleteLink"           ,DeleteLink);
		//this.functions.set("NewLink"              ,NewLink);
		//this.functions.set("CreateNode"           ,CreateNode);
		//this.functions.set("UpdateNode"           ,UpdateNode);
		//this.functions.set("DeleteNode"           ,DeleteNode);
		//this.functions.set("FindNodeFrom"         ,FindNodeFrom);
		this.functions.set("FindNodeByDescription",FindNodeByDescription);
		this.functions.set("FindContextByAttribute",FindContextByAttribute);
		this.functions.set("Commit"               ,Commit);
		this.functions.set("getNode"              ,getNode);
		this.functions.set("getArgumentList"      ,getArgumentList);
		this.functions.set("getNodeTree"          ,getNodeTree);
		this.functions.set("getNodeTreeFromSnapshotId",getNodeTreeFromSnapshotId);
		this.functions.set("getNodeTreeBetween"   ,getNodeTreeBetween);
		this.functions.set("OpenProcessContext"   ,OpenProcessContext);
		//this.functions.set("CloseProcessContext",CloseProcessContext);
		this.functions.set("getProcessContextIds" ,getProcessContextIds);
		this.functions.set("getSnapshotList"      ,getSnapshotList);
		this.functions.set("getSnapshotIds"       ,getSnapshotIds);
		//this.functions.set("getContext"           ,getContext);
		this.functions.set("Support"              ,Support);
		this.functions.set("Rebuttal"             ,Rebuttal);
	}
}
