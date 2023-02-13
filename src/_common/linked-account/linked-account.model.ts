import { Model } from '../model/model.service';

export type Provider = 'twitter' | 'facebook' | 'twitch' | 'google' | 'youtube';

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
	}
	return 'Invalid provider';
}

export class LinkedAccount extends Model {
	static readonly PROVIDER_FACEBOOK: Provider = 'facebook';
	static readonly PROVIDER_TWITTER: Provider = 'twitter';
	static readonly PROVIDER_GOOGLE: Provider = 'google';
	static readonly PROVIDER_TWITCH: Provider = 'twitch';

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
		}
		return 'Invalid provider';
	}

	get icon() {
		return getLinkedAccountPlatformIcon(this.provider);
	}

	get providerDisplayName() {
		return getLinkedAccountProviderDisplayName(this.provider);
	}

	get profileImageUrl() {
		switch (this.provider) {
			case LinkedAccount.PROVIDER_FACEBOOK:
				return `http://graph.facebook.com/${this.provider_id}/picture`;
			case LinkedAccount.PROVIDER_TWITTER:
				return `https://twitter.com/${this.name}/profile_image`;
		}
	}
}

Model.create(LinkedAccount);
