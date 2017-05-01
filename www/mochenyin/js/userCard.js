/**
 * Created by SWSD on 2017-04-06.
 */
function startUserCard(userId,$scope){
    $.get('/api/getOtherUserMsg',{userId:userId},function(res){
        let user=res.data.rows[0];
        $scope.$apply(function(){
            $scope.userName=user.userName;
            $scope.userImg=user.userImg;
            if(user.sex){
                $scope.userSex=user.sex=='0'?'男':'女';
            }
            else{
                $scope.userSex='未知';
            }
            $scope.sign=user.sign?user.sign:'暂无';
            $scope.description=user.description?user.description:'暂无';
        })
    });
    let status;
    $.get('/api/getCareInit',{state:0,userId:sessionStorage.Key,careUserId:userId},function(res){
        let text;
        $scope.$apply(function(){
            $scope.myStar=res.data.rows2[0].countDatas;
            $scope.stared=res.data.rows3[0].countDatas;
        });
          if(res.text=='ok'){
              text='取消关注';
              $('.pull-right').css({background:'orangered',color:'white'});
              status=true;
          }
        else{
              text='关注';
              $('.pull-right').css({background:'white',color:'black'});
              status=false;
          }
        $scope.$apply(function(){
            $scope.care=text;
        })
    });
    $scope.toggleCare=function(){
        if(status){
            $.get('/api/getCareInit',{state:2,userId:sessionStorage.Key,careUserId:userId},function(res){
                if(res.text=='ok'){
                    $('.pull-right').css({background:'white',color:'black'});
                   $scope.$apply(function(){
                       $scope.care='关注';
                       $scope.stared= $scope.stared-1;
                   })
                }
            });
        }
        else{
            $.get('/api/getCareInit',{state:1,userId:sessionStorage.Key,careUserId:userId},function(res){
                if(res.text=='ok'){
                    $('.pull-right').css({background:'orangered',color:'white'});
                    $scope.$apply(function(){
                        $scope.care='取消关注';
                        $scope.stared= $scope.stared+1;
                    })
                }
            });
        }
        status=!status;
    };
    $.get('/api/getPersonalTheme',{userId:userId},function(res){
        if(res.text=='ok'){
            let resQ=res.data.rows;
            let saveObj=res.data.rows3;
            let thumbObj=res.data.rows4;
            let answerObj=res.data.rows5;
            for(var key in resQ){
                if(resQ[key].themeImages){
                    let length=resQ[key].themeImages.length;
                    let str=resQ[key].themeImages.substring(0,length-1);
                    resQ[key].themeImages=str.split(';');
                }
                for(var save in saveObj){
                    if(resQ[key].themeId!=saveObj[save].saveThemeId){
                        resQ[key].save=0;
                    }
                    else{
                        resQ[key].save=saveObj[save].saveCount;
                        break;
                    }
                }
                for(var thumb in thumbObj){
                    if(resQ[key].themeId==thumbObj[thumb].thumbThemeId){
                        resQ[key].thumb=thumbObj[thumb].thumbCount;
                        break;
                    }
                    else{
                        resQ[key].thumb=0;
                    }
                }
                for(var answer in answerObj){
                    if(resQ[key].themeId==answerObj[answer].themeId){
                        resQ[key].answer=answerObj[answer].answerCount;
                        break;
                    }
                    else{
                        resQ[key].answer=0;
                    }
                }
            }
            $scope.$apply(function(){
                $scope.themeArray=resQ;
            });
        }
    });
    $scope.sendNews=function(){
        if(sessionStorage.Key){
            $('.addNews').modal('show');
        }
        else{
            $scope.text='请先登录';
            boxshow($scope.text);
        }
    };
    $scope.getTagMsg=function(){
        $('.addNews').modal('show');
    };
    $scope.cancelClick=function(){
        $('.addNews').modal('hide');
        $('#textNews').val('');
    };
    $scope.checkContent=function($event){
        let obj=$('#textNews');
        let objMsg=$('#textNewsMsg');
        if(!obj.val()){
            objMsg.css({display:'inline-block'});
            objMsg.text('内容不能为空');
            return false;
        }
        else{
            if(obj.val().length>500){
                objMsg.css({display:'inline-block'});
                objMsg.text('内容不能超过500个字');
                return false;
            }
            else{
                objMsg.css({display:'none'});
                return true;
            }
        }
    };
    $scope.getTagMsg=function(){
        if($scope.checkContent()){
            let data={
                userId:sessionStorage.Key,
                sendUserId:userId,
                content:$('#textNews').val()
            };
            $.post('/api/sendNews',data,function(res){
                if(res.text=='ok'){
                    $scope.text='发送成功!';
                    boxshow($scope.text);
                    $('#textNews').val('');
                    $('.addNews').modal('hide');
                }
            })
        }
    }
}