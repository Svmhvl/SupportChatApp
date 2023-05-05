const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botName = 'Chat Support'

//set static folder
app.use(express.static(path.join(__dirname, 'public/public')));

//run when client connects
io.on('connection', socket =>  {
    socket.on('joinroom', ({ username, room}) => {
        const  user = userJoin(socket.id, username, room);

        socket.join(user.room);

      //Welcome current user
      socket.emit("message", formatMessage(botName, `Welcome ${user.username} to ChatSupport`));

      //broadcast when a user connects
      socket.broadcast.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`));

    });

    //Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        io.emit('message', formatMessage(user.username, msg));
    })

     //runs when clients disconnect
     socket.on('disconnect', () => {
        
        io.emit('message', formatMessage(botName, `A user has left the chat`));
    });

});


const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server runnnig on port ${PORT}`));
