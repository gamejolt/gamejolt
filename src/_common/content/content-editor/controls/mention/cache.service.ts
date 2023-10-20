import { UserModel } from '../../../../user/user.model';

export default class ContentEditorMentionCache {
	private static _results: { [query: string]: UserModel[] } = {};

	public static setResults(query: string, users: UserModel[]) {
		this._results[query] = users;
	}

	public static hasResults(query: string): boolean {
		return query in this._results;
	}

	public static getResults(query: string): UserModel[] {
		if (this.hasResults(query)) {
			return this._results[query];
		}
		return [];
	}
}
