import {SnackbarProvider} from 'notistack';
import AppRouterProvider from './providers/AppRouterProvider';
import AppQueryClientProvider from './providers/AppQueryClientProvider';
import AppConnectionProvider from './providers/AppConnetionProvider';
import AppWalletProvider from './providers/AppWalletProvider';
import {NetworkProvider} from './contexts/NetworkContext';

function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      <AppQueryClientProvider>
        <NetworkProvider>
          <AppConnectionProvider>
            <AppWalletProvider>
              <AppRouterProvider />
            </AppWalletProvider>
          </AppConnectionProvider>
        </NetworkProvider>
      </AppQueryClientProvider>
    </SnackbarProvider>
  );
}

export default App;
