/**
 * Created by SWSD on 2017-03-03.
 */
function getPersonalPageController($scope){
    $scope.userName=sessionStorage.userName;
    $scope.userImg=sessionStorage.userImg;
    $.get('/api/getPersonalMsg',{userId:sessionStorage.Key},function(res){
       if(res.text=='ok'){
          $scope.$apply(function(){
              $scope.saveCount=res.data.rows[0].countDatas;
              $scope.thumbCount=res.data.rows[1].countDatas;
              $scope.answerCount=res.data.rows[2].countDatas;
              $scope.themeCount=res.data.rows[3].countDatas;
          })
       }
    })
}