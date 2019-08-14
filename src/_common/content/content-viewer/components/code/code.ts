import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ContentObject } from '../../../content-object';
import { ContentOwner } from '../../../content-owner';
import { renderChildren } from '../base-component';
import './code.styl';
const Prism = require('vue-prism-component');

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

@Component({})
export class AppContentViewerCodeBlock extends Vue {
	@Prop(ContentObject)
	data!: ContentObject;
	@Prop(Object)
	owner!: ContentOwner;

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

	render(h: CreateElement) {
		let node;
		if (this.isPrismLoaded) {
			node = this.renderPrism(h);
		} else {
			node = this.renderDefault(h);
		}
		return node;
	}

	private renderPrism(h: CreateElement) {
		let text = '';
		let language = 'nocode';

		if (this.data.content.length > 0) {
			text = this.data.content[0].text || '';
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
				attrs: {
					'data-annotation': annotationAttr,
				},
				props: {
					language,
				},
			},
			text
		);
	}

	private renderDefault(h: CreateElement) {
		return h(
			'pre',
			{ class: 'content-viewer-code-block content-viewer-nocode' },
			renderChildren(h, this.owner, this.data.content)
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
