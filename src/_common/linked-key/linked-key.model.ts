import { Model } from '~common/model/model.service';

export const LinkedKeyProviderSteam = 'steam';

export type LinkedKeyProvider = typeof LinkedKeyProviderSteam;

export class LinkedKeyModel extends Model {
	declare key: string;
	declare provider: LinkedKeyProvider;
	declare provider_label: string;
}
