<?php

if (!isset($_POST['email']) || !isset($_POST['msg'])) {
  header('Location: /#error');
  exit;
}
mail('bot@tableflip.io', 'Contact form submission', $_POST['email']."\n".$_POST['msg']);
header('Location: /#sent');