var o = function(o) {
    return o && o.__esModule ? o : {
      default: o
    };
  }(require("../../utils/weCropper.js")),
  e = wx.getSystemInfoSync(),
  t = e.windowWidth,
  r = e.windowHeight - 50;
var app = getApp();
Page({
  data: {
    cameraHidden: false,
    cropHidden: true,
    maskType: "IDCardFront",
    cropperOpt: {
      id: "cropper",
      width: t,
      height: r,
      scale: 2.5,
      zoom: 8,
      cut: {
        x: (t - 342.4) / 2,
        y: (r - 216) / 2,
        width: 342.4,
        height: 216
      }
    }
  },
  touchStart: function(o) {
    this.wecropper.touchStart(o);
  },
  touchMove: function(o) {
    this.wecropper.touchMove(o);
  },
  touchEnd: function(o) {
    this.wecropper.touchEnd(o);
  },
  getCropperImage: function() {
    var that = this;
    this.wecropper.getCropperImage(function(o) {
      that.getDetectData(o);
    });
  },
  getDetectData: function(path) {
    wx.showLoading({
      title: '识别中...',
    })
    console.log(this.token)
    var that = this;
    var urlStr = "";
    var param = {};
    switch (that.maskType) {
      case "IDCardFront":
      default:
        urlStr = "https://aip.baidubce.com/rest/2.0/ocr/v1/idcard";
        param.id_card_side = "front";
        param.detect_direction = true;
        break;
      case "IDCardBack":
        urlStr = "https://aip.baidubce.com/rest/2.0/ocr/v1/idcard";
        param.id_card_side = "back";
        param.detect_direction = true;
        break;
      case "BankCard":
        urlStr = "https://aip.baidubce.com/rest/2.0/ocr/v1/bankcard";
        break;
      case "LicensePlate":
        urlStr = "https://aip.baidubce.com/rest/2.0/ocr/v1/license_plate";
        break;
    }
    wx.getFileSystemManager().readFile({
      filePath: path,
      encoding: 'base64',
      success: res => {
        param.image = res.data;
        wx.request({
          url: urlStr + "?access_token=" + that.token,
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          method: "POST",
          data: param,
          success: function(res) {
            console.log(JSON.stringify(res))
            wx.hideLoading()
          },
          fail: function(res) {
            console.log(JSON.stringify(res))
            wx.hideLoading()
          },
          complete:function(res){
            var pages = getCurrentPages();
            var prepage = pages[pages.length-2];
            prepage.setData({
              recognizeResult:res
            });
            wx.navigateBack({})
          }
        })
      }
    })
  },
  onLoad: function(e) {
    console.log('url:' + app.json);
    var that = this;
    if (e.maskType && e.maskType != undefined && e.maskType !== "") {
      this.maskType = e.maskType;
    }
    var t = this.data.cropperOpt,
      r = "../../img/defaultImg.png";
    r && (Object.assign(t, {
      src: r
    }), new o.default(t).on("ready", function(o) {
      console.log("wecropper is ready for work!");
    }).on("beforeImageLoad", function(o) {}).on("imageLoad", function(o) {}));

    //请求token
    wx.request({
      url: "https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=" + app.baiduKeys.APIKey + "&client_secret=" + app.baiduKeys.SecretKey,
      success: function(res) {
        that.token = res.data.access_token
      }
    })
  },
  takePhoto: function() {
    var o = this;
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        wx.showLoading({
          title: '识别中...',
        })
        var t = res.tempImagePath;
        console.log('take photo success: ' + t);
        // o.wecropper.pushOrign(t);
        // o.setData({
        //   cameraHidden: true,
        //   cropHidden: false
        // })
        wx.getFileSystemManager().readFile({
          filePath: t,
          encoding: 'base64',
          success: res => {
            var param = {};
            param.img = res.data;
            console.log('readFile success: ' + param);
            wx.request({
              url: app.globalData.host +'/face',
              header: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              method: "POST",
              data: param,
              success: function(res) {
                console.log('face success: ' + JSON.stringify(res))
                var success = res.data.success;
                var face = res.data.success;
                if (success) {
                  wx.hideLoading()
                  wx.showToast({
                    title: '识别成功',
                    icon: 'success',
                    duration: 2000
                  })
                } else if (face == 0) {
                  wx.showLoading({
                    title: '未检测到人脸',
                  })
                  wx.showToast({
                    title: '未检测到人脸',
                    icon: 'error',
                    duration: 2000
                  })
                } else {
                  wx.showToast({
                    title: '识别错误',
                    icon: 'error',
                    duration: 2000
                  })
                }
              },
              fail: function(res) {
                wx.hideLoading()
                console.log('face fail: ' + JSON.stringify(res))
                wx.showToast({
                  title: '连接错误',
                  icon: 'error',
                  duration: 2000
                })
              },
            })
          }
        })
      }
    })
  },
  cancel: function() {
    this.setData({
      cameraHidden: false,
      cropHidden: true
    })
  }
});