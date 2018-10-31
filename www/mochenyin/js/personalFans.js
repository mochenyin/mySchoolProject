/**
 * Created by asus on 2017/4/29.
 */
function getPersonalFansPageController($scope){
    $.get('/api/getPersonalCare',{state:1,userId:sessionStorage.Key},function(res){
        console.log(res);
        if(res.text=='ok'){
            let resQ=res.data.rows;
            for(var key in resQ){
                resQ[key].description=resQ[key].description?resQ[key].description:'暂无';
            }
            $scope.$apply(function(){
                $scope.themeArray=resQ;
            });
        }
    })
}