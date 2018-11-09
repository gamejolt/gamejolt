import View from '!view!./tags.html?style=./tags.styl';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

@View
@Component({})
export class AppFormGameDescriptionTags extends Vue {
	@Prop(Array)
	tags!: string[];

	@Prop(String)
	text!: string;

	@Emit('tag')
	emitTag(_tag: string) {}

	get shouldShow() {
		return (
			this.tags && this.tags.length && this.recommendedTags.length + this.otherTags.length > 0
		);
	}

	/**
	 * This will do a simple recommendation of tags based on their text content.
	 */
	get recommendedTags() {
		if (this.tags) {
			const text = this.text;
			return this.tags
				.map(t => {
					const count = text.split(t.toLowerCase()).length - 1;
					const hashtagCount = text.split('#' + t.toLowerCase()).length - 1;
					return {
						tag: t,
						count: hashtagCount > 0 ? -1 : count,
					};
				})
				.filter(w => w.count > 0)
				.sort((a, b) => {
					if (a.count > b.count) {
						return -1;
					} else if (a.count < b.count) {
						return 1;
					}
					return 0;
				})
				.map(w => w.tag);
		}
		return [];
	}

	get otherTags() {
		if (this.tags) {
			const recommended = this.recommendedTags;
			const text = this.text;
			return this.tags.filter(
				t =>
					recommended.indexOf(t) === -1 &&
					text.split('#' + t.toLowerCase()).length - 1 === 0
			);
		}
		return [];
	}
}
