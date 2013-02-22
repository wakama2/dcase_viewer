<?php
require_once('config.php');
require_once('utils.php');
session_start();
?>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>D-CASE VIEWER</title>
<link rel="stylesheet" type="text/css" href="lib/codemirror.css"/>
<link rel="stylesheet" type="text/css" href="lib/bootstrap.icons.css"/>
<link rel="stylesheet" type="text/css" href="lib/colorPicker.css"/>
<link rel="stylesheet" type="text/css" href="css/dcase-node.css"/>
<link rel="stylesheet" type="text/css" href="css/viewer.css"/>
<link rel="stylesheet" type="text/css" href="css/sidemenu.css"/>
<link rel="stylesheet" type="text/css" href="css/edit.css"/>
<link rel="stylesheet" type="text/css" href="lib/jquery.ui.autocomplete.css"/>
<style>
body {
	min-height: 480px;
	margin: 0px;
}
#viewer {
	left: 0px;
	top : 0px;
	width : 100%;
	height: 100%;
}
</style>
<script type="text/javascript" src="lib/jquery.min.js"></script>
<script type="text/javascript" src="lib/jquery.mousewheel.min.js"></script>
<script type="text/javascript" src="lib/jquery.ui.autocomplete.js"></script>
<script type="text/javascript" src="lib/jquery.svg.min.js"></script>
<script type="text/javascript" src="lib/jquery.svganim.min.js"></script>
<script type="text/javascript" src="lib/jquery.colorPicker.min.js"></script>
<script type="text/javascript" src="lib/codemirror.js"></script>
<script type="text/javascript" src="lib/storyjs-embed.js"></script>
<script type="text/javascript" src="js/config.js"></script>
<script type="text/javascript" src="js/dcaseviewer.js"></script>
<script type="text/javascript" src="js/dnode.js"></script>
<script type="text/javascript" src="js/dnodeview.js"></script>
<script type="text/javascript" src="js/handler.js"></script>
<script type="text/javascript" src="js/edit.js"></script>
<script type="text/javascript" src="js/api.js"></script>
<script type="text/javascript" src="js/sidemenu.js"></script>
<script type="text/javascript" src="js/animation.js"></script>
<script type="text/javascript">

function getNodeFromServer(id) {
	var res1 = DCaseAPI.call("getArgumentList");
	console.log("get id=" + id);
	var res2 = DCaseAPI.call("getNodeTree", {BelongedArgumentId: id});
	console.log(res2);
	var node = createNodeFromJson(res2);
	return node;
}

function getURLParameter(name) {
	return decodeURI(
		(RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
	);
}

// sorry matz.
var DCase_Viewer;

window.addEventListener("load",function() {
	var id = parseInt(getURLParameter('id'));
	var opts = {};
	var node = null;
	if(id > 0) {
		opts = {
			'argument_id': id
		};
		node = getNodeFromServer(id);
	}
	DCase_Viewer = new DCaseViewer(document.getElementById('viewer'), node, opts);
	ViewerInit(document.body, DCase_Viewer);
	// hide url bar for ipod touch
	setTimeout(function(){
		window.scrollTo(0, 0);
	}, 0);
});
</script>
</head>
<body>
<svg width="0" height="0">
<defs>
	<marker id="Triangle-black" viewBox="0 0 10 10" refX="10" refY="5"
		markerUnits="strokeWidth" markerWidth="15" markerHeight="9" orient="auto">
		<path d="M 0 0 L 10 5 L 0 10 z" fill="gray" stroke="gray"/>
	</marker>
	<marker id="Triangle-white" viewBox="0 0 10 10" refX="10" refY="5"
		markerUnits="strokeWidth" markerWidth="15" markerHeight="9" orient="auto">
		<path d="M 0 0 L 10 5 L 0 10 z" fill="white" stroke="gray"/>
	</marker>
</defs>
</svg>

<div id="viewer"></div>
<div id="timeline"></div>

<div id="toolbar" style="display: none;">
	<a href="#" class="tool-new"><i class="icon-plus"></i></a>
	<a href="#" class="tool-left"><i class="icon-arrow-left"></i></a>
	<a href="#" class="tool-right"><i class="icon-arrow-right"></i></a>
	<a href="#" class="tool-play"><i class="icon-play"></i></a>
	<a href="#" class="tool-up"><i class="icon-circle-arrow-up"></i></a>
	<a href="#" class="tool-down"><i class="icon-circle-arrow-down"></i></a>
	<a href="#" class="tool-remove"><i class="icon-remove"></i></a>
</div>

<div id="menu">
	<div id="menu-search-i" class="menu-i" style="left: 0px;">
		<i class="icon-search"></i>
	</div>
	<div id="menu-search" class="menu-box">
		<p>search query</p>
		<input type="text"></input>
		<ul style="list-style-type: none; overflow: auto;"></ul>
	</div>

	<div id="menu-export-i" class="menu-i" style="left: 40px;">
		<i class="icon-download"></i>
	</div>
	<div id="menu-export" class="menu-box">
		<input id="menu-export-json" type="button" value="export json"></input>
		<input id="menu-export-png"  type="button" value="export png"></input>
		<input id="menu-export-dscript"  type="button" value="export dscript"></input>
	</div>

	<div id="menu-create-i" class="menu-i" style="left: 80px;">
		<i class="icon-plus"></i>
	</div>
	<div id="menu-create" class="menu-box">
<?php
	if (empty($_SESSION['user'])) {
		echo('<p>committer name</p>');
		echo('<input id="argument_committer"></input>');
	} else {
		$img  = h($_SESSION['user']['twitter_profile_image_url']);
		$name = h($_SESSION['user']['twitter_screen_name']);
		echo ('<p><img width="16" height="16" src="'.$img.'" />'.$name.'</p>');
		echo('<input id="argument_committer" type="hidden" value="'.$name.'"></input>');
	}
?>
		<p>descriptions</p>
		<textarea id="argument_description" cols=20 rows=4>Enter new Argument descriptions.  </textarea>
		<button id="menu-create-argument">Create</button>
	</div>

	<div id="menu-tool-i" class="menu-i" style="left: 120px;">
		<i class="icon-list"></i>
	</div>
	<div id="menu-tool" class="menu-box">
		<input id="menu-tool-commit" type="button" value="commit"></input>
	</div>

	<div id="menu-tool-i" class="menu-i" style="left: 160px;">
		<i class="icon-print"></i>
	</div>
	<div id="menu-color-i" class="menu-i" style="left: 200px;">
		<i class="icon-wrench"></i>
	</div>
	<div id="menu-color" class="menu-box">
		<form action="#" method="post">
			<fieldset>
				<div class="controlset">
					<label for="color-goal">Goal</label>
					<input class="colorpicker" id="color-goal" type="text" name="color-goal" value="#333399" /></div>
				<div class="controlset">
					<label for="color-strategy">Strategy</label>
					<input class="colorpicker" id="color-strategy" type="text" name="color-strategy" value="#FF0000" /></div>
				<div class="controlset">
					<label for="color-context">Context</label>
					<input class="colorpicker" id="color-context" type="text" name="color-context" value="#99cc00" /></div>
			</fieldset>
		</form>
<?php
	if (empty($_SESSION['user'])) {
		echo ('<a href="redirect.php"><img src="css/sign-in-with-twitter.png" alt="Sign in with Twitter"/></a>');
	} else {
		$img  = h($_SESSION['user']['twitter_profile_image_url']);
		$name = h($_SESSION['user']['twitter_screen_name']);
		echo ('<p><img width="16" height="16" src="'.$img.'" />'.$name.'</p>');
		echo ('<a href="logout.php">LogOut</a>');
	}

?>

	</div>
</div>

<div id="edit">
	<h1>Type</h1>
	<select></select>
	<h1>Description</h1>
	<textarea rows=4 cols=40></textarea><br>
	<input id="edit-ok" type="button" value="OK"></input>
	<input id="edit-cancel"type="button" value="Cancel"></input>
</div>

</body>
</html>
