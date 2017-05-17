/**
 * Created by asus on 2017/5/1.
 */
function getPersonalNewsPageController($scope){
      $.get('/api/getNewsMsg',{userId:sessionStorage.Key},function(res){
          //获取到所有接收人Id为自己的数据项，并显示到页面
             $scope.$apply(function(){
                 $scope.action=res.data.rows;
                 $scope.news=res.data.rows2;
             })
      });
    $scope.deleteNews=function(newsId,i){
        var a = confirm("您确定要删除吗？");//删除该消息
        if (a) {
            $.get('/api/deleteNews',{newsId:newsId},function(res){
                if(res.text=='ok'){
                    $scope.text='删除成功';
                    boxshow($scope.text);
                   $scope.$apply(function(){
                       $scope.news.splice(i, 1);
                   })
                }
            })
        };
    };

    $scope.sendNews=function(userId){
            $('.addNews').modal('show');
        $scope.userId=userId;
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
    $scope.getTagMsg=function() {//回复该消息
        if ($scope.checkContent()) {
            let data = {
                userId: sessionStorage.Key,
                sendUserId: $scope.userId,
                content: $('#textNews').val()
            };
            $.post('/api/sendNews', data, function (res) {
                if (res.text == 'ok') {
                    $scope.text = '发送成功!';
                    boxshow($scope.text);
                    $('#textNews').val('');
                    $('.addNews').modal('hide');
                }
            })
        }
    }
}