import { User } from '../../../../user/user.model';

export default class ContentEditorMentionCache {
	private static _results: { [query: string]: User[] } = {};

	public static setResults(query: string, users: User[]) {
		this._results[query] = users;
	}

	public static hasResults(query: string): boolean {
		return query in this._results;
	}

	public static getResults(query: string): User[] {
		if (this.hasResults(query)) {
			return this._results[query];
		}
		return [];
	}
}
