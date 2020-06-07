<template>
  <div style="display: flex; height: 100%">
    <el-card class="box-card" style="overflow-x: none;">
      <div slot="header" class="clearfix">
        <div>层级选择</div>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
        ></el-button>
      </div>
        <div v-if="selectedEl">
          <h4>上级节点</h4>
          <el-button-group>
            <el-button v-for="(i, _) in selectedElParents" :key="_" :type="(i[1].id === curIndex) ? 'primary' : ''" @click="curIndex = i[1].id; if (exprIndex < curIndex) exprIndex = curIndex">{{i[1].extra.tag}}</el-button>
            <!-- <el-button v-for="(i, _) in selectedElParents" :key="_" :class="{primary: i[1].id === curEl.id}">{{i[1]}}</el-button> -->
          </el-button-group>

          <h4>语句层级</h4>
          <el-button-group>
            <el-button v-for="(i, _) in selectedElParents" :key="_" :type="(i[1].id === exprIndex) ? 'info' : ''" @click="exprIndex = i[1].id">{{i[1].extra.tag}}</el-button>
          </el-button-group>

        </div>
      <div>
      </div>
    </el-card>

    <el-card class="box-card" style="margin-left: 20px">
      <div slot="header" class="clearfix">
        <div>元素选择</div>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
        ></el-button>
      </div>
      <div>
        <div v-if="curEl">
          <h4>Class 筛选</h4>
          <el-checkbox-group v-model="curExpr.classes" v-if="curEl.classList && curEl.classList.length">
            <el-checkbox v-for="i in curEl.classList" :key="i" :label="i">
              <span style="font-weight: bold; margin-right: 1em">{{i}}</span>
            </el-checkbox>
          </el-checkbox-group>
          <div v-else>无</div>
        </div>

        <div v-if="curEl">
          <h4>属性筛选</h4>
          <el-checkbox-group v-model="curExpr.attrs" v-if="curEl.attrs && curEl.attrs.length">
            <el-checkbox v-for="i in curEl.attrs" :key="i[0]" :label="i">
              <span style="font-weight: bold; margin-right: 1em">{{i[0]}}</span>
              <span>{{i[1]}}</span>
            </el-checkbox>
            <!-- <span :key="i">{{i[0]}} {{i[1]}}</span> -->
          </el-checkbox-group>
          <div v-else>无</div>
        </div>
      </div>
    </el-card>

    <el-card class="box-card" style="margin-left: 20px; overflow-y: auto;">
      <div slot="header" class="clearfix">
        <div>结论</div>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
        ></el-button>
      </div>
      <div class="result">
        <div class="item">
          <!-- <div class="title">CSS Selector</div> -->
          <h4>
            <template>CSS Selector</template>
            <el-checkbox style="margin-left: 1rem" v-model="highlightOnCss">高亮</el-checkbox>
          </h4>
          <div v-if="selectedEl">
            <span>{{resultCssSelector}}</span>
            <el-tag class="matched export" exprname='resultCssSelector'>{{count.cssSelector}} 个匹配</el-tag>
          </div>
        </div>

        <div class="item">
          <!-- <div class="title">XPath</div> -->
          <h4>
            <template>XPath</template>
            <el-checkbox style="margin-left: 1rem" v-model="highlightOnXpath">高亮</el-checkbox>
          </h4>
          <div v-if="selectedEl">
            <span>{{resultXPath}}</span>
            <el-tag class="matched export" exprname='resultXPath'>{{count.xpath}} 个匹配</el-tag>
          </div>
        </div>

        <div class="item">
          <!-- <div class="title">CSS Selector</div> -->
          <h4>导出(点击复制)</h4>
          <div>
            <el-button-group>
              <el-button class="export" icon="el-icon-document-copy" exprname='resultCssSelector' size="small">CSS</el-button>
              <el-button class="export" icon="el-icon-document-copy" exprname='resultCssSelectorJS' size="small">JS</el-button>
              <el-button class="export" icon="el-icon-document-copy" size="small" exprname='resultCssSelectorPy'>PY(lxml)</el-button>
            </el-button-group>
          </div>

          <div style="margin-top: 1rem">
            <el-button-group>
              <el-button class="export" icon="el-icon-document-copy" size="small" exprname='resultXPath'>XPath</el-button>
              <el-button class="export" icon="el-icon-document-copy" size="small" exprname='resultXPathJS'>JS</el-button>
              <el-button class="export" icon="el-icon-document-copy" size="small" exprname='resultXPathPy'>PY(lxml)</el-button>
            </el-button-group>
          </div>
        </div>

      </div>
    </el-card>

  </div>
</template>

<script>
import browser from 'webextension-polyfill'
import ClipboardJS from 'clipboard'
import { jsQuote, pyQuote } from './utils'

export default {
  name: 'app',
  data () {
    return {
      curIndex: -1,
      exprIndex: 0,
      selectedEl: null,

      highlightOnCss: false,
      highlightOnXpath: false,

      expr: {
        tag: '',
        attrs: [],
        classes: [],
        parent: null
      },
      count: {
        cssSelector: 0,
        xpath: 0
      }
    }
  },
  computed: {
    curEl () {
      if (this.curIndex !== -1) {
        return this.selectedElParents[this.curIndex][1]
      }
      return null
    },
    curElClassList () {
      let lst = []
      for (let i of this.curEl.classList) {
        if (i !== '_ez_select_hl') {
          lst.push(i)
        }
      }
      return lst
    },
    curExpr: {
      get () {
        let expr = this.expr

        for (let i = 0; i < this.curIndex; i++) {
          if (!expr.parent) {
            expr.parent = {
              tag: this.selectedElParents[i + 1][1].extra.tag,
              attrs: [],
              classes: [],
              parent: null
            }
          }
          expr = expr.parent
        }

        return expr
      },
      set (value) {
      }
    },
    resultXPath () {
      let el = this.selectedEl
      if (!el) return

      let index = 0
      let solve = (expr) => {
        let base = `${expr.tag}`

        for (let i of expr.classes) {
          base += `[contains(@class, ${jsQuote(i)})]`
        }
        for (let i of expr.attrs) {
          // 暂不支持又有单引号又有双引号的xpath生成
          if ((i[1].indexOf('"') !== -1) && (i[1].indexOf("'") !== -1)) {
            continue
          }
          base += `[contains(@${i[0]}, ${jsQuote(i[1])})]`
        }
        index += 1
        if ((index <= this.exprIndex) && expr.parent) {
          base = solve(expr.parent) + '/' + base
        }
        return base
      }

      return '//' + solve(this.expr)
    },
    resultCssSelector () {
      let el = this.selectedEl
      if (!el) return

      let index = 0
      let solve = (expr) => {
        let base = `${expr.tag}`

        for (let i of expr.classes) {
          base += `.${i}`
        }

        for (let i of expr.attrs) {
          // 暂不支持有\n或\t的css选择器生成
          if ((i[1].indexOf('\t') !== -1) || (i[1].indexOf('\n') !== -1)) {
            continue
          }
          base += `[${i[0]}=${jsQuote(i[1])}]`
        }

        index += 1
        if ((index <= this.exprIndex) && expr.parent) {
          base = solve(expr.parent) + ' > ' + base
        }
        return base
      }

      return solve(this.expr)
    },
    selectedElParents () {
      let el = this.selectedEl
      if (!el) return

      let lst = []
      while (el) {
        lst.push([el.extra.tag, el])
        el = el.parentInfo
      }
      return lst
    },
    resultXPathJS () {
      let cmd = `(function () {
  let r = document.evaluate(\`${this.resultXPath}\`, document, null, XPathResult.ANY_TYPE, null);
  let lst = [];
  let el = null;
  while (el = r.iterateNext()) {
    lst.push(el);
  }
  return lst;
})()`
      return cmd
      // return '$x(`' + this.resultXPath + '`)'
    },
    resultCssSelectorJS () {
      return 'document.querySelectorAll(`' + this.resultCssSelector + '`)'
    },
    resultXPathPy () {
      return `page.xpath(${pyQuote(this.resultXPath)})`
    },
    resultCssSelectorPy () {
      return `page.cssselect(${pyQuote(this.resultXPath)})`
    }
  },
  watch: {
    // 开启关闭 css 高亮
    'highlightOnCss': async function (val) {
      if (val) {
        this.highlightOnXpath = false
        await this.highlightByCssSelector()
        // this.$set('highlightOnXpath', false)
      } else this.highlightCancel()
    },
    // 开启关闭 xpath 高亮
    'highlightOnXpath': async function (val) {
      if (val) {
        this.highlightOnCss = false
        await this.highlightByXPath()
        // this.$set('highlightOnCss', false)
      } else this.highlightCancel()
    },
    'selectedEl': async function () {
      this.expr.attrs = []
      this.expr.classes = []
      this.expr.tag = this.selectedEl ? this.selectedEl.extra.tag : '*'
      this.expr.parent = null

      this.curIndex = 0
      this.exprIndex = 0
      await this.refreshHighlight()
    },
    'resultXPath': async function () {
      if (!this.selectedEl) return
      let cmd = `document.evaluate(\`count(${this.resultXPath})\`, document, null, XPathResult.ANY_TYPE, null).numberValue`
      let ret = await browser.devtools.inspectedWindow.eval(cmd)
      // let ret = await browser.devtools.inspectedWindow.eval('$x(`' + this.xpath + '`).length')
      this.count.xpath = ret[0]
      await this.refreshHighlight()
    },
    'resultCssSelector': async function () {
      if (!this.selectedEl) return
      let ret = await browser.devtools.inspectedWindow.eval('document.querySelectorAll(`' + this.resultCssSelector + '`).length')
      this.count.cssSelector = ret[0]
      await this.refreshHighlight()
    }
  },
  methods: {
    async injectStyle () {
      let code = `if (!window._ez_select_hl_flag) {
        let style = document.createElement('style');
        style.type = 'text/css';
        style.rel = 'stylesheet';
        style.append('._ez_select_hl { outline: auto cornflowerblue !important; }');
        document.querySelector('body').appendChild(style);
        window._ez_select_hl_flag = true;
      }`
      await browser.devtools.inspectedWindow.eval(code)
    },
    async highlightByXPath () {
      await this.injectStyle()

      let cmd = `(() => {
        let els = ${this.resultXPathJS};
        for (let i of els) {
          i.classList.add('_ez_select_hl')
        }
      })()`

      await browser.devtools.inspectedWindow.eval(cmd)
    },
    async highlightByCssSelector () {
      await this.injectStyle()

      let cmd = `(() => {
        let els = ${this.resultCssSelectorJS};
        for (let i of els) {
          i.classList.add('_ez_select_hl')
        }
      })()`

      await browser.devtools.inspectedWindow.eval(cmd)
    },
    async highlightCancel () {
      let cmd = `(() => {
        let els = document.querySelectorAll('._ez_select_hl');
        for (let i of els) {
          i.classList.remove('_ez_select_hl')
        }
      })()`
      await browser.devtools.inspectedWindow.eval(cmd)
    },

    /** 重置高亮 */
    async refreshHighlight () {
      await this.highlightCancel()
      if (this.highlightOnCss) this.highlightByCssSelector()
      if (this.highlightOnXpath) this.highlightByXPath()
    }
  },
  created () {
    this.$nextTick(async function () {
      let handleSelectedElement = () => {
        browser.devtools.inspectedWindow.eval(`
if ($0) {
  let num = 0;
  let getElementInfo = function (el) {
      if (!el) return
      if (el === el.getRootNode()) return
      let attrs = []

      for (let i of el.attributes) {
          attrs.push([i.nodeName, i.value])
      }

      let classList = [...el.classList.values()]

      return {
          'id': num++,
          'parentInfo': getElementInfo(el.parentNode),
          'attrs': attrs,
          'classList': classList,
          'extra': {
              'str': el.toString(),
              'tag': el.localName,
              'outerHTML': el.outerHTML,
              // 'innerHTML': el.innerHTML,
              'innerText': el.innerText
          }
      }
  }

  getElementInfo($0)
}
        `).then((result) => {
          this.selectedEl = result[0]
          this.curIndex = this.selectedEl.id
          this.refreshHighlight()
        })
      }

      browser.devtools.panels.elements.onSelectionChanged.addListener(handleSelectedElement)
      await handleSelectedElement()

      let clipboard = new ClipboardJS('.export', {
        text: (trigger) => {
          let exprName = trigger.getAttribute('exprname')
          return this[exprName]
        }
      })

      clipboard.on('success', (e) => {
        this.$message('复制成功: ' + e.text)
        // console.info('Action:', e.action)
        // console.info('Text:', e.text)
        // console.info('Trigger:', e.trigger)
        e.clearSelection()
      })
    })
  }
}
</script>

<style>
.box-card {
  width: 600px;
  height: 100%;
}

.result > .item > .title {
  margin-top: 1rem;
  font-weight: bolder;
}

.matched {
  margin-left: 1rem;
  cursor: pointer;
}

html {
  height: 100%;
}

body {
  height: 95%;
}
</style>
