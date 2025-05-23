<script lang="ts" setup>
import { computed, PropType, toRef, toRefs } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { trackGotoCommunity } from '../../analytics/analytics.service';
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

const { community, trackGoto } = toRefs(props);
const { user } = useCommonStore();
const route = useRoute();

const memberCount = toRef(() => community.value.member_count || 0);

const isEditing = computed(() => isEditingCommunity(route));

const shouldShowModTools = toRef(() => user.value && user.value.isMod);

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
					backgroundImage: community.header
						? `url('${community.header.mediaserver_url}')`
						: undefined,
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
