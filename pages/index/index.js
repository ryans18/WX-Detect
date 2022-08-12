//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    inputValue: "IDCardBack"
  },
  onShow: function() {
    if (this.data.recognizeResult) {
      this.setData({
        text: JSON.stringify(this.data.recognizeResult)
      })
    }
  },
  onLoad: function() {
    
  },
  startRegist: function() {
    wx.navigateTo({
      url: '../regist/index'
    })
  },
  startFace: function() {
    wx.navigateTo({
      url: '../camera/camera?maskType=' + this.data.inputValue
    })
  }
})