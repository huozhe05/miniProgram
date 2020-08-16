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
            list: [],
      },
      onLoad() {
            this.getList();
      },
      onShow(){
        this.getList();
      },
      //监测屏幕滚动
      onPageScroll: function(e) {
            this.setData({
                  scrollTop: parseInt((e.scrollTop) * wx.getSystemInfoSync().pixelRatio)
            })
      },

    
   
 
      getList() {
            let that = this;
            if (that.data.collegeCur == -2) {
                  var collegeid = _.neq(-2); //除-2之外所有
            } else {
                  var collegeid = that.data.collegeCur + '' //小程序搜索必须对应格式
            }

            db.collection('likes').where({
              _openid: app.openid,
            }).get({
              success: function (res) {
                if (res.data.length == 0) {
                  return
                } 
                
                var arrf = res.data;
                console.log(arrf)
                var arrfd = [];
                for (var i = 0; i < arrf.length;i++){
                  arrfd.push(arrf[i]._id);
                }
                console.log(arrfd)
                db.collection('publish').where({
                  dura: _.gt(new Date().getTime()),
                  collegeid: collegeid,
                  _id: _.in(arrfd)
                }).orderBy('creat', 'desc').limit(20).get({
                  success: function (res) {
                    wx.stopPullDownRefresh(); //暂停刷新动作
                    if (res.data.length == 0) {
                      that.setData({
                        nomore: true,
                        list: [],
                      })
                      return false;
                    }
                    if (res.data.length < 20) {
                      that.setData({
                        nomore: true,
                        page: 0,
                        list: res.data,
                      })
                    } else {
                      that.setData({
                        page: 0,
                        list: res.data,
                        nomore: false,
                      })
                    }
                  }
                })

              }
            })

           
      },
      more() {
            let that = this;
            if (that.data.nomore || that.data.list.length < 20) {
                  return false
            }
            let page = that.data.page + 1;
            if (that.data.collegeCur == -2) {
                  var collegeid = _.neq(-2); //除-2之外所有
            } else {
                  var collegeid = that.data.collegeCur + '' //小程序搜索必须对应格式
            }

        db.collection('likes').where({
          _openid: app.openid,
        }).get({
          success: function (res) {
            if (res.data.length == 0) {
              return
            }

            var arrf = res.data;
            var arrfd = [];
            for (var i = 0; i < arrf.length; i++) {
              arrfd.push(arrf[i].id);
            }
            db.collection('publish').where({
              dura: _.gt(new Date().getTime()),
              collegeid: collegeid,
              _id: _.in(arrfd)
            }).orderBy('creat', 'desc').skip(page * 20).limit(20).get({
              success: function (res) {
                if (res.data.length == 0) {
                  that.setData({
                    nomore: true
                  })
                  return false;
                }
                if (res.data.length < 20) {
                  that.setData({
                    nomore: true
                  })
                }
                that.setData({
                  page: page,
                  list: that.data.list.concat(res.data)
                })
              },
              fail() {
                wx.showToast({
                  title: '获取失败',
                  icon: 'none'
                })
              }
            })

          }
        })


            
      },
      onReachBottom() {
            this.more();
      },
      //下拉刷新
      onPullDownRefresh() {
            this.getList();
      },
      gotop() {
            wx.pageScrollTo({
                  scrollTop: 0
            })
      },
      //跳转详情
      detail(e) {
            let that = this;
            wx.navigateTo({
                  url: '/pages/detail/detail?scene=' + e.currentTarget.dataset.id,
            })
      },


  //修改收藏状态
  like(e) {
    
    let that = this;
    var _idx = e.currentTarget.dataset.id;

    wx.showLoading({
      title: '正在处理',
    })

    db.collection('likes').doc(_idx).remove({
      success: res => {
        wx.hideLoading();
        wx.showToast({
          title: '取消成功',
        })
        that.getList();
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          icon: 'none',
          title: '取消失败',
        })
        console.error('[数据库] [删除记录] 失败：', err)
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