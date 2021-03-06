function getIndexFindController($scope){
    let imagesKey='';
    let resQ;
    $scope.userImg=sessionStorage.userImg;
    $scope.userName=sessionStorage.userName;
    $.post('/api/getFindPageTheme',function(res){
        if(res.text=='ok'){
             resQ=res.data.rows;
            let saveObj=res.data.rows3;
            let thumbObj=res.data.rows4;
            let answerObj=res.data.rows5;
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
            $scope.classify=res.data.rows2;
        }
    });

    $scope.addTheme=function(){
        if(sessionStorage.Key){
            $('.addWords').modal('show');
        }
        else{
            $scope.text='请先登录';
            boxshow($scope.text);
        }
    }
    $scope.cancelClick=function(){
        $('#titleClassify').val('');
        $('#desClassify').val('');
        $('#contentClassify').val('');
        imagesKey='';
        $('.themeImgs').remove();
        $('.addWords').modal('hide');
    };
    $scope.getTagMsg=function(){
        if( $scope.checkTitle()&&$scope.textareaChat()){
            var data={
                themeUserId:sessionStorage.Key,
                themeClassify:$('#classify').val(),
                themeTitle:$('#titleClassify').val(),
                themeDesc:$('#desClassify').val(),
                themeContent:$('#contentClassify').val(),
                themeImages:imagesKey
            };
            $.post('/api/addThemeMsg',data,function(res){
                if(res.text=='ok'){
                   let obj=res.data[0];
                    if(obj.themeImages){
                        let str= obj.themeImages.substring(0,obj.themeImages.length-1);
                        obj.themeImages=str.split(';');
                    }
                    obj.save=0;
                    obj.answer=0;
                    obj.thumb=0;
                    $scope.$apply(function(){
                        $scope.themeArray.splice(0,0,obj);
                    });
                    $scope.text='发布成功';
                    boxshow($scope.text);
                    $('.addWords').modal('hide');
                    $('#titleClassify').val('');
                    $('#desClassify').val('');
                    $('#contentClassify').val('');
                    imagesKey='';
                    $('.themeImgs').remove();
                }
                else{
                    $scope.text='发布失败';
                    boxshow($scope.text);
                }
            })
        }
    };
    $.post('/api/getToken',function(res){
        uploader = Qiniu.uploader({
            runtimes: 'html5,flash,html4',
            browse_button: 'addMutple',//上传按钮的ID
            container: 'btn-uploader2',//上传按钮的上级元素ID
            drop_element: 'btn-uploader2',
            max_file_size: '4mb',//最大文件限制
            flash_swf_url: '/js-sdk-master/js-sdk-master/demo/dist/Moxie.swf',
            dragdrop: false,
            //uptoken_url: '/api/getToken',//设置请求qiniu-token的url
            //uptoken_url:'http://up-z1.qiniu.com/',
            //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
            uptoken : res.data,
            //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
            unique_names: true,
            // 默认 false，key为文件名。若开启该选项，SDK会为每个文件自动生成key（文件名）
            save_key: true,
            // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK在前端将不对key进行任何处理
            domain: 'olcolkmpd.bkt.clouddn.com',//自己的七牛云存储空间域名
            multi_selection: true,//是否允许同时选择多文件
            //文件类型过滤，这里限制为图片类型
            filters: {
                mime_types : [
                    {title : "Image files", extensions: "jpg,jpeg,gif,png"}
                ]
            },
            auto_start: true,
            init: {
                'FilesAdded': function(up, files) {

                },
                'BeforeUpload': function(up, file) {

                },
                'FileUploaded': function(up, file, info) {
                    let domain = up.getOption('domain');
                    let res = eval('(' + info + ')');
                    imagesKey+=res.key+';';
                    let sourceLink = 'http://'+domain +'/'+ res.key;//获取上传文件的链接地址
                    $('#muti_img').append('<img src='+sourceLink+' class="themeImgs" style="width:25%;height:100px;margin:10px;"/>')

                },
                'Error': function(up, err, errTip) {
                    console.log('up',up);
                    console.log('err',err);
                    alert(errTip);
                },
            }
        });
    });
    $scope.checkTitle=function($event){
        let obj=$('#titleClassify');
        let objMsg=$('#titleClassifyMsg');
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
        let obj=$('#desClassify');
        let objMsg=$('#desClassifyMsg');
        if(obj.val()){
            if(obj.val().length>100){
                objMsg.css({display:'inline-block'});
                objMsg.text('描述不能超过100个字');
                return false;
            }
            else{
                objMsg.css({display:'none'});
                return true;
            }
        }
        else{
            objMsg.css({display:'inline-block'});
            objMsg.text('描述不能为空');
            return false;
        }
    };
}
