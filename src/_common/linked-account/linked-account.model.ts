import { Model } from '../model/model.service';

export type Provider =
	| 'twitter'
	| 'facebook'
	| 'twitch'
	| 'google'
	| 'tumblr'
	| 'discord'
	| 'youtube';

export interface FacebookPage {
	id: number;
	name: string;
}

export interface TumblrBlog {
	name: string;
	url: string;
	title: string;
}

export function getLinkedAccountPlatformIcon(provider: string) {
	switch (provider) {
		case LinkedAccount.PROVIDER_FACEBOOK:
			return 'facebook';
		case LinkedAccount.PROVIDER_TWITTER:
			return 'twitter-bird';
		case LinkedAccount.PROVIDER_GOOGLE:
			return 'google';
		case LinkedAccount.PROVIDER_TWITCH:
			return 'twitch';
		case LinkedAccount.PROVIDER_TUMBLR:
			return 'tumblr';
		// case LinkedAccount.PROVIDER_DISCORD:
		// 	return 'radio';
	}
	return 'remove'; // invalid provider
}

export function getLinkedAccountProviderDisplayName(provider: string) {
	switch (provider) {
		case LinkedAccount.PROVIDER_FACEBOOK:
			return 'Facebook';
		case LinkedAccount.PROVIDER_TWITTER:
			return 'Twitter';
		case LinkedAccount.PROVIDER_GOOGLE:
			return 'Google';
		case LinkedAccount.PROVIDER_TWITCH:
			return 'Twitch';
		case LinkedAccount.PROVIDER_TUMBLR:
			return 'Tumblr';
		case LinkedAccount.PROVIDER_DISCORD:
			return 'Discord';
	}
	return 'Invalid provider';
}

export class LinkedAccount extends Model {
	static readonly PROVIDER_FACEBOOK: Provider = 'facebook';
	static readonly PROVIDER_TWITTER: Provider = 'twitter';
	static readonly PROVIDER_GOOGLE: Provider = 'google';
	static readonly PROVIDER_TWITCH: Provider = 'twitch';
	static readonly PROVIDER_TUMBLR: Provider = 'tumblr';
	static readonly PROVIDER_DISCORD: Provider = 'discord';

	game_id!: number;
	provider!: string;
	provider_id!: string;
	name!: string;
	extra_data!: any;

	constructor(data: any = {}) {
		super(data);

		if (data.extra_data) {
			this.extra_data = JSON.parse(data.extra_data);
		}
	}

	get platformLink() {
		switch (this.provider) {
			case LinkedAccount.PROVIDER_FACEBOOK:
				return `https://facebook.com/${this.provider_id}`;
			case LinkedAccount.PROVIDER_TWITTER:
				return `https://twitter.com/${this.name}`;
			case LinkedAccount.PROVIDER_GOOGLE:
				return `https://plus.google.com/${this.provider_id}`;
			case LinkedAccount.PROVIDER_TWITCH:
				return `https://twitch.tv/${this.name}`;
			case LinkedAccount.PROVIDER_TUMBLR:
				return null; // tumblr users don't have a page associated with them that we can show
			case LinkedAccount.PROVIDER_DISCORD:
				return null; // discord users don't have a page associated with them
		}
		return 'Invalid provider';
	}

	get icon() {
		return getLinkedAccountPlatformIcon(this.provider);
	}

	get providerDisplayName() {
		return getLinkedAccountProviderDisplayName(this.provider);
	}

	// returns the name of the page selected for this facebook account
	get facebookSelectedPage(): FacebookPage | null {
		if (this.provider === LinkedAccount.PROVIDER_FACEBOOK && this.extra_data) {
			const selectedPage = this.extra_data.selectedPage;
			if (selectedPage) {
				return selectedPage;
			}
		}
		return null;
	}

	get facebookPageUrl(): string | null {
		const selectedPage = this.facebookSelectedPage;
		if (selectedPage) {
			return 'https://facebook.com/' + selectedPage.id;
		}
		return null;
	}

	get tumblrSelectedBlog(): TumblrBlog | null {
		if (this.provider === LinkedAccount.PROVIDER_TUMBLR && this.extra_data) {
			const selectedBlog = this.extra_data.selectedBlog;
			if (selectedBlog) {
				return selectedBlog;
			}
		}
		return null;
	}

	get profileImageUrl() {
		switch (this.provider) {
			case LinkedAccount.PROVIDER_FACEBOOK:
				return `http://graph.facebook.com/${this.provider_id}/picture`;
			case LinkedAccount.PROVIDER_TWITTER:
				return `https://twitter.com/${this.name}/profile_image`;
			case LinkedAccount.PROVIDER_TUMBLR:
				if (this.tumblrSelectedBlog) {
					return `https://api.tumblr.com/v2/blog/${this.tumblrSelectedBlog.name}/avatar`;
				}
		}
	}
}

Model.create(LinkedAccount);
