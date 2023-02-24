<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppFiresideAvatar from '../../../components/fireside/avatar/AppFiresideAvatar.vue';
import AppFiresideAvatarAdd from '../../../components/fireside/avatar/AppFiresideAvatarAdd.vue';
import AppFiresideAvatarBase from '../../../components/fireside/avatar/AppFiresideAvatarBase.vue';
import AppFiresideBadge from '../../../components/fireside/badge/badge.vue';

const props = defineProps({
	firesides: {
		type: Array as PropType<Fireside[]>,
		required: true,
	},
	isLoading: {
		type: Boolean,
		required: true,
	},
	featuredFireside: {
		type: Object as PropType<Fireside>,
		default: null,
	},
	userFireside: {
		type: Object as PropType<Fireside>,
		default: null,
	},
	showPlaceholders: {
		type: Boolean,
	},
});

const emit = defineEmits({
	'request-refresh': () => true,
});

const displayFiresides = computed(() => {
	const list = [...props.firesides];
	if (props.userFireside) {
		list.unshift(props.userFireside);
	}

	return shouldDisplaySingleRow.value ? list.slice(0, gridColumns.value) : list;
});

const shouldDisplaySingleRow = computed(() => Screen.isMobile);
const gridColumns = computed(() => (Screen.isXs ? 4 : Screen.isSm ? 5 : 3));

const gridStyling = computed(() => ({
	display: 'grid',
	gridTemplateColumns: `repeat(${gridColumns.value}, 1fr)`,
	gridGap: '24px',
}));

function onFiresideExpired() {
	// When a fireside expired while showing it here, refresh the list. It will
	// be excluded from the next fetch.
	//
	// TODO: Do this in a more efficient way. Can't be sending automatic polling
	// requests when we're having firesides that are persistent.
	// emit('request-refresh');
}
</script>

<template>
	<AppLoadingFade :is-loading="isLoading">
		<div class="-header">
			<h4 class="section-header" :class="{ h6: Screen.isXs }">
				<AppTranslate>Firesides</AppTranslate>
			</h4>
			<span class="help-inline">
				<a class="link-unstyled" @click="emit('request-refresh')">
					<AppTranslate>Refresh</AppTranslate>
				</a>
			</span>
		</div>

		<p class="hidden-xs page-help">
			<AppTranslate>Livestream and voice chat with your friends in firesides!</AppTranslate>
		</p>

		<template v-if="featuredFireside && Screen.isDesktop">
			<AppFiresideBadge :fireside="featuredFireside" show-preview />
		</template>

		<div class="-list">
			<component
				:is="shouldDisplaySingleRow ? AppScrollScroller : 'div'"
				:class="{ '-scroller': shouldDisplaySingleRow }"
				horizontal
			>
				<div :class="{ '-scroller-inner': shouldDisplaySingleRow }">
					<div v-if="showPlaceholders" key="placeholders" :style="gridStyling">
						<AppFiresideAvatarBase v-for="i of gridColumns" :key="i" is-placeholder />
					</div>
					<div v-else key="list" :style="gridStyling">
						<AppFiresideAvatarAdd v-if="!userFireside" key="add" />
						<AppFiresideAvatar
							v-for="fireside of displayFiresides"
							:key="fireside.id"
							:fireside="fireside"
							@expired="onFiresideExpired()"
						/>
					</div>
				</div>
			</component>
		</div>
	</AppLoadingFade>
</template>

<style lang="stylus" scoped>
.-header
	display: flex
	justify-content: space-between
	align-items: center
	margin-bottom: ($line-height-computed / 2)

	h4
		margin-bottom: 0

.-scroller
	@media $media-xs
		full-bleed-xs()

		.-scroller-inner
			padding: 0 ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		full-bleed()

		.-scroller-inner
			padding: 0 ($grid-gutter-width / 2)

.-scroller-inner
	display: inline-block
	width: 100%

.-list
	margin-bottom: $line-height-computed
</style>
