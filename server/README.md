# DCase Cloud
---
##開発環境
* Ubuntu 12.04(amd64)
* konoha3

##必要なライブラリ
* MySQL

##必要なソフトウェア
* Apache

データ構造
===============

* NodeId   ユニークなノードId
* ArgumentId ユニークなツリーのId
* TimeLineId タイムラインID   t1 < t2 コミットしたときにつく
* ProcessId
* ProcessContext
* Node ノード情報を格納するJSON
* ContextJson Context をKeyValue化したJSON


API(仮なので、今後多大に変更します)
================

### ProcessContext
* ProcessId OpenProcessContext(ArgumentId, ProcessType , CommiterName);
* ProcessId CloseProcessContext(ArgumentId, ProcessId, String Justification);
* ProcessId[] GetProcessContextIds(ArgumentId)

### Node Operation
* Node GetNode(NodeId) //子ノードなし
* Node[] GetNodeTree(NodeId) //最新版の子ノード付き
* GetNodeTree(NodeId, TimeLineId timeStart, TImeLineId timeEnd);

//新しいNodeIdを返す
* NodeId Replace(OldNodeId, NewNodeTree, ProcessId);
* NodeId Add(ParentNodeId, ChildNodeTree, ProcessId);
* NodeId DeleteLink(ParentNodeId, TargetNode, ProcessId);
* NodeId NewLink(ParentNodeId, TargetNodeId, ProcessId);
* NodeId Create(NodeType, String Description, ProcessId); //外部APIとしては不要?

### Find
* NodeId[] FindNodeFrom(NodeType, NodeIdSearchFrom)
* NodeId[] FindNodeByDescription(SearchText)
* NodeId[] FindContextByProperty(SearchText)

### D-Script
* ContextJson GetContext(NodeId)
* void Support(EvidenceNodeId, ProcessId)
* void Rebuttal(EvidenceNodeId, ProcessId, String Diagnosis)
* TODO D-Script班に追加してもらう

### TimeLine
* TimeLine[] GetAllTimeLine(ArgumentId)
* TimeLine[] GetTimeLineByProcessId(ProcessId)
* TimeLine[] GetTimeLine(TimeLineId timeStart, TimeLineId)
* TimeLine[] GetTimeLine(TimeLineId timeStart) //timeStartから最新まで

### その他
* NodeId[] GetArgumentsIdList() //TopGoalのIdのリストを返す

## Usage
test/ ディレクトリ参照<br>
misc/DCaseCloud.sql ... DCaseDBのテーブル作成用クエリ<br>
misc/rm.sql          ... DBのデータ削除用クエリ(not working)<br>
misc/init.sql        ... DCaseDBのテーブル初期化用クエリ<br>
