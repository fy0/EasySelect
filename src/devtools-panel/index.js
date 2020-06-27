import Vue from 'vue'
import AppComponent from './App/App.vue'
import i18n from './i18n'

import {
  Tag,
  Card,
  Button,
  Checkbox,
  CheckboxButton,
  CheckboxGroup,
  ButtonGroup,
  Row,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Message
} from 'element-ui'

Vue.component('app-component', AppComponent)

Vue.use(Tag)
Vue.use(Card)
Vue.use(Button)
Vue.use(ButtonGroup)
Vue.use(Checkbox)
Vue.use(CheckboxButton)
Vue.use(CheckboxGroup)
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
Vue.use(Row)

Vue.prototype.$message = Message

new Vue({
  el: '#app',
  i18n,
  render: createElement => {
    return createElement(AppComponent)
  }
})
