import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  // Handle ESC key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onClose(); // Close menu after navigation
    }
  };

  const menuVariants = {
    closed: {
      x: '100%',
      transition: {
        type: 'tween' as const,
        duration: 0.3,
      },
    },
    open: {
      x: 0,
      transition: {
        type: 'tween' as const,
        duration: 0.3,
      },
    },
  };

  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
  };

  const linkVariants = {
    closed: { x: 20, opacity: 0 },
    open: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: 0.1 + i * 0.1,
        duration: 0.3,
      },
    }),
  };

  const menuItems = [
    { label: 'Features', href: '#features', isExternal: false },
    { label: 'Pricing', href: '#pricing', isExternal: false },
    { label: 'How It Works', href: '#how-it-works', isExternal: false },
    { label: 'FAQ', href: '#faq', isExternal: false },
    { label: 'Login', href: '/login', isExternal: true },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Slide-in Menu */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            {/* Menu Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <span className="text-2xl font-bold text-green-600">Verdant By SCN</span>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto p-6">
              <ul className="space-y-2">
                {menuItems.map((item, index) => (
                  <motion.li
                    key={item.href}
                    custom={index}
                    initial="closed"
                    animate="open"
                    variants={linkVariants}
                  >
                    <a
                      href={item.href}
                      onClick={(e) => !item.isExternal && handleSmoothScroll(e, item.href)}
                      className="block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition"
                    >
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Menu Footer - CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 border-t border-gray-200"
            >
              <a
                href="/free-trial"
                className="block w-full bg-green-600 text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Start Free Trial
              </a>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  ✓ No credit card required
                </p>
                <p className="text-sm text-gray-600">
                  ✓ 14-day free trial
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
