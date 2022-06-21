export default (key) => {
  // return config[process.env.VUE_APP_ENV][key] 
  return {
      baseURL: '/gateway/', 
  }[key]
}