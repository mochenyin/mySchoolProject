/**
 * Created by SWSD on 2017-03-16.
 */
function indexHeaderController($scope){
    if(sessionStorage.isLogin=='loginIn'){
        var myName=sessionStorage.userName==null?sessionStorage.User:sessionStorage.userName;
        var src='http://olcolkmpd.bkt.clouddn.com/'+sessionStorage.userImg;
        $('#chatH4').html('<a class="indexTab" onclick={window.location="/#/silence/chatPage/memory"}>聊天室</a>');
        $('#userMsg').html('<img id="userImg" data-toggle="modal" data-target="#myModal1" src="'+src+'" width="50px" height="50px"/>' +
            '<span class="glyphicon glyphicon-chevron-down" style="color:white;" data-toggle="dropdown" id="toggleDown"></span>' +
            '  <ul class="dropdown-menu" aria-labelledby="toggleDown"> ' +
            '<li id="toggleToLoginOut"><a ui-sref="/#/silence//index">注销</a></li> ' +
            '</ul>');
        $('#toggleStaute').html('<h4>Hi,'+myName+'</h4>');
    }
    else{
        $('#chatH4').html('<a class="indexTab" onclick={alert("此功能需登录使用,请先登录");window.location="/#/login"}>聊天室</a>');
        $('#userMsg').html('<h4 onclick={window.location="/#/login"}>登录</h4>');
        $('#toggleStaute').html('<h4 onclick={window.location="/#/register"}>注册</h4>')
    }
    $('#toggleToLoginOut').click(function(){
        sessionStorage.isLogin='loginOut';
        $('#userMsg').html('<h4 onclick={window.location="/#/login"}>登录</h4>');
        $('#toggleStaute').html('<h4 onclick={window.location="/#/register"}>注册</h4>')
    });
    //图片裁剪
    $('.image-editor').cropit({//图片裁剪框
        imageBackground: true,
    });
    $('.rotate-cw').click(function () {
        $('.image-editor').cropit('rotateCW');//点击$('.rotate-cw')后图片顺时针旋转
    });
    $('.rotate-ccw').click(function () {
        $('.image-editor').cropit('rotateCCW');//点击$('.rotate-ccw')后图片逆时针旋转
    });
    var formData = new FormData();
    $('.export').click(function () {//点击$('.export')后将对裁剪框中的图片进行裁剪，并获得裁剪后base64编码形式的图片
        var imageData = $('.image-editor').cropit('export');
        if(imageData){
            var newImageData=imageData.split(',')[1];
            imageData = imageData.split(',')[1];
            imageData = window.atob(imageData);
            var ia = new Uint8Array(imageData.length);
            for (var i = 0; i < imageData.length; i++) {
                ia[i] = imageData.charCodeAt(i);
            }
            //canvas.toDataURL 返回的默认格式就是 image/png
            var blob = new Blob([ia], {type: "image/png"});
            formData.append("file", blob,'blob.png');
            formData.append("filePath", imageData);
            var  fSize=formData.get('file').size;
            $.post('/api/getToken',function(res){
                function putb64(){
                    var pic = newImageData;
                    var url = "http://upload-z1.qiniu.com/putb64/"+fSize;//请求的路径
                    var xhr = new XMLHttpRequest();
                    xhr.onreadystatechange=function(){
                        if (xhr.readyState==4){//ajax请求成功
                            let obj=eval('('+xhr.responseText+')');
                            let data={
                                key:obj.key, //上传成功后获取的Key
                                userId:sessionStorage.Key
                            };
                            if(obj.key){
                                $.post('/api/changeUserImg',data,function(respon){//对数据库里该用户的头像字段存储的key值进行修改
                                    console.log(respon);
                                    if(res.text='ok'){
                                        $scope.$apply(function () {
                                            $scope.text = '修改成功';
                                        });
                                        $('#myModal1').modal('hide');
                                        $('#userImg').attr('src','http://olcolkmpd.bkt.clouddn.com/'+respon.data[0].userImg);
                                        sessionStorage.userImg=obj.key;//修改成功后，重写用户头像的sessionStorage
                                    }
                                    else{
                                        $scope.$apply(function () {
                                            $scope.text = respon.text;
                                        });
                                    }
                                })
                            }
                        }
                    };
                    xhr.open("POST", url, true);
                    xhr.setRequestHeader("Content-Type", "application/octet-stream");
                    xhr.setRequestHeader("Authorization", "UpToken "+res.data+"");
                    xhr.setRequestHeader("Access-Control-Allow-Origin","*");
                    xhr.send(pic);
                }
                putb64();
            });
        }
    });
    $('.indexTab').click(function(e){
        $('.indexTab').removeClass('indexActive');
        $(e.target).addClass('indexActive');
    });
    $(document).keydown(function(e){
        let event=e || window.event;
        if(event.keyCode==16){
            $('#title').click(function(){
                $('#myModal2').modal('show')
            });
        }
    });
    console.log('>>>>>',sessionStorage);
}
function checkNumber(){
    let TelNum = $('#account').val();
    let objMsg=$('#accountMsg');
    if(TelNum){
        return true;
    }
    else{
        objMsg.css({display:'inline-block'});
        objMsg.text('邮箱不能为空');
        return false;
    }
}
function getPwd(){
    let PwdNum=$('#password').val();
    let objPwd=$('#passwordMsg');
    if(PwdNum){
        if(PwdNum.length<4||PwdNum.length>16){
            objPwd.css({display:'inline-block'});
            objPwd.text('请输入4-16位的密码');
            return false;
        }
        else{
            objPwd.css({display:'none'});
            return true;
        }
    }
    else{
        objPwd.css({display:'inline-block'});
        objPwd.text('密码不能为空');
        return false;
    }
}
function login() {
    let dat = {
        email: $('#account').val(),
        pwd: hex_md5($('#password').val())
    };
    if(checkNumber()==true&&getPwd()==true){
        $.post('/api/getManagerLogin', dat, function (res) {
            let obj=$('#accountMsg');
            if (res.text == 'ok') {
                sessionStorage.role=res.data[0].role;
                window.location.href = 'mochenyin/managerPage.html';
            } else if(res.text == 'false'){
                obj.css({display:'inline-block'});
                obj.text('权限不足')
            }
            else{
                obj.css({display:'inline-block'});
                obj.text('账户信息有误')
            }
        })
    }
}