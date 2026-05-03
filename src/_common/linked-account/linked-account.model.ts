import { Model } from '~common/model/model.service';

export function getLinkedAccountPlatformIcon(provider: LinkedAccountProvider) {
	switch (provider) {
		case LinkedAccountProviderFacebook:
			return 'facebook';
		case LinkedAccountProviderGoogle:
			return 'google';
		case LinkedAccountProviderTwitch:
			return 'twitch';
	}
	return 'remove'; // invalid provider
}

export function getLinkedAccountProviderDisplayName(provider: LinkedAccountProvider) {
	switch (provider) {
		case LinkedAccountProviderFacebook:
			return 'Facebook';
		case LinkedAccountProviderGoogle:
			return 'Google';
		case LinkedAccountProviderTwitch:
			return 'Twitch';
	}
	return 'Invalid provider';
}

export const LinkedAccountProviderFacebook = 'facebook';
export const LinkedAccountProviderGoogle = 'google';
export const LinkedAccountProviderTwitch = 'twitch';

export type LinkedAccountProvider =
	| typeof LinkedAccountProviderFacebook
	| typeof LinkedAccountProviderGoogle
	| typeof LinkedAccountProviderTwitch;

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
			case LinkedAccountProviderFacebook:
				return `https://facebook.com/${this.provider_id}`;
			case LinkedAccountProviderGoogle:
				return `https://plus.google.com/${this.provider_id}`;
			case LinkedAccountProviderTwitch:
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
			case LinkedAccountProviderFacebook:
				return `http://graph.facebook.com/${this.provider_id}/picture`;
		}
	}
}
