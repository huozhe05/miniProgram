const db = wx.cloud.database();
const app = getApp();
const config = require("../../config.js");
Page({
      data: {
            systeminfo: app.systeminfo,
            entime: {
                  enter: 600,
                  leave: 300
            }, //进入褪出动画时长
        college: JSON.parse(config.data).college.splice(8,8),
            steps: [
                  {
                        text: '步骤一',
                        desc: '填写物品信息'
                  },
                  {
                        text: '步骤二',
                        desc: '发布成功'
                  },
            ],
      },
      //恢复初始态
      initial() {
            let that = this;
            that.setData({
                  dura: 30,
                  price: 15,
                  place: '',
                  chooseDelivery: 0,
                  cids: '-1', //学院选择的默认值
                  isbn: '',
                  show_b: true,
                  show_c: false,
                  active: 0,
                  chooseCollege: false,
                  note_counts: 0,
                  notes: '',
                  kindid: 0,
                  kindlexid: 0,
                  pic:'../../images/add.png',
                  pics:[],
                  picssw: true,
                  kind: [{
                        name: '通用',
                        id: 0,
                        check: true,
                  }, {
                        name: '其它',
                        id: 1,
                        check: false
                  }],
                  kindlex: [{
                    name: '手机号',
                    id: 0,
                    check: true,
                  }, {
                    name: 'QQ号',
                    id: 1,
                    check: false
                    }, {
                      name: '微信号',
                      id: 2,
                      check: false
                    }],
                  delivery: [{
                        name: '自提',
                        id: 0,
                        check: true,
                  }, {
                        name: '帮送',
                        id: 1,
                        check: false
                  }],
                  bookinfo:{
                    _id:'',
                    author:'',
                    edition:'',
                    pic:'',
                    price:'',
                    title:'',
                    summary:''
                  }
            })
      },
      onLoad() {
        this.initial();
        var infooo = wx.getStorageSync('userinfoq');
        var addr = this.data.kindlex;
        if (infooo.qqnum==''){
          addr = this.removeByValue(addr,1);
        }
        if (infooo.wxnum == '') {
          addr = this.removeByValue(addr, 2);
        }
        this.setData({
          kindlex: addr
        })

         
      },

  removeByValue(arr, val) {
    console.log(arr);
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id == val) {
        arr.splice(i, 1);
        
        break;
      }
    }
    return arr;
  },

      //手动输入isbn
      isbnInput(e) {
            this.data.isbn = e.detail.value;
      },
      //打开摄像头扫码isbn
      scan() {
            let that = this;
            wx.scanCode({
                  onlyFromCamera: false,
                  scanType: ['barCode'],
                  success: res => {
                        wx.showToast({
                              title: '扫码成功',
                              icon: 'success'
                        })
                        that.setData({
                              isbn: res.result
                        })
                  },
                  fail() {
                        wx.showToast({
                              title: '扫码失败，请重新扫码或者手动输入',
                              icon: 'none'
                        })
                  }
            })
      },
      confirm() {
            let that = this;
            let isbn = that.data.isbn;
            if (!(/978[0-9]{10}/.test(isbn))) {
                  wx.showToast({
                        title: '请检查您的isbn号',
                        icon: 'none'
                  });
                  return false;
            }
            if (!app.openid) {
                  wx.showModal({
                        title: '温馨提示',
                        content: '该功能需要注册方可使用，是否马上去注册',
                        success(res) {
                              if (res.confirm) {
                                    wx.navigateTo({
                                          url: '/pages/login/login',
                                    })
                              }
                        }
                  })
                  return false
            }
            that.get_book(isbn);
      },
      //查询书籍数据库详情
      get_book(bn) {
            let that = this;
            wx.showLoading({
                  title: '正在获取'
            })
            //先检查是否存在该书记录，没有再进行云函数调用
            db.collection('books').where({
                  isbn: bn
            }).get({
                  success(res) {
                        //添加到数据库
                        if (res.data == "") {
                              that.addbooks(bn);
                        } else {
                              wx.hideLoading();
                              that.setData({
                                    bookinfo: res.data[0],
                                    show_a: false,
                                    show_b: true,
                                    show_c: false,
                                    active: 1,
                              })
                        }
                  }
            })
      },
      //添加书籍信息到数据库
      addbooks(bn) {
            let that = this;
            wx.cloud.callFunction({
                  name: 'books',
                  data: {
                        $url: "bookinfo", //云函数路由参数
                        isbn: bn
                  },
                  success: res => {
                        if (res.result.body.status == 0) {
                              db.collection('books').add({
                                    data: res.result.body.result,
                                    success: function(res) {
                                          wx.hideLoading();
                                          that.setData({
                                                bookinfo: res.result.body.result,
                                                show_a: false,
                                                show_b: true,
                                                show_c: false,
                                                active: 1,
                                          })
                                    },
                                    fail: console.error
                              })
                        }
                  },
                  fail: err => {
                        console.error(err)
                  }
            })
      },
      //价格输入改变
      priceChange(e) {
            this.data.price = e.detail;
      },
      //时才输入改变
      duraChange(e) {
            this.data.dura = e.detail;
      },
      //地址输入
      placeInput(e) {
            console.log(e)
            this.data.place = e.detail.value
      },

      nameInput(e) {
        console.log(e)
        this.data.bookinfo.title = e.detail.value
      },

  ppriceInput(e) {
    console.log(e)
    this.data.bookinfo.price = e.detail.value
  },

  summaryInput(e) {
    console.log(e)
    this.data.bookinfo.summary = e.detail.value
  },
  closes(e) {
    var that = this;
    console.log(e.currentTarget.dataset['index']);
    var index = e.currentTarget.dataset['index'];
    var arrs = that.data.pics;
    var nesd = arrs.splice(index,1);
    console.log(arrs);
    that.setData({
      pics: arrs,
    });
    that.setData({
      picssw: true,
    });

  },
  changeBigImg() {
    let that = this;
    //let openid = app.globalData.openid || wx.getStorageSync('openid');
    wx.chooseImage({
      count: 3, 
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        });

       
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        for (var i = 0; i < res.tempFilePaths.length;i++){
          var sarr = that.data.pics;
          let filePath = res.tempFilePaths[i];
          const name = Math.random() * 1000000;
          const cloudPath = name + filePath.match(/\.[^.]+?$/)[0];
          
         
          wx.cloud.uploadFile({
            cloudPath,//云存储图片名字
            filePath,//临时路径
            success: res => {
              console.log('[上传图片] 成功：', res)
              that.data.bookinfo.pic = res.fileID;
              console.log('[上传图片] ：', that.data.bookinfo.pic);
              console.log(sarr.length);
              if (sarr.length == 3) {
                that.setData({
                  picssw: false,
                });
              } else if (sarr.length<3){
                sarr.push(res.fileID);
                that.setData({
                  pics: sarr,//云存储图片路径,可以把这个路径存到集合，要用的时候再取出来
                });
                if (sarr.length == 3){
                  that.setData({
                    picssw: false,
                  });
                }

              }
             
              console.log('[111] ：', that.data.pics);
              let fileID = res.fileID;
              //把图片存到users集合表
              const db = wx.cloud.database();
              db.collection("file").add({
                data: {
                  pic: fileID
                },
                success: function () {
                  wx.showToast({
                    title: '图片存储成功',
                    'icon': 'none',
                    duration: 3000
                  })
                },
                fail: function () {
                  wx.showToast({
                    title: '图片存储失败',
                    'icon': 'none',
                    duration: 3000
                  })
                }
              });
            },
            fail: e => {
              console.error('[上传图片] 失败：', e)
            },
            complete: () => {
              wx.hideLoading()
            }
          });
        }
        




      }
    })
  },

  //联系类别选择
  kindlexChange(e) {
    let that = this;
    let kind = that.data.kindlex;
    let id = e.detail.value;
    for (let i = 0; i < kind.length; i++) {
      kind[i].check = false
    }
    kind[id].check = true;
    that.setData({
      kindlex: kind,
      kindlexid: id
    })
  },

      //书籍类别选择
      kindChange(e) {
            let that = this;
            let kind = that.data.kind;
            let id = e.detail.value;
            for (let i = 0; i < kind.length; i++) {
                  kind[i].check = false
            }
            kind[id].check = true;
            if (id == 1) {
                  that.setData({
                        kind: kind,
                        chooseCollege: true,
                        kindid: id
                  })
            } else {
                  that.setData({
                        kind: kind,
                        cids: '-1',
                        chooseCollege: false,
                        kindid: id
                  })
            }
      },
      //选择专业
      choCollege(e) {
            let that = this;
            that.setData({
                  cids: e.detail.value
            })
      },
      //取货方式改变
      delChange(e) {
            let that = this;
            let delivery = that.data.delivery;
            let id = e.detail.value;
            for (let i = 0; i < delivery.length; i++) {
                  delivery[i].check = false
            }
            delivery[id].check = true;
            if (id == 1) {
                  that.setData({
                        delivery: delivery,
                        chooseDelivery: 1
                  })
            } else {
                  that.setData({
                        delivery: delivery,
                        chooseDelivery: 0
                  })
            }
      },
      //输入备注
      noteInput(e) {
            let that = this;
            that.setData({
                  note_counts: e.detail.cursor,
                  notes: e.detail.value,
            })
      },
      //发布校检
      check_pub() {
            let that = this;

        if (that.data.bookinfo.title == '') {
          wx.showToast({
            title: '请填写物品名称',
            icon: 'none',
          });
          return false;
        }
        if (that.data.bookinfo.price == '') {
          wx.showToast({
            title: '请填写物品原价',
            icon: 'none',
          });
          return false;
        }
        if (that.data.bookinfo.price == '') {
          wx.showToast({
            title: '请填写物品简介',
            icon: 'none',
          });
          return false;
        }
        if (that.data.pics == []) {
          wx.showToast({
            title: '请上传图片',
            icon: 'none',
          });
          return false;
        }
            //如果用户选择了专业类书籍，需要选择学院
            if (that.data.kind[1].check) {
                  if (that.data.cids == -1) {
                        wx.showToast({
                              title: '请选择学院',
                              icon: 'none',
                        });
                        return false;
                  }
            }
            //如果用户选择了自提，需要填入详细地址
            if (that.data.delivery[0].check) {
                  if (that.data.place == '') {
                        wx.showToast({
                              title: '请输入地址',
                              icon: 'none',
                        });
                        return false;
                  }
            }
            that.publish();
      },
      //正式发布
      publish() {
            let that = this;
            wx.showModal({
                  title: '温馨提示',
                  content: '经检测您填写的信息无误，是否马上发布？',
                  success(res) {
                        if (res.confirm) {
                              db.collection('publish').add({
                                    data: {
                                          creat: new Date().getTime(),
                                          dura: new Date().getTime() + that.data.dura * (24 * 60 * 60 * 1000),
                                          status: 0, //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
                                          price: that.data.price, //售价
                                          tyop:'1',
                                          like:false,
                                          //分类
                                          kindid: that.data.kindid, //区别通用还是专业
                                          kindlexid: that.data.kindlexid, //区别联系方式类型
                                          collegeid: that.data.cids, //学院id，-1表示通用类
                                          deliveryid: that.data.chooseDelivery, //0自1配
                                          place: that.data.place, //选择自提时地址
                                          notes: that.data.notes, //备注
                                          bookinfo: {
                                                _id: that.data.bookinfo._id,
                                                author: that.data.bookinfo.author,
                                                edition: that.data.bookinfo.edition,
                                                summary: that.data.bookinfo.summary,
                                                pic: that.data.pics[0],
                                                pics: that.data.pics,
                                                price: that.data.bookinfo.price,
                                                title: that.data.bookinfo.title,
                                          },
                                          key: that.data.bookinfo.title + that.data.bookinfo.keyword
                                    },
                                    success(e) {
                                          console.log(e)
                                          that.setData({
                                                show_a: false,
                                                show_b: false,
                                                show_c: true,
                                                active: 2,
                                                detail_id: e._id
                                          });
                                          //滚动到顶部
                                          wx.pageScrollTo({
                                                scrollTop: 0,
                                          })
                                    }
                              })
                        }
                  }
            })
      },
      detail() {
            let that = this;
            wx.navigateTo({
                  url: '/pages/detail/detail?scene=' + that.data.detail_id,
            })
      }
})