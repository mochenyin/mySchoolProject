/**
 * Created by SWSD on 2017-03-08.
 */
var onlineUserCount=0; //客户端连接数量
var onlineUsers={};//统计客户端登录用户
var currentUser={};//用来存放当前连接的用户信息
var currentRoom={};//存放当前房间信息
var nickNames={};//存放当前房间的所有用户昵称
var flagIn={};//用户进入房间标识
var flagOut={};//用户退出房间标识
var userMsg={};//存放用户消息
var userIdSoc={};//用户Socket.id
var preDisconnectUser={};//当前预退出房间的用户
var preDisconnectUserArray={};//所有预退出房间的用户
var onlineUserId={};//存放当前在线用户id
var onlineUserIdArray={};//存放所有在线用户id
var allUser=[];//所有用户
var roomUser={};//当前房间用户（字符串）
var userDetail={};//用户具体信息
var roomUserArray={};//当前房间用户（数组）
var userIds={};//用户Id(字符串)
var userIdsArray=[];//用户Id（数组）



function joinRoom(socket,room,userDetail){//加入房间
    var usersInRoom= $io.sockets.adapter.rooms[room];//获取该房间的所有连接
    console.log('usersInRoom1',usersInRoom);
    if(!usersInRoom){
        console.log('-1');
        socket.join(room);
    }
    else{
        console.log('-2');
            for(var index in usersInRoom.sockets){
                if(userIds[index]!=userDetail.userId){
                    console.log('-2.1');
                }
                else{
                    console.log('-2.2');
                    userIdSoc[index].leave(room);
                }
        }
            socket.join(room);
    }
    usersInRoom= $io.sockets.adapter.rooms[room];
    console.log('usersInRoom2',usersInRoom);
    console.log('socket.id',socket.id);
        for(var index1 in usersInRoom.sockets) {
            if (index1 == socket.id) {
                if (roomUserArray[room] == undefined || roomUserArray[room].length < 1) {
                    roomUser[room] = JSON.stringify(userDetail);
                    flagIn[socket.id]=1;
                    console.log('2.1');
                }
                else if (roomUser[room].indexOf(JSON.stringify(userDetail)) ==-1) {
                    roomUser[room] += ';' + JSON.stringify(userDetail);
                    flagIn[socket.id]=1;
                    console.log('2.2');
                }
            }
        }
    roomUserArray[room] = roomUser[room].split(';');
    for (var i = 0; i < roomUserArray[room].length; i++) {
        roomUserArray[room][i] = JSON.parse(roomUserArray[room][i]);
    }
    socket.emit('joinResult',{roomUser:roomUserArray[room],time:getTime()});
    if(flagIn[socket.id]==1){
        socket.emit('systems',{roomUser:roomUserArray[room],time:getTime(),nickName:nickNames[socket.id],room:room,type:'welcome',to:'self'});
        socket.broadcast.to(room).emit('systems',{roomUser:roomUserArray[room],time:getTime(),nickName:nickNames[socket.id],room:room,type:'welcome',to:'other'});
        //给除了自己以外的客户端广播消息
    }
}
//每一个连接都有唯一标识的key
var _webSocket=$io.on('connection',function(socket){//监听客户端连接,回调函数会传递本次连接的socket
    socket.emit('open');//给该socket的客户端发送消息//通知客户端已连接
    socket.on('get name',function(msg,room,userImg,userId){//监听客户端发送的信息
        nickNames[socket.id]=msg;
        currentRoom[socket.id]=room;
        var imgUrl=userImg+'';
        userDetail[socket.id]={
                userId:userId,
                userImg:imgUrl,
                userName:msg
        };
        userIdSoc[socket.id]=socket;
        userIds[socket.id]=userId;
        joinRoom(socket,room,userDetail[socket.id]);
        if(preDisconnectUser[room]!=undefined){
            preDisconnectUser[room]+=';';
            var regExpMsg=new RegExp(userId+';','g');
            preDisconnectUser[room]=preDisconnectUser[room].replace(regExpMsg,'');
            preDisconnectUser[room]=preDisconnectUser[room].substring(0,preDisconnectUser[room].length-1);
            if(preDisconnectUser[room].length>0){
                preDisconnectUserArray[room]=preDisconnectUser[room].split(';');
            }
            else{
                preDisconnectUserArray[room]=undefined;
            }
        }
    });
    //构造客户端对象
    //监听客户端的chat message事件， 该事件由客户端触发
    //当服务端收到消息后，再把该消息播放出去，继续触发chat message事件， 然后在客户端监听chat message事件。
    socket.on('chat message',function(msg){
        var obj1={
            type:'self',
            time:getTime(),
            chatMessage:msg,
            userMsg:userDetail[socket.id]
        }; //构建客户端返回的对象
        var obj2={
            type:'others',
            time:getTime(),
            chatMessage:msg,
            userMsg:userDetail[socket.id]
        }; //构建客户端返回的对象
        socket.emit('chatMsg',obj1); //发送给自己的消息 ， 如果不想打印自己发送的消息，则注释掉该句。
        socket.broadcast.to(currentRoom[socket.id]).emit('chatMsg',obj2); //向其他用户发送消息
    });

    socket.on('disconnect',function() {//用户断开连接后执行的操作
        //将断开连接的用户id添加到待下线用户列表中，如果5秒内重新连接上时则删除该待下线列表中的该用户Id，防止用户操作失误导致的连接断开而下线
        if(preDisconnectUser[currentRoom[socket.id]]==undefined){
            preDisconnectUser[currentRoom[socket.id]]=userIds[socket.id]+'';
        }
        else{
            preDisconnectUser[currentRoom[socket.id]]+=';'+userIds[socket.id];
        }
        preDisconnectUserArray[currentRoom[socket.id]]=preDisconnectUser[currentRoom[socket.id]].split(';');
        //3秒后如果待下线列表中仍有该用户Id则判断该用户下线了
        setTimeout(function(){
            if(preDisconnectUserArray[currentRoom[socket.id]]!=undefined){
                if(preDisconnectUserArray[currentRoom[socket.id]].indexOf(userIds[socket.id])>=0){
                roomUser[currentRoom[socket.id]]+=';';
                roomUser[currentRoom[socket.id]]=roomUser[currentRoom[socket.id]].replace(JSON.stringify(userDetail[socket.id])+';','');
                if(roomUser[currentRoom[socket.id]].length>0){
                    roomUser[currentRoom[socket.id]]=roomUser[currentRoom[socket.id]].substring(0,roomUser[currentRoom[socket.id]].length-1);
                    roomUserArray[currentRoom[socket.id]]=roomUser[currentRoom[socket.id]].split(';');
                    for(var i=0;i<roomUserArray[currentRoom[socket.id]].length;i++){
                        roomUserArray[currentRoom[socket.id]][i]=JSON.parse(roomUserArray[currentRoom[socket.id]][i]);
                    }
                }
                socket.leave(currentRoom[socket.id]);
               var newUsersInRoom= $io.sockets.adapter.rooms[currentRoom[socket.id]];
                console.log('usersInRoom3',newUsersInRoom);
                socket.broadcast.to(currentRoom[socket.id]).emit('systems',{roomUser:roomUserArray[currentRoom[socket.id]],time:getTime(),nickName:nickNames[socket.id],room:currentRoom[socket.id],type:'disconnect'});
                    if(preDisconnectUser[currentRoom[socket.id]]!=undefined){
                        preDisconnectUser[currentRoom[socket.id]]+=';';
                        var regExpMsg=new RegExp(userIds[socket.id]+';','g');
                        preDisconnectUser[currentRoom[socket.id]]=preDisconnectUser[currentRoom[socket.id]].replace(regExpMsg,'');
                        preDisconnectUser[currentRoom[socket.id]]=preDisconnectUser[currentRoom[socket.id]].substring(0,preDisconnectUser[currentRoom[socket.id]].length-1);
                        if(preDisconnectUser[currentRoom[socket.id]].length>0){
                            preDisconnectUserArray[currentRoom[socket.id]]=preDisconnectUser[currentRoom[socket.id]].split(';');
                        }
                        else{
                            preDisconnectUserArray[currentRoom[socket.id]]=undefined;
                        }
                    }
            }
            }
        },3000);
    })
});


function checkTime(time){
    if(time<10){
       time='0'+time;
    }
        return time;
}
var getTime=function(){
    var date = new Date();
    return checkTime(date.getHours())+":"+checkTime(date.getMinutes())+":"+checkTime(date.getSeconds());
};
module.export=_webSocket;/**
 * Created by SWSD on 2017-03-23.
 */
