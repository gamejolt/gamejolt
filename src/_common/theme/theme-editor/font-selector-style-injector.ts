import { h } from 'vue';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';

@Options({})
export class AppThemeEditorFontSelectorStyleInjector extends Vue {
	@Prop(String) fontDefinitions!: string;

	@Watch('fontDefinitions')
	onDefinitionsChanged() {
		this.$el.innerHTML = this.fontDefinitions;
	}

	render() {
		return h('style');
	}
}
