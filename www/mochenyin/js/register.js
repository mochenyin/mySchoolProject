/**
 * Created by SWSD on 2017-02-23.
 */
function registerController($scope){
    let type=false;
    let str;
    $scope.getRandomNum=function(){
        var Array=[0,1,2,3,4,5,6,7,8,9];
        let a1=Math.floor(Math.random()*10);
        let a2=Math.floor(Math.random()*10);
        let a3=Math.floor(Math.random()*10);
        let a4=Math.floor(Math.random()*10);
        return  Array[a1].toString()+Array[a2]+Array[a3]+Array[a4];
    };
    $scope.setTime=function(){
        let btn=document.getElementById('btn');
        if($('#number').val()&&$scope.checkTelNumber()==true){
            str=$scope.getRandomNum();
            let dat={
                recipient:$('#number').val(),
                subject:'欢迎注册莫沉吟的网站',
                html:'<h1>你的邮箱验证码为：'+str+'，此验证码10分钟内有效</h1>',
            };
            $.post('/api/checkMailMsg',dat,function(res){
                if(res.text=='ok'){

                }
            });
            var countdown=60;
            setTimeout(function(){
                type=true;
                str='a';
            },600000);
            var timer=setInterval(function() {
                if (countdown == 0) {
                    clearInterval(timer);
                    btn.removeAttribute("disabled");
                    btn.value="免费获取验证码";
                    countdown = 60;
                } else {
                    btn.setAttribute("disabled", true);
                    btn.value="重新发送(" + countdown + ")";
                    countdown--;
                }
            },1000);
        }
        else{
            $scope.text='请填写您的邮箱';
            boxshow();
            return false;
        }
    };
    $scope.catchMsg=function(){
        let  checkMsg=$('#checkMgs');
        if($('#checkInput').val()){
            if($('#checkInput').val()==str){
                checkMsg.css({display:'none'});
                return true;
            }
            else{
                checkMsg.css({display:'inline-block',color:'red'});
                checkMsg.text('验证码有误或已过期');
                return false;
            }
        }
        else{
            checkMsg.css({display:'inline-block',color:'red'});
            checkMsg.text('请输入验证码');
            return false;
        }
    };
    $scope.checkTelNumber=function(){
        let TelNum = $('#number').val();
        let reg = "^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$";
        let re = new RegExp(reg);
        let objMsg=$('#numMgs');
        if(TelNum){
            if (re.test(TelNum)) {
                objMsg.css({display:'none'});
                return true;
            }
            else {
                objMsg.css({display:'inline-block',color:'red'});
                objMsg.text('请输入正确的邮箱');
                return false;
            }
        }
        else{
            objMsg.css({display:'inline-block',color:'red'});
            objMsg.text('邮箱不能为空');
            return false;
        }
    };
    $scope.getPwd=function(){
        let PwdNum=$('#pwd').val();
        let objPwd=$('#pwdMgs');
        if(PwdNum){
            if(PwdNum.length<4||PwdNum.length>16){
                objPwd.css({display:'inline-block',color:'red'});
                objPwd.text('请输入4-16位的密码');
                return false;
            }
            else{
                objPwd.css({display:'none'});
                return true;
            }
        }
        else{
            objPwd.css({display:'inline-block',color:'red'});
            objPwd.text('密码不能为空');
            return false;
        }
    };
    $scope.checkPwdAgain=function(){
        let PwdNum=$('#pwd').val();
        let CheckPwdNum=$('#checkPwd').val();
        let objCheckPwd=$('#checkPwdMgs');
        if(CheckPwdNum){
            if(PwdNum==CheckPwdNum){
                objCheckPwd.css({display:'none'});
                return true;
            }
            else{
                objCheckPwd.css({display:'inline-block',color:'red'});
                objCheckPwd.text('两次输入密码不同，请确认');
                return false;
            }
        }
        else{
            objCheckPwd.css({display:'inline-block',color:'red'});
            objCheckPwd.text('请再次输入密码');
            return false;
        }
    };
    $scope.clickToRegister=function(){
        if( $scope.catchMsg()==true&&$scope.checkTelNumber()==true&&$scope.getPwd()==true&&$scope.checkPwdAgain()==true){
            let dat={
                email:$('#number').val(),
                pwd:hex_md5($('#pwd').val()),
                userImg:'FuP2PwaHcUbvU2P6-P9quB3b9bFs'
            };
            $.post('/api/register',dat,function(res){
                if(res.text=='ok'){
                    window.location='/'
                }
                else if(res.text=='repeat'){
                  alert('该邮箱已注册，您可直接进行登录');
                    setTimeout(function(){
                        window.location='./login.html'
                    },1500);

                }
            });

        }
        else{
            return false;
        }
    };
    $scope.rewrite=function(){
        $('#number').val('');
        $('#pwd').val('');
        $('#checkPwd').val('');
        $('#checkInput').val('')
    }
};





