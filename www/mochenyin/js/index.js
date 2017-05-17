/**
 * Created by SWSD on 2017-02-16.
 */
var app = angular.module('app', ['ui.router']); //AngularJS 模块定义应用
app.run(function ($rootScope) {  //初始化一个全局提示实例
    $rootScope.alerturl = 'mochenyin/public/alert.html';

});
app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/silence/index');  //当输入一个未定义的路径则一致跳转到/silence/index状态
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
        .state('silence.themePage',{  //路由状态
            url:'/themePage/:themeId&&:classifyId', //url路径及参数
            views:{
                '@':{
                    templateUrl: 'mochenyin/themePage.html', //视图模板
                    controller: 'themePageController', //对应控制器
                }
            }
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
            url:'/userCard/:userId',
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
        .state('#news',{})
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
        .state('silence.personalPage.base',{
            url:'/base',
            templateUrl: 'mochenyin/personalBase.html',
            controller: 'indexPersonalBaseController',
        })
        .state('silence.personalPage.news',{
            url:'/news',
            templateUrl: 'mochenyin/personalNews.html',
            controller:'indexPersonalNewsController'
        })
        .state('silence.personalPage.theme',{
            url:'/theme',
            templateUrl: 'mochenyin/personalTheme.html',
            controller:'indexPersonalThemeController'
        })
        .state('silence.personalPage.browser',{
            url:'/browser',
            templateUrl: 'mochenyin/personalBrowser.html',
            controller:'indexPersonalBrowserController'
        })
        .state('silence.personalPage.save',{
            url:'/save',
            templateUrl: 'mochenyin/personalSave.html',
            controller:'indexPersonalSaveController'
        })
        .state('silence.personalPage.care',{
            url:'/care',
            templateUrl: 'mochenyin/personalCare.html',
            controller:'indexPersonalCareController'
        })
        .state('silence.personalPage.fans',{
            url:'/fans',
            templateUrl: 'mochenyin/personalFans.html',
            controller:'indexPersonalFansController'
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
app.controller('userCardController',function($stateParams,$scope){
   startUserCard($stateParams.userId,$scope);
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
//$stateParams为参数对象，$scope对象的属性可在html中获取
    $.post('/api/getChatClassify',{type:$stateParams.name},function(res){
        //运用ajax的post方式去请求koa路由，res为返回值
        if(res.text=='ok'){
            $scope.$apply(function(){  //手动更新$scope
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
app.controller('indexPersonalBaseController',function($scope){
    $('.personalA:eq(0)').addClass('personalActive');
    getPersonalBasePageController($scope)
});
app.controller('indexPersonalThemeController',function($scope){
    $('.personalA:eq(2)').addClass('personalActive');
    getPersonalThemePageController($scope)
});
app.controller('indexPersonalBrowserController',function($scope){
    $('.personalA:eq(3)').addClass('personalActive');
    getPersonalBrowserPageController($scope)
});
app.controller('indexPersonalSaveController',function($scope){
    $('.personalA:eq(4)').addClass('personalActive');
    getPersonalSavePageController($scope)
});
app.controller('indexPersonalCareController',function($scope){
    $('.personalA:eq(5)').addClass('personalActive');
    getPersonalCarePageController($scope)
});
app.controller('indexPersonalFansController',function($scope){
    $('.personalA:eq(6)').addClass('personalActive');
    getPersonalFansPageController($scope)
});
app.controller('indexPersonalNewsController',function($scope){
    $('.personalA:eq(1)').addClass('personalActive');
    getPersonalNewsPageController($scope)
});
//主题页面控制器
app.controller('themePageController',function($stateParams,$scope){
    getThemePageController($stateParams.themeId,$stateParams.classifyId,$scope);
});



