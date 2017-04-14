/**
 * Created by SWSD on 2017-04-06.
 */
function startIndexBodyClassify(id,$scope){
    $scope.userImg=sessionStorage.userImg;
    $scope.userName=sessionStorage.userName;
    var nArray=['#252b5b','#380E52','#380C0F','#007F5A','#057497','#294739','#2092E3','14263A','grey','#000080','#4B3E0B'];
   $.get('/api/getCover',{id:id},function(res){
               if(res.text=='ok'){
                   console.log(res.data);
                 $scope.$apply(function(){
                     $scope.coverData=res.data.rows[0];
                     $scope.classify=res.data.rows2;
                     $scope.width=(1/(res.data.rows2.length-0))*100+'%';
                     for(var dat in res.data.rows2){
                         var l=Math.floor(Math.random()*nArray.length);
                         res.data.rows2[dat].bgColor=nArray[l]
                     }
                 });
               }
   });
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
                    console.log('info',info)
                    let sourceLink = 'http://'+domain +'/'+ res.key;//获取上传文件的链接地址
                    $('#muti_img').append('<img src='+sourceLink+' style="width:25%;height:100px;margin:10px;"/>')

                },
                'Error': function(up, err, errTip) {
                    console.log('up',up);
                    console.log('err',err);
                    alert(errTip);
                },
            }
        });
    });
}