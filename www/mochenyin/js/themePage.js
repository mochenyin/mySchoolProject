function getThemePageController(themeId,classifyId,$scope) {
        let imagesKey='';
         $.get('/api/setHistroy',{themeId:themeId,userId:sessionStorage.Key});
        $.post('/api/getThemeDetail',{themeId:themeId},function(res){
            if(res.text=='ok'){
                let themeMsg=res.data.role[0];
                $scope.themeUserId=themeMsg.userId;
                if(themeMsg.themeImages){
                    let length=themeMsg.themeImages.length;
                    let str=themeMsg.themeImages.substring(0,length-1);
                    themeMsg.themeImages=str.split(';');
                }
                let liList=res.data.rows;
                for(var key in liList){
                    if(liList[key].userId==$scope.themeUserId){
                        liList[key].className='authorBlock'
                    }
                    else{
                        liList[key].className='authorNone'
                    }
                    if(liList[key].anserThemeImg){
                        let length=liList[key].anserThemeImg.length;
                        let str=liList[key].anserThemeImg.substring(0,length-1);
                        liList[key].anserThemeImg=str.split(';');
                    }
                }
                let readAuthor=false;
                $scope.authorText='只看楼主';
                $scope.readAuthor=function(){
                    readAuthor=!readAuthor;
                    $scope.authorText=readAuthor?'取消只看楼主':'只看楼主';
                    if(readAuthor){
                        $('.THeaderTitle:eq(2)').css({background:'#1E90FF',color:'white'});
                        $scope.listArray=$scope.listArray.filter(function(item){
                            return  item.userId==$scope.themeUserId
                        })
                    }
                    else{
                        $('.THeaderTitle:eq(2)').css({background:'#fff',color:'black'});
                        $scope.listArray=liList;
                    }
                };
                $scope.listArray=liList;
                $scope.$apply(function(){
                    $scope.themeTitle=themeMsg.themeTitle;
                    $scope.userImg=themeMsg.userImg;
                    $scope.userName=themeMsg.userName;
                    $scope.themeDesc=themeMsg.themeDesc;
                    $scope.themeContent=themeMsg.themeContent;
                    $scope.themeImages=themeMsg.themeImages;
                    $scope.add_date=themeMsg.add_date;
                });
            }
        });
        $scope.answer=function(){
            $(window).scrollTop($(document).height())
        };
    let isSave;
    $.get('/api/changeSave',{state:0,themeId:themeId,userId:sessionStorage.Key},function(res){
           if(res.text=='ok'){
               isSave=true;
               $scope.saveText='取消收藏';
               $('.THeaderTitle:eq(1)').css({background:'#1E90FF',color:'white'});
           }
        else{
               isSave=false;
               $scope.saveText='收藏';
               $('.THeaderTitle:eq(1)').css({background:'#fff',color:'black'});
           }
    });
        $scope.saveTheme=function(){
            isSave=!isSave;
            $scope.saveText=isSave?'取消收藏':'收藏';
            if(isSave){
                $('.THeaderTitle:eq(1)').css({background:'#1E90FF',color:'white'});
                $.get('/api/changeSave',{state:1,themeId:themeId,classifyId:classifyId,userId:sessionStorage.Key},function(res){

                })
            }
            else{
                $('.THeaderTitle:eq(1)').css({background:'#fff',color:'black'});
                $.get('/api/changeSave',{state:2,themeId:themeId,userId:sessionStorage.Key},function(res){

                })
            }
        };
    let isThumb;
    $.get('/api/changeThumb',{state:0,themeId:themeId,userId:sessionStorage.Key,authorId:$scope.themeUserId},function(res){
        if(res.text=='ok'){
            isThumb=true;
            $('.THeaderTumbe').css({background:'#1E90FF',color:'white'});
        }
        else{
            isThumb=false;
            $scope.saveText='收藏';
            $('.THeaderTumbe').css({background:'#fff',color:'black'});
        }
    });
    $scope.thumb=function(){
        isThumb=!isThumb;
        if(isThumb){
            $('.THeaderTumbe').css({background:'#1E90FF',color:'white'});
            $.get('/api/changeThumb',{state:1,themeId:themeId,userId:sessionStorage.Key,classifyId:classifyId,authorId:$scope.themeUserId},function(res){

            })
        }
        else{
            $('.THeaderTumbe').css({background:'#fff',color:'black'});
            $.get('/api/changeThumb',{state:2,themeId:themeId,userId:sessionStorage.Key,authorId:$scope.themeUserId},function(res){

            })
        }
    };
        $scope.addAnswerTheme=function(){
            if(sessionStorage.Key){
                if($scope.checkContent()){
                    let dat={
                        answerThemeUserId:sessionStorage.Key,
                        themeId:themeId,
                        answerThemeContent:$('#textTheme').val(),
                        anserThemeImg:imagesKey,
                        classifyId:classifyId,
                    };
                    $scope.cancelAdd=function(){
                        $('#textTheme').val('');
                        imagesKey='';
                        $('.themeImgs').remove();
                    };
                    $.post('/api/addThemeAnswer',dat,function(res){
                        if(res.text=='ok'){
                            let nImg='';
                            if(imagesKey.length){
                                let length=imagesKey.length;
                                let str=imagesKey.substring(0,length-1);
                                nImg=str.split(';');
                            }

                            let nData={
                                userName:sessionStorage.userName,
                                userImg:sessionStorage.userImg,
                                answerThemeContent:$('#textTheme').val(),
                                anserThemeImg:nImg,
                                add_date:'刚刚'
                            };
                            if(sessionStorage.Key==$scope.themeUserId){
                                nData.className='authorBlock'
                            }
                            else{
                                nData.className='authorNone'
                            }
                            $scope.$apply(function(){
                                $scope.listArray.push(nData);
                            });
                            $scope.text='发布成功';
                            boxshow($scope.text);
                            $('#textTheme').val('');
                            imagesKey='';
                            $('.themeImgs').remove();
                        }
                        else{
                            $scope.text='发布失败';
                            boxshow($scope.text);
                        }
                    })
                }
            }
            else{
                $scope.text='请先登录';
                boxshow($scope.text);
            }
        };
        $scope.checkContent=function($event){
            let obj=$('#textTheme');
            let objMsg=$('#textThemeMsg');
            if(!obj.val()){
                objMsg.css({display:'inline-block'});
                objMsg.text('内容不能为空');
                return false;
            }
            else{
                if(obj.val().length>500){
                    objMsg.css({display:'inline-block'});
                    objMsg.text('内容不能超过500个字');
                    return false;
                }
                else{
                    objMsg.css({display:'none'});
                    return true;
                }
            }
        };
        $.post('/api/getToken',function(res) {
            uploader = Qiniu.uploader({
                runtimes: 'html5,flash,html4',
                browse_button: 'addMutple',//上传按钮的ID
                container: 'btn-uploader3',//上传按钮的上级元素ID
                drop_element: 'btn-uploader3',
                max_file_size: '4mb',//最大文件限制
                flash_swf_url: '/js-sdk-master/js-sdk-master/demo/dist/Moxie.swf',
                dragdrop: false,
                //uptoken_url: '/api/getToken',//设置请求qiniu-token的url
                //uptoken_url:'http://up-z1.qiniu.com/',
                //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
                uptoken: res.data,
                //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
                unique_names: true,
                // 默认 false，key为文件名。若开启该选项，SDK会为每个文件自动生成key（文件名）
                save_key: true,
                // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK在前端将不对key进行任何处理
                domain: 'olcolkmpd.bkt.clouddn.com',//自己的七牛云存储空间域名
                multi_selection: true,//是否允许同时选择多文件
                //文件类型过滤，这里限制为图片类型
                filters: {
                    mime_types: [
                        {title: "Image files", extensions: "jpg,jpeg,gif,png"}
                    ]
                },
                auto_start: true,
                init: {
                    'FilesAdded': function (up, files) {

                    },
                    'BeforeUpload': function (up, file) {

                    },
                    'FileUploaded': function (up, file, info) {
                        let domain = up.getOption('domain');
                        let res = eval('(' + info + ')');
                        imagesKey += res.key + ';';
                        let sourceLink = 'http://' + domain + '/' + res.key;//获取上传文件的链接地址
                        $('#Tmuti_img').append('<img src=' + sourceLink + ' class="themeImgs" style="width:25%;height:100px;margin:10px;"/>')

                    },
                    'Error': function (up, err, errTip) {
                        console.log('up', up);
                        console.log('err', err);
                        alert(errTip);
                    },
                }
            });
        });
    };














