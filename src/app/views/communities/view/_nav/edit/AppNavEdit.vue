<script lang="ts" setup>
import { toRef } from 'vue';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { AppCommunityPerms } from '../../../../../components/community/perms/AppCommunityPerms';
import { useCommunityRouteStore } from '../../view.store';

const emit = defineEmits({
	'change-section': (_path: string) => true,
});

const routeStore = useCommunityRouteStore()!;

const community = toRef(() => routeStore.community);

function onChangeSection(path: string) {
	emit('change-section', path);
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
							id: community.id,
						},
					}"
					exact-active-class="active"
				>
					{{ $gettext(`Details`) }}
				</RouterLink>
			</li>
			<AppCommunityPerms
				tag="li"
				:community="community"
				required="community-channels,community-competitions"
				either
				@click.capture="onChangeSection('communities.view.edit.channels.list')"
			>
				<RouterLink
					:to="{
						name: 'communities.view.edit.channels.list',
						params: {
							id: community.id,
						},
					}"
					active-class="active"
				>
					{{ $gettext(`Channels`) }}
				</RouterLink>
			</AppCommunityPerms>
			<AppCommunityPerms
				tag="li"
				:community="community"
				required="community-games"
				@click.capture="onChangeSection('communities.view.edit.games')"
			>
				<RouterLink
					:to="{
						name: 'communities.view.edit.games',
						params: {
							id: community.id,
						},
					}"
					active-class="active"
				>
					{{ $gettext(`Games`) }}
				</RouterLink>
			</AppCommunityPerms>
			<AppCommunityPerms
				tag="li"
				:community="community"
				required="community-moderators"
				@click.capture="onChangeSection('communities.view.edit.moderators')"
			>
				<RouterLink
					:to="{
						name: 'communities.view.edit.moderators',
						params: {
							id: community.id,
						},
					}"
					active-class="active"
				>
					{{ $gettext(`Collaborators`) }}
				</RouterLink>
			</AppCommunityPerms>
			<AppCommunityPerms
				tag="li"
				:community="community"
				required="community-blocks"
				@click.capture="onChangeSection('communities.view.edit.blocks')"
			>
				<RouterLink
					:to="{
						name: 'communities.view.edit.blocks',
						params: {
							id: community.id,
						},
					}"
					active-class="active"
				>
					{{ $gettext(`Blocked Users`) }}
				</RouterLink>
			</AppCommunityPerms>
			<AppCommunityPerms tag="li" :community="community" required="community-activity">
				<RouterLink
					:to="{
						name: 'communities.view.edit.activity',
						params: {
							id: community.id,
						},
					}"
					active-class="active"
					@click.capture="onChangeSection('communities.view.edit.blocks')"
				>
					{{ $gettext(`Audit Log`) }}
				</RouterLink>
			</AppCommunityPerms>
		</ul>
	</nav>
</template>

<style lang="stylus" scoped>
.platform-list
	margin-left: 12px
</style>
