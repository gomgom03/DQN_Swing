const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");

let server = app.listen(port, () => {
    console.log(`Listening to port ${port}`);
})

app.get("/", (req, res) => {
    res.render("home.ejs");
})

app.get("/test", (req, res) => {
    res.render("test.ejs");
})

app.get('/rl', (req, res) => {
    res.render("rl.ejs")
})

app.get('/test2', (req, res) => {
    res.render('test2.ejs')
})

app.get('/test3', (req, res) => {
    res.render('test3.ejs')
})

let t1, t2, t3

const io = require('socket.io')(server);

io.on('connection', socket => {
    console.log('socket connected');
    socket.emit('test', {})
    socket.on('testReply', (data) => {
        switch (data) {
            case 1: socket.emit('dqndata', t1);
                break;
            case 2: socket.emit('dqndata', t2);
                break;
            case 3: socket.emit('dqndata', t3);
                break;
            default:
                null
        }
    })
    socket.on('dqnupload', data => {
        console.log(data);
        socket.emit('dqnuploadresponse', data)
    })
})