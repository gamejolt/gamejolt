<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { Community } from '../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import Onboarding from '../../../../_common/onboarding/onboarding.service';
import { useAppStore } from '../../../store';
import { useGridStore } from '../../grid/grid-store';

const props = defineProps({
	community: {
		type: Object as PropType<Community>,
		required: true,
	},
});

const { community } = toRefs(props);
const { joinCommunity, leaveCommunity } = useAppStore();
const { grid } = useGridStore();

const highlight = computed(() => {
	const highlight = community.value.theme && community.value.theme.highlight_;
	if (highlight) {
		return '#' + highlight;
	}
	return undefined;
});

const highlightFg = computed(() => {
	const highlightFg = community.value.theme && community.value.theme.highlightFg_;
	if (highlightFg) {
		return '#' + highlightFg;
	}
	return undefined;
});

async function toggleJoin() {
	Onboarding.trackEvent(
		community.value.is_member ? 'community-leave' : 'community-join',
		`${community.value.id}-${community.value.path}`
	);

	if (!community.value.is_member) {
		joinCommunity(community.value, { grid: grid.value, location: 'onboarding' });
	} else {
		leaveCommunity(community.value, {
			grid: grid.value,
			location: 'onboarding',
			shouldConfirm: false,
		});
	}
}
</script>

<template>
	<div class="-item">
		<div class="-pressy">
			<div
				class="-wrapper"
				:style="{
					'border-color': community.is_member ? highlight : '',
				}"
			>
				<AppCommunityThumbnailImg class="-img" :community="community" @click="toggleJoin" />

				<div
					v-if="community.is_member"
					class="-followed"
					:style="{
						'background-color': highlight,
					}"
				>
					<AppJolticon
						class="-followed-icon"
						icon="check"
						:style="{ color: highlightFg }"
					/>
				</div>
			</div>
		</div>

		<div class="-name text-muted">
			{{ community.name }}
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import './variables'

.-item
	display: inline-block

.-wrapper
	img-circle()
	position: relative
	width: $-community-item-size
	height: $-community-item-size
	border: 3px solid
	theme-prop('border-color', 'gray')

.-pressy
	display: inline-block
	pressy()

	&:hover
		transform: scale(1.05)

.-img
	cursor: pointer

.-followed
	position: absolute
	bottom: 0
	right: 0
	width: $-community-bubble-size
	height: $-community-bubble-size
	border-radius: 50%

.-followed-icon
	position: absolute
	top: 2px
	left: -1px
	margin: 0
	width: 100%
	text-align: center
	font-size: 20px
	color: $white

.-name
	text-overflow()
	font-size: $font-size-small
	text-align: center
</style>
