import { useState, useRef, useEffect } from 'react'
import { Download, Sparkles, User, Quote, CheckCircle, Bold, List, AtSign, FileText, Smile, AlertCircle, Hash } from 'lucide-react'
import { domToPng } from 'modern-screenshot'

const THEMES = {
  geek: {
    name: '极客代码',
    bg: 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900',
    accent: 'from-green-400 to-emerald-500',
    text: 'text-gray-100',
    subtext: 'text-gray-400',
    cardBorder: 'border-2 border-gray-500/60',
    isDark: true,
    colors: ['#1f2937', '#10b981', '#34d399']
  },
  blue: {
    name: '蔚蓝灵感',
    bg: 'bg-gradient-to-b from-blue-100 via-cyan-50 to-sky-200',
    accent: 'from-blue-500 to-cyan-500',
    text: 'text-blue-900',
    subtext: 'text-blue-700',
    cardBorder: 'border border-blue-200/50',
    colors: ['#dbeafe', '#3b82f6', '#06b6d4']
  },
  pink: {
    name: '蜜桃日记',
    bg: 'bg-gradient-to-b from-pink-100 via-rose-50 to-pink-200',
    accent: 'from-pink-500 to-rose-500',
    text: 'text-pink-900',
    subtext: 'text-pink-700',
    cardBorder: 'border border-pink-200/50',
    colors: ['#fce7f3', '#ec4899', '#f43f5e']
  },
  glass: {
    name: '梦幻视窗',
    bg: 'bg-gradient-to-b from-violet-100 via-fuchsia-50 to-pink-100',
    accent: 'from-violet-500 to-fuchsia-500',
    text: 'text-gray-800',
    subtext: 'text-gray-600',
    cardBorder: 'border-2 border-white/80',
    glass: true,
    colors: ['#e9d5ff', '#8b5cf6', '#d946ef']
  },
  paper: {
    name: '纸墨极简',
    bg: 'bg-gradient-to-b from-amber-50 via-orange-50/30 to-yellow-50',
    accent: 'from-amber-700 to-orange-800',
    text: 'text-gray-800',
    subtext: 'text-gray-600',
    cardBorder: 'border border-amber-200/30',
    paper: true,
    colors: ['#fffbeb', '#d97706', '#ea580c']
  }
}

const PRD_TEMPLATE = `# PRD自查清单

## 需求完整性

- 用户场景是否覆盖完整
- 边界情况是否考虑
- 异常流程是否有处理方案
- 数据埋点是否规划

> 好的产品，细节决定成败 ✨

@产品经理小王`

const EMOJIS = ['✨', '🔥', '💡', '🎯', '⭐', '❤️', '🚀', '💪', '📌', '🎉', '👍', '🌟', '💼', '📊', '🎨', '✅']

const EMPTY_GUIDE = {
  title: '欢迎使用 RedCard',
  subtitle: '小红书干货卡片生成器',
  items: [
    '点击顶部「加载示例」快速开始',
    '或输入你的内容',
    '选择喜欢的主题',
    '导出精美图片'
  ],
  quote: '开始创作你的第一张卡片吧 ✨',
  author: '@你的小红书ID'
}

function App() {
  const [content, setContent] = useState(() => {
    return localStorage.getItem('redcard-content') || ''
  })
  const [theme, setTheme] = useState(() => localStorage.getItem('redcard-theme') || 'geek')
  const [exporting, setExporting] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showLoadConfirm, setShowLoadConfirm] = useState(false)
  const [hoveredTheme, setHoveredTheme] = useState(null)
  const cardRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('redcard-content', content)
  }, [content])

  useEffect(() => {
    localStorage.setItem('redcard-theme', theme)
  }, [theme])

  const parseContent = (text) => {
    const lines = text.trim().split('\n')
    const result = {
      title: '',
      subtitle: '',
      items: [],
      quote: '',
      author: ''
    }

    for (let line of lines) {
      line = line.trim()
      if (!line) continue

      if (line.match(/^#+/)) {
        const match = line.match(/^#+\s*(.+)/)
        if (match) {
          if (!result.title) {
            result.title = match[1]
          } else if (!result.subtitle) {
            result.subtitle = match[1]
          }
        }
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        result.items.push(line.replace(/^[-*] /, ''))
      } else if (line.startsWith('> ')) {
        result.quote = line.replace('> ', '')
      } else if (line.startsWith('@')) {
        result.author = line
      } else if (/^\d+\.\s/.test(line)) {
        result.items.push(line.replace(/^\d+\.\s/, ''))
      }
    }

    return result
  }

  const renderBoldText = (text) => {
    if (!text) return null
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>
      }
      return <span key={index}>{part}</span>
    })
  }

  const parsed = parseContent(content)
  const isEmpty = !content.trim()

  const insertText = (before, after = '') => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)
    
    setContent(newText)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const handleToolbarAction = (action) => {
    switch (action) {
      case 'bold':
        insertText('**', '**')
        break
      case 'h1':
        insertText('# ')
        break
      case 'h2':
        insertText('## ')
        break
      case 'list':
        insertText('- ')
        break
      case 'quote':
        insertText('> ')
        break
      case 'author':
        insertText('@')
        break
      case 'emoji':
        setShowEmojiPicker(!showEmojiPicker)
        break
    }
  }

  const insertEmoji = (emoji) => {
    insertText(emoji)
    setShowEmojiPicker(false)
  }

  const confirmLoadTemplate = () => {
    if (content.trim()) {
      setShowLoadConfirm(true)
    } else {
      setContent(PRD_TEMPLATE)
    }
  }

  const handleLoadTemplate = () => {
    setContent(PRD_TEMPLATE)
    setShowLoadConfirm(false)
  }

  const [showExportModal, setShowExportModal] = useState(false)

  const handleExport = async (selectedScale) => {
    if (!cardRef.current || exporting) return
    
    setShowExportModal(false)
    setExporting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const dataUrl = await domToPng(cardRef.current, {
        scale: selectedScale,
        backgroundColor: null
      })
      
      const link = document.createElement('a')
      link.download = `redcard-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('导出失败:', err)
    } finally {
      setExporting(false)
    }
  }

  const handleContextMenu = (e) => {
    e.preventDefault()
    setShowExportModal(true)
  }

  const currentTheme = THEMES[theme]
  const previewTheme = hoveredTheme ? THEMES[hoveredTheme] : currentTheme

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">RedCard</h1>
          <span className="text-sm text-gray-500">小红书干货卡片生成器</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {Object.entries(THEMES).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                onMouseEnter={() => setHoveredTheme(key)}
                onMouseLeave={() => setHoveredTheme(null)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all relative ${
                  theme === key 
                    ? 'bg-white text-gray-800 shadow-sm ring-2 ring-pink-400/50 animate-pulse' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: value.colors[0] }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: value.colors[1] }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: value.colors[2] }} />
                </div>
                <span className="ml-2">{value.name}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-medium hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? '导出中...' : '导出图片'}
          </button>
        </div>
      </header>

      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowExportModal(false)}>
          <div className="bg-white rounded-2xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-2">导出图片</h3>
            <p className="text-sm text-gray-500 mb-4">也可以直接在卡片上右键导出</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleExport(2)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-800 font-medium transition-colors"
              >
                2x 清晰度
              </button>
              <button
                onClick={() => handleExport(3)}
                className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium transition-colors"
              >
                3x 超清
              </button>
            </div>
            <button
              onClick={() => setShowExportModal(false)}
              className="mt-4 w-full py-2 text-gray-500 hover:text-gray-700 text-sm"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {showLoadConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowLoadConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">加载示例</h3>
                <p className="text-sm text-gray-500">当前内容将被覆盖</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">确定要加载示例内容吗？当前编辑的内容将会丢失。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoadConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleLoadTemplate}
                className="flex-1 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
              >
                确认加载
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex">
        <div className="w-2/5 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-100 overflow-visible">
            <div className="flex items-center justify-between mb-3 overflow-visible">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToolbarAction('h1')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors group relative"
                  title="标题"
                >
                  <span className="text-xs font-bold text-gray-600">H1</span>
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">标题 #</span>
                </button>
                <button
                  onClick={() => handleToolbarAction('h2')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors group relative"
                  title="副标题"
                >
                  <span className="text-xs font-bold text-gray-600">H2</span>
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">副标题 ##</span>
                </button>
                <button
                  onClick={() => handleToolbarAction('bold')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors group relative"
                >
                  <Bold className="w-4 h-4 text-gray-600" />
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">加粗 **文字**</span>
                </button>
                <button
                  onClick={() => handleToolbarAction('list')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors group relative"
                >
                  <List className="w-4 h-4 text-gray-600" />
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">列表项 - </span>
                </button>
                <button
                  onClick={() => handleToolbarAction('quote')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors group relative"
                >
                  <Quote className="w-4 h-4 text-gray-600" />
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">金句 &gt; </span>
                </button>
                <button
                  onClick={() => handleToolbarAction('author')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors group relative"
                >
                  <AtSign className="w-4 h-4 text-gray-600" />
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">作者 @</span>
                </button>
                <div className="relative">
                  <button
                    onClick={() => handleToolbarAction('emoji')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors group relative"
                  >
                    <Smile className="w-4 h-4 text-gray-600" />
                    <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">插入表情</span>
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex flex-wrap gap-1 z-50 w-40">
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => insertEmoji(emoji)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded text-base"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={confirmLoadTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                加载示例
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-4">
            <div className="w-full h-full flex bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-pink-500/20">
              <div className="w-10 bg-gray-100 border-r border-gray-200 flex-shrink-0 py-4 px-2 text-right select-none overflow-hidden">
                {content.split('\n').map((_, i) => (
                  <div key={i} className="text-xs text-gray-400 font-mono leading-6 h-6">{i + 1}</div>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 py-4 px-3 bg-transparent resize-none focus:outline-none font-mono text-sm leading-6 text-gray-800"
                placeholder="输入你的内容，支持 Markdown 语法..."
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        <div className="w-3/5 bg-gray-100 flex items-center justify-center p-8 overflow-auto">
          <div 
            ref={cardRef}
            onContextMenu={handleContextMenu}
            className={`relative w-[360px] h-[480px] rounded-3xl shadow-2xl overflow-hidden cursor-pointer ${previewTheme.bg} ${previewTheme.cardBorder} ${previewTheme.glass ? 'backdrop-blur-2xl' : ''}`}
            style={{ aspectRatio: '3/4' }}
          >
            {previewTheme.paper && (
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
              }} />
            )}
            
            {previewTheme.glass && (
              <div className="absolute inset-0 backdrop-blur-3xl bg-white/10" />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10 h-full flex flex-col p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-full ${previewTheme.isDark ? 'bg-red-500' : 'bg-red-400'}`} />
                  <div className={`w-3 h-3 rounded-full ${previewTheme.isDark ? 'bg-yellow-500' : 'bg-yellow-400'}`} />
                  <div className={`w-3 h-3 rounded-full ${previewTheme.isDark ? 'bg-green-500' : 'bg-green-400'}`} />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${previewTheme.accent} flex items-center justify-center`}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                {(isEmpty ? EMPTY_GUIDE.title : parsed.title) && (
                  <span className={`font-bold text-lg ${previewTheme.text}`}>
                    {isEmpty ? EMPTY_GUIDE.title : parsed.title}
                  </span>
                )}
              </div>

              {(isEmpty ? EMPTY_GUIDE.subtitle : parsed.subtitle) && (
                <h2 className={`text-sm font-semibold mb-3 ${previewTheme.subtext}`}>
                  {isEmpty ? EMPTY_GUIDE.subtitle : parsed.subtitle}
                </h2>
              )}

              <div className="flex-1 space-y-2.5">
                {(isEmpty ? EMPTY_GUIDE.items : parsed.items).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div className={`mt-0.5 w-4 h-4 rounded-full bg-gradient-to-br ${previewTheme.accent} flex items-center justify-center flex-shrink-0`}>
                      <CheckCircle className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className={`text-sm leading-relaxed ${previewTheme.text}`}>
                      {renderBoldText(item)}
                    </span>
                  </div>
                ))}
              </div>

              {(isEmpty ? EMPTY_GUIDE.quote : parsed.quote) && (
                <div className={`mt-4 p-3 rounded-xl ${previewTheme.glass ? 'bg-white/30 backdrop-blur-sm' : previewTheme.isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
                  <div className="flex items-start gap-2">
                    <Quote className={`w-4 h-4 mt-0.5 flex-shrink-0 ${previewTheme.subtext}`} />
                    <span className={`text-sm italic whitespace-nowrap ${previewTheme.subtext}`}>
                      {renderBoldText(isEmpty ? EMPTY_GUIDE.quote : parsed.quote)}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-auto pt-3 flex items-center">
                <div className={`flex items-center gap-1.5 ${previewTheme.isDark ? 'border-gray-700' : 'border-gray-200/50'} border-t pt-3 flex-1`}>
                  <User className={`w-3.5 h-3.5 ${previewTheme.subtext}`} />
                  <span className={`text-xs font-medium ${previewTheme.subtext}`}>
                    {isEmpty ? EMPTY_GUIDE.author : (parsed.author || '@你的小红书ID')}
                  </span>
                </div>
              </div>

            </div>
          </div>
          {hoveredTheme && hoveredTheme !== theme && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-full">
              预览主题: {THEMES[hoveredTheme].name}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
