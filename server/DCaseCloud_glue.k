Import("Type.Json");
Import("Syntax.CStyleWhile");
Import("Syntax.Null");
Import("Syntax.GlobalVariable");
Import("Syntax.StringInterpolation");
Import("Java.Class");
Import("MiniKonoha.NameSpace");
Import("MiniKonoha.Map");
Import("MiniKonoha.Sql");
Import("JavaStyle.Object");
Import("JavaScript.Array");
Import("JavaScript.Date");

class PreparedStatement {
	Connection con;
	String[] queue;
	int id;

	//TODO Array.join()
	String join() {
		if(this.queue.getSize() == 0) {
			return "";
		}
		int i = 0;
		String ret = " USING ";
		while(i < this.queue.getSize()-1) {
			ret = ret + this.queue[i] + ",";
			i = i + 1;
		}
		ret = ret + this.queue[this.queue.getSize()-1];
		return ret;
	}

	PreparedStatement(Connection con, String sql) {
		this.con = con;
		this.queue = [];
		this.con.query("PREPARE stmt1 FROM '${sql}'");
	}

	void setString(String param, String value) {
		this.con.query("SET ${param} = '${value}'"); //FIXME
		this.queue.add(param);
	}

	void setInt(String param, int value) {
		this.con.query("SET ${param} = ${value}");
		this.queue.add(param);
	}

	void setBoolean(String param, boolean value) {
		if(value) {
			this.con.query("SET ${param} = TRUE");
		}else {
			this.con.query("SET ${param} = FALSE");
		}
		this.queue.add(param);
	}

	ResultSet execute() {
		ResultSet r = this.con.query("EXECUTE stmt1 "+this.join());
		this.id = this.con.getInsertId();
		this.con.query("DEALLOCATE PREPARE stmt1");
		return r;
	}

	int getInsertId(){
		return this.id;
	}
}

class DataBase {
	Connection con;

	DataBase(String userName, String password) {
		this.con = new Connection("mysql://${userName}:${password}@localhost:3306");
		this.con.query("USE dcasecloud;");
	}

	PreparedStatement newPreparedStatement(String q) {
		return new PreparedStatement(this.con, q);
	}

}

class DCaseModel {
	DataBase db;

	@Public DCaseModel(String userName, String password) {
		this.db = new DataBase(userName, password);
	}

	@Public int[] GetArgumentList() {
		PreparedStatement q = this.db.newPreparedStatement("SELECT `id` FROM `argument` WHERE `id`!=0");
		ResultSet r = q.execute();
		int[] ret = [];
		while(r.next()) {
			ret.add(r.getInt("id"));
		}
		return ret;
	}

	Json getAttribute(int node_id) {
		Json json = new Json();
		PreparedStatement p = this.db.newPreparedStatement("SELECT property_key,property_value FROM node_property WHERE node_data_id=?"); //FIXME snapshot_id
		p.setInt("@a",node_id);
		ResultSet r = p.execute();
		while(r.next()) {
			json.setString(r.getString("property_key"),r.getString("property_value"));
		}
		return json;
	}

	int GetParent(int node_id) {
		PreparedStatement q = this.db.newPreparedStatement("SELECT node_parent_id FROM node_link WHERE node_child_id=?"); //FIXME snapshot_id
		q.setInt("@a", node_id);
		ResultSet r = q.execute();
		r.next();
		return r.getInt("node_parent_id");
	}

	Json CreateJsonNode(ResultSet r) {
		Json json = new Json();
		int node_id = r.getInt("node_id");
		json.setInt("ThisNodeId", node_id);
		json.setInt("ParentNodeId", this.GetParent(node_id));
		json.setInt("BelongedArgumentId", r.getInt("argument_id"));
		json.setInt("NodeIdentityId", r.getInt("node_identity_id"));
		json.setInt("PrevNodeId", r.getInt("node_prev_id"));
		json.setInt("NextNodeId", r.getInt("node_next_id"));
		json.setString("Url", r.getString("url"));
		json.setString("Description", r.getString("description"));
		json.setBoolean("DeleteFlag", r.getBoolean("delete_flag"));
		json.setString("NodeType", r.getString("type_name"));
		json.set("Children", this.GetChildLinkList(r.getInt("node_id")));
		json.set("Attributes", this.getAttribute(node_id));
		return json;
	}

	Json CreateJsonNode(ResultSet r, int snapshot_id ) {
		Json json = new Json();
		int node_id = r.getInt("node_id");
		json.setInt("ThisNodeId", node_id);
		json.setInt("ParentNodeId", this.GetParent(node_id));
		json.setInt("BelongedArgumentId", r.getInt("argument_id"));
		json.setInt("NodeIdentityId", r.getInt("node_identity_id"));
		json.setInt("PrevNodeId", r.getInt("node_prev_id"));
		json.setInt("NextNodeId", r.getInt("node_next_id"));
		json.setString("Url", r.getString("url"));
		json.setString("Description", r.getString("description"));
		json.setBoolean("DeleteFlag", r.getBoolean("delete_flag"));
		json.setString("NodeType", r.getString("type_name"));
		json.set("Children", this.GetChildLinkList(r.getInt("node_id"),snapshot_id));
		json.set("Attributes", this.getAttribute(node_id));
		return json;
	}

	//Return Node
	@Public Json GetNode(int node_id) {
		PreparedStatement q = this.db.newPreparedStatement("SELECT node_data.id AS node_id,node_identity_id, url, description, delete_flag,type_name,node_prev_id,node_next_id,argument_id FROM node_identity INNER JOIN node_data ON current_node_id=node_data.id INNER JOIN node_type ON node_type_id=node_type.id WHERE node_data.id=?");
		q.setInt("@a",node_id);
		ResultSet r = q.execute();
		r.next();
		return this.CreateJsonNode(r);
	}

	Json GetChildLinkList(int node_id) {
		PreparedStatement p = this.db.newPreparedStatement("SELECT node_child_id FROM node_link WHERE node_parent_id=?");
		p.setInt("@a",node_id);
		ResultSet r = p.execute();
		Json json = new Json([]);
		while(r.next()) {
			json.add(r.getInt("node_child_id"));
		}
		return json;
	}

	Json GetChildLinkList(int node_id, int snapshot_id) {
		PreparedStatement q = this.db.newPreparedStatement("SELECT node_child_id FROM node_link INNER JOIN node_link_has_snapshot ON node_link.id=node_link_id WHERE node_parent_id=? AND node_link_has_snapshot.snapshot_id=?"); //FIXME snapshot_id
		q.setInt("@a", node_id);
		q.setInt("@b", snapshot_id);
		ResultSet r = q.execute();
		Json json = new Json([]);
		while(r.next()) {
			json.add(r.getInt("node_child_id"));
		}
		return json;
	}

	Json GetLinkList(int snapshot_id) {
		PreparedStatement q = this.db.newPreparedStatement("SELECT node_parent_id,node_child_id FROM node_link_has_snapshot INNER JOIN node_link ON node_link_id=node_link.id WHERE snapshot_id=?");
		q.setInt("@a", snapshot_id);
		ResultSet r = q.execute();
		Json json_array = new Json([]);
		while(r.next()) {
			//FIXME
			Json json = new Json();
			json.setInt("node_parent_id", r.getInt("node_parent_id"));
			json.setInt("node_child_id", r.getInt("node_child_id"));
			json_array.add(json);
		}
		return json_array;
	}

	Json GetNodeList(int snapshot_id) {
		PreparedStatement q = this.db.newPreparedStatement("SELECT node_data.id AS node_id,node_identity_id, url, description, delete_flag,type_name,argument_id FROM node_data INNER JOIN snapshot_has_node_data ON node_data_id=node_data.id  INNER JOIN node_type ON node_type_id=node_type.id INNER JOIN node_identity ON node_data.node_identity_id=node_identity.id WHERE snapshot_id=?");
		q.setInt("@a", snapshot_id);
		ResultSet r = q.execute();
		Json json_array = new Json([]);
		while(r.next()) {
			Json json = this.CreateJsonNode(r,snapshot_id);
			json_array.add(json);
		}

		return json_array;
	}

	int getTopGoalId(int snapshot_id) {
		PreparedStatement p = this.db.newPreparedStatement("SELECT `root_node_id` FROM `snapshot` WHERE `id`=?");
		p.setInt("@a", snapshot_id);
		ResultSet r = p.execute();
		r.next();
		return r.getInt("root_node_id");
	}

	Json _GetNodeTree(int argument_id, int top_goal_id, int snapshot_id) {
		Json tree = new Json();
		tree.setInt("BelongedArgumentId",argument_id);
		tree.setInt("SnapshotId",snapshot_id);
		tree.setInt("TopGoalId",top_goal_id);
		Json nodeList = this.GetNodeList(snapshot_id);
		tree.set("NodeList", nodeList);
		//tree.set("links", linkList);
		return tree;
	}

	//Return NodeTree
	@Public Json  GetNodeTree(int argument_id) {
		return this.GetNodeTree(argument_id, this.getCurrentSnapShot(argument_id));
	}

	@Public Json  GetNodeTree(int argument_id, int snapshot_id) {
		int top_goal_id = this.getTopGoalId(snapshot_id);
		return this._GetNodeTree(argument_id,top_goal_id,snapshot_id);
	}

	int[] _GetSnapshotList(int start_id, int end_id) {
		int[] ret = [];
		ret.add(end_id);
		int it = end_id;
		while(it != start_id) {
			PreparedStatement p = this.db.newPreparedStatement("SELECT `prev_snapshot_id` FROM `snapshot` WHERE `id`=?");
			p.setInt("@a", it);
			ResultSet r = p.execute();
			r.next();
			it = r.getInt("prev_snapshot_id");
			if(it == 0) {
				break;
			}
			ret.add(it);
		}
		int[] reverse = [];
		int i = ret.getSize()-1;
		while(i>=0) {
			reverse.add(ret[i]);
			i = i - 1;
		}
		return reverse;
	}

	@Public Json GetNodeTree(int argument_id, int snapshot_start_id, int snapshot_end_id) {
		Json array_json = new Json([]);
		int i = 0;
		int[] ids = this._GetSnapshotList(snapshot_start_id,snapshot_end_id);//TODO get snapshot_id[]
		while(i < ids.getSize()) {
			int top_goal_id = this.getTopGoalId(ids[i]);
			array_json.add(this._GetNodeTree(argument_id,top_goal_id,ids[i]));
			i = i + 1;
		}
		return array_json;
	}

	int initSnapshot(int prev_snapshot_id, int root_node_id) {
		String sql = "INSERT INTO `snapshot`(`prev_snapshot_id`,`unix_time`, `root_node_id`) VALUES(?,?,?)";
		PreparedStatement q = this.db.newPreparedStatement(sql);
		q.setInt("@a", prev_snapshot_id);
		q.setInt("@b", new Date().getTime());
		q.setInt("@c", root_node_id);
		q.execute();
		return q.getInsertId();
	}

	int initProcessContext(int snapshot_id, int processType, String justification, String commiter) {
		String sql = "INSERT INTO `process_context`(`current_snapshot_id`,`process_type`,`justification`,`commiter`) VALUES(?,?,?,?)";
		PreparedStatement q = this.db.newPreparedStatement(sql);
		q.setInt("@a",    snapshot_id);
		q.setInt("@b",    processType);
		q.setString("@c", justification);
		q.setString("@d", commiter);
		q.execute();
		return q.getInsertId();
	}

	int initArgument(int process_id) {
		PreparedStatement p = this.db.newPreparedStatement("INSERT INTO `argument`(`current_process_id`) VALUES(?)");
		p.setInt("@a", process_id);
		p.execute();
		return p.getInsertId();
	}

	int initNode_identity(int argument_id) {
		PreparedStatement p = this.db.newPreparedStatement("INSERT INTO `node_identity`(`argument_id`) VALUES(?)");
		p.setInt("@a", argument_id);
		p.execute();
		return p.getInsertId();
	}

	int getNodeType(String type_name) {
		PreparedStatement p = this.db.newPreparedStatement("SELECT `id` FROM `node_type` WHERE `type_name`=?");
		p.setString("@a", type_name);
		ResultSet r = p.execute();
		r.next();
		return r.getInt("id");
	}

	int createNodeData(int type_id, int node_identity_id, String description, String url) {
		PreparedStatement p = this.db.newPreparedStatement("INSERT INTO `node_data`(`node_type_id`,`node_identity_id`,`description`, `url`) VALUES(?,?,?,?)");
		p.setInt("@a", type_id);
		p.setInt("@b", node_identity_id);
		p.setString("@c", description);
		p.setString("@d", url);
		p.execute();
		return p.getInsertId();
	}

	void createAttributes(int node_id, Json attr) {
		String[] keys = attr.keys();
		int i = 0;
		while(i<keys.getSize()) {
			PreparedStatement p = this.db.newPreparedStatement("INSERT INTO `node_property`(`property_key`,`property_value`, `node_data_id`) VALUES(?,?,?)");
			p.setString("@a", keys[i]);
			p.setString("@b", attr.getString(keys[i])); //FIXME String or Json
			p.setInt("@c", node_id);
			p.execute();
			i = i + 1;
		}
	}

	int createNodeDataFromJson(int type_id, int node_identity_id, Json json) {
		int parent_node_id = json.getInt("ParentNodeId");
		int argument_id    = json.getInt("BelongedArgumentId");
		String description = json.getString("Description");
		String url         = json.getString("Url");
		//int this_node_id = json.getInt("ThisNodeId");
		int prev_node_id   = json.getInt("PrevNodeId");
		//int next_node_id = json.getInt("NextNodeId");
		PreparedStatement p = this.db.newPreparedStatement("INSERT INTO `node_data`(`node_type_id`,`node_identity_id`,`description`, `url`, `node_prev_id`) VALUES(?,?,?,?,?)");
		p.setInt("@a", type_id);
		p.setInt("@b", node_identity_id);
		p.setString("@c", description);
		p.setString("@d", url);
		p.setInt("@e", prev_node_id);
		p.execute();
		int node_id = p.getInsertId();
		if(parent_node_id != 0) {
			this.CreateLink(argument_id, parent_node_id, node_id);
		}
		Json children = json.get("Children");
		int i = 0;
		while(i < children.getSize()) {
			int c_id = children.getInt(i);
			this.CreateLink(argument_id, node_id, c_id);
			i = i + 1;
		}
		Json attr = json.get("Attributes");
		this.createAttributes(node_id, attr);
		return node_id;
	}

	int updateNodeDataFromJson(int type_id, int node_identity_id, Json json) {
		int parent_node_id = json.getInt("ParentNodeId");
		int argument_id    = json.getInt("BelongedArgumentId");
		String description = json.getString("Description");
		String url         = json.getString("Url");
		int prev_node_id   = json.getInt("PrevNodeId");
		//int next_node_id = json.getInt("NextNodeId");
		PreparedStatement p = this.db.newPreparedStatement("INSERT INTO `node_data`(`node_type_id`,`node_identity_id`,`description`, `url`, `node_prev_id`) VALUES(?,?,?,?,?)");
		p.setInt("@a", type_id);
		p.setInt("@b", node_identity_id);
		p.setString("@c", description);
		p.setString("@d", url);
		p.setInt("@e", prev_node_id);
		p.execute();
		int node_id = p.getInsertId();
		if(parent_node_id != 0) {
			this.CreateLink(argument_id,parent_node_id, node_id);
		}
		Json children = json.get("Children");
		int i = 0;
		while(i < children.getSize()) {
			int c_id = children.getInt(i);
			this.CreateLink(argument_id, node_id, c_id);
			i = i + 1;
		}
		PreparedStatement p1 = this.db.newPreparedStatement("UPDATE `node_data` SET `node_next_id`=? WHERE `id`=?");
		p1.setInt("@a", node_id);
		p1.setInt("@b", prev_node_id);
		p1.execute();

		Json attr = json.get("Attributes");
		this.createAttributes(node_id, attr);
		return node_id;
	}

	void updateSnapshot(int node_id, int snapshot_id) {
		PreparedStatement p = this.db.newPreparedStatement("UPDATE `snapshot` SET `root_node_id`=? WHERE `id`=?");
		p.setInt("@a", node_id);
		p.setInt("@b", snapshot_id);
		p.execute();
	}

	void updateProcessContext(int process_id, int current_snapshot_id) {
		PreparedStatement p = this.db.newPreparedStatement("UPDATE process_context SET current_snapshot_id=? WHERE id=?");
		p.setInt("@a", current_snapshot_id);
		p.setInt("@b", process_id);
		p.execute();
	}

	void updateNodeIdentity(int node_identity_id, int node_data_id) {
		PreparedStatement p = this.db.newPreparedStatement("UPDATE `node_identity` SET `current_node_id`=? WHERE `id`=?");
		p.setInt("@a", node_data_id);
		p.setInt("@b", node_identity_id);
		p.execute();
	}

	void insertSnapshotNodeData(int snapshot_id, int argument_id) {
		PreparedStatement p = this.db.newPreparedStatement("INSERT INTO `snapshot_has_node_data`(snapshot_id,node_data_id) SELECT ? AS snapshot_id,current_node_id FROM node_identity WHERE argument_id=? AND current_node_id!=0");
		p.setInt("@a", snapshot_id);
		p.setInt("@b", argument_id);
		p.execute();
	}

	void insertSnapshotNodeLink(int snapshot_id, int argument_id) {
		PreparedStatement p = this.db.newPreparedStatement("INSERT INTO `node_link_has_snapshot`(node_link_id,snapshot_id) SELECT current_node_link_id,? AS snapshot_id FROM link_identity WHERE argument_id=? AND current_node_link_id!=0");
		p.setInt("@a", snapshot_id);
		p.setInt("@b", argument_id);
		p.execute();
	}

	void insertProcessContextHasSnapshot(int process_id, int snapshot_id) {
		PreparedStatement p = this.db.newPreparedStatement("INSERT INTO `process_context_has_snapshot` (`process_context_id`,`snapshot_id`) VALUES(?,?)");
		p.setInt("@a", process_id);
		p.setInt("@b", snapshot_id);
		p.execute();
	}

	void insertArgumentHasProcessContext(int process_id, int argument_id) {
		PreparedStatement p = this.db.newPreparedStatement("INSERT INTO `argument_has_process_context` (`argument_id`,`process_context_id`) VALUES(?,?)");
		p.setInt("@a", argument_id);
		p.setInt("@b", process_id);
		p.execute();
	}

	@Public int CreateTopGoal(String description, int processType, String justification, String commiter) {
		int snapshot_id = this.initSnapshot(0,0);
		int process_id  = this.initProcessContext(snapshot_id,processType,justification,commiter);
		int argument_id = this.initArgument(process_id);
		int top_goal_identity_id = this.initNode_identity(argument_id);
		int node_type_id = this.getNodeType("Goal");
		int node_data_id = this.createNodeData(node_type_id,top_goal_identity_id,description,"");
		this.updateNodeIdentity(top_goal_identity_id,node_data_id);
		this.updateSnapshot(node_data_id,snapshot_id); //FIXME
		this.insertSnapshotNodeData(snapshot_id,argument_id);
		this.insertProcessContextHasSnapshot(process_id,snapshot_id);
		this.insertArgumentHasProcessContext(process_id,argument_id);

		return argument_id;
	}

	//Return newNodeId
	@Public int DeleteLink(int ParentNodeId, Json /*DBNode*/ TargetNode/*FIXME*/) {
	}

	//Return NodeId TODO AwayGoal
	@Public int NewLink(int ParentNodeId,int TargetNodeId) {
	}

	@Public int CreateNode(int argument_id, Json json) {
		int node_identity_id = this.initNode_identity(argument_id);
		int type_id = this.getNodeType(json.getString("NodeType"))
			int node_data_id = this.createNodeDataFromJson(type_id,node_identity_id,json);
		this.updateNodeIdentity(node_identity_id,node_data_id);
		return node_data_id;
	}

	@Public int CreateNode(int argument_id, Json json, Map[int] m) {
		if(m.has(json.getInt("ParentNodeId").toString())) {
			json.setInt("ParentNodeId", m.get(json.getInt("ParentNodeId").toString()));
		}else {
			Json n = this.GetNode(json.getInt("ParentNodeId"));
			System.p(n);
			int n_id = n.getInt("NextNodeId");
			if(n_id != 0) {
				json.setInt("ParentNodeId",n_id);
			}
		}
		int node_identity_id = this.initNode_identity(argument_id);
		int type_id = this.getNodeType(json.getString("NodeType"))
			int node_data_id = this.createNodeDataFromJson(type_id,node_identity_id,json);
		this.updateNodeIdentity(node_identity_id,node_data_id);
		if(json.getInt("ThisNodeId")<0) {
			m.set(json.getInt("ThisNodeId").toString(),node_data_id);
		}
		return node_data_id;
	}

	int getNodeIdentityId(int node_id) {
		PreparedStatement p = this.db.newPreparedStatement("SELECT node_identity_id FROM node_data WHERE id=?");
		p.setInt("@a",node_id);
		ResultSet r = p.execute();
		r.next();
		return r.getInt("node_identity_id");
	}

	void ClearLinkByPrevNodeId(int node_id) {
		PreparedStatement p = this.db.newPreparedStatement("UPDATE link_identity INNER JOIN node_link ON link_identity.id=node_link.link_identity_id SET current_node_link_id=0 WHERE node_link.node_parent_id=? OR node_link.node_child_id=?");
		p.setInt("@a",node_id);
		p.setInt("@b",node_id);
		p.execute();
	}

	@Public void UpdateNode(int argument_id, Json json, Map[int] m) {
		int node_identity_id = json.getInt("NodeIdentityId");
		int prev_node_id = json.getInt("PrevNodeId");
		if(node_identity_id == 0) {
			node_identity_id = this.getNodeIdentityId(prev_node_id);
		}
		this.ClearLinkByPrevNodeId(prev_node_id);
		int type_id = this.getNodeType(json.getString("NodeType"));
		int node_data_id = this.updateNodeDataFromJson(type_id,node_identity_id,json);
		if(json.getInt("ThisNodeId")<0) {
			m.set(json.getInt("ThisNodeId").toString(),node_data_id);
		}
		this.updateNodeIdentity(node_identity_id,node_data_id);
	}

	@Public void DeleteNode(int argument_id, Json json) {
		/* //TODO
		   int node_id = json.getString("node_id").toint;
		   int type_id = this.getNodeType(json.getString("type"));
		   int node_data_id = this.createNodeData(type_id,node_id,json.getString("description"),json.getString("url"));
		   this.updateNodeIdentity(node_id,node_data_id);
		   */
	}

	//Return Array[NodeId]
	@Public int[] FindNodeFrom(String NodeType, int NodeIdSearchFrom) { //TODO need refactoring node_link
	}

	//Return Array[NodeId]
	@Public int[] FindNodeByDescription(String SearchText) {
		int[] ret = [];
		PreparedStatement p = this.db.newPreparedStatement("SELECT node_data.id AS data_id, node_identity.id AS identity_id FROM node_data INNER JOIN node_identity ON node_data.node_identity_id=node_identity.id INNER JOIN node_type ON node_type_id=node_type.id WHERE description LIKE ?");
		//p.setString("@a",NodeType);
		p.setString("@a","%"+SearchText+"%"); //FIXME
		ResultSet r = p.execute();
		while(r.next()) {
			ret.add(r.getInt("data_id")); //FIXME
		}
		return ret;
	}

	//Return Array[NodeId]
	@Public int[] FindContextByProperty(String SearchText) {
		PreparedStatement p = this.db.newPreparedStatement("SELECT node_data.id as node_id,property_key,property_value FROM node_data,node_property WHERE node_data.id=node_property.node_data_id AND( property_key LIKE ? OR property_value LIKE ?)"); //FIXME
		p.setString("@a",SearchText);
		p.setString("@b",SearchText);
		ResultSet r = p.execute();
		int[] ret = [];
		while(r.next()) {
			ret.add(r.getInt("node_id")); //FIXME
		}
		return ret;
	}

	void updatelinkIdentity(int identity_id,int link_id){
		PreparedStatement p = this.db.newPreparedStatement("UPDATE `link_identity` SET current_node_link_id=? WHERE `id`=?");
		p.setInt("@a",link_id);
		p.setInt("@b",identity_id);
		p.execute();
	}

	void CreateLink(int argument_id, int parent_id, int node_id) {
		PreparedStatement p = this.db.newPreparedStatement("INSERT INTO `link_identity`(`argument_id`) VALUES(?)");
		p.setInt("@a",argument_id);
		p.execute();
		int link_id = p.getInsertId();

		PreparedStatement p_node_link = this.db.newPreparedStatement("INSERT INTO `node_link`(`node_parent_id`,`node_child_id`,`link_identity_id`) VALUES(?,?,?)"); //FIXME
		p_node_link.setInt("@a",parent_id);
		p_node_link.setInt("@b",node_id);
		p_node_link.setInt("@c",link_id);
		p_node_link.execute();
		int l_id = p_node_link.getInsertId();
		this.updatelinkIdentity(link_id,l_id);
	}

	int getCurrentSnapshotFromProcessId(int ProcessId) {
		PreparedStatement p = this.db.newPreparedStatement("SELECT current_snapshot_id FROM process_context WHERE id=?");
		p.setInt("@a", ProcessId);
		ResultSet r = p.execute();
		r.next();
		return r.getInt("current_snapshot_id");
	}

	int getCurrentSnapShot(int argument_id) {
		PreparedStatement p = this.db.newPreparedStatement("SELECT current_snapshot_id FROM argument INNER JOIN process_context ON current_process_id=process_context.id WHERE argument.id=?");
		p.setInt("@a", argument_id);
		ResultSet r = p.execute();
		r.next();
		return r.getInt("current_snapshot_id");
	}

	int getCurrentProcessContext(int argument_id) {
		PreparedStatement p = this.db.newPreparedStatement("SELECT current_process_id FROM argument WHERE id=?");
		p.setInt("@a", argument_id);
		ResultSet r = p.execute();
		r.next();
		return r.getInt("current_process_id");
	}

	void createNodeList(int argument_id, Json node_list, Map[int] m) {
		int i = 0;
		while(i < node_list.getSize()) {
			this.CreateNode(argument_id,node_list[i],m);
			i = i + 1;
		}
	}

	void replaceNodeList(int argument_id, Json node_list, Map[int] m) {
		int i = 0;
		while(i < node_list.getSize()) {
			this.UpdateNode(argument_id,node_list[i], m);
			i = i + 1;
		}
	}

	void deleteNodeList(int argument_id, Json node_list) {
		int i = 0;
		while(i < node_list.getSize()) {
			this.DeleteNode(argument_id,node_list[i]);
			i = i + 1;
		}
	}

	void ClearLinkIdentityCurrent(int ArgumentId) {
		PreparedStatement p = this.db.newPreparedStatement("UPDATE link_identity SET current_node_link_id=0 WHERE argument_id=?");
		p.setInt("@a",ArgumentId);
		p.execute();
	}

	void ClearNodeIdentityCurrent(int ArgumentId) {
		PreparedStatement p = this.db.newPreparedStatement("UPDATE node_identity SET current_node_id=0 WHERE argument_id=?");
		p.setInt("@a",ArgumentId);
		p.execute();
	}

	void UpdateNodeIdentityCurrent(int snapshot_id) {
		PreparedStatement p = this.db.newPreparedStatement("UPDATE snapshot_has_node_data INNER JOIN node_data ON snapshot_has_node_data.node_data_id=node_data.id INNER JOIN node_identity ON node_identity.id=node_data.node_identity_id SET node_identity.current_node_id=node_data.id WHERE snapshot_has_node_data.snapshot_id=?"); //FIXME
		p.setInt("@a", snapshot_id);
		p.execute();
	}

	void UpdateLinkIdentityCurrent(int snapshot_id) {
		PreparedStatement p = this.db.newPreparedStatement("UPDATE node_link_has_snapshot INNER JOIN node_link ON node_link_has_snapshot.node_link_id=node_link.id INNER JOIN link_identity ON link_identity.id=node_link.link_identity_id SET link_identity.current_node_link_id=node_link.id WHERE node_link_has_snapshot.snapshot_id=?"); //FIXME
		p.setInt("@a", snapshot_id);
		p.execute();
	}

	void UpdateCurrentProcess(int ArgumentId,int ProcessId) {
		PreparedStatement p = this.db.newPreparedStatement("UPDATE argument SET current_process_id=?  WHERE argument.id=?");
		p.setInt("@a",ProcessId);
		p.setInt("@b",ArgumentId);
		p.execute();
	}

	void _Commit(int argument_id, int process_id, int top_goal_id, int snapshot_id, Json commit) {
		Map[int] m = new Map[int];
		int i = 0;
		while(i < commit.getSize()) {
			String command = commit[i].getString("command");
			Json node_list = commit[i].get("NodeList");
			if(command == "insert") {
				this.createNodeList(argument_id,node_list,m);
			} else if(command == "replace") {
				this.replaceNodeList(argument_id,node_list,m);
			} else if(command == "delete") {
				this.deleteNodeList(argument_id,node_list);
			} else { //FIXME Error Handling
				System.p("command not found");
			}
			i = i + 1;
		}

		this.insertSnapshotNodeData(snapshot_id,argument_id); //FIXME
		this.insertSnapshotNodeLink(snapshot_id,argument_id); //FIXME
	}

	@Public void Commit(int ArgumentId, int ProcessId, Json args) {
		int prev_snapshot_id = this.getCurrentSnapshotFromProcessId(ProcessId);
		this.ClearNodeIdentityCurrent(ArgumentId);
		this.ClearLinkIdentityCurrent(ArgumentId);
		this.UpdateNodeIdentityCurrent(prev_snapshot_id);
		//this.UpdateLinkIdentityCurrent(prev_snapshot_id);
		this.UpdateCurrentProcess(ArgumentId,ProcessId);
		int top_goal_id = this.getTopGoalId(prev_snapshot_id);
		int snapshot_id = this.initSnapshot(prev_snapshot_id,top_goal_id); //FIXME
		this.updateProcessContext(ProcessId,snapshot_id);
		this._Commit(ArgumentId, ProcessId, top_goal_id, snapshot_id, args);
	}

	@Public void Commit(int argument_id, Json args) {
		int prev_snapshot_id = this.getCurrentSnapShot(argument_id);
		int process_id  = this.getCurrentProcessContext(argument_id);
		int top_goal_id = this.getTopGoalId(prev_snapshot_id);
		int snapshot_id = this.initSnapshot(prev_snapshot_id,top_goal_id); //FIXME
		this.updateProcessContext(process_id,snapshot_id);
		this._Commit(argument_id, process_id, top_goal_id, snapshot_id, args);
	}

	// ProcessContext
	//return ProcessId
	@Public int OpenProcessContext(int argument_id, int process_type, String justification, String commiter_name) {
		int current_snapshot_id = this.getCurrentSnapShot(argument_id); //FIXME
		int ProcessId = this.initProcessContext(current_snapshot_id, process_type, justification, commiter_name);
		this.insertArgumentHasProcessContext(ProcessId,argument_id);
		return ProcessId;
	}

	@Public int CloseProcessContext(int argument_id, int process_id, String justification) {
		//TODO
	}

	@Public int[] GetProcessContextIds(int argument_id) {
		PreparedStatement p = this.db.newPreparedStatement("SELECT `process_context_id` FROM  `argument_has_process_context` WHERE `argument_id`=?");
		p.setInt("@a",argument_id);
		ResultSet r = p.execute();
		int[] ret = [];
		while(r.next()) {
			ret.add(r.getInt("process_context_id"));
		}
		return ret;
	}

	Json _GetSnapshot(ResultSet r) {
		Json json = new Json();
		json.setInt("SnapshotId",r.getInt("id"));
		json.setInt("PrevSnapshotId",r.getInt("prev_snapshot_id"));
		json.setInt("UnixTime",r.getInt("unix_time"));
		//json.setString("CommitMessage",r.getString("commit_message"));
		return json;
	}

	Json GetSnapshot(int[] ids) {
		Json json = new Json([]);
		int i = 0;
		while(i < ids.getSize()) {
			PreparedStatement p = this.db.newPreparedStatement("SELECT id,prev_snapshot_id,unix_time FROM snapshot WHERE id=?");
			p.setInt("@a",ids[i]);
			ResultSet r = p.execute();
			r.next();
			json.add(this._GetSnapshot(r));
			i = i + 1;
		}
		return json;
	}

	@Public int[] GetSnapshotIds(int argument_id) {
		int end_id = this.getCurrentSnapShot(argument_id);
		return this._GetSnapshotList(0, end_id);
	}

	@Public Json GetSnapshotList(int argument_id) {
		int[] arr =  this.GetSnapshotIds(argument_id);
		return this.GetSnapshot(arr);
	}

	//### D-Script
	//return ContextJson
	@Public Json GetContext(int NodeId) {
		Json node = this.GetNode(NodeId);
		Json childIds = node.get("Children");
		int i = 0;
		while(i < childIds.getSize()) {
			Json child = this.GetNode(childIds[i]);
			i = i + 1;
		}
	}

	@Public int Support(int EvidenceNodeId, int ArgumentId, int ProcessId) {
		Json support = new Json();
		support.setString("NodeType","Support");
		support.setInt("ParentNodeId"      , EvidenceNodeId);
		support.setInt("ThisNodeId"        , 0);
		support.setInt("PrevNodeId"        , 0);
		support.setInt("NextNodeId"        , 0);
		support.setInt("BelongedArgumentId", ArgumentId);
		support.set("Children"             , new Json([]));
		support.setString("Description"    , Diagnosis);
		Json attr = new Json();
		support.set("Attributes"           , attr);
		int nodeId = this.CreateNode(ArgumentId, support);
		this.CreateLink(ArgumentId,EvidenceNodeId,nodeId);
		return nodeId;
	}

	@Public int Rebuttal(int EvidenceNodeId, int ArgumentId, int ProcessId, String Diagnosis) {
		Json rebuttal = new Json();
		rebuttal.setString("NodeType","Rebuttal");
		rebuttal.setInt("ParentNodeId"      , EvidenceNodeId);
		rebuttal.setInt("ThisNodeId"        , 0);
		rebuttal.setInt("PrevNodeId"        , 0);
		rebuttal.setInt("NextNodeId"        , 0);
		rebuttal.setInt("BelongedArgumentId", ArgumentId);
		rebuttal.set("Children"             , new Json([]));
		rebuttal.setString("Description"    , Diagnosis);
		Json attr = new Json();
		rebuttal.set("Attributes"           , attr);
		int nodeId = this.CreateNode(ArgumentId,rebuttal);
		this.CreateLink(ArgumentId,EvidenceNodeId,nodeId);
		return nodeId;
	}
}
