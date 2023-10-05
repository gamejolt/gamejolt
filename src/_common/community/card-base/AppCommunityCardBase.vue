<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { trackGotoCommunity } from '../../analytics/analytics.service';
import { vAppTrackEvent } from '../../analytics/track-event.directive';
import AppButton from '../../button/AppButton.vue';
import { Environment } from '../../environment/environment.service';
import { formatNumber } from '../../filters/number';
import { useCommonStore } from '../../store/common-store';
import AppTheme from '../../theme/AppTheme.vue';
import { $gettext } from '../../translate/translate.service';
import { CommunityModel, isEditingCommunity } from '../community.model';
import AppCommunityJoinWidget from '../join-widget/AppCommunityJoinWidget.vue';
import AppCommunityVerifiedTick from '../verified-tick/AppCommunityVerifiedTick.vue';

const props = defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
	overflow: {
		type: Boolean,
	},
	elevate: {
		type: Boolean,
	},
	allowEdit: {
		type: Boolean,
		default: true,
	},
	trackGoto: {
		type: Boolean,
	},
});

const { user } = useCommonStore();
const route = useRoute();

const { community, trackGoto } = toRefs(props);

const memberCount = computed(() => community.value.member_count || 0);

const headerBackgroundImage = computed(() =>
	community.value.header ? `url('${community.value.header.mediaserver_url}')` : undefined
);

const isEditing = computed(() => isEditingCommunity(route));

const shouldShowModTools = computed(() => user.value && user.value.isMod);

function doTrackGotoCommunity() {
	if (trackGoto.value) {
		trackGotoCommunity({
			source: 'card',
			id: community.value.id,
			path: community.value.path,
		});
	}
}
</script>

<template>
	<AppTheme
		class="community-card sheet sheet-full sheet-no-full-bleed"
		:class="{ 'sheet-elevate': elevate }"
		:theme="community.theme"
	>
		<div class="-info">
			<div
				class="-header"
				:style="{
					'background-image': headerBackgroundImage,
				}"
			/>

			<div class="-thumbnail">
				<slot name="thumbnail" />
			</div>

			<div class="-well fill-bg">
				<div class="-name" :class="{ '-overflow': overflow }">
					<RouterLink
						:to="community.routeLocation"
						class="link-unstyled"
						@click="doTrackGotoCommunity"
					>
						{{ community.name }}
						<AppCommunityVerifiedTick :community="community" />
					</RouterLink>
				</div>

				<div class="-member-counts small">
					<RouterLink
						v-app-track-event="`community-card:community-members`"
						v-translate="{ count: formatNumber(memberCount) }"
						:translate-n="memberCount"
						translate-plural="<b>%{count}</b> members"
						:to="{
							name: 'communities.view.members',
							params: { path: community.path },
						}"
					>
						<b>1</b>
						member
					</RouterLink>
				</div>

				<div class="-controls">
					<template v-if="community.hasPerms() && allowEdit">
						<AppButton
							v-if="!isEditing"
							v-app-track-event="`community-card-inline:community-edit`"
							primary
							block
							:to="community.routeEditLocation"
						>
							{{ $gettext(`Edit Community`) }}
						</AppButton>
						<AppButton
							v-else
							primary
							block
							:to="community.routeLocation"
							@click="doTrackGotoCommunity"
						>
							{{ $gettext(`View Community`) }}
						</AppButton>
					</template>
					<AppCommunityJoinWidget
						v-else
						:community="community"
						:disabled="!!community.user_block"
						block
						hide-count
						location="card"
					/>
					<AppButton
						v-if="shouldShowModTools"
						class="-moderate"
						:href="Environment.baseUrl + `/moderate/communities/view/${community.id}`"
						icon="cog"
						circle
						trans
					/>
				</div>
			</div>
		</div>
	</AppTheme>
</template>

<style lang="stylus" src="./card-base.styl" scoped></style>
