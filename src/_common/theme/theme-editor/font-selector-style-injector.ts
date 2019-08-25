import Vue, { CreateElement } from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component({})
export class AppThemeEditorFontSelectorStyleInjector extends Vue {
	@Prop(String) fontDefinitions!: string;

	@Watch('fontDefinitions')
	onDefinitionsChanged() {
		this.$el.innerHTML = this.fontDefinitions;
	}

	render(h: CreateElement) {
		return h('style');
	}
}
