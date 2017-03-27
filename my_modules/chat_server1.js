/**
 * Created by SWSD on 2017-03-08.
 */
var userFlag=false; //客户端连接数量
var onlineUsers={};//统计客户端登录用户
var namesUsed={};
var currentRoom={};
var nickNames={};
var userMsg={};
var userIdSoc={};
var preDisconnectUser={};
var preDisconnectUserArray={};
var onlineUserId={};
var onlineUserIdArray={};


function joinRoom(socket,room,userMsg,userId){
    socket.leave( currentRoom[ socket.id ] );
    socket.join(room);
    currentRoom[socket.id]=room;
    var usersInRoom= $io.sockets.adapter.rooms[room];
   // var mm=JSON.stringify(userMsg)+';';
    for(var index in usersInRoom.sockets){
        if(index==socket.id){
            if(onlineUsers[room]==undefined||onlineUsers[room].length<1){
                onlineUsers[room]=JSON.stringify(userMsg);
            }
           else{
                if(onlineUserIdArray[room]==undefined){
                    onlineUsers[room]+=';'+JSON.stringify(userMsg);
                }
                else if(onlineUserIdArray[room].indexOf(userId)<0){
                    onlineUsers[room]+=';'+JSON.stringify(userMsg);
                }
            }
        }
    }
    namesUsed[room]=onlineUsers[room].split(';');
    for(var i=0;i<namesUsed[room].length;i++){
        namesUsed[room][i]=JSON.parse(namesUsed[room][i]);
    }
    socket.emit('joinResult',{usersInRoom:usersInRoom,time:getTime(),namesUsed:namesUsed[room],nickName:nickNames[socket.id],room:room,type:'welcome'});
    if(userFlag==false){
        socket.emit('systems',{usersInRoom:usersInRoom,time:getTime(),namesUsed:namesUsed[room],nickName:nickNames[socket.id],room:room,type:'welcome',to:'self'});
        // $io.sockets.sockets[socket.id].emit('system',{usersInRoom:usersInRoom,time:getTime(),namesUsed:namesUsed[room],nickName:nickNames[socket.id],room:room,type:'welcome',to:'self'});  //发送给自己的消息
        socket.broadcast.to(room).emit('systems',{usersInRoom:usersInRoom,time:getTime(),namesUsed:namesUsed[room],nickName:nickNames[socket.id],room:room,type:'welcome',to:'other'});
    }
    else{

    }
    userFlag=true;
}

var _webSocket=$io.on('connection',function(socket){
    socket.emit('open');//通知客户端已连接
    socket.on('get name',function(msg,room,userImg,userId){
        nickNames[socket.id]=msg;
        userIdSoc[socket.id]=userId;
        var imgUrl='http://olcolkmpd.bkt.clouddn.com/'+userImg+'';
         userMsg[socket.id]={
            msg:msg,
            userImg:imgUrl
        };
        joinRoom(socket,room,userMsg[socket.id],userId);
        //将该用户id添加到在线用户列表中，防止因重复连接而导致的消息重复发送
        if(onlineUserId[room]==undefined){
            onlineUserId[room]=userId+'';
        }
        else{
            //todo:修改
            onlineUserId[room]+=';'+userId;
        }
        onlineUserIdArray[room]=onlineUserId[room].split(';');
        //删除待下线列表中该用户的id
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
            userMsg:userMsg[socket.id]
        }; //构建客户端返回的对象
        var obj2={
            type:'others',
            time:getTime(),
            chatMessage:msg,
            userMsg:userMsg[socket.id]
        }; //构建客户端返回的对象
        socket.emit('chat message',obj1); //发送给自己的消息 ， 如果不想打印自己发送的消息，则注释掉该句。
        socket.broadcast.to(currentRoom[socket.id]).emit('chat message',obj2); //向其他用户发送消息


        //io.emit('chat message',msg);
    });

    socket.on('disconnect',function(){
        //将断开连接的用户id添加到待下线用户列表中，如果5秒内重新连接上时则删除该待下线列表中的该用户Id，防止用户操作失误导致的连接断开而下线
        if(preDisconnectUser[currentRoom[socket.id]]==undefined){
            preDisconnectUser[currentRoom[socket.id]]= userIdSoc[socket.id]+'';
        }
        else{
            preDisconnectUser[currentRoom[socket.id]]+=';'+ userIdSoc[socket.id];
        }
            preDisconnectUserArray[currentRoom[socket.id]]=preDisconnectUser[currentRoom[socket.id]].split(';');
        //5秒后如果待下线列表中仍有该用户Id则判断该用户下线了
        setTimeout(function(){
            if(preDisconnectUserArray[currentRoom[socket.id]]!=undefined){
                if(preDisconnectUserArray[currentRoom[socket.id]].indexOf(userIdSoc[socket.id])>=0){

                    onlineUsers[currentRoom[socket.id]]+=';';
                    onlineUsers[currentRoom[socket.id]]=onlineUsers[currentRoom[socket.id]].replace(JSON.stringify(userMsg[socket.id])+';','');
                    onlineUsers[currentRoom[socket.id]]=onlineUsers[currentRoom[socket.id]].substring(0,onlineUsers[currentRoom[socket.id]].length-1);
                    if(onlineUsers[currentRoom[socket.id]].length>0){
                        namesUsed[currentRoom[socket.id]]=onlineUsers[currentRoom[socket.id]].split(';');
                        for(var i=0;i<namesUsed[currentRoom[socket.id]].length;i++){
                            namesUsed[currentRoom[socket.id]][i]=JSON.parse(namesUsed[currentRoom[socket.id]][i]);
                        }
                    }
                    else{
                        namesUsed[currentRoom[socket.id]]=[];
                    }
                    obj={time:getTime(),namesUsed:namesUsed[currentRoom[socket.id]],nickName:nickNames[socket.id],room:currentRoom[socket.id],type:'disconnect'};
                    userFlag=false;
                    //广播用户退出
                    delete nickNames[socket.id];
                    socket.broadcast.to(currentRoom[socket.id]).emit('systems',obj); //用户登录和退出都使用system事件播报
                    //删除待下线列表中该用户Id
                    preDisconnectUser[currentRoom[socket.id]]+=';';
                    preDisconnectUser[currentRoom[socket.id]]=preDisconnectUser[currentRoom[socket.id]].replace(userIdSoc[socket.id]+';','');
                    preDisconnectUser[currentRoom[socket.id]]=preDisconnectUser[currentRoom[socket.id]].substring(0,preDisconnectUser[currentRoom[socket.id]].length-1);
                    if(preDisconnectUser[currentRoom[socket.id]].length>0){
                        preDisconnectUserArray[currentRoom[socket.id]]=preDisconnectUser[currentRoom[socket.id]].split(';');
                    }
                    else{
                        preDisconnectUserArray[currentRoom[socket.id]]=undefined;
                    }
                    //删除在线列表中该用户Id
                    onlineUserId[currentRoom[socket.id]]+=';';
                    var reg = new RegExp( userIdSoc[socket.id]+ ';', 'g');
                    onlineUserId[currentRoom[socket.id]]=onlineUserId[currentRoom[socket.id]].replace(reg,'');
                    onlineUserId[currentRoom[socket.id]]=onlineUserId[currentRoom[socket.id]].substring(0,onlineUserId[currentRoom[socket.id]].length-1);
                    if(onlineUserId[currentRoom[socket.id]].length>0){
                        onlineUserIdArray[currentRoom[socket.id]]=onlineUserId[currentRoom[socket.id]].split(';');
                    }
                    else{
                        onlineUserIdArray[currentRoom[socket.id]]=undefined;
                    }

                }
            }


        },5000);

    });
    
});


var getTime=function(){
    var date = new Date();
    return date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
};
module.export=_webSocket;