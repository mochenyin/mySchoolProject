/**
 * Created by asus on 2017/4/29.
 */
function getPersonalBrowserPageController($scope){
    $.get('/api/getPersonalBrowser',{userId:sessionStorage.Key},function(res){
        if(res.text=='ok'){
           $scope.$apply(function(){
               $scope.themeArray=res.data
           })
        }
    })
}