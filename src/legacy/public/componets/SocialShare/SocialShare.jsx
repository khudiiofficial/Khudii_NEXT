'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Link as LinkIcon,
  Mail,
  Youtube,
  Instagram,
  Music2,
  Share2,
  Send,
  Check,
} from 'lucide-react';
import './SocialShare.css';

const DEFAULT_NETWORKS = ['whatsapp', 'facebook', 'twitter', 'linkedin', 'copy'];

const NETWORK_META = {
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, className: 'whatsapp' },
  facebook: { label: 'Facebook', icon: Facebook, className: 'facebook' },
  twitter: { label: 'X (Twitter)', icon: Twitter, className: 'twitter' },
  linkedin: { label: 'LinkedIn', icon: Linkedin, className: 'linkedin' },
  telegram: { label: 'Telegram', icon: Send, className: 'telegram' },
  email: { label: 'Email', icon: Mail, className: 'email' },
  youtube: { label: 'YouTube', icon: Youtube, className: 'youtube' },
  instagram: { label: 'Instagram', icon: Instagram, className: 'instagram' },
  tiktok: { label: 'TikTok', icon: Music2, className: 'tiktok' },
  copy: { label: 'Copy Link', icon: LinkIcon, className: 'copy-link' },
};

const SocialShare = ({ shareTools = null }) => {
  const [copied, setCopied] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const popupRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsPopupOpen(false);
      }
    };
    if (isPopupOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPopupOpen]);

  useEffect(() => {
    if (!isPopupOpen) return undefined;
    const reset = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsPopupOpen(false), 5000);
    };
    reset();
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((ev) => document.addEventListener(ev, reset));
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((ev) => document.removeEventListener(ev, reset));
    };
  }, [isPopupOpen]);

  if (shareTools && shareTools.enabled === false) return null;

  const activeNetworks =
    Array.isArray(shareTools?.activeNetworks) && shareTools.activeNetworks.length > 0
      ? shareTools.activeNetworks.filter((n) => Boolean(NETWORK_META[n]))
      : DEFAULT_NETWORKS;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const pageTitle = typeof document !== 'undefined' ? document.title || 'Khudii' : 'Khudii';

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${pageTitle} ${currentUrl}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(pageTitle)}&url=${encodeURIComponent(currentUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(pageTitle)}`,
    email: `mailto:?subject=${encodeURIComponent(pageTitle)}&body=${encodeURIComponent(currentUrl)}`,
    youtube: 'https://www.youtube.com/@khudiiofficial',
    instagram: 'https://www.instagram.com/khudiiofficial',
    tiktok: 'https://www.tiktok.com/@khudiiofficial',
  };

  const handleShare = (platform) => {
    if (platform === 'copy') {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(currentUrl).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => {});
      } else {
        try {
          const textArea = document.createElement('textarea');
          textArea.value = currentUrl;
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // ignore
        }
      }
      return;
    }
    const url = shareLinks[platform];
    if (url) window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
    setIsPopupOpen(false);
  };

  const iconSize = Number(shareTools?.iconSize || 42);
  const glyphSize = Math.max(16, Math.round(iconSize * 0.46));
  const isCircle = shareTools?.iconStyle === 'circle';
  const isMinimal = shareTools?.iconStyle === 'minimal';
  const isFlat = shareTools?.iconStyle === 'flat';

  const customStyle =
    shareTools?.colorScheme === 'custom'
      ? { backgroundColor: shareTools.customBgColor || '#02236E', color: shareTools.customTextColor || '#ffffff' }
      : shareTools?.colorScheme === 'monochrome'
        ? { backgroundColor: '#0f172a', color: '#ffffff' }
        : {};

  const edge = shareTools?.sidebarEdge === 'left' ? 'left' : 'right';
  const gap = Number(shareTools?.gapFromEdge ?? 0);
  const isAttached = gap === 0;

  const vPos =
    shareTools?.verticalPosition === 'top'
      ? { top: '22%', transform: 'none' }
      : shareTools?.verticalPosition === 'bottom'
        ? { top: 'auto', bottom: '100px', transform: 'none' }
        : { top: '50%', transform: 'translateY(-50%)' };

  if (!isMobile) {
    return (
      <aside
        className={`social-share-sidebar edge-${edge} ${isAttached ? 'is-attached' : 'is-floating'}`}
        style={{
          ...(edge === 'left' ? { left: `${gap}px`, right: 'auto' } : { right: `${gap}px`, left: 'auto' }),
          ...vPos,
        }}
        aria-label="Share Tools"
      >
        <div className={`share-buttons-stack ${isCircle ? 'style-circle' : isMinimal ? 'style-minimal' : isFlat ? 'style-flat' : 'style-default'}`}>
          {activeNetworks.map((net, index) => {
            const meta = NETWORK_META[net] || NETWORK_META.copy;
            const isCopy = net === 'copy';
            const Icon = isCopy && copied ? Check : meta.icon;
            const isFirst = index === 0;
            const isLast = index === activeNetworks.length - 1;

            return (
              <button
                key={net}
                type="button"
                className={`share-icon-btn ${meta.className} ${isCopy && copied ? 'copied' : ''} ${isFirst ? 'is-first' : ''} ${isLast ? 'is-last' : ''}`}
                style={{
                  width: `${iconSize}px`,
                  height: `${iconSize}px`,
                  ...customStyle,
                }}
                onClick={() => handleShare(net)}
                aria-label={isCopy ? (copied ? 'Link copied' : 'Copy link') : `Share on ${meta.label}`}
              >
                <Icon size={glyphSize} className="share-icon-svg" />
                <span className="share-btn-tooltip" role="tooltip">
                  {isCopy ? (copied ? 'Copied!' : 'Copy Link') : `Share on ${meta.label}`}
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <>
      <button
        type="button"
        className="mobile-share-button"
        onClick={() => setIsPopupOpen((v) => !v)}
        aria-label="Share this page"
        title="Share"
      >
        <Share2 size={22} />
      </button>

      {isPopupOpen && (
        <div className="mobile-share-popup-overlay" role="dialog" aria-modal="true" aria-label="Share options">
          <div className="mobile-share-popup" ref={popupRef}>
            <div className="mobile-share-header">
              <h3>Share this page</h3>
              <p>Spread the word to help Pakistan's welfare ecosystem</p>
            </div>
            <div className="mobile-share-icons">
              {activeNetworks.map((net) => {
                const meta = NETWORK_META[net] || NETWORK_META.copy;
                const isCopy = net === 'copy';
                const Icon = isCopy && copied ? Check : meta.icon;
                return (
                  <button
                    key={net}
                    type="button"
                    className={`mobile-share-icon ${meta.className} ${isCopy && copied ? 'copied' : ''}`}
                    onClick={() => handleShare(net)}
                  >
                    <div className="mobile-icon-circle">
                      <Icon size={20} />
                    </div>
                    <span>{isCopy ? (copied ? 'Copied!' : 'Copy Link') : meta.label}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" className="mobile-popup-close" onClick={() => setIsPopupOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SocialShare;
