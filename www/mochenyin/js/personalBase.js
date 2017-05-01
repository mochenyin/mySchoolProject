/**
 * Created by asus on 2017/4/23.
 */
function getPersonalBasePageController($scope){
    $.get('/api/getPersonBase',{userId:sessionStorage.Key},function(res){
        if(res.text=='ok'){
            $scope.$apply(function(){
                $scope.userDatas=res.data.rows[0];

            });
            if(!$scope.userDatas.sex||$scope.userDatas.sex=='0'){
                $('.disabledRadio:eq(0)').attr('checked',true)
            }
            else{
                $('.disabledRadio:eq(1)').attr('checked',true)
            }
        }
    });
    $scope.edit='修改';
    let staute=false;
    $('.disabledInput').attr('disabled',true);
    $scope.editOrSave=function(){
        staute=!staute;
        $scope.edit=staute?'保存':'修改';
        if(!staute){
            let data=$('.userMsgForm').serializeArray();
            data.userId=sessionStorage.Key;
           $.post('/api/changeMyUserMsg',data,function(res){
               if(res.text=='ok'){
                   $scope.text='修改成功';
                   boxshow($scope.text);
               }
           });
        }
        $('.disabledInput').attr('disabled',!staute);
    }
}