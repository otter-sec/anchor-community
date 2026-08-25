import {Adapter, WalletError} from '@solana/wallet-adapter-base';
import {WalletDialogProvider} from '@solana/wallet-adapter-material-ui';
import {WalletProvider} from '@solana/wallet-adapter-react';
import {useSnackbar} from 'notistack';
import {FC, useCallback} from 'react';

const AppWalletProvider: FC<{children?: React.ReactNode}> = ({children}) => {
  const {enqueueSnackbar} = useSnackbar();
  const onError = useCallback(
    (error: WalletError, adapter?: Adapter) => {
      enqueueSnackbar(
        error.message ? `${error.name}: ${error.message}` : error.name,
        {variant: 'error'}
      );
      console.error(error, adapter);
    },
    [enqueueSnackbar]
  );

  return (
    <WalletProvider wallets={[]} onError={onError} autoConnect>
      <WalletDialogProvider>{children}</WalletDialogProvider>
    </WalletProvider>
  );
};
export default AppWalletProvider;
