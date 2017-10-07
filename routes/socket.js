/**
 * Created by waiwai on 17-7-11.
 */

let userCount=0;
let users=[];
module.exports=function(server){
    var io= require('socket.io').listen(server);
    io.on('connection', function(socket) {
        userCount++;
        //用户登录
        socket.on('login',function(userId){
            console.log(userId,"----")
            if(users.indexOf(userId)==-1){ //不存在
                users.push(userId);
                userCount=users.length;
                socket.userId=userId;
                console.log("通知系统登录");
                io.sockets.emit('sys',socket.userId,users,'login');
            }
        });
        //用户断开
        socket.on('disconnect',function(){
          var index= users.indexOf(socket.userId);
          users.splice(index,1);
          userCount--;
          socket.broadcast.emit('sys',socket.userId,users,'logout');
        });

        socket.on('sendMsg',function(msg){
            socket.broadcast.emit('newMsg',socket.userId,msg);
        });
    });

}

