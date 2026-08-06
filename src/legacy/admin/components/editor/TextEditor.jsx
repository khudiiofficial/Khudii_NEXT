import React, { useState, useRef, useEffect } from 'react';

const RichTextEditor = ({form,setForm}) => {
  const [content, setContent] = useState('');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, linkUrl: '' });
  const editorRef = useRef(null);
  const contextMenuRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML =form.description || 'Write Your Description Here...';
    }

    // Close context menu when clicking outside
    const handleClickOutside = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu({ visible: false, x: 0, y: 0, linkUrl: '' });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      setForm({ ...form, description: editorRef.current.innerHTML })
    }
  };

  const formatText = (command, value = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  const insertHTML = (html) => {
    editorRef.current?.focus();
    document.execCommand('insertHTML', false, html);
    handleInput();
  };

  const insertLink = () => {
    const selectedText = window.getSelection().toString();
    
    if (!selectedText) {
      alert('Please select some text to create a link');
      return;
    }

    const url = prompt('Enter URL:');
    if (url) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Create anchor element with link styling
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.textContent = selectedText;
        // anchor.style.color = '#007bff';
        // anchor.style.textDecoration = 'underline';
        // anchor.style.cursor = 'pointer';
        
        // Delete the selected content and insert the anchor
        range.deleteContents();
        range.insertNode(anchor);
        
        handleInput();
      }
    }
  };

  const removeLink = () => {
    const selection = window.getSelection();
    
    if (selection.rangeCount === 0) {
      alert('Please select a link to remove');
      return;
    }

    // Find the parent anchor element
    let node = selection.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeName === 'A') {
        // Replace the anchor with its text content
        const textNode = document.createTextNode(node.textContent);
        node.parentNode.replaceChild(textNode, node);
        handleInput();
        return;
      }
      node = node.parentElement;
    }
    
    alert('No link found in selection');
  };

  // Check if current selection contains a link
//   const isLinkSelected = () => {
//     const selection = window.getSelection();
//     if (selection.rangeCount === 0) return false;
    
//     let node = selection.anchorNode;
//     while (node && node !== editorRef.current) {
//       if (node.nodeName === 'A') return true;
//       node = node.parentElement;
//     }
//     return false;
//   };

  // Handle right-click on links
  const handleContextMenu = (e) => {
    if (e.target.tagName === 'A') {
      e.preventDefault();
      const href = e.target.getAttribute('href');
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        linkUrl: href
      });
    }
  };

  // Open link from context menu
  const openLink = () => {
    if (contextMenu.linkUrl) {
      window.open(contextMenu.linkUrl, '_blank');
    }
    setContextMenu({ visible: false, x: 0, y: 0, linkUrl: '' });
  };

  // Copy link from context menu
  const copyLink = () => {
    if (contextMenu.linkUrl) {
      navigator.clipboard.writeText(contextMenu.linkUrl);
    }
    setContextMenu({ visible: false, x: 0, y: 0, linkUrl: '' });
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      const altText = prompt('Enter alt text (optional):', '');
      insertHTML(`<img src="${url}" alt="${altText}" style="max-width: 100%; height: auto; border-radius: 4px;" />`);
    }
  };

  const insertTable = () => {
    const rows = prompt('Number of rows:', '2');
    const cols = prompt('Number of columns:', '2');
    
    if (rows && cols) {
      let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #ddd;">';
      for (let i = 0; i < rows; i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < cols; j++) {
          tableHTML += `<td style="padding: 8px; border: 1px solid #ddd;">Content</td>`;
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</table>';
      insertHTML(tableHTML);
    }
  };

  const toggleFullscreen = () => {
    if (editorRef.current) {
      editorRef.current.classList.toggle('fullscreen');
    }
  };

  const clearEditor = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '<p><br></p>';
      setContent('');
       setForm({ ...form, description:"" });
    }
  };

  const exportContent = () => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = () => {
    const text = editorRef.current?.innerText || '';
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  return (
    <div className="rich-text-editor">
      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className="context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 1000
          }}
        >
          <button   type="button"  onClick={openLink}>Open Link</button>
          <button   type="button"  onClick={copyLink}>Copy Link</button>
        </div>
      )}

      <div className="toolbar">
        {/* Text Formatting Group */}
        <div className="toolbar-group">
          <button   type="button"  onClick={() => formatText('bold')} title="Bold">
            <strong>B</strong>
          </button>
          <button   type="button"  onClick={() => formatText('italic')} title="Italic">
            <em>I</em>
          </button>
          <button   type="button"  onClick={() => formatText('underline')} title="Underline">
            <u>U</u>
          </button>
          <button   type="button"  onClick={() => formatText('strikeThrough')} title="Strikethrough">
            <s>S</s>
          </button>
        </div>

        {/* Alignment Group */}
        <div className="toolbar-group">
          <button   type="button"  onClick={() => formatText('justifyLeft')} title="Align Left">
            ⬅
          </button>
          <button   type="button"  onClick={() => formatText('justifyCenter')} title="Align Center">
            ↔
          </button>
          <button   type="button"  onClick={() => formatText('justifyRight')} title="Align Right">
            ➡
          </button>
        </div>

        {/* Headings & Formatting */}
        {/* <div className="toolbar-group">
          <select onChange={(e) => formatText('formatBlock', e.target.value)} title="Format">
            <option value="<p>">Normal</option>
            <option value="<h1>">Heading 1</option>
            <option value="<h2>">Heading 2</option>
            <option value="<h3>">Heading 3</option>
            <option value="<blockquote>">Quote</option>
            <option value="<pre>">Code</option>
          </select>
        </div> */}

        {/* Lists & Indentation */}
        <div className="toolbar-group">
          <button   type="button"  onClick={() => formatText('insertUnorderedList')} title="Bullet List">
            • List
          </button>
          <button   type="button"  onClick={() => formatText('insertOrderedList')} title="Numbered List">
            1. List
          </button>
          <button   type="button" onClick={() => formatText('outdent')} title="Outdent">
            ←
          </button>
          <button   type="button"  onClick={() => formatText('indent')} title="Indent">
            →
          </button>
        </div>

        {/* Colors */}
        {/* <div className="toolbar-group">
          <input 
            type="color" 
            onChange={(e) => formatText('foreColor', e.target.value)} 
            title="Text Color"
            className="color-picker"
          />
          <input 
            type="color" 
            onChange={(e) => formatText('hiliteColor', e.target.value)} 
            title="Background Color"
            className="color-picker"
          />
        </div> */}

        {/* Media & Links */}
        <div className="toolbar-group">
          <button   type="button"  onClick={insertLink} title="Insert Link">
            🔗 Add Link
          </button>
          <button 
              type="button" 
            onClick={removeLink} 
            title="Remove Link" 
            // disabled={!isLinkSelected()}
            // style={{ opacity: isLinkSelected() ? 1 : 0.5 }}
          >
            🚫 Remove Link
          </button>
          <button   type="button"  onClick={insertImage} title="Insert Image">
            🖼
          </button>
          <button   type="button"  onClick={insertTable} title="Insert Table">
            ⧩
          </button>
        </div>

        {/* Special Formatting */}
        <div className="toolbar-group">
          <button   type="button"  onClick={() => formatText('superscript')} title="Superscript">
            x²
          </button>
          <button   type="button"  onClick={() => formatText('subscript')} title="Subscript">
            x₂
          </button>
          <button   type="button"  onClick={() => insertHTML('<hr>')} title="Horizontal Line">
            ―
          </button>
        </div>

        {/* Actions */}
        <div className="toolbar-group">
          <button   type="button"  onClick={() => formatText('undo')} title="Undo">
            ↩
          </button>
          <button   type="button"  onClick={() => formatText('redo')} title="Redo">
            ↪
          </button>
          <button   type="button"  onClick={clearEditor} title="Clear Editor">
            🗑
          </button>
          <button   type="button"  onClick={exportContent} title="Export HTML">
            💾
          </button>
          <button   type="button"  onClick={toggleFullscreen} title="Toggle Fullscreen">
            ⛶
          </button>
        </div>
      </div>
      
      {/* Editor Stats */}
      <div className="editor-stats">
        <span>Words: {wordCount()}</span>
        <span>Characters: {content.replace(/<[^>]*>/g, '').length}</span>
        <span>Links: {(content.match(/<a /g) || []).length}</span>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handleInput}
        onContextMenu={handleContextMenu}
        className="editable-area"
        suppressContentEditableWarning={true}
      />
      
      {/* Instructions */}
      <div style={{ 
        padding: '10px 20px', 
        background: '#f8f9fa', 
        fontSize: '12px', 
        color: '#6c757d',
        borderTop: '1px solid #e1e1e1'
      }}>
        💡 <strong>Tip:</strong> Right-click on links to open or copy them.
      </div>

      {/* Preview & Export */}
      <div className="preview-section">
        <div className="preview-controls">
          <button type="button"  onClick={() => document.getElementById('htmlPreview').classList.toggle('hidden')}>
            Toggle HTML Preview
          </button>
          <button type="button"  onClick={exportContent}>Export as HTML</button>
        </div>
        <div id="htmlPreview" className="html-preview hidden">
          <h4>HTML Output:</h4>
          <pre>{content}</pre>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;