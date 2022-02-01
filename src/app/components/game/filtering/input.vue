<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Analytics } from '../../../../_common/analytics/analytics.service';
import { GameFilteringContainer } from './container';

@Options({})
export default class AppGameFilteringInput extends Vue {
	@Prop(Object) filtering!: GameFilteringContainer;

	query = '';

	declare $refs: {
		input: HTMLElement;
	};

	created() {
		this.query = this.filtering.filters.query;
	}

	clear() {
		this.query = '';
		this.filtering.unsetFilter('query');
		this.filtering.onChanged();

		Analytics.trackEvent('game-filtering', 'query-clear');
	}

	sendSearch() {
		this.filtering.setFilter('query', this.query);
		this.filtering.onChanged();

		if (this.query) {
			Analytics.trackEvent('game-filtering', 'query-change', this.query);
		} else {
			Analytics.trackEvent('game-filtering', 'query-change-empty');
		}
	}

	blur() {
		if (this.$refs.input) {
			this.$refs.input.blur();
		}
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
