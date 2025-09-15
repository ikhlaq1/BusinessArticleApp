import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 1000,
  },
  statusContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  offline: {
    backgroundColor: '#424242',
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 50, // Account for status bar
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dotOffline: {
    backgroundColor: '#ff5252',
  },
  dotOnline: {
    backgroundColor: '#fff',
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 10,
  },
  subtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    flex: 1,
    textAlign: 'right',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  spinner: {
    marginLeft: 8,
  },
});
