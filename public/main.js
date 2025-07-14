// Connect to Socket.IO server
var socket = window.io();
var canvas = document.getElementById('board');
var ctx = canvas.getContext('2d');
var drawing = false;
var last = null;

canvas.addEventListener('mousedown', function (e) {
  drawing = true;
  last = getPos(e);
});
canvas.addEventListener('mouseup', function () {
  drawing = false;
  last = null;
});
canvas.addEventListener('mouseout', function () {
  drawing = false;
  last = null;
});
canvas.addEventListener('mousemove', function (e) {
  if (!drawing) return;
  var pos = getPos(e);
  drawLine(last, pos, true);
  last = pos;
});

function getPos(e) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function drawLine(from, to, emit) {
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();
  if (emit) {
    socket.emit('draw', { from: from, to: to });
  }
}

// Listen for drawing events from others
socket.on('draw', function (data) {
  drawLine(data.from, data.to, false);
});
