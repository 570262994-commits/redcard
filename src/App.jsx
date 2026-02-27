import { useState, useRef } from 'react'
import { Download, Palette, Sparkles, User, Quote, CheckCircle } from 'lucide-react'
import html2canvas from 'html2canvas'

const THEMES = {
  gray: {
    name: '高级灰',
    bg: 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300',
    accent: 'from-gray-600 to-gray-800',
    text: 'text-gray-800',
    subtext: 'text-gray-600'
  },
  blue: {
    name: '多巴胺蓝',
    bg: 'bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-200',
    accent: 'from-blue-500 to-cyan-500',
    text: 'text-blue-900',
    subtext: 'text-blue-700'
  },
  pink: {
    name: '多巴胺粉',
    bg: 'bg-gradient-to-br from-pink-100 via-rose-100 to-pink-200',
    accent: 'from-pink-500 to-rose-500',
    text: 'text-pink-900',
    subtext: 'text-pink-700'
  },
  glass: {
    name: '磨砂玻璃',
    bg: 'bg-gradient-to-br from-white/80 via-white/60 to-white/40',
    accent: 'from-violet-500 to-purple-500',
    text: 'text-gray-800',
    subtext: 'text-gray-600',
    glass: true
  },
  minimal: {
    name: '极简白',
    bg: 'bg-gradient-to-br from-white to-gray-50',
    accent: 'from-gray-800 to-black',
    text: 'text-gray-900',
    subtext: 'text-gray-500'
  }
}

const DEFAULT_CONTENT = `# 产品设计知识

## 5个核心原则

- 用户体验至上
- 简洁即是美
- 一致性设计
- 反馈及时响应
- 包容性思维

> 好的设计让产品更出色 ✨

@产品设计师小明`

function App() {
  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [theme, setTheme] = useState('gray')
  const [scale, setScale] = useState(2)
  const cardRef = useRef(null)
  const [exporting, setExporting] = useState(false)

  const parseContent = (text) => {
    const lines = text.trim().split('\n')
    const result = {
      title: '',
      items: [],
      quote: '',
      author: ''
    }

    let currentSection = null

    for (let line of lines) {
      line = line.trim()
      if (!line) continue

      if (line.startsWith('# ')) {
        result.title = line.replace('# ', '')
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        result.items.push(line.replace(/^[-*] /, ''))
      } else if (line.startsWith('> ')) {
        result.quote = line.replace('> ', '')
      } else if (line.startsWith('@')) {
        result.author = line
      } else if (/^\d+\.\s/.test(line)) {
        result.items.push(line.replace(/^\d+\.\s/, ''))
      } else if (line.startsWith('## ')) {
        currentSection = 'subtitle'
      } else if (line.startsWith('## ')) {
        result.subtitle = line.replace('## ', '')
      } else if (line.startsWith('##') && !result.subtitle) {
        result.subtitle = line.replace('##', '').trim()
      }
    }

    return result
  }

  const parsed = parseContent(content)

  const handleExport = async () => {
    if (!cardRef.current || exporting) return
    
    setExporting(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: scale,
        useCORS: true,
        backgroundColor: null,
        logging: false
      })
      
      const link = document.createElement('a')
      link.download = `redcard-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('导出失败:', err)
    } finally {
      setExporting(false)
    }
  }

  const currentTheme = THEMES[theme]

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
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            {Object.entries(THEMES).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  theme === key 
                    ? 'bg-white text-gray-800 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {value.name}
              </button>
            ))}
          </div>

          <select 
            value={scale} 
            onChange={(e) => setScale(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          >
            <option value={2}>2x 清晰度</option>
            <option value={3}>3x 超清</option>
          </select>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-medium hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? '导出中...' : '导出图片'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex">
        <div className="w-2/5 border-r border-gray-200 bg-white p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-4 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-mono text-sm leading-relaxed"
            placeholder="输入你的内容，支持 Markdown 语法..."
          />
        </div>

        <div className="w-3/5 bg-gray-100 flex items-center justify-center p-8 overflow-auto">
          <div 
            ref={cardRef}
            className={`relative w-[360px] h-[480px] rounded-3xl shadow-2xl overflow-hidden ${currentTheme.bg} ${currentTheme.glass ? 'backdrop-blur-xl' : ''}`}
            style={{ aspectRatio: '3/4' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            
            <div className="relative z-10 h-full flex flex-col p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentTheme.accent} flex items-center justify-center`}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                {parsed.title && (
                  <span className={`font-bold text-lg ${currentTheme.text}`}>
                    {parsed.title}
                  </span>
                )}
              </div>

              {parsed.subtitle && (
                <h2 className={`text-sm font-semibold mb-3 ${currentTheme.subtext}`}>
                  {parsed.subtitle}
                </h2>
              )}

              <div className="flex-1 space-y-2.5">
                {parsed.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div className={`mt-0.5 w-4 h-4 rounded-full bg-gradient-to-br ${currentTheme.accent} flex items-center justify-center flex-shrink-0`}>
                      <CheckCircle className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className={`text-sm leading-relaxed ${currentTheme.text}`}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {parsed.quote && (
                <div className="mt-4 p-3 bg-white/40 backdrop-blur-sm rounded-xl">
                  <div className="flex items-start gap-2">
                    <Quote className={`w-4 h-4 mt-0.5 ${currentTheme.subtext}`} />
                    <span className={`text-sm italic ${currentTheme.subtext}`}>
                      {parsed.quote}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-200/50 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <User className={`w-3.5 h-3.5 ${currentTheme.subtext}`} />
                  <span className={`text-xs font-medium ${currentTheme.subtext}`}>
                    {parsed.author || '@你的小红书ID'}
                  </span>
                </div>
                <span className={`text-xs ${currentTheme.subtext}`}>
                  ✨ 收藏 · 点赞
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
