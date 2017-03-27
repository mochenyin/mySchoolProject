function startIndexChat($scope,$state){
    $scope.lickick=function($event){
        $('.chatLi a').removeClass('checked');
        $($event.target).addClass('checked');
    };
    $.get('/api/getChatStyle',function(res){
        if(res.text=='ok'){
            $scope.$apply(function(){
                $scope.chatList=res.data;
            });
        }
       $('.chatLi:eq(0) .chatA').addClass('checked');
    });
    $scope.wReload=function(){
        $state.go("silence.chatPage.classify",{name:'memory'});
    }
}

