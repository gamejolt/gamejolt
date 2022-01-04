import { h } from 'vue';
import Prism from 'vue-prism-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { ContentObject } from '../../../content-object';
import { renderChildren } from '../base-component';
import './code.styl';

const LANGUAGE_MAP = {
	js: 'javascript',
	javascript: 'javascript',
	ts: 'javascript',
	typescript: 'javascript',

	css: 'css',

	html: 'markup',
	markup: 'markup',
	xml: 'markup',
	svg: 'markup',

	c: 'clike',
	csharp: 'clike',
	'c++': 'clike',
	java: 'clike',
	clike: 'clike',

	nocode: 'nocode',
} as any;

@Options({})
export class AppContentViewerCodeBlock extends Vue {
	@Prop({ type: ContentObject })
	contentData!: ContentObject;

	isPrismLoaded = false;

	async mounted() {
		// Lazy load in the Prism library first, then our custom code style.
		// These two imports HAVE to run in that order for the style to apply properly.
		await Promise.all([
			import(/* webpackChunkName: "prismjs" */ 'prismjs'),
			import(/* webpackChunkName: "prismjs" */ 'prismjs/themes/prism.css' as any),
		]);
		await import(/* webpackChunkName: "prismjs" */ './code-style.css' as any);
		this.isPrismLoaded = true;
	}

	render() {
		if (this.isPrismLoaded) {
			return this.renderPrism();
		} else {
			return this.renderDefault();
		}
	}

	private renderPrism() {
		let text = '';
		let language = 'nocode';

		if (this.contentData.content.length > 0) {
			text = this.contentData.content[0].text || '';
		}

		// Try and find a language annotation.
		// If found, remove it from the text.
		const annotation = this.getLanguageAnnotation(text);
		let annotationAttr = '';
		if (annotation !== undefined) {
			const annotatedLanguage = LANGUAGE_MAP[annotation];
			if (annotatedLanguage !== undefined) {
				language = annotatedLanguage;
				text = text.slice(annotation.length + 2); // + 2 to remove the # and new line
				annotationAttr = '#' + annotation;
			}
		}

		if (language === 'nocode') {
			return h('pre', { class: 'content-viewer-code-block content-viewer-nocode' }, text);
		}

		return h(
			Prism,
			{
				class: 'content-viewer-code-block',
				'data-annotation': annotationAttr,
				language,
			},
			text
		);
	}

	private renderDefault() {
		return h(
			'pre',
			{ class: 'content-viewer-code-block content-viewer-nocode' },
			renderChildren(this.contentData.content)
		);
	}

	private getLanguageAnnotation(text: string) {
		if (text.length > 0) {
			const match = text.match(/^#(.+)\n/);
			if (match !== null && match.length > 1) {
				const matchedText = match[1];
				return matchedText;
			}
		}
	}
}
