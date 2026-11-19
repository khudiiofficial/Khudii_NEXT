'use client';

import { useState, useEffect, useRef } from 'react';
import { Facebook, Twitter, Linkedin, MessageCircle, Link as LinkIcon, Mail, Youtube, Instagram, Music2, Share2 } from 'lucide-react';
import './SocialShare.css';

const DEFAULT_NETWORKS = ['facebook', 'whatsapp', 'email', 'youtube', 'instagram', 'tiktok', 'copy'];

const NETWORK_META = {
  facebook: { label: 'Facebook', icon: Facebook, className: 'facebook' },
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, className: 'whatsapp' },
  twitter: { label: 'Twitter / X', icon: Twitter, className: 'twitter' },
  linkedin: { label: 'LinkedIn', icon: Linkedin, className: 'linkedin' },
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
    const handleResize = () => setIsMobile(window.innerWidth <= 1300);
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
    email: `mailto:?subject=${encodeURIComponent(pageTitle)}&body=${encodeURIComponent(currentUrl)}`,
    youtube: 'https://www.youtube.com/@khudiiofficial',
    instagram: 'https://www.instagram.com/khudiiofficial',
    tiktok: 'https://www.tiktok.com/@khudiiofficial',
  };

  const handleShare = (platform) => {
    if (platform === 'copy') {
      navigator.clipboard?.writeText(currentUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
      return;
    }
    const url = shareLinks[platform];
    if (url) window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
    setIsPopupOpen(false);
  };

  const iconSize = Number(shareTools?.iconSize || 40);
  const glyphSize = Math.max(14, Math.round(iconSize * 0.48));
  const radius =
    shareTools?.iconStyle === 'circle'
      ? '9999px'
      : shareTools?.iconStyle === 'flat'
        ? '0px'
        : shareTools?.iconStyle === 'minimal'
          ? '6px'
          : '10px';

  const customStyle =
    shareTools?.colorScheme === 'custom'
      ? { backgroundColor: shareTools.customBgColor || '#02236E', color: shareTools.customTextColor || '#ffffff' }
      : shareTools?.colorScheme === 'monochrome'
        ? { backgroundColor: '#1e293b', color: '#ffffff' }
        : {};

  const edge = shareTools?.sidebarEdge === 'left' ? 'left' : 'right';
  const gap = Number(shareTools?.gapFromEdge ?? 0);
  const vPos =
    shareTools?.verticalPosition === 'top'
      ? { top: '20%', transform: 'none' }
      : shareTools?.verticalPosition === 'bottom'
        ? { top: 'auto', bottom: '120px', transform: 'none' }
        : {};

  if (!isMobile) {
    return (
      <div
        className="social-share-sidebar"
        style={{
          ...(edge === 'left' ? { left: `${gap}px`, right: 'auto' } : { right: `${gap}px`, left: 'auto' }),
          ...vPos,
        }}
      >
        {activeNetworks.map((net) => {
          const meta = NETWORK_META[net];
          const Icon = meta.icon;
          const isCopy = net === 'copy';
          return (
            <button
              key={net}
              type="button"
              className={`share-icon-btn ${meta.className} ${isCopy && copied ? 'copied' : ''}`}
              style={{ width: `${iconSize}px`, height: `${iconSize}px`, borderRadius: radius, ...customStyle }}
              onClick={() => handleShare(net)}
              aria-label={isCopy ? 'Copy link' : `Share on ${meta.label}`}
              title={isCopy ? (copied ? 'Copied!' : 'Copy Link') : meta.label}
            >
              <Icon size={glyphSize} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        className="mobile-share-button"
        onClick={() => setIsPopupOpen((v) => !v)}
        aria-label="Share"
      >
        <Share2 size={24} />
      </button>

      {isPopupOpen && (
        <div className="mobile-share-popup-overlay">
          <div className="mobile-share-popup" ref={popupRef}>
            <h3>Share this page</h3>
            <div className="mobile-share-icons">
              {activeNetworks.map((net) => {
                const meta = NETWORK_META[net];
                const Icon = meta.icon;
                const isCopy = net === 'copy';
                return (
                  <button
                    key={net}
                    type="button"
                    className={`mobile-share-icon ${meta.className} ${isCopy && copied ? 'copied' : ''}`}
                    onClick={() => handleShare(net)}
                  >
                    <Icon size={24} />
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
