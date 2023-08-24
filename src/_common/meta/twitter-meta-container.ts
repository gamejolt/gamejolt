import { MetaContainer } from './meta-container';

export class TwitterMetaContainer {
	readonly meta = new MetaContainer();

	set card(value: string | null) {
		this.meta.set('twitter:card', value);
	}
	get card() {
		return this.meta.get('twitter:card');
	}

	set title(value: string | null) {
		this.meta.set('twitter:title', value);
	}
	get title() {
		return this.meta.get('twitter:title');
	}

	set description(value: string | null) {
		this.meta.set('twitter:description', value);
	}
	get description() {
		return this.meta.get('twitter:description');
	}

	set image(value: string | null) {
		this.meta.set('twitter:image', value);
	}
	get image() {
		return this.meta.get('twitter:image');
	}

	set url(value: string | null) {
		this.meta.set('twitter:url', value);
	}
	get url() {
		return this.meta.get('twitter:url');
	}
}
