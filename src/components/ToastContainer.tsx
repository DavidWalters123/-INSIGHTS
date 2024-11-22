import React from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function ToastContainer() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        className: '!bg-surface !border !border-surface-light !text-white',
        success: {
          icon: '🎉',
          className: '!border-green-500/20 !bg-green-500/10',
        },
        error: {
          icon: '❌',
          className: '!border-red-500/20 !bg-red-500/10',
        },
      }}
    >
      {(t) => (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {t}
          </motion.div>
        </AnimatePresence>
      )}
    </Toaster>
  );
}