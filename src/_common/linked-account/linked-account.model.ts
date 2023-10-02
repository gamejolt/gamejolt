import { Model } from '../model/model.service';

export function getLinkedAccountPlatformIcon(provider: LinkedAccountProvider) {
	switch (provider) {
		case LinkedAccountProvider.Facebook:
			return 'facebook';
		case LinkedAccountProvider.Google:
			return 'google';
		case LinkedAccountProvider.Twitch:
			return 'twitch';
	}
	return 'remove'; // invalid provider
}

export function getLinkedAccountProviderDisplayName(provider: LinkedAccountProvider) {
	switch (provider) {
		case LinkedAccountProvider.Facebook:
			return 'Facebook';
		case LinkedAccountProvider.Google:
			return 'Google';
		case LinkedAccountProvider.Twitch:
			return 'Twitch';
	}
	return 'Invalid provider';
}

export const enum LinkedAccountProvider {
	Facebook = 'facebook',
	Google = 'google',
	Twitch = 'twitch',
}

export class LinkedAccountModel extends Model {
	declare game_id: number;
	declare provider: LinkedAccountProvider;
	declare provider_id: string;
	declare name: string;
	declare extra_data: any;

	constructor(data: any = {}) {
		super(data);

		if (data.extra_data) {
			this.extra_data = JSON.parse(data.extra_data);
		}
	}

	get platformLink() {
		switch (this.provider) {
			case LinkedAccountProvider.Facebook:
				return `https://facebook.com/${this.provider_id}`;
			case LinkedAccountProvider.Google:
				return `https://plus.google.com/${this.provider_id}`;
			case LinkedAccountProvider.Twitch:
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
			case LinkedAccountProvider.Facebook:
				return `http://graph.facebook.com/${this.provider_id}/picture`;
		}
	}
}
