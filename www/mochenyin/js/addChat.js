/**
 * Created by SWSD on 2017-03-13.
 */
function addChatController($scope){
    $scope.sourceLink='none';
    $.get('/api/getChatStyle',function(res){
        if(res.text=='ok'){
            $scope.$apply(function(){
                $scope.chatStyle=res.data;
            })
        }
    });
    $.post('/api/getToken',function(res){//请求token
        uploader2 = Qiniu.uploader({
            runtimes: 'html5,flash,html4',
            browse_button: 'pickfiles2',//上传按钮的ID
            container: 'btn-uploader2',//上传按钮的上级元素ID
            drop_element: 'btn-uploader2',
            max_file_size: '2mb',//最大文件限制
            flash_swf_url: '/js-sdk-master/js-sdk-master/demo/dist/Moxie.swf',
            dragdrop: false,
            uptoken : res.data, //由后台服务获取到的token
            unique_names: true,
            // 默认 false，key为文件名。若开启该选项，SDK会为每个文件自动生成key（文件名）
            save_key: true,
            // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK在前端将不对key进行任何处理
            domain: 'olcolkmpd.bkt.clouddn.com',//自己的七牛云存储空间域名
            multi_selection: false,//是否允许同时选择多文件
            //文件类型过滤，这里限制为图片类型
            filters: {
                mime_types : [
                    {title : "Image files", extensions: "jpg,jpeg,gif,png"}
                ]
            },
            auto_start: true,
            init: {
                'FileUploaded': function(up, file, info) {
                    let domain = up.getOption('domain');
                    let res = eval('(' + info + ')');
                    let sourceLink = 'http://'+domain +'/'+ res.key;//获取上传文件的链接地址
                    $('#chatImg').html('<img style="width:280px;height:150px;" id="chatPImg" src='+sourceLink+' />');
                    $scope.sourceLink=sourceLink;
                },
                'Error': function(up, err, errTip) {
                    console.log('up',up);
                    console.log('err',err);
                    boxshow(errTip);
                },
            }
        });
    });
    $scope.okClick=function(){
        if($scope.checkTitle()==true&&$scope.textareaChat()==true){
            var chatData={
                title:$('#titleChat').val(),
                description:$('#textareaChat').val(),
                chatStyle:$('#selectStyle').val(),
                sourceLink:$scope.sourceLink,
                userId:sessionStorage.Key,
                roomName:$('#roomName').val()
            };
            $.post('/api/addChatRoom',chatData,function(res){
                if(res.text=='ok'){
                   boxshow('发布成功');
                    $('#titleChat').val('');
                    $('#textareaChat').val('');
                    $('#selectStyle').val('1');
                    $('#roomName').val('');
                    $('#chatPImg').remove();
                }
            })
        }
    };
    $scope.cancelClick=function(){
        $('#titleChat').val('');
        $('#textareaChat').val('');
        $('#selectStyle').val('1');
        $('#roomName').val('');
        $('#chatPImg').remove();
    };
    $scope.checkTitle=function($event){
        let obj=$('#titleChat');
        let objMsg=$('#titleMsg');
        if(obj.val()){
            if(obj.val().length>30){
                objMsg.css({display:'inline-block'});
                objMsg.text('标题不能超过30个字');
                return false;
            }
            else{
                objMsg.css({display:'none'});
                return true;
            }
        }
        else{
            objMsg.css({display:'inline-block'});
            objMsg.text('标题不能为空');
            return false;
        }
    };
    $scope.textareaChat=function(){
        let obj=$('#textareaChat');
        let objMsg=$('#textareaMsg');
        if(obj.val()){
            if(obj.val().length>200){
                objMsg.css({display:'inline-block'});
                objMsg.text('描述不能超过200个字');
                return false;
            }
            else{
                objMsg.css({display:'none'});
                return true;
            }
        }
        else{
            objMsg.css({display:'inline-block'});
            objMsg.text('内容描述不能为空');
            return false;
        }
    };
}