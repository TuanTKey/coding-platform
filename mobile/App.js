import React from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import store from './src/store/store';
import { RootNavigator } from './src/navigation/RootNavigator';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  React.useEffect(() => {
    const prepare = async () => {
      try {
        // You can add any async initialization here
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the splash screen to hide after we've done loading
        SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  return (
    <Provider store={store}>
      <RootNavigator />
      <StatusBar barStyle="dark-content" />
    </Provider>
  );
}
