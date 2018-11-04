var Renderer = require ('./src/render-i');
var renderer;
window.addEventListener('load', () => { main() })

function main() {
    initEvent();
    renderer = Renderer(getOpt());
    setTimeout (() => { tick() }, 200);
}

function initEvent() {

}

function getOpt() {
    var canvas = document.getElementById('canvas');
    canvas.style.background = '#ffffff';
    var ctx = canvas.getContext('2d');
    var opt = {ctx};
    opt.width = canvas.width = 700;
    opt.height = canvas.height = 500;

    var colors = document.getElementsByClassName('color');
    opt.palette = [];
    for (var i = 0; i < colors.length; ++i) {
        opt.palette.push(colors[i].value);
        colors[i].onchange = (e) => { 
            opt.palette[i] = e.target.value;}
    }

    var number_slider = document.getElementById('number');
    number_slider.onchange = (e) => { 
        opt.number = e.target.value; 
        console.log(opt);
    }

    var clear_button = document.getElementById('clear');
    clear_button.onmousedown = () => { renderer.clear(); }
    
    return opt;
}

function tick(){
  renderer.tick();
  window.requestAnimationFrame(tick);
}