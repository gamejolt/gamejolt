import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Api } from '../../api/api.service';
import { Environment } from '../../environment/environment.service';
import AppLoading from '../../loading/loading.vue';
import { SiteContentBlock } from '../../site/content-block/content-block-model';
import { Site } from '../../site/site-model';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import FormContentBlockEditor from './editor-form.vue';

const PreviewDebounce = 3000;

@Component({
	components: {
		AppLoading,
		FormContentBlockEditor,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppContentBlockEditor extends Vue {
	@Prop(Site) site!: Site;
	@Prop(String) windowId!: string;
	@Prop(SiteContentBlock) contentBlock!: SiteContentBlock;

	isPreviewLoading = false;
	private previewIndex = 0;
	private previewTimeout: NodeJS.Timer | null = null;

	Environment = Environment;

	@Watch('contentBlock.content_markdown')
	onContentChanged(content: string, oldContent: string) {
		if (content !== oldContent) {
			this.$emit('change', content);
		}

		if (content) {
			this.isPreviewLoading = true;
			this._fetchPreview();
		} else {
			this.isPreviewLoading = false;
			this.compiled('');
		}
	}

	async _fetchPreview() {
		if (this.previewTimeout) {
			clearTimeout(this.previewTimeout);
		}

		this.previewTimeout = setTimeout(async () => {
			const previewIndex = ++this.previewIndex;
			const response = await Api.sendRequest(
				'/web/dash/sites/content-preview',
				{ content: this.contentBlock.content_markdown },
				{ ignorePayloadUser: true }
			);

			if (previewIndex === this.previewIndex) {
				this.isPreviewLoading = false;
				if (response && response.success !== false && response.compiled) {
					this.compiled(response.compiled);
				}
			}

			this.previewTimeout = null;
		}, PreviewDebounce);
	}

	compiled(compiledContent: string) {
		this.contentBlock.content_compiled = compiledContent;
		this.refresh();
	}

	refresh() {
		const iframe = document.getElementById(this.windowId) as HTMLIFrameElement | undefined;
		if (iframe && iframe.contentWindow) {
			const msg = {
				type: 'content-update',
				block: this.contentBlock,
			};
			iframe.contentWindow.postMessage(msg, '*');
		}
	}

	// Pulled from: http://stackoverflow.com/questions/1064089/inserting-a-text-where-cursor-is-using-javascript-jquery
	insertAtCaret(text: string) {
		const txtarea = this.$el.getElementsByTagName('textarea')[0];
		if (!txtarea) {
			return;
		}

		const scrollPos = txtarea.scrollTop;
		let strPos = 0;
		const br =
			txtarea.selectionStart || txtarea.selectionStart === 0
				? 'ff'
				: (document as any).selection
				? 'ie'
				: false;

		if (br === 'ie') {
			txtarea.focus();
			const range = (document as any).selection.createRange();
			range.moveStart('character', -txtarea.value.length);
			strPos = range.text.length;
		} else if (br === 'ff') {
			strPos = txtarea.selectionStart;
		}

		const front = txtarea.value.substring(0, strPos);
		const back = txtarea.value.substring(strPos, txtarea.value.length);
		txtarea.value = front + text + back;
		strPos = strPos + text.length;
		if (br === 'ie') {
			txtarea.focus();
			const ieRange = (document as any).selection.createRange();
			ieRange.moveStart('character', -txtarea.value.length);
			ieRange.moveStart('character', strPos);
			ieRange.moveEnd('character', 0);
			ieRange.select();
		} else if (br === 'ff') {
			txtarea.selectionStart = strPos;
			txtarea.selectionEnd = strPos;
			txtarea.focus();
		}

		txtarea.scrollTop = scrollPos;

		this.contentBlock.content_markdown = txtarea.value;
	}
}
