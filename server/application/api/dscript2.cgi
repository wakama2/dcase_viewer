#!/usr/local/bin/konoha

Import("Syntax.JavaStyleClass");
Import("Syntax.GlobalVariable");
Import("Syntax.StringInterpolation");
Import("Syntax.CStyleFor");
Import("Syntax.CStyleWhile");
Import("Syntax.Null");
Import("Type.File");
Import("Type.Json");
Import("Java.String");
Import("JavaScript.Array");
Import("posix.process");
Import("Deos.DCaseCloud");
Load("Http.k");

class Exporter {
    Exporter() {}
    @Virtual void export(Json json) { return; }
}

class JsonExporter extends Exporter {
    JsonExporter() {
        stderr.print("Content-Type: application/json; charset=utf-8\n\n");
    }
    @Override void export(Json json) {
        String ret = json.get("result").toString();
        stderr.print(ret);
    }
}

Json FindById(Json NodeList, int Id) {
    int i, len = NodeList.getSize();
    for (i=0; i < len; i = i + 1) {
        Json node = NodeList.get(i);
        int thisId = node.getInt("ThisNodeId");
        if (thisId == Id) {
            return node;
        }
    }
    return null;
}

class DScriptExporter extends Exporter {
    String string;
    DScriptExporter() {
        stderr.print("Content-Type: application/json; charset=utf-8\n\n");
        string = "";
    }
    @Virtual void emit() {
        stderr.println(this.string);
    }
    void println(String string) {
        this.string = this.string + string + "\n";
    }

    String EmitIndent(int level) {

        int i = 0;
        String indent = "";
        while(i < level) {
            indent = indent + "    ";
            i = i + 1;
        }
        return indent;
    }

    boolean IsGoal(Json node) {
        return  node.getString("NodeType") == "Goal";
    }

    boolean IsStrategy(Json node) {
        return node.getString("NodeType") == "Strategy";
    }

    boolean IsContext(Json node) {
        return node.getString("NodeType") == "Context";
    }

    boolean IsEvidence(Json node) {
        return node.getString("NodeType") == "Evidence";
    }

    void GenerateGoalCode(Json NodeList, int node_id, int level) {
        Json root = FindById(NodeList, node_id);
        Json children = root.get("Children");
        int childrenNum = children.getSize();
        String indent = "";

        if(IsEvidence(root)) {
            String evidence = root.getString("Description");
            indent = EmitIndent(level);
            stderr.print(indent + evidence + "\n");
            return;
        }
        else if(IsGoal(root)) {
            indent = EmitIndent(level);
            stderr.print(indent + "assure " + root.get("Description") + " {\n");
        }
        else if(IsStrategy(root)) {
            indent = EmitIndent(level);
            stderr.print(indent + "strategy " + root.get("Description") + " {\n");
        }
        else if(IsContext(root)) {
            return;
        }
        int i = 0;
        for (i=0; i < childrenNum; i = i + 1) {
            int childId = children.getInt(i);
            GenerateGoalCode(NodeList, childId, level + 1);
        }
        stderr.print(indent + "}\n");
    }

    @Override void export(Json json) {
        Json tree = json.get("result").get("Tree");
        int RootId = tree.getInt("TopGoalId");
        Json NodeList= tree.get("NodeList");
        println("digraph AssuranceScript {");
        int i, j, len = NodeList.getSize();

        String indent = EmitIndent(0);
        Json RootNode = FindById(NodeList,RootId);
        stderr.print("argue " + RootNode.getString("Description") + " {\n");
        Json child = RootNode.get("Children");
        len = child.getSize();
        for (i=0; i < len; i = i + 1) {
            int childId = child.getInt(i);
            GenerateGoalCode(NodeList, childId, 1);
        }
        stderr.print("}\n");
    }
}

void main () {
    String file = System.getenv("QUERY_STRING");
    if(file == "") {
        file = "32.dot";
    }
    String[] a = file.split(".");
    String ext = a.pop();
    int id = a[0] to int;
    Json json = new Json();
    json.setString("jsonrpc", "2.0");
    json.setString("version", "1.0");
    json.setString("method", "getNodeTree");
    Json param = new Json();
    param.setInt("BelongedArgumentId", id);
    json.set("params", param);
    HttpClient client = new CurlHttpClient("http://192.168.59.251/dcase_viewer/cgi/api.cgi");
    Json ret = Json.parse(client.post(json.toString()));
    DScriptExporter export = new DScriptExporter();
    export.export(ret);
}

main();
