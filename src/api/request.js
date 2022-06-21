import axios from 'axios'
import qs from 'qs'
import Notification from '@/packages/notification'

import md5 from "md5";

import config from '../config'

/**
 * @description 自定义逻辑封装：后端子服务接口code处理
 * @param {*} code
 * @param {*} msg
 */
const createUuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 | 0
    // 生成y位数大于等于8小于等于11
    let v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16) //转换成16进制
  })
} 
// eslint-disable-next-line no-unused-vars
const handleCode = (code, msg) => {
  // code 封装.....
  // Message({
  //   type: 'error',
  //   message: msg || `后端接口${code}异常`
  // })
  // eg：
  // if (code === 501 || code === 502) {
  // 跳转相应无权限页
  //   router.push({ path: '/404' }).catch(() => {});
  // } else {
  //   Message({
  //     showClose: true,
  //     type: 'error',
  //     message: msg || `后端接口${code}异常`,
  //   });
  // }
}

/**
 * @description  upc接口错误码处理
 *          upc接口错误码描述： 400003: 请登录；200001: 调用接口失败，100002: 文件上传失败，100001: 参数格式错误
 * @param {*} code
 * @param {*} msg
 */
const handleCodeOfUPC = (code, msg) => {
  if (code === 400003) {
    window.location.href = `${
      config('upcHostBase') || '//work-be.test.mi.com'
    }/login?redirect=${encodeURI(window.location.href)}`
  } else {
    window.console.log(code, msg)
    // Message({
    //   type: 'error',
    //   message: msg || `后端接口${code}异常`
    // })
  }
}

/**
 * 请求正常服务端返回 code 处理
 * 接口需分 upc、相应后端服务 两种服务接口，UPC接口字符串含v1，通过v1 区别
 * @param {*} res
 */
// eslint-disable-next-line no-unused-vars
const checkCode = (res, successCode = 200) => {
  
  if (res.status === 200) {
    if (res?.headers?.accesstoken) {
      localStorage.setItem('tokenTime', new Date().getTime())
      localStorage.setItem('accesstoken', res.headers.accesstoken);
    }
    // console.log(res?.headers)
    if (res?.headers?.refreshtoken) {
      localStorage.setItem('refreshtoken', res.headers.refreshtoken);
    }
    if (res.data && res.data.code === successCode) {
      return Promise.resolve(res.data)
    }
    
    if([1102, 1003, 1002, 401].includes(res.data.code)) {
      location.href = `/login`
    } else {
      if(res.data.code!==10001){
        Notification({
          message: res.data.message,
        })
        // type: 'error'
      }
    }


    // Promise.resolve(res)
    // upc接口code处理方法
    if (res.config.url.match('/v1/')) {
      handleCodeOfUPC(res.data.code, res.data.msg)
    } else {
      // 相应后端子应用处理方法
      handleCode(res.data.code, res.data.message)
    }
    return Promise.reject(res)
  }

  return Promise.reject(res)
}

/**
 * 请求异常 status 处理
 * @param {*} res
 */
const checkStatus = (error) => {
  let { message } = error
  if (message === 'Network Error') {
    message = '后端接口连接异常'
  }
  if (message.includes('timeout')) {
    message = '后端接口请求超时'
  }
  if (message.includes('Request failed with status code')) {
    const code = message.substr(message.length - 3)
    message = `后端接口${code}异常`
  }
  // Message({
  //   type: 'error',
  //   message
  // })

  return Promise.reject(error)
}

/**
 * 兼容 contentType 类型
 * @param {*} config
 */
const checkContentType = (config) => {
  if (
    Object.prototype.toString.call(config.data) !== '[object FormData]' &&
    config.headers['Content-Type'] === 'application/x-www-form-urlencoded'
  ) {
    config.data = qs.stringify(config.data)
  }
  if (config.otherConfig) {
    config = { ...config, ...config.otherConfig }
  }

  return config
}

export const defaultHeader = () => {
  const _header = {
    os: 'web',
    ts: Date.now(),
    nonce: createUuid(),
    businessLine: 100,
    platform: 40,
    appVersion : 1000,
    accesstoken: localStorage.getItem('accesstoken')
  }
  _header.requestSign = md5(`os=${_header.os}&ts=${_header.ts}&nonce=${_header.nonce}shi!@#$%^&[xian!@#]`).slice(4,13)
  return _header
}


const instance = axios.create({
  baseURL: config('baseURL'),
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})
const newInstance = axios.create({
  baseURL: process.env.VUE_APP_ENV === 'production'? 'https://gateway.36kr.com' : 'https://gateway-test.36kr.com',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 兼容 contentType 类型
 * @param {*} config
 */

// eslint-disable-next-line no-unused-vars
const setInterceptors = (instance, successCode = 200) => {
  // 请求拦截处理
  instance.interceptors.request.use(
    (config) => checkContentType(config),
    (error) => Promise.reject(error)
  )

  // 响应拦截处理
  instance.interceptors.response.use(
    (response) => checkCode(response, successCode),
    (error) => checkStatus(error)
  )
  // instance.interceptors.response.use(config => {  return config })
}
setInterceptors(instance)
setInterceptors(newInstance, 0)

export default {
  // 抛出axios 实例方便扩展
  request: newInstance,
  /**
   * GET 请求
   * @param {*} url
   * @param {*} params
   * @param {*} headers
   */
  get (url, params, headers = {}) {
    return instance({
      url,
      method: 'GET',
      params,
      headers: Object.assign(defaultHeader(),headers)
    })
  },

  /**
   * POST请求
   * @param {*} url
   * @param {*} data
   * @param {*} headers
   */
  post (url, data, headers = {}) {
    return instance({
      url,
      method: 'POST',
      data,
      headers: Object.assign(defaultHeader(),headers)
    })
  },


  /**
   * 上传请求
   * @param {*} url
   * @param {*} formdata
   * @param {*} headers
   */
  upload (
    url,
    formdata,
    headers = {
      'Content-Type': 'multipart/form-data'
    }
  ) {
    // 注意： 这个baseUrl 是UPC接口域名，若不是建议重新基于request封装下
    return instance({
      url: config('baseUrl') + url,
      method: 'POST',
      headers,
      data: formdata
    })
  },

  /**
   * 下载请求
   * @param {*} url
   * @param {*} data
   * @param {*} headers
   * @param {*} method
   */
  download (url, data, headers, method) {
    return instance({
      url,
      method,
      responseType: 'blob',
      transformResponse: [(res) => res],
      data,
      headers
    })
  },
}
