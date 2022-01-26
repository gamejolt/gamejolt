<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Analytics } from '../../../../../../_common/analytics/analytics.service';
import { Community } from '../../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../../_common/community/thumbnail/img/img.vue';
import Onboarding from '../../../../../../_common/onboarding/onboarding.service';
import { useAppStore } from '../../../../../store';

@Options({
	components: {
		AppCommunityThumbnailImg,
	},
})
export default class AppOnboardingFollowsCommunityItem extends Vue {
	@Prop({ type: Object, required: true })
	community!: Community;

	store = setup(() => useAppStore());

	get highlight() {
		const highlight = this.community.theme && this.community.theme.highlight_;
		if (highlight) {
			return '#' + highlight;
		}
		return null;
	}

	get highlightFg() {
		const highlightFg = this.community.theme && this.community.theme.highlightFg_;
		if (highlightFg) {
			return '#' + highlightFg;
		}
		return null;
	}

	async toggleJoin() {
		// This matches what's on community join widget. Seems odd but okay.
		Analytics.trackEvent(
			'community-join',
			'onboarding',
			this.community.is_member ? 'leave' : 'join'
		);

		// Onboarding analytics too
		Onboarding.trackEvent(
			this.community.is_member ? 'community-leave' : 'community-join',
			`${this.community.id}-${this.community.path}`
		);

		if (!this.community.is_member) {
			this.store.joinCommunity(this.community, 'onboarding');
		} else {
			this.store.leaveCommunity(this.community, 'onboarding', {
				shouldConfirm: false,
			});
		}
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
@import '../variables'

.-item
	display: inline-block

.-wrapper
	position: relative
	width: $-item-size
	height: $-item-size

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
	width: $-bubble-size
	height: $-bubble-size
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
