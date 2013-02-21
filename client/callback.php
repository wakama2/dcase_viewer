<?php

require_once('config.php');
require_once('utils.php');
require_once('twitteroauth/twitteroauth.php');

session_start();

$oauth = new TwitterOAuth(CONSUMER_KEY, CONSUMER_SECRET, $_SESSION['oauth_token'], $_SESSION['oauth_token_secret']);

$accessToken = $oauth->getAccessToken($_GET['oauth_verifier']);

$me = $oauth->get('account/verify_credentials');

session_regenerate_id(true);
$_SESSION['user'] = array(
        'twitter_screen_name' => ($me->screen_name),
        'twitter_profile_image_url' => ($me->profile_image_url),
);

jump('/');

?>
