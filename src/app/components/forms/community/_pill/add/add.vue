<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../../_common/community/community.model';
import AppPill from '../../../../../../_common/pill/AppPill.vue';
import AppFormsCommunityPillSelector from '../selector/selector.vue';

@Options({
	components: {
		AppFormsCommunityPillSelector,
		AppPill,
	},
})
export default class AppFormsCommunityPillAdd extends Vue {
	@Prop({ type: Array, required: true })
	communities!: Community[];

	@Prop({ type: Boolean, default: true })
	withChannel!: boolean;

	@Emit('add') emitAdd(_community: Community, _channel: CommunityChannel) {}
	@Emit('add-community') emitAddCommunity(_community: Community) {}
}
</script>

<template>
	<AppFormsCommunityPillSelector
		:communities="communities"
		:with-channel="withChannel"
		@select="emitAdd"
		@select-community="emitAddCommunity"
	>
		<AppPill class="-add">
			<template #img>
				<AppJolticon icon="add" />
			</template>
			<AppTranslate>Add Community</AppTranslate>
		</AppPill>
	</AppFormsCommunityPillSelector>
</template>

<style lang="stylus" scoped>
@import '../variables'

.-add
	cursor: pointer
	height: $pill-height
	border: $border-width-base solid var(--theme-bg-subtle)
	transition: border-color 300ms $strong-ease-out

	&:hover
		border-color: var(--theme-link-hover)
</style>
