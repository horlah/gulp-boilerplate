var h2 = document.querySelectorAll('h2');
var div = document.querySelectorAll('div');

console.log(div);
h2.forEach(function (h2) {
    h2.innerHTML = 'Check it out';
});
