/**
 * Created by SWSD on 2017-03-08.
 */
var onlineUserCount=0; //客户端连接数量
var onlineUsers={};//统计客户端登录用户
var currentUser={};
var currentRoom={};
var nickNames={};
var flagIn={};
var flagOut={};
var userMsg={};
var userIdSoc={};
var preDisconnectUser={};
var preDisconnectUserArray={};
var onlineUserId={};
var onlineUserIdArray={};

var allUser=[];
var roomUser={};
var userDetail={};
var roomUserArray={};
var userIds={};
var userIdsArray=[];



function joinRoom(socket,room,userDetail){
    var usersInRoom= $io.sockets.adapter.rooms[room];
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
    }

}

var _webSocket=$io.on('connection',function(socket){
    socket.emit('open');//通知客户端已连接
    socket.on('get name',function(msg,room,userImg,userId){
        nickNames[socket.id]=msg;
        currentRoom[socket.id]=room;
        var imgUrl='http://olcolkmpd.bkt.clouddn.com/'+userImg+'';
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
        socket.emit('chat message',obj1); //发送给自己的消息 ， 如果不想打印自己发送的消息，则注释掉该句。
        socket.broadcast.to(currentRoom[socket.id]).emit('chat message',obj2); //向其他用户发送消息
    });

    socket.on('disconnect',function() {
        if(preDisconnectUser[currentRoom[socket.id]]==undefined){
            preDisconnectUser[currentRoom[socket.id]]=userIds[socket.id]+'';
        }
        else{
            preDisconnectUser[currentRoom[socket.id]]+=';'+userIds[socket.id];
        }
        preDisconnectUserArray[currentRoom[socket.id]]=preDisconnectUser[currentRoom[socket.id]].split(';');
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


var getTime=function(){
    var date = new Date();
    return date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
};
module.export=_webSocket;/**
 * Created by SWSD on 2017-03-23.
 */
