import View from '!view!./tags.html';
import {
	AppTagSuggestion,
	TagSuggester,
} from 'game-jolt-frontend-lib/components/tag/suggestion/suggestion';
import Vue from 'vue';
import { Component, Emit, Prop, Watch } from 'vue-property-decorator';

@View
@Component({
	components: {
		AppTagSuggestion,
	},
})
export class AppFormPostTags extends Vue {
	@Prop(Array)
	tags!: string[];

	@Prop(String)
	text!: string;

	suggester: TagSuggester = null as any;

	@Emit('tag')
	emitTag(_tag: string) {}

	get shouldShow() {
		return this.suggester.shouldShow;
	}

	created() {
		this.suggester = new TagSuggester(this.tags, this.text);
	}

	@Watch('tags')
	@Watch('text')
	onDataChanged() {
		this.suggester.tags = this.tags;
		this.suggester.text = this.text;
	}
}
