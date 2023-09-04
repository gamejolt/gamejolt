<script lang="ts">
import {
	computed,
	defineAsyncComponent,
	inject,
	InjectionKey,
	onMounted,
	provide,
	Ref,
	ref,
	toRefs,
	watch,
} from 'vue';
import { useRouter } from 'vue-router';
import { trackSearch } from '../../../_common/analytics/analytics.service';
import AppPopper from '../../../_common/popper/AppPopper.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { arrayRemove } from '../../../utils/array';
import { createFocusToken } from '../../../utils/focus-token';
import AppSearchInput from './AppSearchInput.vue';
import { Search } from './search-service';

const AppSearchAutocomplete = defineAsyncComponent(() => import('./AppSearchAutocomplete.vue'));

const KEYCODE_UP = 38;
const KEYCODE_DOWN = 40;
const KEYCODE_ENTER = 13;
const KEYCODE_ESC = 27;

type Controller = ReturnType<typeof createSearchController>;
export type SearchKeydownSpy = (event: KeyboardEvent) => void;

let searchIterator = 0;

const Key: InjectionKey<Controller> = Symbol('search');

export function useSearchController() {
	return inject(Key, null);
}

function createSearchController({
	autocompleteDisabled,
	autofocus,
}: {
	autocompleteDisabled: Ref<boolean>;
	autofocus: Ref<boolean>;
}) {
	const id = ref(++searchIterator);
	const query = ref(Search.query);
	const isFocused = ref(false);
	const isShowingAutocomplete = ref(false);
	const keydownSpies = ref([] as SearchKeydownSpy[]);
	const focusToken = createFocusToken();

	const shouldShowAutocomplete = computed(() => !autocompleteDisabled.value);
	const isEmpty = computed(() => !query.value.trim());

	onMounted(() => {
		if (autofocus.value) {
			focusToken.focus();
		}
	});

	watch(
		() => Search.query,
		newQuery => {
			query.value = newQuery;
		}
	);

	/**
	 * Ability to set watchers for when a keydown event fires.
	 */
	function setKeydownSpy(fn: SearchKeydownSpy) {
		keydownSpies.value.push(fn);
	}

	function removeKeydownSpy(fn: SearchKeydownSpy) {
		arrayRemove(keydownSpies.value, i => i === fn);
	}

	const c = {
		id,
		query,
		isFocused,
		focusToken,
		isShowingAutocomplete,
		keydownSpies,
		shouldShowAutocomplete,
		setKeydownSpy,
		removeKeydownSpy,
		isEmpty,
	};
	provide(Key, c);
	return c;
}
</script>

<script lang="ts" setup>
const props = defineProps({
	autocompleteDisabled: {
		type: Boolean,
	},
	autofocus: {
		type: Boolean,
	},
});

const {
	id: inputId,
	keydownSpies,
	isFocused,
	focusToken,
	shouldShowAutocomplete,
	isShowingAutocomplete,
	query,
} = createSearchController(toRefs(props));

const router = useRouter();

function onKeydown(event: KeyboardEvent) {
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
	if (!shouldShowAutocomplete.value && event.keyCode === KEYCODE_ENTER) {
		focusToken.blur();
		router.push({ name: 'search.results', query: { q: query.value } });
		trackSearch({ query: query.value });
	}

	// We want to blur the input on escape.
	if (event.keyCode === KEYCODE_ESC) {
		focusToken.blur();
		event.stopPropagation();
	}

	for (const spy of keydownSpies.value) {
		spy(event);
	}
}

function onFocus() {
	isFocused.value = true;
	if (shouldShowAutocomplete.value) {
		isShowingAutocomplete.value = true;
	}
}

function onBlur() {
	isFocused.value = false;
	if (shouldShowAutocomplete.value) {
		isShowingAutocomplete.value = false;
	}
}
</script>

<template>
	<div class="app-search">
		<!--
			Put the action/method stuff so that crawlers can see how to submit the form.
		-->
		<form
			class="navbar-form"
			action="/search"
			method="GET"
			role="search"
			onsubmit="return false"
		>
			<div class="-input">
				<label :for="`search-input-${inputId}`" class="sr-only">
					<AppTranslate>Search</AppTranslate>
				</label>

				<AppPopper
					popover-class="fill-darkest"
					trigger="manual"
					block
					fixed
					hide-on-state-change
					track-trigger-width
					:manual-show="isShowingAutocomplete"
				>
					<AppSearchInput
						:id="`search-input-${inputId}`"
						v-model="query"
						:focus-token="focusToken"
						@focus="onFocus"
						@blur="onBlur"
						@keydown="onKeydown"
					/>

					<template #popover>
						<AppSearchAutocomplete />
					</template>
				</AppPopper>
			</div>
		</form>
	</div>
</template>

<style lang="stylus" scoped>
.-input
	width: 100%
</style>
