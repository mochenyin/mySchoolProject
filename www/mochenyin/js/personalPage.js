/**
 * Created by SWSD on 2017-03-03.
 */
function getPersonalPageController($scope){
    $scope.userName=sessionStorage.userName;
    $scope.userImg=sessionStorage.userImg;
}