var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

mongoose.connect('mongodb://localhost:27017/chat', {
    useNewUrlParser: true
});

const Message = mongoose.model('Message', {
    owner: String, text: String, timestamp: Date
});

var app = express();
var auth = require('./auth');
var session = require('express-session');
app.use(session({
    secret: "mercury",
    pass: "dupa"
}));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules/howler/dist/'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));


app.get("/auth", function(req, res) {
    var error = req.session.error ? "Incorrect password" : "";
    req.session.error = false;
    res.render("user.ejs", {error: error});
});

app.post("/auth", function(req, res) {
    var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : null);
    var user = {
        name: req.body.name,
        ip: ip
    };
    console.log(user);
    if (req.body.password === 'cd8gQQ') {
        req.session.user = user.name;
        res.cookie("user", user);
        res.redirect("/");
    } else {
        req.session.error = true;
        res.redirect("/auth");
    }
});

app.get("/logout", function(req, res) {
    req.session.destroy();
    res.redirect("/auth");
})

app.use(auth);
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
    console.log(req.cookies);
    res.render('index.ejs', {user: req.cookies.user});
});

io.on('connection', function(socket) {
    console.log('a user connected');

    Message.find({}, function(err, messages) {
        socket.emit('update', messages);
    });

    socket.on('chat', function(msg) {
        console.log(msg);
        const message = new Message({
            owner: msg.owner,
            text: msg.text,
            timestamp: Date.now()
        });
        io.emit('chat', message);
        message.save().then(() => console.log('Recorded: ' + msg));
    });

    socket.on('typing', function(user) {
        io.emit('typing', user);
    })
});

http.listen(3000, function() {
    console.log('listening on 3000');
});
