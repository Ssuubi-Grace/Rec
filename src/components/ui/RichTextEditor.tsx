import React, { useCallback, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { applyBlockStyle, plainToHtml, sanitizeRich } from '../../utils/richText';

export interface RichTextEditorHandle {
  insertText: (text: string) => void;
  focus: () => void;
}

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
  maxHeight?: number;
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
}

export const RichTextEditor = React.forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  ({ value, onChange, minHeight = 140, maxHeight = 320, placeholder, className = '', 'aria-label': ariaLabel }, ref) => {
    const bodyRef = useRef<HTMLDivElement>(null);
    /** Tracks last `value` prop applied to the DOM (not the initial prop — avoids skipping first sync). */
    const lastValueRef = useRef<string | null>(null);

    const syncFromDom = useCallback(() => {
      const body = bodyRef.current;
      if (!body) return;
      const text = body.textContent?.trim() || '';
      const html = text ? sanitizeRich(body.innerHTML) : '';
      lastValueRef.current = html;
      onChange(html);
    }, [onChange]);

    useLayoutEffect(() => {
      const body = bodyRef.current;
      if (!body) return;
      const incoming = value ?? '';
      if (incoming === lastValueRef.current) return;
      const html = plainToHtml(incoming) || '<p><br></p>';
      body.innerHTML = html;
      lastValueRef.current = incoming;
    }, [value]);

    useImperativeHandle(ref, () => ({
      focus: () => bodyRef.current?.focus(),
      insertText: (text: string) => {
        bodyRef.current?.focus();
        document.execCommand('insertText', false, text);
        syncFromDom();
      },
    }));

    const runCmd = (cmd: string, val?: string) => {
      bodyRef.current?.focus();
      if (cmd === 'formatBlock') document.execCommand(cmd, false, val);
      else document.execCommand(cmd, false, val ?? undefined);
      syncFromDom();
    };

    const onFormatBlock = (val: string) => {
      if (!val) return;
      runCmd('formatBlock', val);
    };

    const onLineHeight = (val: string) => {
      const body = bodyRef.current;
      if (!body || !val) return;
      body.focus();
      applyBlockStyle(body, 'lineHeight', val);
      syncFromDom();
    };

    const onSpaceAfter = (val: string) => {
      const body = bodyRef.current;
      if (!body || !val) return;
      body.focus();
      applyBlockStyle(body, 'marginBottom', val);
      syncFromDom();
    };

    return (
      <div className={`rich-editor ${className}`}>
        <div className="rich-toolbar" role="toolbar" aria-label="Formatting">
          <div className="rich-toolbar-group" aria-label="Font">
            <button type="button" className="rich-btn" title="Bold" onMouseDown={(e) => e.preventDefault()} onClick={() => runCmd('bold')}>
              <b>B</b>
            </button>
            <button type="button" className="rich-btn" title="Italic" onMouseDown={(e) => e.preventDefault()} onClick={() => runCmd('italic')}>
              <i>I</i>
            </button>
            <button type="button" className="rich-btn" title="Underline" onMouseDown={(e) => e.preventDefault()} onClick={() => runCmd('underline')}>
              <u>U</u>
            </button>
            <button type="button" className="rich-btn" title="Strikethrough" onMouseDown={(e) => e.preventDefault()} onClick={() => runCmd('strikeThrough')}>
              <s>S</s>
            </button>
          </div>
          <div className="rich-toolbar-group" aria-label="Style">
            <label className="rich-select-label">
              Style
              <select
                className="rich-select"
                defaultValue=""
                onChange={(e) => {
                  onFormatBlock(e.target.value);
                  e.target.selectedIndex = 0;
                }}
              >
                <option value="">Normal</option>
                <option value="p">Normal</option>
                <option value="h3">Heading 1</option>
                <option value="h4">Heading 2</option>
              </select>
            </label>
          </div>
          <div className="rich-toolbar-group" aria-label="Lists and indent">
            <button type="button" className="rich-btn" title="Bullet list" onMouseDown={(e) => e.preventDefault()} onClick={() => runCmd('insertUnorderedList')}>
              • List
            </button>
            <button type="button" className="rich-btn" title="Numbered list" onMouseDown={(e) => e.preventDefault()} onClick={() => runCmd('insertOrderedList')}>
              1. List
            </button>
            <button type="button" className="rich-btn" title="Decrease indent" onMouseDown={(e) => e.preventDefault()} onClick={() => runCmd('outdent')}>
              ⇤
            </button>
            <button type="button" className="rich-btn" title="Increase indent" onMouseDown={(e) => e.preventDefault()} onClick={() => runCmd('indent')}>
              ⇥
            </button>
          </div>
          <div className="rich-toolbar-group" aria-label="Alignment">
            <button type="button" className="rich-btn" title="Align left" onMouseDown={(e) => e.preventDefault()} onClick={() => runCmd('justifyLeft')}>
              Left
            </button>
            <button type="button" className="rich-btn" title="Centre" onMouseDown={(e) => e.preventDefault()} onClick={() => runCmd('justifyCenter')}>
              Centre
            </button>
            <button type="button" className="rich-btn" title="Align right" onMouseDown={(e) => e.preventDefault()} onClick={() => runCmd('justifyRight')}>
              Right
            </button>
            <button type="button" className="rich-btn" title="Justify" onMouseDown={(e) => e.preventDefault()} onClick={() => runCmd('justifyFull')}>
              Justify
            </button>
          </div>
          <div className="rich-toolbar-group" aria-label="Spacing">
            <label className="rich-select-label">
              Line
              <select
                className="rich-select"
                defaultValue=""
                onChange={(e) => {
                  onLineHeight(e.target.value);
                  e.target.selectedIndex = 0;
                }}
              >
                <option value="">Line spacing</option>
                <option value="1">1.0</option>
                <option value="1.15">1.15</option>
                <option value="1.5">1.5</option>
                <option value="2">2.0</option>
              </select>
            </label>
            <label className="rich-select-label">
              After
              <select
                className="rich-select"
                defaultValue=""
                onChange={(e) => {
                  onSpaceAfter(e.target.value);
                  e.target.selectedIndex = 0;
                }}
              >
                <option value="">Space after</option>
                <option value="0">None</option>
                <option value="8px">Small</option>
                <option value="16px">Medium</option>
                <option value="24px">Large</option>
              </select>
            </label>
          </div>
          <div className="rich-toolbar-group">
            <button type="button" className="rich-btn" title="Clear formatting" onMouseDown={(e) => e.preventDefault()} onClick={() => runCmd('removeFormat')}>
              Clear
            </button>
          </div>
        </div>
        <div
          ref={bodyRef}
          className="rich-body"
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label={ariaLabel}
          data-placeholder={placeholder}
          style={{ minHeight, maxHeight }}
          onInput={syncFromDom}
          onBlur={syncFromDom}
          suppressContentEditableWarning
        />
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';
