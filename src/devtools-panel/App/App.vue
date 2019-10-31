<template>
  <div style="display: flex; height: 100%">
    <el-card class="box-card" style="overflow-x: none;">
      <div slot="header" class="clearfix">
        <div>节点选择</div>
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
        <div>一些信息</div>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
        ></el-button>
      </div>
      <div>
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

        <div v-if="curEl">
          <h4>Class 筛选</h4>
          <el-checkbox-group v-model="curExpr.classes" v-if="curEl.classList && curEl.classList.length">
            <el-checkbox v-for="i in curEl.classList" :key="i" :label="i">
              <span style="font-weight: bold; margin-right: 1em">{{i}}</span>
            </el-checkbox>
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
          <h4>CSS Selector</h4>
          <div v-if="selectedEl">
            <span>{{resultCssSelector}}</span>
            <el-tag class="matched export" exprname='resultCssSelector'>{{count.cssSelector}} 个匹配</el-tag>
            <el-button type="small" @click="highlightByCssSelector" style="margin-left: .5rem">高亮</el-button>
            <el-button type="small" @click="highlightCancel">取消高亮</el-button>
          </div>
        </div>

        <div class="item">
          <!-- <div class="title">XPath</div> -->
          <h4>XPath</h4>
          <div v-if="selectedEl">
            <span>{{resultXPath}}</span>
            <el-tag class="matched export" exprname='resultXPath'>{{count.xpath}} 个匹配</el-tag>
            <el-button type="small" @click="highlightByXPath" style="margin-left: .5rem">高亮</el-button>
            <el-button type="small" @click="highlightCancel">取消高亮</el-button>
          </div>
        </div>

        <div class="item">
          <!-- <div class="title">CSS Selector</div> -->
          <h4>导出</h4>
          <div>
            <el-row>
              <el-button class="export" icon="el-icon-document-copy" exprname='resultCssSelector' size="small">获取CSS选择器</el-button>
              <el-button class="export" icon="el-icon-document-copy" exprname='resultCssSelectorJS' size="small">获取JS语句</el-button>
              <el-button class="export" icon="el-icon-document-copy" size="small" exprname='resultCssSelectorPy'>获取Python语句(lxml)</el-button>
            </el-row>
          </div>

          <div style="margin-top: 1rem">
            <el-row>
              <el-button class="export" icon="el-icon-document-copy" size="small" exprname='resultXPath'>获取XPath表达式</el-button>
              <el-button class="export" icon="el-icon-document-copy" size="small" exprname='resultXPathJS'>获取JS语句</el-button>
              <el-button class="export" icon="el-icon-document-copy" size="small" exprname='resultXPathPy'>获取Python语句(lxml)</el-button>
            </el-row>
          </div>
        </div>

      </div>
    </el-card>

  </div>
</template>

<script>
import browser from 'webextension-polyfill'
import ClipboardJS from 'clipboard'

let myQuote = (s) => {
  let singleFlag = (s.indexOf("'") != -1)
  let doubleFlag = (s.indexOf('"') != -1)

  if (singleFlag && doubleFlag) {
    return `'${s.replace(/'/g, "\\'")}'`
  }

  if (singleFlag) {
    return `"${s}"`
  }

  if (doubleFlag) {
    return `'${s}'`
  }

  return `'${s}'`
}

let pythonQuote = (s) => {
  let singleFlag = (s.indexOf("'") != -1)
  let doubleFlag = (s.indexOf('"') != -1)

  if (singleFlag && doubleFlag) {
    return `'''${s}'''`
  }

  if (singleFlag) {
    return `"${s}"`
  }

  if (doubleFlag) {
    return `'${s}'`
  }

  return `'${s}'`
}

export default {
  name: 'app',
  data () {
    return {
      curIndex: -1,
      exprIndex: 0,
      selectedEl: null,
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
        // console.log(111, this.selectedElParents[this.curIndex])
        return this.selectedElParents[this.curIndex][1]
      }
    },
    curElClassList () {
      let lst = []
      for (let i of curEl.classList) {
        if (i != '_quick_pick_hl') {
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
              tag: this.selectedElParents[i+1][1].extra.tag,
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
          base += `[contains(@class, ${myQuote(i)})]`
        }
        for (let i of expr.attrs) {
          // 暂不支持又有单引号又有双引号的xpath生成
          if ((i[1].indexOf('"') != -1) && (i[1].indexOf("'") != -1)) {
            continue
          }
          base += `[contains(@${i[0]}, ${myQuote(i[1])})]`
        }
        index ++
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
          if ((i[1].indexOf('\t') != -1) || (i[1].indexOf("\n") != -1)) {
            continue
          }
          base += `[${i[0]}=${myQuote(i[1])}]`
        }

        index ++
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
      return `page.xpath(${pythonQuote(this.resultXPath)})`
    },
    resultCssSelectorPy () {
      return `page.cssselect(${pythonQuote(this.resultXPath)})`
    }
  },
  watch: {
    'selectedEl': async function () {
      this.expr.attrs = []
      this.expr.classes = []
      this.expr.tag = this.selectedEl ? this.selectedEl.extra.tag : '*'
      this.expr.parent = null

      this.curIndex = 0
      this.exprIndex = 0
      await this.highlightCancel()
    },
    'resultXPath': async function () {
      if (!this.selectedEl) return
      let cmd = `document.evaluate(\`count(${this.resultXPath})\`, document, null, XPathResult.ANY_TYPE, null).numberValue`
      let ret = await browser.devtools.inspectedWindow.eval(cmd)
      // let ret = await browser.devtools.inspectedWindow.eval('$x(`' + this.xpath + '`).length')
      this.count.xpath = ret[0]

      await this.highlightCancel()
    },
    'resultCssSelector': async function () {
      if (!this.selectedEl) return
      let ret = await browser.devtools.inspectedWindow.eval('document.querySelectorAll(`' + this.resultCssSelector + '`).length')
      this.count.cssSelector = ret[0]

      await this.highlightCancel()
    }
  },
  methods: {
    async injectStyle () {
      let code = `if (!window._quick_pick_hl_flag) {
        let style = document.createElement('style');
        style.type = 'text/css';
        style.rel = 'stylesheet';
        style.append('._quick_pick_hl { outline: auto cornflowerblue; }');
        document.querySelector('body').appendChild(style);
        window._quick_pick_hl_flag = true;
      }`
      await browser.devtools.inspectedWindow.eval(code)
    },
    async highlightByXPath () {
      await this.injectStyle()

      let cmd = `(() => {
        let els = ${this.resultXPathJS};
        for (let i of els) {
          i.classList.add('_quick_pick_hl')
        }
      })()`

      await browser.devtools.inspectedWindow.eval(cmd)
    },
    async highlightByCssSelector () {
      await this.injectStyle()

      let cmd = `(() => {
        let els = ${this.resultCssSelectorJS};
        for (let i of els) {
          i.classList.add('_quick_pick_hl')
        }
      })()`

      await browser.devtools.inspectedWindow.eval(cmd)
    },
    async highlightCancel () {
      let cmd = `(() => {
        let els = document.querySelectorAll('._quick_pick_hl');
        for (let i of els) {
          i.classList.remove('_quick_pick_hl')
        }
      })()`
      await browser.devtools.inspectedWindow.eval(cmd)
    }
  },
  created () {
    this.$nextTick(function () {
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
        `)
          .then((result) => {
            this.selectedEl = result[0]
            this.curIndex = this.selectedEl.id
          });
      }

      browser.devtools.panels.elements.onSelectionChanged.addListener(handleSelectedElement)

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
