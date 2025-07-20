
// ==== Setup ==== //
var socket = window.io();
var canvas = document.getElementById('board');
var ctx = canvas.getContext('2d');
var drawing = false;
var last = null;
var color = '#222';
var username = null;

// ==== Username Modal ==== //
function showUsernameModal() {
  var modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.4)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '9999';

  var box = document.createElement('div');
  box.style.background = '#fff';
  box.style.padding = '32px';
  box.style.borderRadius = '8px';
  box.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
  box.style.textAlign = 'center';

  var label = document.createElement('label');
  label.textContent = 'Enter your name:';
  label.style.display = 'block';
  label.style.marginBottom = '12px';

  var input = document.createElement('input');
  input.type = 'text';
  input.style.padding = '8px';
  input.style.width = '200px';
  input.style.marginBottom = '16px';
  input.maxLength = 20;

  var btn = document.createElement('button');
  btn.textContent = 'Join';
  btn.style.padding = '8px 24px';
  btn.style.background = '#222';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '4px';
  btn.style.cursor = 'pointer';

  btn.onclick = function () {
    var val = input.value.trim();
    if (!val) {
      input.style.border = '2px solid red';
      return;
    }
    username = val;
    socket.emit('set-username', username);
    document.body.removeChild(modal);
  };

  box.appendChild(label);
  box.appendChild(input);
  box.appendChild(btn);
  modal.appendChild(box);
  document.body.appendChild(modal);
  input.focus();
}

window.addEventListener('DOMContentLoaded', function () {
  showUsernameModal();

  // Add user list UI
  var userListDiv = document.createElement('div');
  userListDiv.id = 'userList';
  userListDiv.style.position = 'fixed';
  userListDiv.style.top = '0';
  userListDiv.style.right = '0';
  userListDiv.style.background = 'rgba(255,255,255,0.95)';
  userListDiv.style.padding = '12px 24px';
  userListDiv.style.borderBottomLeftRadius = '12px';
  userListDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
  userListDiv.style.fontFamily = 'sans-serif';
  userListDiv.style.fontSize = '16px';
  userListDiv.style.zIndex = '1000';
  userListDiv.innerHTML = '<b>Connected Users:</b><ul id="userListItems" style="list-style:none;padding-left:0;margin:8px 0 0 0;"></ul>';
  document.body.appendChild(userListDiv);
});

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

// Update user list when received from server
socket.on('user-list', function (users) {
  var ul = document.getElementById('userListItems');
  if (!ul) return;
  ul.innerHTML = '';
  users.forEach(function (u) {
    var li = document.createElement('li');
    if (u === username) {
      li.textContent = u + ' (You)';
      li.style.fontWeight = 'bold';
      li.style.color = '#1976d2';
    } else {
      li.textContent = u;
    }
    ul.appendChild(li);
  });
});
