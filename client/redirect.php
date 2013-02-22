<?php

require_once('config.php');
require_once('utils.php');
require_once('twitteroauth/twitteroauth.php');

session_start();

$oauth = new TwitterOAuth(CONSUMER_KEY, CONSUMER_SECRET);

$requestToken = $oauth->getRequestToken();

$_SESSION['oauth_token'] = $requestToken['oauth_token'];
$_SESSION['oauth_token_secret'] = $requestToken['oauth_token_secret'];

$url = $oauth->getAuthorizeUrl($requestToken['oauth_token'], false);

header('Location: '.$url);
exit;

?>
