'use client';

import { useEffect } from 'react';

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
const SCRIPT_SRC = 'https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js';

export default function VapiAssistant() {
  useEffect(() => {
    if (!VAPI_PUBLIC_KEY || !VAPI_ASSISTANT_ID) return undefined;

    let widget = document.querySelector('vapi-widget[data-khudii-vapi="true"]');
    if (!widget) {
      widget = document.createElement('vapi-widget');
      widget.dataset.khudiiVapi = 'true';
      widget.setAttribute('public-key', VAPI_PUBLIC_KEY);
      widget.setAttribute('assistant-id', VAPI_ASSISTANT_ID);
      widget.setAttribute('mode', 'chat');
      widget.setAttribute('theme', 'light');
      widget.setAttribute('position', 'bottom-right');
      widget.setAttribute('accent-color', '#02236e');
      widget.setAttribute('cta-button-color', '#009dc8');
      widget.setAttribute('cta-button-text-color', '#ffffff');
      widget.setAttribute('title', 'AI Assistant');
      widget.setAttribute('cta-title', 'Ask Khudii');
      widget.setAttribute('cta-subtitle', '24/7 Support');
      widget.setAttribute('chat-placeholder', 'How can I help you today?');
      widget.setAttribute('hide-cta-button', 'true');
      document.body.appendChild(widget);
    }

    const updateSize = () => {
      const size = window.innerWidth < 640 ? 'tiny' : window.innerWidth < 1024 ? 'compact' : 'full';
      widget.setAttribute('size', size);
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.dataset.khudiiVapiScript = 'true';
      document.head.appendChild(script);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      widget?.remove();
    };
  }, []);

  return null;
}
