<script lang="ts" setup>
import { $gettext } from '../../../../../../_common/translate/translate.service';
import AppCommunityPerms from '../../../../../components/community/perms/AppCommunityPerms.vue';
import { useCommunityRouteStore } from '../../view.store';

const emit = defineEmits({
	changeSection: (_path: string) => true,
});

const { community } = useCommunityRouteStore()!;

function onChangeSection(path: string) {
	emit('changeSection', path);
}
</script>

<template>
	<nav class="platform-list">
		<ul>
			<li @click.capture="onChangeSection('communities.view.edit.details')">
				<RouterLink
					:to="{
						name: 'communities.view.edit.details',
						params: {
							id: community!.id,
						},
					}"
					exact-active-class="active"
				>
					{{ $gettext(`Details`) }}
				</RouterLink>
			</li>
			<AppCommunityPerms
				:community="community!"
				required="community-channels,community-competitions"
				either
			>
				<li @click.capture="onChangeSection('communities.view.edit.channels.list')">
					<RouterLink
						:to="{
							name: 'communities.view.edit.channels.list',
							params: {
								id: community!.id,
							},
						}"
						active-class="active"
					>
						{{ $gettext(`Channels`) }}
					</RouterLink>
				</li>
			</AppCommunityPerms>
			<AppCommunityPerms :community="community!" required="community-games">
				<li @click.capture="onChangeSection('communities.view.edit.games')">
					<RouterLink
						:to="{
							name: 'communities.view.edit.games',
							params: {
								id: community!.id,
							},
						}"
						active-class="active"
					>
						{{ $gettext(`Games`) }}
					</RouterLink>
				</li>
			</AppCommunityPerms>
			<AppCommunityPerms :community="community!" required="community-moderators">
				<li @click.capture="onChangeSection('communities.view.edit.moderators')">
					<RouterLink
						:to="{
							name: 'communities.view.edit.moderators',
							params: {
								id: community!.id,
							},
						}"
						active-class="active"
					>
						{{ $gettext(`Collaborators`) }}
					</RouterLink>
				</li>
			</AppCommunityPerms>
			<AppCommunityPerms :community="community!" required="community-blocks">
				<li @click.capture="onChangeSection('communities.view.edit.blocks')">
					<RouterLink
						:to="{
							name: 'communities.view.edit.blocks',
							params: {
								id: community!.id,
							},
						}"
						active-class="active"
					>
						{{ $gettext(`Blocked Users`) }}
					</RouterLink>
				</li>
			</AppCommunityPerms>
			<AppCommunityPerms :community="community!" required="community-activity">
				<li @click.capture="onChangeSection('communities.view.edit.activity')">
					<RouterLink
						:to="{
							name: 'communities.view.edit.activity',
							params: {
								id: community!.id,
							},
						}"
						active-class="active"
					>
						{{ $gettext(`Audit Log`) }}
					</RouterLink>
				</li>
			</AppCommunityPerms>
		</ul>
	</nav>
</template>

<style lang="stylus" scoped>
.platform-list
	margin-left: 12px
</style>
