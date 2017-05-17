/**
 * Created by SWSD on 2017-02-27.
 */
var _qn={};
//文件上传
//需要填写你的 Access Key 和 Secret Key
$qiniu.conf.ACCESS_KEY = 'nyn08w1WGp6GxYfBbDr-mF-EV7dznhtxVGfWSrLG';
$qiniu.conf.SECRET_KEY = 'tGx2SxQc1roW0zN0xWc44SilSyXuRBX0UKHvpGCf';
bucket = 'ltmochenyin';//要上传的空间
key = 'my-nodejs-logo.png';//上传到七牛后保存的文件名
//构建上传策略函数，设置回调的url以及需要回调给业务服务器的数据
function uptoken(bucket) {
    var putPolicy = new $qiniu.rs.PutPolicy(bucket);
    return putPolicy.token();
}
//生成上传 Token
_token = uptoken(bucket);
module.exports =_token;


//要上传文件的本地路径
// filePath = './nodejs-logo.png';
// //构造上传函数
//  function uploadFile(localFile) {
//     var extra = new $qiniu.io.PutExtra();
//     $qiniu.io.putFile(_token, localFile, extra, function(err, ret) {
//         if(!err) {
//             // 上传成功， 处理返回值
//             console.log(ret.hash, ret.key, ret.persistentId);
//         } else {
//             // 上传失败， 处理返回代码
//             console.log(err);
//         }
//         return ret;
//     });
// }
// _uploadFile=uploadFile(filePath);

// //调用uploadFile上传
// uploadFile(token, key, filePath);

//构建bucketmanager对象
// var client = new $qiniu.rs.Client();
// //你要测试的空间， 并且这个key在你空间中存在
// // bucket = 'Bucket_Name';
// // key = 'nodejs-logo.png';
// //获取文件信息
// client.stat(bucket, key, function(err, ret) {
//     if (!err) {
//         console.log(ret.hash, ret.fsize, ret.putTime, ret.mimeType);
//     } else {
//         console.log(err);
//     }
// });