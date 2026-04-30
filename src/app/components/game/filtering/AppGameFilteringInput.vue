<script lang="ts" setup>
import { ref, useTemplateRef } from 'vue';

import { GameFilteringContainer } from '~app/components/game/filtering/container';
import AppJolticon from '~common/jolticon/AppJolticon.vue';

type Props = {
	filtering: GameFilteringContainer;
};

const { filtering } = defineProps<Props>();

const query = ref('');
const inputRef = useTemplateRef('input');

// Equivalent of created()
query.value = filtering.filters.query;

function clear() {
	query.value = '';
	filtering.unsetFilter('query');
	filtering.onChanged();
}

function sendSearch() {
	filtering.setFilter('query', query.value);
	filtering.onChanged();
}

function blur() {
	if (inputRef.value) {
		inputRef.value.blur();
	}
}
</script>

<template>
	<form class="game-filtering-input" @submit.prevent="sendSearch">
		<AppJolticon icon="filter" />

		<transition>
			<a v-if="query" class="anim-fade-enter anim-fade-leave" @click="clear">
				<AppJolticon icon="remove" />
			</a>
		</transition>

		<input
			ref="input"
			v-model="query"
			type="search"
			class="form-control"
			:placeholder="$gettext('Filter results...')"
			@blur="sendSearch"
			@keydown.esc.stop.prevent="blur"
		/>
	</form>
</template>

<style lang="stylus" scoped>
.game-filtering-input
	position: relative

	> input
		padding-left: 32px
		padding-right: 32px

	> .jolticon
		theme-prop('color', 'lighter')
		position: absolute
		top: 9px
		left: 9px

	> a
		theme-prop('color', 'lighter')
		position: absolute
		top: 6px
		right: 7px

		&:hover
			color: $black
</style>
