#!/usr/local/bin/konoha

Import("Syntax.JavaStyleClass");
Import("Syntax.StringInterpolation");
Import("Syntax.CStyleFor");
Import("Syntax.Null");
Import("Type.File");
Import("Type.Json");
Import("Java.String");
Import("JavaScript.Array");
Import("posix.process");
Load("Http.k");

class Exporter {
    Exporter() {}
    @Virtual void export(Json json) { return; }
}

class JsonExporter extends Exporter {
    JsonExporter() {
        stdout.print("Content-Type: application/json; charset=utf-8\n\n");
    }
    @Override void export(Json json) {
        String ret = json.get("result").toString();
        stdout.print(ret);
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

class DotExporter extends Exporter {
    String string;
    DotExporter() {
        stdout.print("Content-Type: application/json; charset=utf-8\n\n");
        string = "";
    }
    @Virtual void emit() {
        stdout.println(this.string);
    }
    void println(String string) {
        this.string = this.string + string + "\n";
    }
    @Override void export(Json json) {
        Json tree = json.get("result").get("Tree");
        int RootId = tree.getInt("TopGoalId");
        Json NodeList= tree.get("NodeList");
        println("digraph AssuranceScript {");
        int i, len = NodeList.getSize();
        for (i=0; i < len; i = i + 1) {
            Json node = NodeList.get(i);
            int thisId = node.getInt("ThisNodeId");
            String type = node.getString("NodeType");
            String shape = "rect";
            String prefix = "";
            if (type == "Goal") {
                shape = "rect";
                prefix = "G";
            }
            else if (type == "Context") {
                shape = "circle";
                prefix = "C";
            }
            else if (type == "Strategy") {
                shape = "parallelogram";
                prefix = "S";
            }
            else if (type == "Evidence") {
                shape = "box";
                prefix = "E";
            } else {
                continue;
            }
            String desc = node.getString("Description");
            println("  ${thisId}[hieght=1.0,shape=${shape},label=\"${prefix}${thisId}\\n${desc}\"]");
        }

        for (i=0; i < len; i = i + 1) {
            Json node = NodeList.get(i);
            int j, thisId = node.getInt("ThisNodeId")
            Json child = node.get("Children");
            int[] same = [thisId];
            int[] down = [];
            for (j=0; j < child.getSize(); j = j + 1) {
                int childId = child.getInt(j);
                println("  " + thisId + " -> " + childId + ";");
                String type = FindById(NodeList, childId).getString("NodeType");
                if (type == "Goal") {
                    down.add(childId);
                }
                else if (type == "Context") {
                    same.add(childId);
                }
                else if (type == "Strategy") {
                    down.add(childId);
                }
                else if (type == "Evidence") {
                    down.add(childId);
                }
            }
            if (same.getSize() >= 2) {
                println("  {/*same*/");
                println("    rank = same");
                for (j=0; j < same.getSize(); j = j + 1) {
                    println("    ${same.get(j)}");
                }
                println("  }");
            }
            if (down.getSize() > 1) {
                println("  {/*down*/");
                println("    rank = same");
                for (j=0; j < down.getSize(); j = j + 1) {
                    println("    ${down.get(j)}");
                }
                println("  }");
            }

        }
        println("}");
        emit();
    }
}

class DScriptExporter extends Exporter {
    String string;
    DScriptExporter() {
        stdout.print("Content-Type: text/plain; charset=utf-8\n\n");
        string = "";
    }
    @Virtual void emit() {
        stdout.println(this.string);
    }
    void println(String string) {
        this.string = this.string + string + "\n";
    }

    String EmitIndent(int level) {
        int i = 0;
        String indent = "";
        for (i=0; i < level; i = i + 1) {
            indent = indent + "    ";
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
            stdout.print(indent + evidence + "\n");
            return;
        }
        else if(IsGoal(root)) {
            indent = EmitIndent(level);
            stdout.print(indent + "assure " + root.get("Description") + " {\n");
        }
        else if(IsStrategy(root)) {
            indent = EmitIndent(level);
            stdout.print(indent + "strategy " + root.get("Description") + " {\n");
        }
        else if(IsContext(root)) {
            return;
        }
        int i = 0;
        for (i=0; i < childrenNum; i = i + 1) {
            int childId = children.getInt(i);
            GenerateGoalCode(NodeList, childId, level + 1);
        }
        stdout.print(indent + "}\n");
    }

    @Override void export(Json json) {
        Json tree = json.get("result").get("Tree");
        int RootId = tree.getInt("TopGoalId");
        Json NodeList= tree.get("NodeList");
        println("digraph AssuranceScript {");
        int i, j, len = NodeList.getSize();

        String indent = EmitIndent(0);
        Json RootNode = FindById(NodeList,RootId);
        stdout.print("argue " + RootNode.getString("Description") + " {\n");
        Json child = RootNode.get("Children");
        len = child.getSize();
        for (i=0; i < len; i = i + 1) {
            int childId = child.getInt(i);
            GenerateGoalCode(NodeList, childId, 1);
        }
        stdout.print("}\n");
    }
}

void main () {
    String file = System.getenv("QUERY_STRING");
    if(file == "") {
        file = "32.json";
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

    HttpClient client = new CurlHttpClient("http://www.ubicg.ynu.ac.jp/dcase_viewer/cgi/api.cgi");
    Json ret = Json.parse(client.post(json.toString()));
    Exporter export = null;
    if (ext == "dot") {
        export = new DotExporter();
    } else if (ext == "json") {
        export = new JsonExporter();
    } else if (ext == "dscript") {
        export = new DScriptExporter();
    }
    if (export == null) {
        export = new JsonExporter();
    }
    export.export(ret);
}

main();
