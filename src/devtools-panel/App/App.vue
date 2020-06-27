<template>
  <div style="display: flex; height: 100%">
    <!-- first panel -->
    <el-card class="box-card" style="overflow-x: none; overflow-y: auto;">
      <div slot="header" class="clearfix">
        <div>{{ $t('layerSelect') }}</div>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
        ></el-button>
      </div>
        <div v-if="selectedEl">
          <h4>{{ $t('parentNodes') }}</h4>
          <el-button-group>
            <el-button v-for="(i, _) in selectedElParents" size="small" :key="_" :type="(i[1].id === curIndex) ? 'primary' : ''" @click="curIndex = i[1].id; if (exprIndex < curIndex) exprIndex = curIndex">{{i[1].extra.tag}}</el-button>
            <!-- <el-button v-for="(i, _) in selectedElParents" :key="_" :class="{primary: i[1].id === curEl.id}">{{i[1]}}</el-button> -->
          </el-button-group>

          <h4>{{ $t('layerLimit') }}</h4>
          <el-button-group>
            <el-button v-for="(i, _) in selectedElParents" size="small" :key="_" :type="(i[1].id === exprIndex) ? 'info' : ''" @click="exprIndex = i[1].id">{{i[1].extra.tag}}</el-button>
          </el-button-group>
        </div>
      <div>
      </div>
    </el-card>

    <!-- second panel -->
    <el-card class="box-card" style="margin-left: .5rem; white-space: normal; overflow: auto;">
      <div slot="header" class="clearfix">
        <div>{{ $t('elementSelect') }}</div>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
        ></el-button>
      </div>
      <div>
        <div v-if="curEl">
          <h4>{{ $t('classFilters') }}</h4>
          <el-checkbox-group v-model="curExpr.classes" v-if="curEl.classList && curEl.classList.length">
            <el-checkbox v-for="i in curEl.classList" :key="i" :label="i">
              <span style="font-weight: bold; margin-right: 1em">{{i}}</span>
            </el-checkbox>
          </el-checkbox-group>
          <div v-else>{{ $t('nothing') }}</div>
        </div>

        <div v-if="curEl">
          <h4>{{ $t('attributeFilters') }}</h4>
          <el-checkbox-group v-model="curExpr.attrs" v-if="curEl.attrs && curEl.attrs.length">
            <el-checkbox v-for="i in curEl.attrs" :key="i[0]" :label="i">
              <span style="font-weight: bold; margin-right: 1em">{{i[0]}}</span>
              <span>{{i[1]}}</span>
            </el-checkbox>
            <!-- <span :key="i">{{i[0]}} {{i[1]}}</span> -->
          </el-checkbox-group>
          <div v-else>{{ $t('nothing') }}</div>
        </div>

        <!-- <div v-if="curEl">
          <h4>{{ $t('options') }}</h4>
          <el-checkbox v-model="curExpr.useNthChild">:nth-child()</el-checkbox>
        </div> -->
      </div>
    </el-card>

    <!-- third panel -->
    <el-card class="box-card" style="margin-left: .5rem; overflow-y: auto;">
      <div slot="header" class="clearfix">
        <div>
          <template>{{ $t('conclusion') }}</template>
          <div style="float: right">
            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link">{{conclusionType}}<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="CSS">CSS</el-dropdown-item>
                <el-dropdown-item command="XPATH">XPATH</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
        ></el-button>
      </div>
      <div class="result">
        <div class="item">
          <!-- <div class="title">CSS Selector</div> -->
          <h4>
            <template v-if="conclusionType == 'XPATH'">XPath</template>
            <template v-else>CSS Selector</template>
            <el-checkbox style="float: right" v-model="highlightOn">{{ $t('highlight') }}</el-checkbox>
          </h4>
          <div v-if="selectedEl">
            <span>{{rcur.selector}}</span>
            <el-tag class="matched export" exprname='rcur.selector'>{{count.cssSelector}} {{ $t('matchCount') }}</el-tag>
          </div>
        </div>

        <div class="item">
          <h4>{{ $t('export') }}</h4>
          <div>
            <el-button-group>
              <el-button class="export" icon="el-icon-document-copy" exprname='rcur.selector' size="small">{{ conclusionType }}</el-button>
              <el-button class="export" icon="el-icon-document-copy" exprname='rcur.jsConsoleExpr' size="small">JS</el-button>
              <el-button class="export" icon="el-icon-document-copy" size="small" exprname='rcur.pyLxmlExpr'>PY(lxml)</el-button>
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
import { computeCssSelector, computeXpath } from './compute'

export default {
  name: 'app',
  data () {
    return {
      curIndex: -1,
      exprIndex: 0,
      selectedEl: null,

      conclusionType: 'CSS',
      highlightOn: false,

      expr: {
        tag: '',
        attrs: [],
        classes: [],
        parent: null,
        useNthChild: false,
        parentNodesLength: 0,
        parentNodesIndex: 0
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
            let elInfo = this.selectedElParents[i + 1][1]
            expr.parent = {
              tag: elInfo.extra.tag,
              attrs: [],
              classes: [],
              parent: null,
              useNthChild: false,

              parentNodesLength: elInfo.parentNodesLength,
              parentNodesIndex: elInfo.parentNodesIndex
            }
          }
          expr = expr.parent
        }

        return expr
      },
      set (value) {
      }
    },
    /** result of css */
    rcss () {
      let el = this.selectedEl
      if (!el) return
      return computeCssSelector(this.expr, this.exprIndex)
    },
    /** result of xpath */
    rxpath () {
      let el = this.selectedEl
      if (!el) return
      return computeXpath(this.expr, this.exprIndex)
    },
    /** result of current */
    rcur () {
      if (this.conclusionType === 'CSS') {
        return this.rcss
      }
      if (this.conclusionType === 'XPATH') {
        return this.rxpath
      }
      return this.rcss
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
    }
  },
  watch: {
    'highlightOn': async function (val) {
      if (val) {
        this.highlightSetup()
      } else {
        this.highlightCancel()
      }
    },
    'selectedEl': async function () {
      this.expr.attrs = []
      this.expr.classes = []
      this.expr.tag = this.selectedEl ? this.selectedEl.extra.tag : '*'
      this.expr.parent = null
      this.expr.useNthChild = false
      this.expr.parentNodesLength = this.selectedEl.parentNodesLength
      this.expr.parentNodesIndex = this.selectedEl.parentNodesIndex

      this.curIndex = 0
      this.exprIndex = 0
      await this.refreshHighlight()
    },
    'rxpath': async function () {
      if (!this.selectedEl) return
      let cmd = `document.evaluate(\`count(${this.rxpath.selector})\`, document, null, XPathResult.ANY_TYPE, null).numberValue`
      let ret = await browser.devtools.inspectedWindow.eval(cmd)
      // let ret = await browser.devtools.inspectedWindow.eval('$x(`' + this.xpath + '`).length')
      this.count.xpath = ret[0]
      await this.refreshHighlight()
    },
    'rcss': async function () {
      if (!this.selectedEl) return
      let ret = await browser.devtools.inspectedWindow.eval(`${this.rcss.jsConsoleExpr}.length`)
      this.count.cssSelector = ret[0]
      await this.refreshHighlight()
    }
  },
  methods: {
    handleCommand (command) {
      this.conclusionType = command
      this.highlightOn = false
      this.highlightCancel()
    },
    async injectStyle () {
      let code = `if (!window._ez_select_hl_flag) {
        let style = document.createElement('style');
        style.type = 'text/css';
        style.rel = 'stylesheet';
        style.append('._ez_select_hl { outline: auto cornflowerblue !important; background-color: cornflowerblue; }');
        document.querySelector('body').appendChild(style);
        window._ez_select_hl_flag = true;
      }`
      await browser.devtools.inspectedWindow.eval(code)
    },
    async highlightSetup () {
      await this.injectStyle()
      let getElements = `let els = ${this.rcur.jsConsoleExpr};`

      let cmd = `(() => {
        ${getElements}
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
      if (this.highlightOn) this.highlightSetup()
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
        if (i.nodeName !== 'class') {
          attrs.push([i.nodeName, i.value])
        }
      }

      let classList = [...el.classList.values()]
      let hlIndex = classList.indexOf('_ez_select_hl')
      if (hlIndex !== -1) {
        classList.splice(hlIndex, 1)
      }

      let index = 0
      let parentNodesLength = 0
      if (el.parentElement) {
        let pnodes = el.parentElement.childNodes
        for (; index < pnodes.length; index++) {
          if (pnodes[index] == el) break
        }
        parentNodesLength = pnodes.length
      }

      return {
          'id': num++,
          'parentInfo': getElementInfo(el.parentNode),
          'attrs': attrs,
          'classList': classList,
          'parentNodesLength': parentNodesLength,
          'parentNodesIndex': index,
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
          let exprNames = trigger.getAttribute('exprname').split('.')
          let val = this
          for (let i of exprNames) {
            val = val[i]
          }
          return val
        }
      })

      clipboard.on('success', (e) => {
        this.$message(this.$t('copied') + e.text)
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

.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
}

.el-icon-arrow-down {
  font-size: 12px;
}

</style>
