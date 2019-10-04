var socket = io();

var receivedSound = new Howl({
    src: ['drone_msg.ogg']
});

var receivedSound2 = new Howl({
    src: ['drone_msg2.ogg']
});

socket.on("chat", (msg) => {
    newMsg(msg);
    if(Math.floor(Math.random() * 2) === 0) {
        receivedSound.play();
    } else {
        receivedSound2.play();
    }
});

socket.on("update", update);

function update(messages) {
    messages.map((msg) => {
        newMsg(msg);
    });
}

socket.on("typing", (user) => {
    var cont = document.querySelector("#messages");

    if(cont.firstChild.className === "typing-ph" || user === userName) {
        return;
    }

    var div = document.createElement('div');
    div.className = "typing-ph";
    div.innerHTML = "<p>" + user + " is typing...</p>";
    cont.insertBefore(div, cont.firstChild);
    var t = setTimeout(() => {
        div.remove();
    }, 500);
})

function getNiceDate(dateString) {
    let date = new Date(dateString);
    let niceDate = 
    ('0' + date.getDate()).slice(-2) + "-" + 
    ('0' + (date.getMonth() + 1)).slice(-2) + "-" + 
    date.getFullYear() + " " + 
    ('0' + date.getHours()).slice(-2) + ":" + 
    ('0' + date.getMinutes()).slice(-2) + ":" + 
    ('0' + date.getSeconds()).slice(-2);
    
    return niceDate;
}

function newMsg(msg) {
    var cont = document.querySelector("#messages");
    var div = document.createElement('div');
    div.className = "ui message massive";
    if (msg.owner === userName) {
        div.className += " teal";
    } else {
        div.className += " blue";
    }
    var niceDate = getNiceDate(msg.timestamp);
    div.innerHTML = "<p class=\"timestamp\"><span class=\"owner\">" + msg.owner + "</span> " + niceDate + "</p><p>" + msg.text + "</p>";
    div.style.cssText = "display: none";
    cont.insertBefore(div, cont.firstChild);
    div.style.cssText = "";
}

function send() {
    var text = document.querySelector("input");
    if (text.value.length != 0) {
        cleanText = text.value.replace(/<[^>]*>?/gm, '');
        socket.emit('chat', { owner: userName, text: cleanText});
        text.value = "";
    }
}

function keyup(e) {
    if (e.keyCode == 13) send();
}

function onTyping(e) {
    console.log('typing...');
    socket.emit('typing', userName);
}