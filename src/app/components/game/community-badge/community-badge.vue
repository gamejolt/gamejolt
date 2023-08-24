<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { CommunityModel } from '../../../../_common/community/community.model';
import { formatNumber } from '../../../../_common/filters/number';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import AppTheme from '../../../../_common/theme/AppTheme.vue';

@Options({
	components: {
		AppTheme,
		AppMediaItemBackdrop,
	},
})
export default class AppGameCommunityBadge extends Vue {
	@Prop(Object)
	community!: CommunityModel;

	readonly formatNumber = formatNumber;
}
</script>

<template>
	<AppTheme :theme="community.theme">
		<router-link
			:to="{
				name: 'communities.view.overview',
				params: { path: community.path },
			}"
		>
			<div class="-community-container fill-darkest">
				<AppMediaItemBackdrop
					v-if="community.header"
					class="-backdrop"
					:media-item="community.header"
					radius="lg"
				>
					<div
						class="-header"
						:style="{
							'background-image': 'url(' + community.header.mediaserver_url + ')',
						}"
					>
						<div class="-header-gradient" />
					</div>
				</AppMediaItemBackdrop>

				<div class="-content">
					<div class="-thumbnail">
						<img :src="community.img_thumbnail" />
					</div>
					<div>
						<div class="tag">
							<AppTranslate>Game Community</AppTranslate>
						</div>
						<div class="-name">
							{{ community.name }}
						</div>
						<div v-if="community.member_count > 0" class="-member-count">
							<AppTranslate
								:translate-n="community.member_count || 0"
								:translate-params="{
									count: formatNumber(community.member_count || 0),
								}"
								translate-plural="%{ count } Members"
							>
								%{ count } Member
							</AppTranslate>
						</div>
					</div>
				</div>
			</div>
		</router-link>
	</AppTheme>
</template>

<style lang="stylus" scoped src="./community-badge.styl"></style>
