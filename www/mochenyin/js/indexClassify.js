/**
 * Created by SWSD on 2017-04-06.
 */
function startIndexBodyClassify(id,$scope){
    $scope.userImg=sessionStorage.userImg;
    $scope.userName=sessionStorage.userName;
   $.get('/api/getCover',{id:id},function(res){
               if(res.text=='ok'){
                 $scope.$apply(function(){
                     $scope.coverData=res.data[0];
                 });
                   console.log(res.data[0].classifyImg);
               }
   })
}