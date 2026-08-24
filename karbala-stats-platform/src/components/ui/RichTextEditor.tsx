import { useEffect, useRef } from 'react'
import {
  AlignCenter, AlignLeft, AlignRight, Bold, Eraser, Italic, Link as LinkIcon,
  List, ListOrdered, Pilcrow, Quote, Redo2, RemoveFormatting, Underline, Undo2,
  Unlink,
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  error?: string
  minHeight?: string
  placeholder?: string
}

const buttonClass = 'p-2 rounded-md border border-gray-200 bg-white hover:bg-primary-50 hover:text-primary transition-colors'

export default function RichTextEditor({
  value,
  onChange,
  label,
  error,
  minHeight = '180px',
  placeholder = 'اكتب المحتوى هنا...',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const syncValue = () => {
    onChange(editorRef.current?.innerHTML ?? '')
  }

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, commandValue)
    syncValue()
  }

  const addLink = () => {
    const url = window.prompt('أدخل الرابط')
    if (!url) return
    const normalizedUrl = /^https?:\/\//i.test(url) || url.startsWith('/') ? url : `https://${url}`
    runCommand('createLink', normalizedUrl)
  }

  return (
    <div>
      {label && <label className="label">{label}</label>}

      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-colors">
        <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50 text-gray-600">
          <button type="button" className={buttonClass} title="تراجع" onClick={() => runCommand('undo')}><Undo2 className="h-4 w-4" /></button>
          <button type="button" className={buttonClass} title="إعادة" onClick={() => runCommand('redo')}><Redo2 className="h-4 w-4" /></button>
          <span className="w-px bg-gray-200 mx-1" />
          <button type="button" className={buttonClass} title="غامق" onClick={() => runCommand('bold')}><Bold className="h-4 w-4" /></button>
          <button type="button" className={buttonClass} title="مائل" onClick={() => runCommand('italic')}><Italic className="h-4 w-4" /></button>
          <button type="button" className={buttonClass} title="تحته خط" onClick={() => runCommand('underline')}><Underline className="h-4 w-4" /></button>
          <span className="w-px bg-gray-200 mx-1" />
          <button type="button" className={buttonClass} title="فقرة" onClick={() => runCommand('formatBlock', 'P')}><Pilcrow className="h-4 w-4" /></button>
          <button type="button" className={buttonClass} title="عنوان" onClick={() => runCommand('formatBlock', 'H2')}>H2</button>
          <button type="button" className={buttonClass} title="عنوان فرعي" onClick={() => runCommand('formatBlock', 'H3')}>H3</button>
          <button type="button" className={buttonClass} title="اقتباس" onClick={() => runCommand('formatBlock', 'BLOCKQUOTE')}><Quote className="h-4 w-4" /></button>
          <span className="w-px bg-gray-200 mx-1" />
          <button type="button" className={buttonClass} title="قائمة نقطية" onClick={() => runCommand('insertUnorderedList')}><List className="h-4 w-4" /></button>
          <button type="button" className={buttonClass} title="قائمة مرقمة" onClick={() => runCommand('insertOrderedList')}><ListOrdered className="h-4 w-4" /></button>
          <span className="w-px bg-gray-200 mx-1" />
          <button type="button" className={buttonClass} title="يمين" onClick={() => runCommand('justifyRight')}><AlignRight className="h-4 w-4" /></button>
          <button type="button" className={buttonClass} title="وسط" onClick={() => runCommand('justifyCenter')}><AlignCenter className="h-4 w-4" /></button>
          <button type="button" className={buttonClass} title="يسار" onClick={() => runCommand('justifyLeft')}><AlignLeft className="h-4 w-4" /></button>
          <span className="w-px bg-gray-200 mx-1" />
          <button type="button" className={buttonClass} title="إضافة رابط" onClick={addLink}><LinkIcon className="h-4 w-4" /></button>
          <button type="button" className={buttonClass} title="إزالة الرابط" onClick={() => runCommand('unlink')}><Unlink className="h-4 w-4" /></button>
          <button type="button" className={buttonClass} title="إزالة التنسيق" onClick={() => runCommand('removeFormat')}><RemoveFormatting className="h-4 w-4" /></button>
          <button type="button" className={buttonClass} title="تفريغ" onClick={() => { if (editorRef.current) editorRef.current.innerHTML = ''; onChange('') }}><Eraser className="h-4 w-4" /></button>
        </div>

        <div
          ref={editorRef}
          contentEditable
          dir="rtl"
          role="textbox"
          aria-multiline="true"
          data-placeholder={placeholder}
          className="rich-editor px-4 py-3 text-sm leading-7 outline-none prose prose-sm max-w-none"
          style={{ minHeight }}
          onInput={syncValue}
          onBlur={syncValue}
          suppressContentEditableWarning
        />
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
