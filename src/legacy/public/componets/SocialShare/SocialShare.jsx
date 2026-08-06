

// import { useState } from 'react';
// import { Facebook, Twitter, Linkedin, MessageCircle, Link, Mail, Youtube, Instagram, Music2 } from 'lucide-react';
// import './SocialShare.css';

// const SocialShare = () => {
//     const [copied, setCopied] = useState(false);

//     const currentUrl = window.location.href;
//     const pageTitle = document.title || 'Check this out!';

//     const shareLinks = {
//         facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
//         whatsapp: `https://wa.me/?text=${encodeURIComponent(pageTitle + ' ' + currentUrl)}`,
//         email: `mailto:?subject=${encodeURIComponent(pageTitle)}&body=${encodeURIComponent(currentUrl)}`,
//         youtube: `https://www.youtube.com/@khudiiofficial`,   // 🔹 No direct share support → open platform
//         instagram: `https://www.instagram.com/@khudiiofficial`,  // 🔹 Opens Instagram
//         tiktok: `https://www.tiktok.com/@khudiiofficial`,       // 🔹 Opens TikTok
//     };

//     const handleShare = (platform) => {
//         const url = shareLinks[platform];
//         if (url) {
//             window.open(url, '_blank', 'width=600,height=400');
//         }
//     };

//     const copyToClipboard = async () => {
//         try {
//             await navigator.clipboard.writeText(currentUrl);
//             setCopied(true);
//             setTimeout(() => setCopied(false), 2000);
//         } catch (err) {
//             console.error('Failed to copy:', err);
//         }
//     };

//     return (
//         <div className="social-share-sidebar">
//             {/* Facebook */}
//             <button
//                 className="share-icon-btn facebook"
//                 onClick={() => handleShare('facebook')}
//                 aria-label="Share on Facebook"
//                 title="Share on Facebook"
//             >
//                 <Facebook size={20} />
//             </button>

//             {/* WhatsApp */}
//             <button
//                 className="share-icon-btn whatsapp"
//                 onClick={() => handleShare('whatsapp')}
//                 aria-label="Share on WhatsApp"
//                 title="Share on WhatsApp"
//             >
//                 <MessageCircle size={20} />
//             </button>

//             {/* Email */}
//             <button
//                 className="share-icon-btn email"
//                 onClick={() => handleShare('email')}
//                 aria-label="Share via Email"
//                 title="Share via Email"
//             >
//                 <Mail size={20} />
//             </button>

//             {/* YouTube */}
//             <button
//                 className="share-icon-btn youtube"
//                 onClick={() => handleShare('youtube')}
//                 aria-label="Open YouTube"
//                 title="YouTube"
//             >
//                 <Youtube size={20} />
//             </button>

//             {/* Instagram */}
//             <button
//                 className="share-icon-btn instagram"
//                 onClick={() => handleShare('instagram')}
//                 aria-label="Open Instagram"
//                 title="Instagram"
//             >
//                 <Instagram size={20} />
//             </button>

//             {/* TikTok */}
//             <button
//                 className="share-icon-btn tiktok"
//                 onClick={() => handleShare('tiktok')}
//                 aria-label="Open TikTok"
//                 title="TikTok"
//             >
//                 <Music2 size={20} />
//             </button>

//             {/* Copy Link */}
//             <button
//                 className={`share-icon-btn copy-link ${copied ? 'copied' : ''}`}
//                 onClick={copyToClipboard}
//                 aria-label="Copy link"
//                 title={copied ? 'Copied!' : 'Copy Link'}
//             >
//                 <Link size={20} />
//             </button>
//         </div>
//     );
// };

// export default SocialShare;
import { useState, useEffect, useRef } from 'react';
import { Facebook, Twitter, Linkedin, MessageCircle, Link, Mail, Youtube, Instagram, Music2, Share2 } from 'lucide-react';
import './SocialShare.css';

const SocialShare = () => {
    const [copied, setCopied] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const popupRef = useRef(null);
    const timeoutRef = useRef(null);

    const currentUrl = window.location.href;
    const pageTitle = document.title || 'Check this out!';

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(pageTitle + ' ' + currentUrl)}`,
        email: `mailto:?subject=${encodeURIComponent(pageTitle)}&body=${encodeURIComponent(currentUrl)}`,
        youtube: `https://www.youtube.com/@khudiiofficial`,
        instagram: `https://www.instagram.com/@khudiiofficial`,
        tiktok: `https://www.tiktok.com/@khudiiofficial`,
    };

    // Check screen size on resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1300);
        };
        handleResize()
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle click outside to close popup
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setIsPopupOpen(false);
            }
        };

        if (isPopupOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPopupOpen]);

    // Reset timeout on user activity
    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        if (isPopupOpen) {
            timeoutRef.current = setTimeout(() => {
                setIsPopupOpen(false);
            }, 5000); // 5 seconds
        }
    };

    // Set up activity listeners when popup is open
    useEffect(() => {
        if (isPopupOpen) {
            resetTimeout();
            
            const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
            
            const handleActivity = () => {
                resetTimeout();
            };
            
            activityEvents.forEach(event => {
                document.addEventListener(event, handleActivity);
            });
            
            return () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                activityEvents.forEach(event => {
                    document.removeEventListener(event, handleActivity);
                });
            };
        }
    }, [isPopupOpen]);

    const handleShare = (platform) => {
        const url = shareLinks[platform];
        if (url) {
            window.open(url, '_blank', 'width=600,height=400');
        }
        setIsPopupOpen(false);
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const togglePopup = () => {
        setIsPopupOpen(!isPopupOpen);
    };

    // Desktop view - Sidebar
    if (!isMobile) {
        return (
            <div className="social-share-sidebar">
                <button
                    className="share-icon-btn facebook"
                    onClick={() => handleShare('facebook')}
                    aria-label="Share on Facebook"
                    title="Share on Facebook"
                >
                    <Facebook size={20} />
                </button>

                <button
                    className="share-icon-btn whatsapp"
                    onClick={() => handleShare('whatsapp')}
                    aria-label="Share on WhatsApp"
                    title="Share on WhatsApp"
                >
                    <MessageCircle size={20} />
                </button>

                <button
                    className="share-icon-btn email"
                    onClick={() => handleShare('email')}
                    aria-label="Share via Email"
                    title="Share via Email"
                >
                    <Mail size={20} />
                </button>

                <button
                    className="share-icon-btn youtube"
                    onClick={() => handleShare('youtube')}
                    aria-label="Open YouTube"
                    title="YouTube"
                >
                    <Youtube size={20} />
                </button>

                <button
                    className="share-icon-btn instagram"
                    onClick={() => handleShare('instagram')}
                    aria-label="Open Instagram"
                    title="Instagram"
                >
                    <Instagram size={20} />
                </button>

                <button
                    className="share-icon-btn tiktok"
                    onClick={() => handleShare('tiktok')}
                    aria-label="Open TikTok"
                    title="TikTok"
                >
                    <Music2 size={20} />
                </button>

                <button
                    className={`share-icon-btn copy-link ${copied ? 'copied' : ''}`}
                    onClick={copyToClipboard}
                    aria-label="Copy link"
                    title={copied ? 'Copied!' : 'Copy Link'}
                >
                    <Link size={20} />
                </button>
            </div>
        );
    }

    // Mobile view - Share button with popup
    return (
        <>
            {/* Mobile Share Button */}
            <button 
                className="mobile-share-button"
                onClick={togglePopup}
                aria-label="Share"
            >
                <Share2 size={24} />
            </button>

            {/* Mobile Popup */}
            {isPopupOpen && (
                <div className="mobile-share-popup-overlay">
                    <div 
                        className="mobile-share-popup"
                        ref={popupRef}
                    >
                        <h3>Share this page</h3>
                        <div className="mobile-share-icons">
                            <button
                                className="mobile-share-icon facebook"
                                onClick={() => handleShare('facebook')}
                            >
                                <Facebook size={24} />
                                <span>Facebook</span>
                            </button>

                            <button
                                className="mobile-share-icon whatsapp"
                                onClick={() => handleShare('whatsapp')}
                            >
                                <MessageCircle size={24} />
                                <span>WhatsApp</span>
                            </button>

                            <button
                                className="mobile-share-icon email"
                                onClick={() => handleShare('email')}
                            >
                                <Mail size={24} />
                                <span>Email</span>
                            </button>

                            <button
                                className="mobile-share-icon youtube"
                                onClick={() => handleShare('youtube')}
                            >
                                <Youtube size={24} />
                                <span>YouTube</span>
                            </button>

                            <button
                                className="mobile-share-icon instagram"
                                onClick={() => handleShare('instagram')}
                            >
                                <Instagram size={24} />
                                <span>Instagram</span>
                            </button>

                            <button
                                className="mobile-share-icon tiktok"
                                onClick={() => handleShare('tiktok')}
                            >
                                <Music2 size={24} />
                                <span>TikTok</span>
                            </button>

                            <button
                                className={`mobile-share-icon copy-link ${copied ? 'copied' : ''}`}
                                onClick={copyToClipboard}
                            >
                                <Link size={24} />
                                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                            </button>
                        </div>
                        <button 
                            className="mobile-popup-close"
                            onClick={() => setIsPopupOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default SocialShare;