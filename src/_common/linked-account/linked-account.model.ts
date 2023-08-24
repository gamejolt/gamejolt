import { Model } from '../model/model.service';

export type Provider = 'facebook' | 'twitch' | 'google' | 'youtube';

export function getLinkedAccountPlatformIcon(provider: string) {
	switch (provider) {
		case LinkedAccountModel.PROVIDER_FACEBOOK:
			return 'facebook';
		case LinkedAccountModel.PROVIDER_GOOGLE:
			return 'google';
		case LinkedAccountModel.PROVIDER_TWITCH:
			return 'twitch';
	}
	return 'remove'; // invalid provider
}

export function getLinkedAccountProviderDisplayName(provider: string) {
	switch (provider) {
		case LinkedAccountModel.PROVIDER_FACEBOOK:
			return 'Facebook';
		case LinkedAccountModel.PROVIDER_GOOGLE:
			return 'Google';
		case LinkedAccountModel.PROVIDER_TWITCH:
			return 'Twitch';
	}
	return 'Invalid provider';
}

export class LinkedAccountModel extends Model {
	static readonly PROVIDER_FACEBOOK: Provider = 'facebook';
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
			case LinkedAccountModel.PROVIDER_FACEBOOK:
				return `https://facebook.com/${this.provider_id}`;
			case LinkedAccountModel.PROVIDER_GOOGLE:
				return `https://plus.google.com/${this.provider_id}`;
			case LinkedAccountModel.PROVIDER_TWITCH:
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
			case LinkedAccountModel.PROVIDER_FACEBOOK:
				return `http://graph.facebook.com/${this.provider_id}/picture`;
		}
	}
}
