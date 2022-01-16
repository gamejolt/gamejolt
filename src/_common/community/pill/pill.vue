<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { FiresidePostCommunity } from '../../fireside/post/community/community.model';
import AppPillBi from '../../pill/bi/bi.vue';
import AppPill from '../../pill/pill.vue';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import AppCommunityThumbnailImg from '../thumbnail/img/img.vue';
import AppCommunityVerifiedTick from '../verified-tick/verified-tick.vue';

@Options({
	components: {
		AppPill,
		AppPillBi,
		AppCommunityThumbnailImg,
		AppCommunityVerifiedTick,
	},
	directives: {
		AppTooltip,
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
	<app-pill v-if="!channel" :to="toCommunity">
		<template #img>
			<app-community-thumbnail-img :community="community" />
		</template>

		<template #default>
			{{ community.name }}
			<app-community-verified-tick class="-tick" :community="community" small />
		</template>
	</app-pill>
	<app-pill-bi v-else :left-to="toCommunity" :right-to="toChannel">
		<template #img>
			<app-community-thumbnail-img :community="community" />
		</template>

		<template #left>
			{{ community.name }}
			<app-community-verified-tick class="-tick" :community="community" small />
		</template>

		<template #right>
			<app-jolticon
				v-if="channel.type === 'competition'"
				v-app-tooltip="$gettext(`Jam`)"
				icon="jams"
				class="-jams-icon"
			/>

			{{ channel.displayTitle }}

			<app-jolticon
				v-if="communityLink.isFeatured"
				v-app-tooltip="$gettext(`Featured`)"
				class="-featured-icon"
				icon="star"
			/>
		</template>
	</app-pill-bi>
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
