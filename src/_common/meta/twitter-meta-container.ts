import { MetaContainer } from './meta-container';

export class TwitterMetaContainer extends MetaContainer {
	set card(value: string | null) {
		this.set('twitter:card', value);
	}
	get card() {
		return this.get('twitter:card');
	}

	set title(value: string | null) {
		this.set('twitter:title', value);
	}
	get title() {
		return this.get('twitter:title');
	}

	set description(value: string | null) {
		this.set('twitter:description', value);
	}
	get description() {
		return this.get('twitter:description');
	}

	set image(value: string | null) {
		this.set('twitter:image', value);
	}
	get image() {
		return this.get('twitter:image');
	}

	set url(value: string | null) {
		this.set('twitter:url', value);
	}
	get url() {
		return this.get('twitter:url');
	}
}
