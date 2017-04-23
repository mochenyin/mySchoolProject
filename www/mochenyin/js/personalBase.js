/**
 * Created by asus on 2017/4/23.
 */
function getPersonalBasePageController($scope){
    $.get('/api/getPersonBase',{userId:sessionStorage.Key},function(res){
        if(res.text=='ok'){
            $scope.$apply(function(){
                $scope.userDatas=res.data.rows[0];

            })
        }
    })
}