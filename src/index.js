import A from '../public/a.png'
import './main.css'
import './fonts/iconfont.css'
const a = 'Hello ITEM'
console.log(a)
console.log('process.env.NODE_ENV=', process.env.NODE_ENV)

const img = new Image()
img.src = A

document.getElementById('imgBox').appendChild(img)
export default a