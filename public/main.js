
// ==== Setup ==== //
var socket = window.io();
var canvas = document.getElementById('board');
var ctx = canvas.getContext('2d');
var drawing = false;
var last = null;
var color = '#222';

// ==== UI Handlers ==== //
var colorPicker = document.getElementById('colorPicker');
if (colorPicker) {
  colorPicker.addEventListener('input', function (e) {
    color = e.target.value;
  });
}

var clearBtn = document.getElementById('clearBtn');
if (clearBtn) {
  clearBtn.addEventListener('click', function () {
    socket.emit('clear');
    clearBoard();
  });
}

// ==== Drawing Functions ==== //
function clearBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawLine(from, to, emit, remoteColor) {
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.strokeStyle = remoteColor || color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();
  if (emit) {
    socket.emit('draw', { from: from, to: to, color: color });
  }
}

// ==== Utility Functions ==== //
function getPos(e) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function getTouchPos(e) {
  var rect = canvas.getBoundingClientRect();
  var touch = e.touches[0] || e.changedTouches[0];
  return {
    x: (touch.clientX - rect.left) * (canvas.width / rect.width),
    y: (touch.clientY - rect.top) * (canvas.height / rect.height)
  };
}

// ==== Mouse Events ==== //
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

// ==== Touch Events ==== //
canvas.addEventListener('touchstart', function (e) {
  e.preventDefault();
  drawing = true;
  last = getTouchPos(e);
});
canvas.addEventListener('touchend', function (e) {
  e.preventDefault();
  drawing = false;
  last = null;
});
canvas.addEventListener('touchcancel', function (e) {
  e.preventDefault();
  drawing = false;
  last = null;
});
canvas.addEventListener('touchmove', function (e) {
  e.preventDefault();
  if (!drawing) return;
  var pos = getTouchPos(e);
  drawLine(last, pos, true);
  last = pos;
});

// ==== Socket Events ==== //
socket.on('draw', function (data) {
  drawLine(data.from, data.to, false, data.color);
});

socket.on('clear', function () {
  clearBoard();
});
