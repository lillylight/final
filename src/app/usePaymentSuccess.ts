"use client";

import { useEffect } from 'react';

/**
 * usePaymentSuccess
 *
 * Calls the provided callback when OnchainKit payment is detected as successful.
 * Handles postMessage, DOM, and MutationObserver strategies for robustness.
 *
 * @param onSuccess - callback to run when payment is detected as successful
 * @param image - File or null (optional, for your logic)
 * @param step - string (optional, for your logic)
 */
export function usePaymentSuccess(onSuccess: () => void, image?: File | null, step?: string) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let paymentSuccessDetected = false;

    const logState = (msg: string) => {
      // Uncomment for debugging
      // console.log(`[PAYMENT DEBUG] ${msg}`, { image, step });
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data) {
        if (
          (event.data.type === 'checkout-status-change' && event.data.status === 'success') ||
          event.data.event_type === 'charge:confirmed' ||
          event.data.event_type === 'charge:resolved' ||
          event.data.event_type === 'charge:completed'
        ) {
          if (paymentSuccessDetected) return;
          paymentSuccessDetected = true;
          logState('Payment detected via postMessage');
          setTimeout(() => {
            logState('Calling onSuccess after payment (postMessage)');
            onSuccess();
          }, 3000);
        }
      }
    };
    window.addEventListener('message', handleMessage);

    const checkForPaymentSuccess = () => {
      if (paymentSuccessDetected) return;
      const successElements = document.querySelectorAll('.ock-text-success, .ock-success-message');
      if (successElements.length > 0) {
        paymentSuccessDetected = true;
        logState('Payment detected via DOM class');
        setTimeout(() => {
          logState('Calling onSuccess after payment (DOM class)');
          onSuccess();
        }, 3000);
        return;
      }
      const allElements = document.querySelectorAll('*');
      Array.from(allElements).forEach(element => {
        if (
          element.textContent?.includes('Payment successful') ||
          element.textContent?.includes('Payment completed') ||
          element.textContent?.includes('Transaction complete') ||
          element.textContent?.includes('Payment confirmed') ||
          element.textContent?.includes('View payment details')
        ) {
          paymentSuccessDetected = true;
          logState('Payment detected via DOM text');
          setTimeout(() => {
            logState('Calling onSuccess after payment (DOM text)');
            onSuccess();
          }, 3000);
        }
      });
    };

    const observer = new MutationObserver(mutations => {
      if (paymentSuccessDetected) return;
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              const successElements = document.querySelectorAll('.ock-text-success, .ock-success-message');
              if (successElements.length > 0) {
                if (paymentSuccessDetected) return;
                paymentSuccessDetected = true;
                logState('Payment detected via MutationObserver class');
                setTimeout(() => {
                  logState('Calling onSuccess after payment (MutationObserver class)');
                  onSuccess();
                }, 3000);
              }
              if (
                element.textContent?.includes('Payment successful') ||
                element.textContent?.includes('Payment completed') ||
                element.textContent?.includes('Transaction complete') ||
                element.textContent?.includes('Payment confirmed') ||
                element.textContent?.includes('View payment details')
              ) {
                paymentSuccessDetected = true;
                logState('Payment detected via MutationObserver text');
                setTimeout(() => {
                  logState('Calling onSuccess after payment (MutationObserver text)');
                  onSuccess();
                }, 3000);
              }
            }
          });
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const interval = setInterval(checkForPaymentSuccess, 2000);

    return () => {
      window.removeEventListener('message', handleMessage);
      observer.disconnect();
      clearInterval(interval);
    };
  }, [onSuccess, image, step]);
}
