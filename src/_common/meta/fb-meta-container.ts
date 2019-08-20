import { MetaContainer } from './meta-container';

export class FbMetaContainer extends MetaContainer {
	protected _attr = 'property';

	set title(value: string | null) {
		this.set('og:title', value);
	}
	get title() {
		return this.get('og:title');
	}

	set description(value: string | null) {
		this.set('og:description', value);
	}
	get description() {
		return this.get('og:description');
	}

	set url(value: string | null) {
		this.set('og:url', value);
	}
	get url() {
		return this.get('og:url');
	}

	set type(value: string | null) {
		this.set('og:type', value);
	}
	get type() {
		return this.get('og:type');
	}

	set image(value: string | null) {
		this.set('og:image', value);
	}
	get image() {
		return this.get('og:image');
	}

	set profileId(value: string | null) {
		this.set('og:profile_id', value);
	}
	get profileId() {
		return this.get('og:profile_id');
	}
}
