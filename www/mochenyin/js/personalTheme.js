/**
 * Created by asus on 2017/4/23.
 */
function getPersonalThemePageController($scope){
    $.get('/api/getPersonalTheme',{userId:sessionStorage.Key},function(res){
        if(res.text=='ok'){
            let resQ=res.data.rows;
            let saveObj=res.data.rows3;
            let thumbObj=res.data.rows4;
            let answerObj=res.data.rows5;
            console.log(answerObj)
            for(var key in resQ){
                if(resQ[key].themeImages){
                    let length=resQ[key].themeImages.length;
                    let str=resQ[key].themeImages.substring(0,length-1);
                    resQ[key].themeImages=str.split(';');
                }
                for(var save in saveObj){
                    if(resQ[key].themeId!=saveObj[save].saveThemeId){
                        resQ[key].save=0;
                    }
                    else{
                        resQ[key].save=saveObj[save].saveCount;
                        break;
                    }
                }
                for(var thumb in thumbObj){
                    if(resQ[key].themeId==thumbObj[thumb].thumbThemeId){
                        resQ[key].thumb=thumbObj[thumb].thumbCount;
                        break;
                    }
                    else{
                        resQ[key].thumb=0;
                    }
                }
                for(var answer in answerObj){
                    if(resQ[key].themeId==answerObj[answer].themeId){
                        resQ[key].answer=answerObj[answer].answerCount;
                        break;
                    }
                    else{
                        resQ[key].answer=0;
                    }
                }
            }
            $scope.$apply(function(){
                $scope.themeArray=resQ;
            });
        }
    })
}