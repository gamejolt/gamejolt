<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { Analytics } from '../../../../_common/analytics/analytics.service';
import { Community } from '../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import Onboarding from '../../../../_common/onboarding/onboarding.service';
import { useAppStore } from '../../../store';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';

const props = defineProps({
	community: {
		type: Object as PropType<Community>,
		required: true,
	},
});

const { community } = toRefs(props);
const { joinCommunity, leaveCommunity } = useAppStore();

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
	// This matches what's on community join widget. Seems odd but okay.
	Analytics.trackEvent(
		'community-join',
		'onboarding',
		community.value.is_member ? 'leave' : 'join'
	);

	// Onboarding analytics too
	Onboarding.trackEvent(
		community.value.is_member ? 'community-leave' : 'community-join',
		`${community.value.id}-${community.value.path}`
	);

	if (!community.value.is_member) {
		joinCommunity(community.value, 'onboarding');
	} else {
		leaveCommunity(community.value, 'onboarding', {
			shouldConfirm: false,
		});
	}
}
</script>

<template>
	<div class="-item">
		<div class="-pressy">
			<div class="-wrapper">
				<AppCommunityThumbnailImg
					class="-img"
					:style="{
						'border-color': community.is_member ? highlight : '',
					}"
					:community="community"
					@click="toggleJoin"
				/>

				<div
					v-if="community.is_member"
					class="-followed"
					:style="{
						'background-color': highlight,
					}"
				>
					<AppJolticon class="-icon" icon="check" :style="{ color: highlightFg }" />
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
	position: relative
	width: $-community-item-size
	height: $-community-item-size

.-pressy
	display: inline-block

	&:hover
		transform: scale(1.05)

	pressy()

.-img
	img-circle()
	width: 100%
	height: 100%
	border: 3px solid
	cursor: pointer
	theme-prop('border-color', 'gray')

.-followed
	position: absolute
	bottom: 0
	right: 0
	width: $-community-bubble-size
	height: $-community-bubble-size
	border-radius: 50%

	.-icon
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
