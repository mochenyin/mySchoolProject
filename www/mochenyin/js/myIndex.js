/**
 * Created by SWSD on 2017-03-03.
 */
$('.carousel').carousel({
    interval: 2000
});
function startIndexBody($scope){
    let data={
        type:'active'
    };
    $.get('/api/getChangeImg',data,function(res){
        $scope.$apply(function () { //手动加载路由
            $scope.activeImg=res.data.active;
        });
    });
    $scope.userName=sessionStorage.userName;
    $scope.userImg=sessionStorage.userImg;
}