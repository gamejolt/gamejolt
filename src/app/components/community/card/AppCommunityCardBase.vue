<script lang="ts" setup>
import { computed, toRef } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import AppCommunityJoinWidget from '~app/components/community/AppCommunityJoinWidget.vue';
import { trackGotoCommunity } from '~common/analytics/analytics.service';
import AppButton from '~common/button/AppButton.vue';
import { CommunityModel, isEditingCommunity } from '~common/community/community.model';
import AppCommunityVerifiedTick from '~common/community/verified-tick/AppCommunityVerifiedTick.vue';
import { BaseUrl } from '~common/environment/environment.service';
import { formatNumber } from '~common/filters/number';
import { useCommonStore } from '~common/store/common-store';
import AppTheme from '~common/theme/AppTheme.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	community: CommunityModel;
	overflow?: boolean;
	elevate?: boolean;
	allowEdit?: boolean;
	trackGoto?: boolean;
};
const { community, trackGoto, allowEdit = true } = defineProps<Props>();

const { user } = useCommonStore();
const route = useRoute();

const memberCount = toRef(() => community.member_count || 0);

const isEditing = computed(() => isEditingCommunity(route));

const shouldShowModTools = toRef(() => user.value && user.value.isMod);

function doTrackGotoCommunity() {
	if (trackGoto) {
		trackGotoCommunity({
			source: 'card',
			id: community.id,
			path: community.path,
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
						:to="{
							name: 'communities.view.members',
							params: { path: community.path },
						}"
					>
						<AppTranslate
							:translate-n="memberCount"
							translate-plural="%{count} members"
							:translate-params="{ count: formatNumber(memberCount) }"
						>
							%{count} member
						</AppTranslate>
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
						:href="BaseUrl + `/moderate/communities/view/${community.id}`"
						icon="cog"
						circle
						trans
					/>
				</div>
			</div>
		</div>
	</AppTheme>
</template>

<style lang="stylus" src="~app/components/community/card/card-base.styl" scoped></style>
