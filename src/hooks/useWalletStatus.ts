import { useEffect, useState } from 'react';
import { useWalletContext } from '@coinbase/onchainkit/wallet';

export function useWalletStatus() {
  const walletCtx = useWalletContext?.();
  // Use only the correct property for wallet address (fix build error)
  const address = walletCtx?.address || null;
  const [isConnected, setIsConnected] = useState(!!address);

  useEffect(() => {
    setIsConnected(!!address);
  }, [address]);

  return { isConnected, address };
}
