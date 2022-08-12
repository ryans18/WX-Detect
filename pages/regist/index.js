var app = getApp();
Page({
  data: {
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
  onLoad: function(e) {
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
              url: app.globalData.host + '/regist',
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
                    title: '注册人脸成功',
                    icon: 'success',
                    duration: 2000
                  })
                } else if (face == 0) {
                  wx.showToast({
                    title: '未检测到人脸',
                    icon: 'error',
                    duration: 2000
                  })
                } else {
                  wx.showToast({
                    title: '注册人脸失败',
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