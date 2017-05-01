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
    $.get('/api/getAllUser',function(res){
          if(res.text=='ok'){
              let resQ=res.data.rows;
              for(var key in resQ){
                  resQ[key].description=resQ[key].description?resQ[key].description:'暂无';
              }
              $scope.$apply(function(){
                  $scope.themeArray=resQ;
              });
          }
    });
    $.get('/api/getTopIndex',function(res){
        if(res.text=='ok'){
            $scope.$apply(function(){
                $scope.topIndex=res.data.rows;
            })
        }
    });
    $scope.userName=sessionStorage.userName;
    $scope.userImg=sessionStorage.userImg;
}