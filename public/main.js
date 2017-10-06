const html = document.getElementsByTagName('html')[0]
let scrolled = false

function addClass (el, className) {
  el.className = el.className.split(' ').concat(className).join(' ')
}

function removeClass (el, className) {
  var classes = el.className.split(' ')
  el.className = classes.filter(function (c) {
    return c !== className
  }).join(' ')
}

window.onscroll = function () {
  if (window.scrollY > 0 && !scrolled) {
    addClass(html, 'scrolled')
    scrolled = true
  } else if (window.scrollY <= 0 && scrolled) {
    removeClass(html, 'scrolled')
    scrolled = false
  }
}

document.addEventListener('load', function () {
  setTimeout(function () {
    window.onscroll()
  })
})
