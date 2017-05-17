/**
 * Created by asus on 2017/4/29.
 */
function getPersonalSavePageController($scope){
    $.get('/api/getPersonalSave',{userId:sessionStorage.Key},function(res){
        if(res.text=='ok'){
            let resQ=res.data.rows;
            $scope.$apply(function(){
                $scope.themeArray=resQ;
            });
        }
    })
}
