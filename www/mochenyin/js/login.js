/**
 * Created by SWSD on 2017-02-21.
 */
function loginController($scope){
    $scope.checkTelNumber=function(){
        let TelNum = $('#account').val();
        let reg = "^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$";
        let re = new RegExp(reg);
        let objMsg=$('#accountMsg');
        if(TelNum){
            if (re.test(TelNum)) {
                objMsg.css({display:'none'});
                return true;
            }
            else {
                objMsg.css({display:'inline-block'});
                objMsg.text('请输入正确的邮箱');
                return false;
            }
        }
        else{
            objMsg.css({display:'inline-block'});
            objMsg.text('邮箱不能为空');
            return false;
        }
    };
    $scope.getPwd=function(){
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
    };
    $scope.login = function () {
        let dat = {
            email: $('#account').val(),
            pwd: hex_md5($('#password').val())
        };
        if($scope.checkTelNumber()==true&&$scope.getPwd()==true){
            $.post('/api/getLogin', dat, function (res) {
                console.log('res',res);
                if (res.text == 'ok') {
                    $scope.text = '登录成功';
                    boxshow($scope.text);
                    var userImg=res.data.userImg==null?'FgN38DT4jtHTaqIhpaL-zXNyx5Xo':res.data.userImg;
                    sessionStorage.User=res.data.userEmail;
                    sessionStorage.Key=res.data.userId;
                    sessionStorage.userImg=userImg;
                    sessionStorage.userName=res.data.userName;
                    sessionStorage.isLogin='loginIn';
                    setTimeout(function () {
                        window.location.href = '/';
                    }, 1500);
                } else {
                        $scope.text = res.text;
                    boxshow($scope.text);
                }
            })
        }
    };
    $scope.findPwd=function(){
        window.location='/#/findPwd'
    }
}

