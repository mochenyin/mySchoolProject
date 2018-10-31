/**
 * Created by asus on 2017/4/23.
 */
function getPersonalBasePageController($scope){
    $.get('/api/getPersonBase',{userId:sessionStorage.Key},function(res){
        //从缓存里拿到用户Id，并将其传递给后台程序，根据用户Id获取到该用户的信息
        if(res.text=='ok'){
            $scope.$apply(function(){
                $scope.userDatas=res.data.rows[0];
  //将获取到的用户数据赋值给$scope的userDatas属性，html可拿到该数据，并显示在页面上
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
            //表单序列化，可将表单里加了name属性的控件值以数组形式获取到
            data.userId=sessionStorage.Key;
           $.post('/api/changeMyUserMsg',data,function(res){//将修改后的数据传递给后台程序，并对数据表进行修改
               if(res.text=='ok'){
                   $scope.text='修改成功';
                   boxshow($scope.text);
               }
           });
        }
        $('.disabledInput').attr('disabled',!staute);
    }
}