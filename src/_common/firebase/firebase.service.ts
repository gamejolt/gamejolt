import { FirebaseApp, initializeApp } from 'firebase/app';

const firebaseConfig = {
	apiKey: 'AIzaSyB8-lpXgBHQKGd92EkkDEc_4eIl4tpk_AA',
	authDomain: 'api-project-1065321331780.firebaseapp.com',
	databaseURL: 'https://api-project-1065321331780.firebaseio.com',
	projectId: 'api-project-1065321331780',
	storageBucket: 'api-project-1065321331780.appspot.com',
	messagingSenderId: '1065321331780',
	appId: '1:1065321331780:web:37c4d21c84f1a69ad3d011',
	measurementId: 'G-ZV3SVDN43D',
};

export function initFirebase() {
	// Just calling this should initialize it and save it.
	getFirebaseApp();
}

let _firebaseApp: FirebaseApp | null = null;
export function getFirebaseApp() {
	return (_firebaseApp ??= initializeApp(firebaseConfig));
}
