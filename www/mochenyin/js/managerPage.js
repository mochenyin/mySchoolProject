/**
 * Created by SWSD on 2017-03-06.
 */
$('#clickUl').click(function(e){
    $('#clickUl li a').removeClass('clicked');
    $(e.target).addClass('clicked')
});
window.location='/mochenyin/managerPage.html#/';
var app = angular.module('app', ['ngRoute'])
    .controller('baseMsgMngrController',function($scope,$route){$scope.$route=$route;})
    .controller('changeImgMngrController',function($scope,$route){$scope.$route=$route;})
    .controller('userMngrController',function($scope,$route){$scope.$route=$route;})
    .controller('imgMngrController',function($scope,$route){$scope.$route=$route;})
    .config(['$routeProvider',function($routeProvider){
        $routeProvider
            .when('/baseMsg',{
                templateUrl: 'baseMsgMngr.html',
                controller: 'baseMsgMngrController',
            })
            .when('/changeImgMngr',{
                templateUrl: 'changeImgMngr.html',
                controller: 'changeImgMngrController',
            })
            .when('/userMnger',{
                templateUrl: 'userMngr.html',
                controller: 'userMngrController',
            })
            .when('/imgMngr',{
                templateUrl: 'imgMngr.html',
                controller: 'imgMngrController',
            })
            .when('/chatMngr',{
                templateUrl: 'chatMngr.html',
                controller: 'chatMngrController',
            })
            .otherwise({redirectTo:'/baseMsg'});
    }]);

app.run(function ($rootScope) {
    $rootScope.navurl = 'public/nav.html';
    $rootScope.alerturl = 'public/alert.html';

});

app.controller('managerController',function($scope){

});
//聊天管理页面控制器
app.controller('chatMngrController',function($scope){
         startChatMngrController($scope);
});
//轮播图页面控制器
app.controller('changeImgMngrController',function($scope){
let data={
    type:'all'
};
$.get('/api/getChangeImg',data,function(res){
    $scope.$apply(function () { //手动加载路由
        $scope.activeImg=res.data.active;
        $scope.unActiveImg=res.data.unActive;
    });
    });

    $.post('/api/getToken',function(res){
        uploader = Qiniu.uploader({
            runtimes: 'html5,flash,html4',
            browse_button: 'pickfiles',//上传按钮的ID
            container: 'btn-uploader',//上传按钮的上级元素ID
            drop_element: 'btn-uploader',
            max_file_size: '2mb',//最大文件限制
            flash_swf_url: '/js-sdk-master/js-sdk-master/demo/dist/Moxie.swf',
            dragdrop: false,
            //uptoken_url: '/api/getToken',//设置请求qiniu-token的url
            //uptoken_url:'http://up-z1.qiniu.com/',
            //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
            uptoken : res.data,
            //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
            unique_names: true,
            // 默认 false，key为文件名。若开启该选项，SDK会为每个文件自动生成key（文件名）
            save_key: true,
            // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK在前端将不对key进行任何处理
            domain: 'olcolkmpd.bkt.clouddn.com',//自己的七牛云存储空间域名
            multi_selection: false,//是否允许同时选择多文件
            //文件类型过滤，这里限制为图片类型
            filters: {
                mime_types : [
                    {title : "Image files", extensions: "jpg,jpeg,gif,png"}
                ]
            },
            auto_start: true,
            init: {
                'FileUploaded': function(up, file, info) {
                    let domain = up.getOption('domain');
                    let res = eval('(' + info + ')');
                    let sourceLink = 'http://'+domain +'/'+ res.key;//获取上传文件的链接地址
                    let data={
                        imgUrl:sourceLink,
                    };
                    $.post('/api/addChangeImg',data,function(res){
                        if(res.text=='ok'){
                            $scope.text='添加成功';
                            $scope.$apply(function () {
                                $scope.unActiveImg.splice(0, 0, res.data[0]);
                            });
                        }
                    })
                },
                'Error': function(up, err, errTip) {
                    console.log('up',up);
                    console.log('err',err);
                    alert(errTip);
                },
            }
        });
    });
   $scope.delect=function(val,flag){
       $.post('/api/deleteChangeImg',{imgId:val.imgId},function(res){
           if(res.text=='ok'){
               $scope.text='删除成功';
              if(flag==0){
                  $scope.$apply(function () {
                      $scope.unActiveImg.splice($.inArray(val, $scope.unActiveImg), 1);
                  });
              }
             else{
                  $scope.$apply(function () {
                      $scope.activeImg.splice($.inArray(val, $scope.activeImg), 1);
                  });
              }
           }
       })
   };
    $scope.changeFlag=function(val,flag){
        $.post('/api/switchImgFlag',{flag:flag,imgId:val.imgId,},function(res){
            if(res.text=='ok'){
                if(flag==0){
                    $scope.$apply(function () {
                        $scope.activeImg.splice($.inArray(val, $scope.activeImg), 1);
                        $scope.unActiveImg.splice(0, 0, val);
                    });
                }
                else{
                    $scope.$apply(function () {
                        $scope.unActiveImg.splice($.inArray(val, $scope.unActiveImg), 1);
                        $scope.activeImg.splice(0, 0, val);
                    });
                }
            }
        })
    }
});



