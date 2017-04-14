/**
 * Created by SWSD on 2017-02-16.
 */
var app = angular.module('app', ['ui.router']);
app.run(function ($rootScope) {
    $rootScope.alerturl = 'mochenyin/public/alert.html';

});
app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/silence/index');
    $stateProvider
        .state('silence',{
            url:'/silence',
            templateUrl: 'mochenyin/subIndex.html',
            controller: 'indexHeaderController',
        })
        .state('login',{
            url:'/login',
            templateUrl: 'mochenyin/login.html',
            controller: 'loginController',
        })
        .state('register',{
            url:'/register',
            templateUrl: 'mochenyin/register.html',
            controller: 'registerController',
        })
        .state('findPwd',{
            url:'/findPwd',
            templateUrl: 'mochenyin/findPwd.html',
            controller: 'findPwdController',
        })
           .state('silence.index',{
               url:'/index',
               templateUrl: 'mochenyin/myIndex.html',
               controller: 'indexBodyController',
           })
        .state('silence.indexClassify',{
            url:'/indexClassify/:id',
            templateUrl: 'mochenyin/indexClassify.html',
            controller: 'indexBodyClassifyController',
        })
        .state('silence.userCard',{
            url:'/userCard',
            templateUrl:'mochenyin/userCard.html',
            controller:'userCardController'
        })
           .state('silence.findPage',{
               url:'/findPage',
               templateUrl: 'mochenyin/findPage.html',
               controller: 'indexFindController',
           })
           .state('silence.chatPage',{
               url:'/chatPage',
               templateUrl: 'mochenyin/chatPage.html',
               controller: 'indexChatController',
           })
        .state('silence.chatPage.addChat',{
            url:'/addChat',
            templateUrl: 'mochenyin/addChat.html',
            controller: 'addChatController',
        })
        .state('silence.chatPage.classify',{
            url:'/:name',
            templateUrl: 'mochenyin/chatClassify.html',
            controller: 'chatClassifyController',
        })
        .state('silence.chatPage.classify.subChat',{
            url:'/subChat/:roomId',
            views:{
                '@':{
                    templateUrl: 'mochenyin/subChatPage.html',
                    controller: 'subChatController',
                }
            }
        })
           .state('silence.personalPage',{
               url:'/personalPage',
               templateUrl: 'mochenyin/personalPage.html',
               controller: 'indexPersonalController',
           })
});
app.run(function ($rootScope) {
    $rootScope.navurl = 'mochenyin/public/nav.html';
    $rootScope.alerturl = 'mochenyin/public/alert.html';

});
//首页头部控制器
app.controller('indexHeaderController',function($scope){
    indexHeaderController($scope)
});

//登录控制器
app.controller('loginController',function($scope){
    loginController($scope)
});
//找回密码页面控制器
app.controller('findPwdController',function($scope){
    findPwdController($scope)
});
//注册页面控制器
app.controller('registerController',function($scope){
    registerController($scope)
});
//首页控制器
app.controller('indexBodyController',function($scope){
    $('.indexTab:eq(0)').addClass('indexActive');
    startIndexBody($scope);
});
//首页子分类控制器
app.controller('indexBodyClassifyController',function($stateParams,$scope){
    $('.indexTab:eq(0)').addClass('indexActive');
    startIndexBodyClassify($stateParams.id,$scope);
});
//用户卡片页面控制器
app.controller('userCardController',function($scope){
   startUserCard($scope);
});

//聊天室页面控制器
app.controller('indexChatController',function($scope,$state){
        $('.indexTab:eq(2)').addClass('indexActive');
        startIndexChat($scope,$state);
});
//新增聊天控制器
app.controller('addChatController',function($scope){
    addChatController($scope)
});
//房间聊天页面
app.controller('subChatController',function($stateParams,$scope){
    subChatController($scope,$stateParams.roomId);
});
//分类随记控制器
app.controller('chatClassifyController',function($stateParams,$scope){
    $.post('/api/getChatClassify',{type:$stateParams.name},function(res){
        if(res.text=='ok'){
            $scope.$apply(function(){
                $scope.title=res.data.classify[0].chatName;
            });
            getChatClassify($scope,res.data.list);
        }
    })
});
//发现页面控制器
app.controller('indexFindController',function($scope){
    $('.indexTab:eq(1)').addClass('indexActive');
    getIndexFindController($scope);
});
//个人中心控制器
app.controller('indexPersonalController',function($scope){
    $('.indexTab:eq(3)').addClass('indexActive');
    getPersonalPageController($scope)
});



