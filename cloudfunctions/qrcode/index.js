// 云函数入口文件
const cloud = require('wx-server-sdk')
const appid = 'wx2def96a0b2f3a19c'; //你的小程序appid
const secret = '6c1b95a9dc75dd8e982e34e2c9fda5eb'; //你的小程序secret
const envName = 'hardphp-0422'; // 小程序云开发环境ID
cloud.init({
      env: envName
})

// 云函数入口函数
exports.main = async(event, context) => {
      //先判断云存储是否存在此二维码
      try {
            await cloud.downloadFile({
                  fileID: 'share/' + event.scene + '.jpeg',
            })
            console.log('get from cos')
            return 'share/' + event.scene + '.jpeg'
       //不存在则进行生成
      } catch (e) {
            console.log('creat start')
            //先获取
            const bufferContent = await cloud.openapi.wxacode.getUnlimited({
                  scene: event.scene,
                  page: 'pages/detail/detail'
            })
            console.log(bufferContent)
            //再上传云存储
            const fileContent = await cloud.uploadFile({
                  cloudPath: 'share/' + event.scene + '.jpeg',
                  fileContent: bufferContent.buffer
            })
            return fileContent.fileID
      }
}