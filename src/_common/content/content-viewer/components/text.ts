import { h } from 'vue';
import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { Environment } from '../../../environment/environment.service';
import AppLinkExternal from '../../../link/AppLinkExternal.vue';
import { ContentObject } from '../../content-object';
import { ContentOwnerController, ContentOwnerControllerKey } from '../../content-owner';
import AppContentViewerMention from './mention/mention.vue';
import AppContentViewerTag from './tag/tag.vue';

@Options({})
export class AppContentViewerText extends Vue {
	@Prop({ type: ContentObject })
	contentData!: ContentObject;

	@Inject({ from: ContentOwnerControllerKey })
	owner!: ContentOwnerController;

	hasMark(mark: string) {
		return this.contentData.marks && this.contentData.marks.some(m => m.type === mark);
	}

	getMarkAttrs(mark: string) {
		if (this.hasMark(mark)) {
			return this.contentData.marks.find(m => m.type === mark)!.attrs;
		}
		return [];
	}

	get text() {
		const text = this.contentData.text;

		if (text && text?.length > 64 && this.isLink) {
			const rules = this.owner.contentRules;
			if (rules.truncateLinks) {
				return text.substr(0, 64) + '…';
			}
		}

		return text;
	}

	get isBold() {
		return this.hasMark('strong');
	}

	get isItalics() {
		return this.hasMark('em');
	}

	get isStrikethrough() {
		return this.hasMark('strike');
	}

	get isCode() {
		return this.hasMark('code');
	}

	get isLink() {
		return this.hasMark('link');
	}

	get isMention() {
		return this.hasMark('mention');
	}

	get isTag() {
		return this.hasMark('tag');
	}

	render() {
		let vnode = h('span', {}, this.text ?? undefined);

		if (this.isLink) {
			const attrs = this.getMarkAttrs('link');
			const children = [vnode];

			// Make sure the href is prefaced by a protocol.
			let href = attrs.href as string;
			if (!/^[a-z][a-z0-9+\-.]*:\/\//i.test(href)) {
				href = '//' + href;
			}

			const elementAttrs = {
				href,
			} as any;
			if (attrs.title && attrs.title !== attrs.href) {
				elementAttrs.title = attrs.title + ' (' + href + ')';
			} else {
				elementAttrs.title = attrs.href;
			}

			// If this is a local link to gamejolt.com, we want to open it in
			// same tab, otherwise we open in new window.
			const ourHost =
				href.startsWith(Environment.baseUrl) ||
				href.startsWith(Environment.baseUrlInsecure);

			if (ourHost) {
				vnode = h('a', elementAttrs, {
					default: () => children,
				});
			} else {
				vnode = h(AppLinkExternal, elementAttrs, {
					default: () => children,
				});
			}
		} else if (this.isMention) {
			const attrs = this.getMarkAttrs('mention');
			const children = [vnode];

			vnode = h(
				AppContentViewerMention,
				{ username: attrs.username },
				{
					default: () => children,
				}
			);
		} else if (this.isTag) {
			const attrs = this.getMarkAttrs('tag');
			const children = [vnode];

			vnode = h(
				AppContentViewerTag,
				{ tag: attrs.tag },
				{
					default: () => children,
				}
			);
		}

		if (this.isBold) {
			vnode = h('strong', {}, [vnode]);
		}
		if (this.isItalics) {
			vnode = h('em', {}, [vnode]);
		}
		if (this.isStrikethrough) {
			vnode = h('s', {}, [vnode]);
		}
		if (this.isCode) {
			vnode = h('code', {}, [vnode]);
		}
		return vnode;
	}
}
