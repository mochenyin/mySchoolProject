/**
 * Created by asus on 2017/4/29.
 */
function getPersonalCarePageController($scope){
    $.get('/api/getPersonalCare',{state:0,userId:sessionStorage.Key},function(res){
        console.log(res);
        if(res.text=='ok'){
            let resQ=res.data.rows;
            for(var key in resQ){
                res.description=res.description?res.description:'暂无';
            }
            $scope.$apply(function(){
                $scope.themeArray=resQ;
            });
        }
    })
}