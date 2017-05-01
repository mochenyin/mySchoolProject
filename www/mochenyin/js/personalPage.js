/**
 * Created by SWSD on 2017-03-03.
 */
function getPersonalPageController($scope){
    $scope.userName=sessionStorage.userName;
    $scope.userImg=sessionStorage.userImg;
    $.get('/api/getPersonalMsg',{userId:sessionStorage.Key},function(res){
        console.log(res)
       if(res.text=='ok'){
          $scope.$apply(function(){
              $scope.saveCount=res.data.rows[0].countDatas;
              $scope.themeCount=res.data.rows[1].countDatas;
              $scope.histroyCount=res.data.rows[2].countDatas;
              $scope.caredCount=res.data.rows2[0].countDatas;
              $scope.careCount=res.data.rows3[0].countDatas;
          })
       }
    })
}