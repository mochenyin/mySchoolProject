/**
 * Created by SWSD on 2017-03-03.
 */

var fontStyle=['默认','微软雅黑','楷体','宋体','仿宋_GB2312','楷体_GB2312','隶书','幼圆','华文行楷','方正姚体','华文琥珀','华文新魏'];
var oArray=['#085787','#4FBAB0','lightcoral','#6E2EFF','mediumseagreen','#2092E3','black','grey','#000080'];
function subChatController($scope,roomId){
    // var str = window.location.search.substring(8);
    $.post('/api/getRoomMsg',{roomId:roomId},function(res){
        if(res.text=='ok'){
            var resData=res.data[0];
            $scope.currentRoom=resData.roomName;
            $scope.currentRoomTitle=resData.roomTitle;
            $scope.currentRoomDes=resData.roomDescription;
            $scope.currentRoomImg=resData.roomImg=='none'?'Fi4IIuXEHudX40NOxXQr1FIkHXia':resData.roomImg;
            $scope.currentRoomId=resData.roomId;
        }
    });
    $.post('/api/getAllMsgs',{roomId:roomId},function(res){
        if(res.text=='ok'){
            console.log('data',res.data);
            for(var index in res.data){
                var l=Math.floor(Math.random()*oArray.length);
                res.data[index].bkColor=oArray[l];
                if(!res.data[index].userImg){
                    res.data[index].userImg='Fi4IIuXEHudX40NOxXQr1FIkHXia'
                }
               if(res.data[index].userId==sessionStorage.Key){
                   res.data[index].addCls='myMsgLiMine';
               }
                else{
                   res.data[index].addCls='myMsgLiOther';
               }
            }
        }
        $scope.$apply(function(){
            $scope.myMsgTypeList=res.data;
        })
    });
    $scope.fontStyle=fontStyle;
    $scope.flag=false;
    $scope.toggleFlag=function($event){
        $event.stopPropagation();
        $scope.flag=!$scope.flag;
    };
    $scope.changeFontStyle=function($event){
        $scope.fontFamily='font-family:'+$($event.target).attr('data-fontStyle');
        $scope.flag=false;
    };
    $scope.cancelFlag=function(){
        $scope.flag=false;
    };
    $scope.fontSize='font-size:16px;';
    $scope.fontNumber=16;
    $scope.toggleAdd=function(){
        if($scope.fontNumber<22){
            $scope.fontNumber+=1;
        }
        $scope.fontSize='font-size:'+$scope.fontNumber+'px;';
    };
    $scope.toggleDecrese=function(){
        if($scope.fontNumber>16){
            $scope.fontNumber-=1;
        }
        $scope.fontSize='font-size:'+$scope.fontNumber+'px;';
    };


    var socket= io('http://localhost:8000');//todo:更换服务器ip
    socket.on('open',function(){
        if(sessionStorage.userName==null){
            socket.emit('get name','guest'+sessionStorage.Key,roomId,sessionStorage.userImg,sessionStorage.Key);
        }
        else{
            socket.emit('get name',sessionStorage.userName,roomId,sessionStorage.userImg,sessionStorage.Key);
        }
    });
    socket.on('joinResult',function(json){
       console.log('json',json);
        $scope.$apply(function() {
            $scope.userList = json.roomUser;
        })
    });
    socket.on('systems',function(json){
        if(json.type=='welcome') {
            $scope.$apply(function () {
                $scope.userList = json.roomUser;
            });
            if (json.to == 'self') {
                $('#messages').append($('<li class="systemsMsg">').html('你已成功加入群聊，快跟大家认识一下吧  ' + '<span style="color:grey">' + json.time + '</span>'));
            }
            else {
                $('#messages').append($('<li class="systemsMsg">').html('欢迎' + '<span style="color:blue">' + json.nickName + '</span>' + '加入群聊 ' + '<span style="color:grey">' + json.time + '</span>'));
            }
        }
        else if(json.type==='disconnect'){
            $scope.$apply(function(){
                $scope.userList = json.roomUser;
            });
            $('#messages').append($('<li class="systemsMsg">').html('<span style="color:blue">'+json.nickName+'</span>'+'退出群聊 '+'<span style="color:grey">'+json.time+'</span>'));
        }
    });
//监听服务端的chat message事件，接受每一条消息
    socket.on('chatMsg',function(json){
        var num=Math.floor(Math.random()*oArray.length);
        var color=oArray[num];
        if(json.type=='others'){
            let dat={
                bkColor:color,
                userName:json.userMsg.userName,
                userImg:json.userMsg.userImg,
                add_date:json.time,
                chatMsg:json.chatMessage,
                addCls:'myMsgLiOther'
            };
            $scope.$apply(function(){
                $scope.myMsgTypeList.push(dat);
            });
        }
        else{
            let dat={
                bkColor:color,
                userName:json.userMsg.userName,
                userImg:json.userMsg.userImg,
                add_date:json.time,
                chatMsg:json.chatMessage,
                addCls:'myMsgLiMine'
            };
           $scope.$apply(function(){
               $scope.myMsgTypeList.push(dat);
            });
        }
        $('#myDivContent').scrollTop($('#messages').height());
    });
    var obj=$('#sendMsg');
    obj.keydown(function(e){
        if(e.keyCode===13){
            if(obj.val()){
                socket.emit('chat message',obj.val());
                let data={
                    roomId:roomId,
                    userId:sessionStorage.Key,
                    chatMsg:obj.val()
                };
                $.post('/api/addChatMsg',data,function(res){

                });
                obj.val('');
            }
            else{
                alert('内容不能为空')
            }
        }
    });
    $('.send:eq(0)').click(function(){
        if(obj.val()){
            socket.emit('chat message',obj.val());
            let data={
                roomId:roomId,
                userId:sessionStorage.Key,
                chatMsg:obj.val()
            };
            $.post('/api/addChatMsg',data,function(res){

            });
            obj.val('');
        }
        else{
            alert('内容不能为空')
        }
    })

}

/**
 * Created by SWSD on 2017-03-23.
 */