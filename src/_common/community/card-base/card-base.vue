<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { trackGotoCommunity } from '../../analytics/analytics.service';
import { Environment } from '../../environment/environment.service';
import { formatNumber } from '../../filters/number';
import { useCommonStore } from '../../store/common-store';
import AppTheme from '../../theme/AppTheme.vue';
import { CommunityModel, isEditingCommunity } from '../community.model';
import AppCommunityJoinWidget from '../join-widget/join-widget.vue';
import AppCommunityVerifiedTick from '../verified-tick/verified-tick.vue';

@Options({
	components: {
		AppTheme,
		AppCommunityVerifiedTick,
		AppCommunityJoinWidget,
	},
})
export default class AppCommunityCardBase extends Vue {
	@Prop({ type: Object, required: true }) community!: CommunityModel;
	@Prop({ type: Boolean, default: false }) overflow!: boolean;
	@Prop({ type: Boolean, default: false }) elevate!: boolean;
	@Prop({ type: Boolean, default: true }) allowEdit!: boolean;
	@Prop({ type: Boolean, default: false }) trackGoto!: boolean;

	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	readonly formatNumber = formatNumber;
	readonly Environment = Environment;

	get memberCount() {
		return this.community.member_count || 0;
	}

	get headerBackgroundImage() {
		return this.community.header
			? `url('${this.community.header.mediaserver_url}')`
			: undefined;
	}

	get isEditing() {
		return isEditingCommunity(this.$route);
	}

	get shouldShowModTools() {
		return this.user && this.user.isMod;
	}

	trackGotoCommunity() {
		if (this.trackGoto) {
			trackGotoCommunity({
				source: 'card',
				id: this.community.id,
				path: this.community.path,
			});
		}
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
					<router-link
						:to="community.routeLocation"
						class="link-unstyled"
						@click="trackGotoCommunity()"
					>
						{{ community.name }}
						<AppCommunityVerifiedTick :community="community" />
					</router-link>
				</div>

				<div class="-member-counts small">
					<router-link
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
					</router-link>
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
							<AppTranslate>Edit Community</AppTranslate>
						</AppButton>
						<AppButton
							v-else
							primary
							block
							:to="community.routeLocation"
							@click="trackGotoCommunity()"
						>
							<AppTranslate>View Community</AppTranslate>
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
