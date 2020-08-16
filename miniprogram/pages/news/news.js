const app = getApp()
const db = wx.cloud.database();
const config = require("../../config.js");
const _ = db.command;

Page({
  data: {
    college: JSON.parse(config.data).college,
    collegeCur: -2,
    showList: false,
    scrollTop: 0,
    nomore: false,
    news: [],
  },
  onLoad() {
    this.getnews();
  },
  //监测屏幕滚动
  onPageScroll: function (e) {
    this.setData({
      scrollTop: parseInt((e.scrollTop) * wx.getSystemInfoSync().pixelRatio)
    })
  },


  //下拉刷新
  onPullDownRefresh() {
    this.getnews();
  },
  gotop() {
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  
  //获取轮播
  getnews() {
    let that = this;
    db.collection('news').where({}).get({
      success: function (res) {
        that.setData({
          news: res.data[0].list
        })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: JSON.parse(config.data).share_title,
      imageUrl: JSON.parse(config.data).share_img,
      path: '/pages/start/start'
    }
  },

})