type SessionStorageSuggestions = {
	// When user follow suggestions were dismissed.
	// To not bug with suggestions, we limit them to X per interval.
	dismissed: number[];
	[userId: number]: number;
};
const Key = 'user-follow-suggestions';

// How many suggestion dismissals we are allowing per interval.
const MaxPerDay = 3;

// The interval used to rate limit dismissed suggestions in ms.
const RateLimitInterval = 86400000; // 1 day

export abstract class UserFollowSuggestion {
	private static get suggestions() {
		const suggestionsStr = sessionStorage.getItem(Key);
		if (suggestionsStr === null) {
			return { dismissed: [] } as SessionStorageSuggestions;
		}

		return JSON.parse(suggestionsStr) as SessionStorageSuggestions;
	}

	private static set suggestions(value: SessionStorageSuggestions) {
		sessionStorage.setItem(Key, JSON.stringify(value));
	}

	static canSuggest(userId: number) {
		let canSuggest = true;
		const now = Date.now();
		const s = this.suggestions;

		// Check if this specific user was already suggested in the past interval.
		const lastSuggested = s[userId] || 0;
		if (now - lastSuggested > RateLimitInterval) {
			delete s[userId];
		} else {
			canSuggest = false;
		}

		// Remove old entries from the globally dismissed suggestion times.
		const dismissed = s.dismissed;
		while (dismissed.length > 0 && now - dismissed[0] > RateLimitInterval) {
			dismissed.splice(0);
		}

		// Check if after removing the old entries we are still capped.
		if (dismissed.length >= MaxPerDay) {
			canSuggest = false;
		}

		this.suggestions = s;
		return canSuggest;
	}

	static doNotSuggest(userId: number) {
		const s = this.suggestions;

		const now = Date.now();
		s.dismissed.push(now);
		s[userId] = now;

		this.suggestions = s;
	}
}
