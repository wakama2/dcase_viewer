//Obsolete
//Import("Deos.DCaseCloud");
//Import("JavaStyle.Object");
//Import("Type.Json");
//
//Strategy makeStrategy(API repo, String description) {
//	Json json = new Json();
//	json.setString("description",description);
//	json.setString("type","Strategy");
//	return repo.CreateDBNode(json) as Strategy;
//}
//
//Goal makeGoal(API repo, String description) {
//	Json json = new Json();
//	json.setString("description",description);
//	json.setString("type","Goal");
//	return repo.CreateDBNode(json) as Goal;
//}
//
//Evidence makeEvidence(API repo, String description) {
//	Json json = new Json();
//	json.setString("description",description);
//	json.setString("type","Evidence");
//	return repo.CreateDBNode(json) as Evidence;
//}
//
//void GenerateTree1(API repo) {
//	DCaseArgument argument = repo.CreateArgument("サービスが正常に運用できる");
//	int id = argument.argument_id;
//
//	DBNode root = repo.GetArgument(id).GetRoot();
//
//	Json json = new Json();
//	json.setString("IP","192.168.0.1");
//	json.setString("PORT","1234");
//	repo.AddContext(id, root.node_id, json);
//
//	Strategy s1 = makeStrategy(repo, "各種スクリプトで議論する");
//	repo.InsertLink(id, root, s1);
//
//	Goal g2_1 = makeGoal(repo, "サービスに関わるスクリプトが正常に動作する");
//	repo.InsertLink(id, s1 , g2_1);
//
//	Goal g2_2 = makeGoal(repo, "障害対応に関わるスクリプトが正常に動作する");
//	repo.InsertLink(id, s1 , g2_2);
//
//	Strategy s3 = makeStrategy(repo, "モニタリング／診断／対応のそれぞれについて議論する");
//	repo.InsertLink(id, g2_2 , s3);
//
//	Goal g4_1 = makeGoal(repo, "モニタリングスクリプトが正常に動作する");
//	repo.InsertLink(id, s3, g4_1);
//
//	Goal g4_2 = makeGoal(repo, "診断スクリプトが正常に動作する");
//	repo.InsertLink(id, s3, g4_2);
//
//	Goal g4_3 = makeGoal(repo, "対応スクリプトが正常に動作する");
//	repo.InsertLink(id, s3, g4_3);
//
//	Evidence e5_1 = makeEvidence(repo, "D-Script:再起動が正常に動作する");
//	repo.InsertLink(id, g4_3, e5_1);
//
//	System.p(repo.GetArgument(id).toJson());
//	System.p(repo.GetArgumentIds());
//}
//
//void GenerateTree2(API repo) {
//	DCaseArgument argument = repo.CreateArgument("D-Scriptが正常に動作する");
//	int id = argument.argument_id;
//
//	DBNode root = repo.GetArgument(id).GetRoot();
//
//	//Json parent = new Json();
//	//Json child = new Json();
//	//child.setString("Name","再起動が正常に動作する");
//	//child.setString("Script","sudo shutdown -r now");
//	//parent.set("D-Script", child);
//	//repo.AddContext(id, root.node_id, parent);
//
//	Json json = new Json();
//	json.setString("D-Script.Name","再起動が正常に動作する");
//	json.setString("D-Script.Script","sudo shutdown -r now");
//	repo.AddContext(id, root.node_id, json);
//
//	Strategy s1 = makeStrategy(repo, "事前状態／事後状態で議論する");
//	repo.InsertLink(id, root, s1);
//
//	Goal g2_1 = makeGoal(repo, "事前にWebサーバが正常に動作している");
//	repo.InsertLink(id, s1, g2_1);
//
//	Goal g2_2 = makeGoal(repo, "事後にWebサーバが正常に動作している");
//	repo.InsertLink(id, s1, g2_2);
//
//	Evidence e3_1 = makeEvidence(repo, "D-Script:Webサーバが正常に動作している");
//	repo.InsertLink(id, g2_1, e3_1);
//	repo.InsertLink(id, g2_2, e3_1);
//
//	System.p(repo.GetArgument(id).toJson());
//	System.p(repo.GetArgumentIds());
//}
//
//void GenerateTree3(API repo) {
//	DCaseArgument argument = repo.CreateArgument("D-Scriptが正常に動作する");
//	int id = argument.argument_id;
//
//	DBNode root = repo.GetArgument(id).GetRoot();
//
//	//Json parent = new Json();
//	//Json child = new Json();
//	//child.setString("Name","Webサーバが正常に動作している");
//	//child.setString("Script","telnet $`IP` $`PORT`");
//	//parent.set("D-Script", child);
//	//repo.AddContext(id, root.node_id, child);
//
//	Json json = new Json();
//	json.setString("D-Script.Name","Webサーバが正常に動作している");
//	json.setString("D-Script.Script","telnet $`IP` $`PORT`");
//	repo.AddContext(id, root.node_id, json);
//
//	System.p(repo.GetArgument(id).toJson());
//	System.p(repo.GetArgumentIds());
//}
//
//void main() {
//	API repo = new API("dcasedb","dcasedb");
//	GenerateTree1(repo);
//	GenerateTree2(repo);
//	GenerateTree3(repo);
//}
//
//main();
