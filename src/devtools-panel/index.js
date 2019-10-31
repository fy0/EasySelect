import Vue from "vue";
import AppComponent from "./App/App.vue";

Vue.component("app-component", AppComponent);

import {
  Tag,
  Card,
  Button,
  Checkbox,
  CheckboxGroup,
  ButtonGroup,
  Row,
  Message
} from 'element-ui';

Vue.use(Tag)
Vue.use(Card)
Vue.use(Button)
Vue.use(ButtonGroup)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(Row)

Vue.prototype.$message = Message

new Vue({
  el: "#app",
  render: createElement => {
    return createElement(AppComponent);
  }
});
