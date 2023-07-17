import fallbackImageUrl from '../../app/img/meta-default-image.png';
import { MetaContainer } from './meta-container';

export class FbMetaContainer {
	readonly meta = new MetaContainer('property');

	set title(value: string | null) {
		this.meta.set('og:title', value);
	}
	get title() {
		return this.meta.get('og:title');
	}

	set description(value: string | null) {
		this.meta.set('og:description', value);
	}
	get description() {
		return this.meta.get('og:description');
	}

	set url(value: string | null) {
		this.meta.set('og:url', value);
	}
	get url() {
		return this.meta.get('og:url');
	}

	set type(value: string | null) {
		this.meta.set('og:type', value);
	}
	get type() {
		return this.meta.get('og:type');
	}

	set image(value: string | null) {
		// Default to the fallback.
		this.meta.set('og:image', value ?? fallbackImageUrl);
	}
	get image() {
		return this.meta.get('og:image');
	}

	set profileId(value: string | null) {
		this.meta.set('og:profile_id', value);
	}
	get profileId() {
		return this.meta.get('og:profile_id');
	}
}
