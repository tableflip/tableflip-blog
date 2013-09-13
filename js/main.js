jQuery(function ($) {
  $("#main").css("min-height", $(window).height())
  
  if (window.location.hash == "#sent") {
    $("#hire-us").hide()
  } else {
    $("#sent").hide()
  }
})