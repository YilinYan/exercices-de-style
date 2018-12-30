// Reference:
// https://github.com/mattdesl/color-wander/blob/master/lib/createRenderer.js#L11

var random = (x, y) => { return Math.random() * (y-x) + x; };
var normalize = ([x, y]) => { var len = Math.sqrt( x*x + y*y );
                                   return [ x/len, y/len ]; };
var add = ([x, y], [a, b]) => { return [ x+a, y+b ]; };
var lerp = (x, y, z) => { return (y-x) * x + x; }

var SimplexNoise = require('simplex-noise'),
    simplex = new SimplexNoise(Math.random),
    noise2d = simplex.noise2D,
    noise3d = simplex.noise3D,
    noise4d = simplex.noise4D;

module.exports = function getRenderer (opt) {
    opt = opt || {};
    var N = opt.number || 20;
    var weight = opt.weight || 20;
    var Width = opt.width || 700;
    var Height = opt.height || 500;
    var palette = opt.palette ||
    ['#000000','#272943', '#fffdd9', '#97afd4', '#ffffff', '#ffffff', '#ffffff'];
    var ctx = opt.ctx;
    var lastTime = Date.now();
    var particles = new Array(N).fill(0).map(() => newParticle());

    return {
        clear,
        tick
    };

    function clear() {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    function newParticle(p) {
        p = p || {}
        p.xy = [random(Width * 0.3, Width * 0.7), random(Height * 0.3, Height * 0.7)]
        p.v = [random(-1, 1), random(-1, 1)];
//        console.log (p.v);
        var rand = random(0, palette.length - 1);
        p.color = palette[ Math.round(rand) ];
        p.speed = random (0, 1);
        p.time = 0;
        p.duration = random(300, 500);
        p.width = random(weight * 0.8, weight * 1.2);
        return p;
    }

    function tick() {
        var nowTime = Date.now();
        particles.forEach (function(p, i) {
            p.time += 1;
            if (p.time > p.duration) {
                p = newParticle(p);
            }
            else{
                var x = p.xy[0];
                var y = p.xy[1];
                var fx = Math.round(x);
                var fy = Math.round(y);
                //var pS = lerp(0.00001, 0.0001, pn.noise (y * 0.01, x * 0.01, p.duration));
                //var angle = pn.noise(x * pS, y * pS, 0) * Math.PI * 2;
                var angle = random(0, 1) * Math.PI * 2;
        //        var angle = pn.noise (fx * 0.1, fy * 0.1, 0) * p.duration * 0.137;
                var lineWidth = //pn.noise( x * 0.05, y * 0.05, nowTime ) *
                                Math.sin (p.time / p.duration * Math.PI)
                                * Math.abs( Math.sin(nowTime / 1000 + p.duration) );
        //        var speed = (1 - lineWidth) * p.speed;
                var speed = Math.min( angle, Math.PI * 2 - angle ) * p.speed;
        //        var speed = p.speed;

                p.v = add( p.v, [ Math.cos(angle) * 0.2, Math.sin(angle) * 0.2] );
            //    console.log (p.v);
                p.v = normalize(p.v);
                p.xy = add( p.xy, p.v.map( (t) => t * speed ) );

                ctx.beginPath();
                ctx.lineTo(x, y);
                ctx.lineTo(p.xy[0], p.xy[1]);
                ctx.lineWidth =  lineWidth * p.width;
                ctx.strokeStyle = p.color;
        //        ctx.lineCap = "square";
                ctx.lineJoin = "square";
                ctx.stroke();
            }
        });
        lastTime = nowTime;
    }
}

