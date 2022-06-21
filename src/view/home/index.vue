<template>
  <button @click="count">click</button>
  <div>1234567890</div>
</template>

<script setup>
import { ref, reactive } from 'vue'
// 变量
const msg = 'Hello!'

const obj = {
  a:0,
  b:'1',
  c:true,
  d:[1,2,3],
  e:{
    e1:0,
    e2:'1',
    e3:false,
    e4:[1,'2','3',[1,2,3,4]],
    e5:{
      e51:123,
      e52:'123'
    }
  }
}
let refmsg = ref(msg)
let refObj = ref(obj)

let reactiveMsg = reactive(msg)
let reactiveObj = reactive(obj)
const count = () => {
console.log(refmsg);
console.log(reactiveMsg);
console.log('---------------------------');
console.log(refObj);
console.log(reactiveObj);
}

</script>



<style lang='scss' scoped>

</style>