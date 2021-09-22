<script lang="ts">
import {
	computed,
	defineAsyncComponent,
	inject,
	InjectionKey,
	nextTick,
	onMounted,
	provide,
	reactive,
	ref,
	watch,
} from 'vue';
import { useRouter } from 'vue-router';
import { arrayRemove } from '../../../utils/array';
import { trackExperimentEngagement } from '../../../_common/analytics/analytics.service';
import { configHasAutocomplete } from '../../../_common/config/config.service';
import AppPopper from '../../../_common/popper/popper.vue';
import AppShortkey from '../../../_common/shortkey/shortkey.vue';
import AppSearchInput, { createSearchInput } from './input/input.vue';
import { Search } from './search-service';

const KEYCODE_UP = 38;
const KEYCODE_DOWN = 40;
const KEYCODE_ENTER = 13;
const KEYCODE_ESC = 27;

type Controller = ReturnType<typeof createSearchController>;
export type SearchKeydownSpy = (event: KeyboardEvent) => void;

let searchIterator = 0;

const Key: InjectionKey<Controller> = Symbol('search');

function createSearchController(p: typeof props) {
	const id = ref(++searchIterator);
	const query = ref(Search.query);
	const isFocused = ref(false);
	const isShowingAutocomplete = ref(false);
	const keydownSpies = ref([] as SearchKeydownSpy[]);
	const searchInput = createSearchInput();

	const shouldShowAutocomplete = computed(
		() => !p.autocompleteDisabled && configHasAutocomplete.value
	);

	const isEmpty = computed(() => !query.value.trim());

	onMounted(() => {
		if (p.autofocus) {
			focus();
		}
	});

	async function focus() {
		await nextTick();
		searchInput.focus();
	}

	async function blur() {
		await nextTick();
		searchInput.blur();
	}

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

	return reactive({
		id,
		query,
		isFocused,
		isShowingAutocomplete,
		keydownSpies,
		searchInput,
		shouldShowAutocomplete,
		focus,
		blur,
		setKeydownSpy,
		removeKeydownSpy,
		isEmpty,
	});
}

export function useSearchController() {
	return inject(Key, null);
}
</script>

<script lang="ts" setup>
const AppSearchAutocomplete = defineAsyncComponent(() => import('./autocomplete/autocomplete.vue'));

const props = defineProps({
	autocompleteDisabled: {
		type: Boolean,
	},
	autofocus: {
		type: Boolean,
	},
});

const c = createSearchController(props);
provide(Key, c);

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
	if (!c.shouldShowAutocomplete && event.keyCode === KEYCODE_ENTER) {
		c.blur();
		router.push({ name: 'search.results', query: { q: c.query } });
	}

	// We want to blur the input on escape.
	if (event.keyCode === KEYCODE_ESC) {
		c.blur();
		event.stopPropagation();
	}

	for (const spy of c.keydownSpies) {
		spy(event);
	}
}

function onFocus() {
	trackExperimentEngagement(configHasAutocomplete);

	c.isFocused = true;
	if (c.shouldShowAutocomplete) {
		c.isShowingAutocomplete = true;
	}
}

function onBlur() {
	c.isFocused = false;
	if (c.shouldShowAutocomplete) {
		c.isShowingAutocomplete = false;
	}
}
</script>

<template>
	<div class="app-search">
		<AppShortkey shortkey="s" @press="c.focus()" />

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
				<label :for="`search-input-${c.id}`" class="sr-only">
					<translate>search.input.placeholder</translate>
				</label>

				<!--
					We use the 'click-show' trigger event.
					This will make sure that the autocomplete popover doesn't disappear when
					clicking the search input again.'
				-->
				<AppPopper
					popover-class="fill-darkest"
					trigger="manual"
					block
					fixed
					hide-on-state-change
					track-trigger-width
					:manual-show="c.isShowingAutocomplete"
				>
					<AppSearchInput
						:id="`search-input-${c.id}`"
						v-model="c.query"
						:controller="c.searchInput"
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
