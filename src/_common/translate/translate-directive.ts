import { Directive, DirectiveBinding, VNode } from 'vue';
import {
	TranslationContext,
	getTranslation,
	getTranslationLang,
	interpolateTranslation,
} from './translate.service';

// TODO(vue3): I think we should get rid of this since there's no way the
// translations will work with the way vue does the scope stuff.

export const TranslateDirective: Directive<unknown, TranslationContext> = {
	beforeMount(el: HTMLElement, binding, vnode) {
		// Make sure that vue knows not to reuse this node when v-ifing or
		// anything, since we store the inner HTML into the msgid property and
		// don't watch that for changes. We always use the initial value that
		// was set.
		if (!vnode.key) {
			vnode.key = Symbol();
		}

		// We use the raw HTML and don't trim so that it can be picked up as-is
		// by the extractor. (David note: this is how it was being done before,
		// I don't know if we actually want to trim or not once the extractor is
		// working)
		const msgid = el.innerHTML;
		el.dataset.msgid = msgid;
		el.dataset.currentLanguage = getTranslationLang();

		_updateTranslation(el, binding, vnode);
	},
	updated(el: HTMLElement, binding, vnode) {
		let shouldUpdate = false;

		// If the language changed.
		const currentLanguage = getTranslationLang();
		if (el.dataset.currentLanguage !== currentLanguage) {
			el.dataset.currentLanguage = currentLanguage;
			shouldUpdate = true;
		} else if (binding.value !== binding.oldValue) {
			shouldUpdate = true;
		}

		if (shouldUpdate) {
			_updateTranslation(el, binding, vnode);
		}
	},
};

function _updateTranslation(
	el: HTMLElement,
	binding: DirectiveBinding<Record<string, string | number>>,
	vnode: VNode
) {
	const attrs = vnode.props ?? {};
	const msgid = el.dataset.msgid as string;
	const translateN = attrs['translate-n'];
	const translatePlural = attrs['translate-plural'];
	const enableHTMLEscaping = attrs['render-html'] !== 'true';
	const isPlural = translateN !== undefined && translatePlural !== undefined;

	if (!isPlural && (translateN !== undefined || translatePlural)) {
		throw new Error(
			`"translate-n" and "translate-plural" attributes must be used together: ${msgid}.`
		);
	}

	const context = binding.value && typeof binding.value === 'object' ? binding.value : {};

	let translation = getTranslation(msgid, translateN, isPlural ? translatePlural : null);
	translation = interpolateTranslation(translation, context, { enableHTMLEscaping });

	el.innerHTML = translation;
}
