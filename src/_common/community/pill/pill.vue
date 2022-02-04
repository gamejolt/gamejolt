<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { FiresidePostCommunity } from '../../fireside/post/community/community.model';
import AppPill from '../../pill/AppPill.vue';
import AppPillBi from '../../pill/AppPillBi.vue';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import AppCommunityThumbnailImg from '../thumbnail/AppCommunityThumbnailImg.vue';
import AppCommunityVerifiedTick from '../verified-tick/verified-tick.vue';

@Options({
	components: {
		AppPill,
		AppPillBi,
		AppCommunityThumbnailImg,
		AppCommunityVerifiedTick,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppCommunityPill extends Vue {
	@Prop({ type: Object, required: true })
	communityLink!: FiresidePostCommunity;

	@Prop({ type: Boolean, required: false, default: false })
	noLinks!: boolean;

	get community() {
		return this.communityLink.community;
	}

	get channel() {
		return this.communityLink.channel;
	}

	get toCommunity() {
		if (this.noLinks) {
			return undefined;
		}
		return this.community.routeLocation;
	}

	get toChannel() {
		if (this.noLinks || !this.channel) {
			return undefined;
		}
		return this.community.channelRouteLocation(this.channel);
	}
}
</script>

<template>
	<AppPill v-if="!channel" :to="toCommunity">
		<template #img>
			<AppCommunityThumbnailImg :community="community" />
		</template>

		<template #default>
			{{ community.name }}
			<AppCommunityVerifiedTick class="-tick" :community="community" small />
		</template>
	</AppPill>
	<AppPillBi v-else :left-to="toCommunity" :right-to="toChannel">
		<template #img>
			<AppCommunityThumbnailImg :community="community" />
		</template>

		<template #left>
			{{ community.name }}
			<AppCommunityVerifiedTick class="-tick" :community="community" small />
		</template>

		<template #right>
			<AppJolticon
				v-if="channel.type === 'competition'"
				v-app-tooltip="$gettext(`Jam`)"
				icon="jams"
				class="-jams-icon"
			/>

			{{ channel.displayTitle }}

			<AppJolticon
				v-if="communityLink.isFeatured"
				v-app-tooltip="$gettext(`Featured`)"
				class="-featured-icon"
				icon="star"
			/>
		</template>
	</AppPillBi>
</template>

<style lang="stylus" scoped>
.-tick
	margin-left: 5px

.-featured-icon
	margin: 0 0 0 5px
	font-size: 12px

.-jams-icon
	margin-right: 2px
	margin-bottom: 2px
</style>
