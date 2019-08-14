import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { SiteTemplate } from '../../site/template/template-model';
import { Api } from '../../api/api.service';
import AppCodemirror from '../../codemirror/codemirror.vue';
import AppLoading from '../../../vue/components/loading/loading.vue'
import AppThemeEditorFontSelector from './font-selector.vue';
import AppThemeEditorImage from './image.vue';
import AppColorpicker from '../../colorpicker/colorpicker.vue';

interface StyleGroup {
	name: string;
	sections: {
		section: string;
		definitions: string[];
	}[];
}

@Component({
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

	async created() {
		const response = await Api.sendRequest('/sites-io/get-template/' + this.template, undefined, {
			detach: true,
		});

		this.isLoaded = true;

		this.templateObj = new SiteTemplate(response.template);
		this.definition = this.templateObj.data;
		this.selectedGroup = this.definition.styleGroups[0];

		// Make sure we update the page with the current theme.
		this.refresh(true);
	}

	async refresh(initial = false) {
		// Gotta wait for the value to be saved.
		await this.$nextTick();

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
			this.$emit('change', this.theme);
		}
	}

	updateField(field: string, content: string) {
		this.theme[field] = content;
		this.refresh();
	}
}
