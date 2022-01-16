<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/img/img.vue';
import AppCommunityVerifiedTick from '../../../../../_common/community/verified-tick/verified-tick.vue';
import AppPillBi from '../../../../../_common/pill/bi/bi.vue';
import AppPill from '../../../../../_common/pill/pill.vue';

@Options({
	components: {
		AppPill,
		AppPillBi,
		AppCommunityThumbnailImg,
		AppCommunityVerifiedTick,
	},
})
export default class AppFormsCommunityPill extends Vue {
	@Prop({ type: Object, required: true })
	community!: Community;

	@Prop(Object)
	channel?: CommunityChannel;

	@Prop({ type: Boolean, default: true })
	removable!: boolean;

	@Prop({ type: Boolean, default: true })
	withChannel!: boolean;

	@Emit('remove') emitRemove() {}
}
</script>

<template>
	<app-pill v-if="!withChannel">
		<template #img>
			<app-community-thumbnail-img :community="community" />
		</template>
		<template #default>
			{{ community.name }}
			<app-community-verified-tick class="-tick" :community="community" small />

			<a v-if="removable" class="-remove text-muted" @click="emitRemove">
				<app-jolticon icon="remove" />
			</a>
		</template>
	</app-pill>
	<app-pill-bi v-else no-hover>
		<template #img>
			<app-community-thumbnail-img :community="community" />
		</template>

		<template #left>
			{{ community.name }}
			<app-community-verified-tick class="-tick" :community="community" small />
		</template>

		<template #right>
			<span class="-channel">
				{{ channel ? channel.displayTitle : '???' }}

				<a v-if="removable" class="-remove text-muted" @click="emitRemove">
					<app-jolticon icon="remove" />
				</a>
			</span>
		</template>
	</app-pill-bi>
</template>

<style lang="stylus" scoped>
.-remove
	position: relative
	left: 3px

	&:hover
		color: var(--theme-highlight)

	> .jolticon
		vertical-align: middle

.-tick
	margin-left: 5px
</style>
