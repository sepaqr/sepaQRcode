var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});


app.get('/sepaqr', function (req, res) {
  var sepaQR = require('./src/sepaqr.js'),
      QRCodep = require('./src/qrcode-patched.js');

  var sepaqr1 = new sepaQR({
    charset: sepaQR.Charset.UTF_8,
    version: '001',
    beneficiaryName: 'Purjehdusseura Bitti ja Paatti Segelsällskapet Bit och Båt juhlat os.1',
    bic: 'NDEAFIHH',
    beneficiaryAccNr: 'FI7331313001000058',
    amountEuro: 1234.99,
    purpose: 'BEXP',
    creditorReference: '',
    remittanceInformation: '140charactersoffreetext140charactersoffreetext140charactersoffreetext140charactersoffreetext140charactersoffreetext140charactersoffreetext14',
    information: 'ReqdExctnDt/2014-01-02 pushing to the last very Z limit'
  });

  var Canvas = require('canvas')
    , canvas = new Canvas(320, 320)
    , ctx = canvas.getContext('2d');
  var code = sepaqr1.makeCodeInto(canvas);
  res.type("png");
  canvas.pngStream().pipe(res);
});

/**
 * Module dependencies.
 */
app.get('/clock', function (req, res) {
var Canvas = require('canvas')
  , canvas = new Canvas(320, 320)
  , ctx = canvas.getContext('2d')
  , fs = require('fs');

function getX(angle) {
  return -Math.sin(angle + Math.PI);
}
function getY(angle) {
  return Math.cos(angle + Math.PI);
}

function clock(ctx){
  var now = new Date();
  ctx.clearRect(0,0,320,320);

  ctx.save();
  ctx.translate(160,160);
  ctx.beginPath();
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#325FA2';
  ctx.fillStyle = '#eeeeee';
  ctx.arc(0,0,142,0,Math.PI*2,true);
  ctx.stroke();
  ctx.fill();

  ctx.strokeStyle = '#000000';
  // Hour marks
  ctx.lineWidth = 8;
  for (var i=0;i<12;i++){
    var x = getX(Math.PI/6*i);
    var y = getY(Math.PI/6*i);
    ctx.beginPath();
    ctx.moveTo(x*100,y*100);
    ctx.lineTo(x*125,y*125);
    ctx.stroke();
  }

  // Minute marks
  ctx.lineWidth = 5;
  for (i=0;i<60;i++){
    if (i%5!=0) {
      var x = getX(Math.PI/30*i);
      var y = getY(Math.PI/30*i);
      ctx.beginPath();
      ctx.moveTo(x*117,y*117);
      ctx.lineTo(x*125,y*125);
      ctx.stroke();
    }
  }

  var sec = now.getSeconds();
  var min = now.getMinutes();
  var hr  = now.getHours();
  hr = hr>=12 ? hr-12 : hr;

  ctx.fillStyle = "black";

  // write Hours
  var x = getX(hr*(Math.PI/6) + (Math.PI/360)*min + (Math.PI/21600)*sec);
  var y = getY(hr*(Math.PI/6) + (Math.PI/360)*min + (Math.PI/21600)*sec);
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(x*-20,y*-20);
  ctx.lineTo(x*80,y*80);
  ctx.stroke();

  // write Minutes
  var x = getX((Math.PI/30)*min + (Math.PI/1800)*sec);
  var y = getY((Math.PI/30)*min + (Math.PI/1800)*sec);

  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(x*-28,y*-28);
  ctx.lineTo(x*112,y*112);
  ctx.stroke();

  // Write seconds
  var x = getX(sec * Math.PI/30);
  var y = getY(sec * Math.PI/30);
  ctx.strokeStyle = "#D40000";
  ctx.fillStyle = "#D40000";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x*-30,y*-30);
  ctx.lineTo(x*83,y*83);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0,0,10,0,Math.PI*2,true);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x*95,y*95,10,0,Math.PI*2,true);
  ctx.stroke();
  ctx.fillStyle = "#555";
  ctx.arc(0,0,3,0,Math.PI*2,true);
  ctx.fill();

  ctx.restore();
}

clock(ctx);


  /*var stream = canvas.createPNGStream();

  stream.pipe(res);*/
  res.type("png");
  canvas.pngStream().pipe(res);
  /*
var out = fs.createWriteStream(__dirname + '/clock.png')
  , stream = canvas.createPNGStream();

stream.on('data', function(chunk){
  out.write(chunk);
});*/

});
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
