import { WebView } from 'react-native-webview';
import { StyleSheet, View } from 'react-native';


export default function Home() {
  return (
    <>
        <View style={styles.webviewContainer}>
          <WebView 
            source={{ uri: 'https://recursive-depression-d2-k.vercel.app/' }}
            style={styles.webview}
          />
        </View>
    </>
  );
}
  
const styles = StyleSheet.create({
  webviewContainer: {
    flex: 1,
    width: '100%',
    height: 400,
  },
  webview: {
    flex: 1,
  },
});