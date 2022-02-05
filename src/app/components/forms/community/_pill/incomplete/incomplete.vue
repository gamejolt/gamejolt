<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import AppCommunityVerifiedTick from '../../../../../../_common/community/verified-tick/verified-tick.vue';
import AppPillBi from '../../../../../../_common/pill/AppPillBi.vue';
import AppFormsCommunityPillSelector from '../selector/selector.vue';

@Options({
	components: {
		AppFormsCommunityPillSelector,
		AppCommunityThumbnailImg,
		AppCommunityVerifiedTick,
		AppPillBi,
	},
})
export default class AppFormsCommunityPillIncomplete extends Vue {
	@Prop({ type: Array, required: true })
	communities!: Community[];

	@Prop({ type: Object, required: true })
	community!: Community;

	@Emit('add') emitAdd(_community: Community, _channel: CommunityChannel) {}
}
</script>

<template>
	<AppFormsCommunityPillSelector
		:communities="communities"
		:initial-community="community"
		@select="emitAdd"
	>
		<AppPillBi class="-pill" no-hover>
			<template #img>
				<AppCommunityThumbnailImg :community="community" />
			</template>

			<template #left>
				{{ community.name }}
				<AppCommunityVerifiedTick class="-tick" :community="community" small />
			</template>

			<template #right>
				<span class="-channel">
					<AppTranslate>Select Channel</AppTranslate>
				</span>
			</template>
		</AppPillBi>
	</AppFormsCommunityPillSelector>
</template>

<style lang="stylus" scoped>
@import '../variables'

.-pill
	height: $pill-height
	border-color: var(--theme-notice)
	cursor: pointer
	transition: border-color 300ms $strong-ease-out

	.-channel
		color: var(--theme-notice)
		transition: color 300ms $strong-ease-out
		font-weight: bold

	&:hover
		border-color: var(--theme-link-hover)

		.-channel
			color: var(--theme-link-hover)

.-tick
	margin-left: 5px
</style>
