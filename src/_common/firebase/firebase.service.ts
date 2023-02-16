import { FirebaseApp, initializeApp } from 'firebase/app';
import { Environment } from '../environment/environment.service';

const firebaseConfig = {
	apiKey: 'AIzaSyB8-lpXgBHQKGd92EkkDEc_4eIl4tpk_AA',
	authDomain: 'api-project-1065321331780.firebaseapp.com',
	databaseURL: 'https://api-project-1065321331780.firebaseio.com',
	projectId: 'api-project-1065321331780',
	storageBucket: 'api-project-1065321331780.appspot.com',
	messagingSenderId: '1065321331780',

	// These change depending on the "app" which is web or client.
	appId: Environment.firebaseAppId,
	measurementId: Environment.firebaseMeasurementId,
};

let _firebaseApp: FirebaseApp | null = null;
export function getFirebaseApp() {
	if (!_firebaseApp) {
		_firebaseApp = initializeApp(firebaseConfig);
		_initPerformanceMonitoring();
	}

	return _firebaseApp;
}

async function _initPerformanceMonitoring() {
	if (import.meta.env.SSR || GJ_IS_DESKTOP_APP) {
		return;
	}

	const { initializePerformance } = await import('firebase/performance');
	initializePerformance(getFirebaseApp());
}
