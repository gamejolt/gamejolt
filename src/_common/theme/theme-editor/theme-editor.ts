import { nextTick } from 'vue';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { Api } from '../../api/api.service';
import AppCodemirror from '../../codemirror/codemirror.vue';
import AppColorpicker from '../../colorpicker/colorpicker.vue';
import AppLoading from '../../loading/loading.vue';
import { SiteTemplate } from '../../site/template/template-model';
import AppThemeEditorFontSelector from './font-selector.vue';
import AppThemeEditorImage from './image.vue';

interface StyleGroup {
	name: string;
	sections: {
		section: string;
		definitions: string[];
	}[];
}

@Options({
	components: {
		AppLoading,
		AppCodemirror,
		AppThemeEditorFontSelector,
		AppThemeEditorImage,
		AppColorpicker,
	},
})
export default class AppThemeEditor extends Vue {
	@Prop(String) windowId!: string;
	@Prop(Number) template!: number;
	@Prop(Object) theme!: any;
	@Prop(Number) resourceId!: number;

	isLoaded = false;

	selectedGroup: StyleGroup = null as any;
	templateObj: SiteTemplate = {} as any;
	definition: any = {};

	@Emit('change')
	emitChange(_theme: any) {}

	async created() {
		const response = await Api.sendRequest(
			'/sites-io/get-template/' + this.template,
			undefined,
			{
				detach: true,
			}
		);

		this.isLoaded = true;

		this.templateObj = new SiteTemplate(response.template);
		this.definition = this.templateObj.data;
		this.selectedGroup = this.definition.styleGroups[0];

		// Make sure we update the page with the current theme.
		this.refresh(true);
	}

	async refresh(initial = false) {
		// Gotta wait for the value to be saved.
		await nextTick();

		const iframe = document.getElementById(this.windowId) as HTMLIFrameElement | undefined;
		if (iframe && iframe.contentWindow) {
			const msg = {
				type: 'theme-update',
				template: this.templateObj,
				definition: this.definition,
				theme: this.theme,
			};

			iframe.contentWindow.postMessage(msg, '*');
		}

		if (!initial) {
			this.emitChange(this.theme);
		}
	}

	updateField(field: string, content?: string) {
		this.theme[field] = content;
		this.refresh();
	}
}
