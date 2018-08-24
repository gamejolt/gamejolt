import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import View from '!view!./search.html?style=./search.styl';

import { AppPopoverTrigger } from '../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { Search } from './search-service';
import { AppSearchHistory } from './history/history';
import { AppSearchAutocomplete } from './autocomplete/autocomplete';
import { Popover } from '../../../lib/gj-lib-client/components/popover/popover.service';
import { SearchHistory } from './history/history-service';
import { AppSearchInput } from './input/input';

const KEYCODE_UP = 38;
const KEYCODE_DOWN = 40;
const KEYCODE_ENTER = 13;
const KEYCODE_ESC = 27;

let searchIterator = 0;

function setCaretPosition(el: any, caretPos: number) {
	// This is used to not only get "focus", but
	// to make sure we don't have it everything -selected-
	// (it causes an issue in chrome, and having it doesn't hurt any other browser)
	el.value = el.value;

	if (el !== null) {
		if (el.createTextRange) {
			const range = el.createTextRange();
			range.move('character', caretPos);
			range.select();
		} else if (el.selectionStart || el.selectionStart === 0) {
			// (el.selectionStart === 0 added for Firefox bug)
			el.focus();
			el.setSelectionRange(caretPos, caretPos);
		}
	}
}

@View
@Component({
	components: {
		AppSearchHistory,
		AppSearchAutocomplete,
		AppSearchInput,
	},
	directives: {
		AppPopoverTrigger,
	},
})
export class AppSearch extends Vue {
	@Prop({ type: Boolean, default: false })
	autocompleteDisabled!: boolean;

	id = ++searchIterator;

	query = '';
	isFocused = false;
	inputElem: HTMLElement | undefined;
	keydownSpies: Function[] = [];

	readonly Search = Search;

	created() {
		this.query = Search.query;
	}

	// Sync it.
	@Watch('Search.query')
	queryChange() {
		this.query = Search.query;
	}

	isEmpty() {
		return !this.query.trim();
	}

	async focus() {
		await this.$nextTick();

		if (this.inputElem) {
			this.inputElem.focus();
		}
	}

	async blur() {
		await this.$nextTick();

		if (this.inputElem) {
			this.inputElem.blur();
		}
	}

	commandFocus(event: KeyboardEvent) {
		event.preventDefault();
		this.query = ':';

		// We push their cursor after the ":".
		// This will also focus it.
		if (this.inputElem) {
			setCaretPosition(this.inputElem, 1);
		}
	}

	/**
	 * Ability to set watchers for when a keydown event fires.
	 */
	setKeydownSpy(fn: Function) {
		this.keydownSpies.push(fn);
	}

	onKeydown(event: KeyboardEvent) {
		// This stops the default behavior from happening when we press up/down
		// or enter (we don't want to submit form).
		if (
			event.keyCode === KEYCODE_ESC ||
			event.keyCode === KEYCODE_UP ||
			event.keyCode === KEYCODE_DOWN ||
			event.keyCode === KEYCODE_ENTER
		) {
			event.preventDefault();
		}

		// If autocomplete is disabled, then we want to submit the form on enter.
		// Normally the autocomplete will take control of the submission since they
		// technically highlight what they want in autocomplete and go to it.
		if (this.autocompleteDisabled && event.keyCode === KEYCODE_ENTER) {
			SearchHistory.record(this.query);
			this.$router.push({ name: 'search.results', query: { q: this.query } });
		}

		// We want to blur the input on escape.
		if (event.keyCode === KEYCODE_ESC) {
			this.blur();
			this.toggleAutocomplete(false);
			event.stopPropagation();
		}

		for (const spy of this.keydownSpies) {
			spy(event);
		}
	}

	onFocus() {
		this.isFocused = true;
		this.toggleAutocomplete(true);
	}

	onBlur() {
		this.isFocused = false;
	}

	private toggleAutocomplete(state: boolean) {
		const autocomplete = Popover.getPopover('search-autocomplete');
		if (!autocomplete || !this.inputElem) {
			return;
		}

		if (state) {
			autocomplete.show(this.inputElem);
		} else {
			autocomplete.hide();
		}
	}
}
