//Obsolete in this version.
//Import("Deos.DCaseCloud");
//Import("JavaStyle.Object");
//Import("Type.Json");
////Import("konoha.object");
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
//Evidence makeEvidence(API repo, String description, boolean flag) {
//	Json json = new Json();
//	json.setString("description",description);
//	json.setBoolean("isEvidence",flag);
//	json.setString("type","Evidence");
//	return repo.CreateDBNode(json) as Evidence;
//}
//
//void GenerateTree1(API repo) {
//	DCaseArgument argument = repo.CreateArgument("診断スクリプトが正常に動作する");
//	int id = argument.argument_id;
//
//	DBNode root = repo.GetArgument(id).GetRoot();
//
//	Json json = new Json();
//	json.setString("IP","192.168.0.1");
//	json.setString("PORT","1234");
//	json.setString("DEST","192.168.0.2");
//	repo.AddContext(id, root.node_id, json);
//
//	Strategy s1 = makeStrategy(repo, "レイヤーレベルで議論する");
//	repo.InsertLink(id, root, s1);
//
//	Goal g2_1 = makeGoal(repo, "ネットワークインターフェース層は正常である");
//	repo.InsertLink(id, s1 , g2_1);
//
//	Goal g2_2 = makeGoal(repo, "インターネット層は正常である");
//	repo.InsertLink(id, s1 , g2_2);
//
//	Goal g2_3 = makeGoal(repo, "トランスポート層は正常である");
//	repo.InsertLink(id, s1 , g2_3);
//
//	Goal g2_4 = makeGoal(repo, "アプリケーション層は正常である(名前解決可能である)");
//	repo.InsertLink(id, s1 , g2_4);
//	Evidence e2_4 = makeEvidence(repo, "Nslookup.ds", true);
//	repo.InsertLink(id, g2_4, e2_4);
//
//	Strategy s2 = makeStrategy(repo, "PCや周辺機器の状態により議論する");
//	repo.InsertLink(id, g2_1 , s2);
//
////	Goal g3_1 = makeGoal(repo, "イーサネットケーブルが途切れていない");
////	repo.InsertLink(id, s2, g3_1);
////	Evidence e3_1 = makeEvidence(repo, "人による確認");
////	repo.InsertLink(id, g3_1, e3_1);
//
//	Goal g3_1 = makeGoal(repo, "イーサネットカードが認識されている");
//	repo.InsertLink(id, s2, g3_1);
//	Evidence e3_1 = makeEvidence(repo, "CheckNIC.ds", true);
//	repo.InsertLink(id, g3_1, e3_1);
//
//	Goal g3_2 = makeGoal(repo ,"イーサネットインターフェースが有効になっている");
//	repo.InsertLink(id, s2, g3_2);
//	Evidence e3_2 = makeEvidence(repo, "Connection.ds", true);
//	repo.InsertLink(id, g3_2, e3_2);
//
//	Strategy s3 = makeStrategy(repo, "インターネット層の持つ役割を基に議論する");
//	repo.InsertLink(id, g2_2 , s3);
//
//	Goal g4_1 = makeGoal(repo, "IPアドレスが割り当てられている");
//	repo.InsertLink(id, s3, g4_1);
//	Evidence e4_1 = makeEvidence(repo, "CheckIPAddress.ds", true);
//	repo.InsertLink(id, g4_1, e4_1);
//
//	Goal g4_2 = makeGoal(repo, "ルーティング可能である");
//	repo.InsertLink(id, s3, g4_2);
//
//	Goal g4_3 = makeGoal(repo, "firewall設定によりIPレベルでパケットが破棄されない");
//	repo.InsertLink(id, s3, g4_2);
//
//	Strategy s4 = makeStrategy(repo, "ルーティングテーブルを基に議論する");
//	repo.InsertLink(id, g4_2 , s4);
//
//	Goal g5_1 = makeGoal(repo, "直接ルーティング可能である");
//	repo.InsertLink(id, s4, g5_1);
//	Evidence e5_1 = makeEvidence(repo, "RoutingDirectly.ds", true);
//	repo.InsertLink(id, g5_1, e5_1);
//
//	Goal g5_2 = makeGoal(repo, "ゲートウェイを通してルーティング可能である");
//	repo.InsertLink(id, s4, g5_2);
//	Evidence e5_2 = makeEvidence(repo, "RoutingDefault.ds", true);
//	repo.InsertLink(id, g5_2, e5_2);
//
////	Goal g5_3 = makeGoal(repo, "ルータが壊れていない");
////	repo.InsertLink(id, s4, g5_3);
////	Evidence e5_3 = makeEvidence(repo, "人による確認");
////	repo.InsertLink(id, g5_3, e5_3);
//
//	Strategy s5 = makeStrategy(repo, "INPUT, FORWARD, OUTPUT別に確認する");
//	repo.InsertLink(id, g4_3, s5);
//
//	Goal g6_1 = makeGoal(repo, "INPUTチェーンではパケットを受け入れている");
//	repo.InsertLink(id, s5, g6_1);
//	Evidence e6_1 = makeEvidence(repo, "FirewallIPInput.ds", true);
//	repo.InsertLink(id, g6_1, e6_1);
//
//	Goal g6_2 = makeGoal(repo, "FORWARDチェーンではパケットを受け入れている");
//	repo.InsertLink(id, s5, g6_2);
//	Evidence e6_2 = makeEvidence(repo, "FirewallIPForward.ds", true);
//	repo.InsertLink(id, g6_2, e6_2);
//
//	Goal g6_3 = makeGoal(repo, "OUTPUTチェーンではパケットを受け入れている");
//	repo.InsertLink(id, s5, g6_3);
//	Evidence e6_3 = makeEvidence(repo, "FirewallIPOutput.ds", true);
//	repo.InsertLink(id, g6_3, e6_3);
//
//	Strategy s6 = makeStrategy(repo, "firewall設定を考慮する");
//	repo.InsertLink(id, g2_3, s6);
//
//	Goal g7_1 = makeGoal(repo, "受信するTCPプロトコルのパケットを破棄しない");
//	repo.InsertLink(id, s6, g7_1);
//	Evidence e7_1 = makeEvidence(repo, "FirewallTCPInput.ds", true);
//	repo.InsertLink(id, g7_1, e7_1);
//
//	Goal g7_2 = makeGoal(repo, "中継するTCPプロトコルのパケットを破棄しない");
//	repo.InsertLink(id, s6, g7_2);
//	Evidence e7_2 = makeEvidence(repo, "FirewallTCPForward.ds", true);
//	repo.InsertLink(id, g7_2, e7_2);
//
//	Goal g7_3 = makeGoal(repo, "送信するTCPプロトコルのパケットを破棄しない");
//	repo.InsertLink(id, s6, g7_3);
//	Evidence e7_3 = makeEvidence(repo, "FirewallTCPOutput.ds", true);
//	repo.InsertLink(id, g7_3, e7_3);
//
//	System.p(repo.GetArgument(id).toJson());
//	System.p(repo.GetArgumentIds());
//}
//
//void main() {
//	API repo = new API("dcasedb","dcasedb");
//	GenerateTree1(repo);
//}
//
//main();
