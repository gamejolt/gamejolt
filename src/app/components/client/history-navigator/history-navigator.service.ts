export class ClientHistoryNavigator {
	static readonly canGoForward = true;
	static readonly canGoBack = true;

	static init() {}

	static back() {
		window.history.back();
	}

	static forward() {
		window.history.forward();
	}
}
