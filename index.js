const express = require('express');
const defaultPort = 8080;
const path = require('path');
const enableKafka = require('./kafka/index');
const get = require('lodash/get');

function getPort() {
    return (
        process.argv
            .filter((a) => a.startsWith('port'))
            .map((val) => Number(val.split(/[ =]+/g)[1] || defaultPort))
            .pop() || defaultPort
    );
}

const port = getPort(); // should be possible to overide the port via console arg
const v = 10; // indicating app version from kubernetes logs

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(express.static('build/public'));

app.get('/api', (req, res) => res.json(process.env)); // test rest api

function random(limit) {
    return Math.floor(Math.random() * (limit + 1));
}

function randomLogin() {
    const zero = ['', '', '', '', 'Extremly', 'Really', 'So', 'Not'];
    const one = [
        'Funny',
        'Stinky',
        'Happy',
        'Weird',
        'Successful',
        'Giant',
        'Lucky',
        'Extreme',
        'Pretty',
        'Supreme',
        'Holly',
    ];
    const two = [
        'Cow',
        'Bacon',
        'Parrot',
        'Hamster',
        'Arnold',
        'Cat',
        'Pirate',
        'Hacker',
        'Gnome',
        'Eminem',
    ];
    return (
        zero[random(zero.length - 1)] +
        one[random(one.length - 1)] +
        two[random(two.length - 1)] +
        random(100)
    );
}

// as we don't have separate persistance service (like redis) we have to introduce local state <- which is not good. 
// With stateless services everything is simpler!
const set = new Set();

if (process.env.KAFKA_ENABLED === 'true') {
    const emitter = enableKafka(io);
    emitter.on('kafkaIncome', (msg) => {
        const data = get(JSON.parse(msg.value), 'packet.data', []);
        if(data[0] === 'userConnected') {
            set.add(data[1]);
        }
        if(data[0] === 'userDisconnected') {
            set.delete(data[1]);
        }
    })
}

/** Chat Websocket logic is here */
const chat = io.of('/api/chat').on('connection', (socket) => {
    const nick = randomLogin();
    set.add(nick);
    socket.emit('message', { msg: 'Welcome #' + nick, currUserId: nick });
    socket.emit('activeUsers', Array.from(set));
    socket.broadcast.emit('message', { msg: nick + ' connected chat' });

    chat.emit('userConnected', nick);

    socket.on('message', (msg) => {
        console.log('message: ' + msg);

        const time = new Date();
        chat.emit('message', {
            msg,
            user: nick,
            time: `${time.getHours()}:${time.getMinutes()}`,
        });
    });

    socket.on('disconnect', () => {
        chat.emit('userDisconnected', nick);
        chat.emit('message', { msg: '~ ' + nick + ' disconnected' });
        console.log('Client disconnected');
    });
});

app.get('*', function (req, res) {
    const fileDirectory = path.resolve(__dirname, '.', 'public/');

    res.sendFile('index.html', { root: fileDirectory });
});

/* Run the application */
server.listen(port, () => console.log('Chat server started...', { port, v }));
