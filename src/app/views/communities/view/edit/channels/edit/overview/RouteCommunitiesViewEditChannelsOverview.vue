<script lang="ts">
import { computed, toRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppButton from '../../../../../../../../_common/button/AppButton.vue';
import {
	$archiveCommunityChannel,
	$unarchiveCommunityChannel,
	CommunityChannelModel,
} from '../../../../../../../../_common/community/channel/channel.model';
import {
	showErrorGrowl,
	showSuccessGrowl,
} from '../../../../../../../../_common/growls/growls.service';
import { showModalConfirm } from '../../../../../../../../_common/modal/confirm/confirm-service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../../_common/route/route-component';
import { Scroll } from '../../../../../../../../_common/scroll/scroll.service';
import { $gettext } from '../../../../../../../../_common/translate/translate.service';
import { arrayRemove } from '../../../../../../../../utils/array';
import FormCommunityChannelDescription from '../../../../../../../components/forms/community/channel/description/FormCommunityChannelDescription.vue';
import FormCommunityChannelEdit from '../../../../../../../components/forms/community/channel/edit/FormCommunityChannelEdit.vue';
import AppCommunitiesViewPageContainer from '../../../../_page-container/page-container.vue';
import { useCommunityRouteStore } from '../../../../view.store';

export default {
	...defineAppRouteOptions({}),
};
</script>

<script lang="ts" setup>
const routeStore = useCommunityRouteStore()!;

const community = toRef(() => routeStore.community);
const channel = toRef(() => routeStore.channel);
const archivedChannels = toRef(() => routeStore.archivedChannels);

const route = useRoute();
const router = useRouter();

const canEditDescription = computed(() => channel.value!.type === 'competition');

const canArchive = computed(
	() =>
		!channel.value!.is_archived &&
		channel.value!.visibility === 'published' &&
		community.value.canRemoveChannel
);

const shouldShowArchiveOptions = computed(
	() =>
		channel.value!.visibility === 'published' && community.value.hasPerms('community-channels')
);

function onSubmit(model: CommunityChannelModel) {
	// After submitting the form, redirect to the edit page with the new title if it changed.
	// The title of the channel is part of the URL.
	if (model.title !== route.params.channel) {
		router.push({ params: { channel: model.title } });
	}
}

function onBackgroundChange(model: CommunityChannelModel) {
	Object.assign(channel!, model);
}

async function onClickArchive() {
	if (!canArchive.value) {
		return;
	}

	const result = await showModalConfirm(
		$gettext(`Are you sure you want to archive the channel %{ channel }?`, {
			channel: channel.value!.displayTitle,
		})
	);

	if (result) {
		const payload = await $archiveCommunityChannel(channel.value!);

		if (payload.success) {
			archivedChannels.value.push(channel.value!);
			arrayRemove(community.value.channels!, i => i.id === channel.value!.id);
			community.value.has_archived_channels = true;

			showSuccessGrowl($gettext(`Channel is now archived.`));
			Scroll.to(0);
		}
	}
}

async function onClickUnarchive() {
	const result = await showModalConfirm(
		$gettext(`Are you sure you want to restore the channel %{ channel } from the archive?`, {
			channel: channel.value!.displayTitle,
		})
	);

	if (result) {
		try {
			await $unarchiveCommunityChannel(channel.value!);
			community.value.channels!.push(channel.value!);
			arrayRemove(archivedChannels.value, i => i.id === channel.value!.id);

			if (archivedChannels.value.length === 0) {
				community.value.has_archived_channels = false;
			}

			showSuccessGrowl($gettext(`Channel was restored from the archive.`));
			Scroll.to(0);
		} catch (payload: any) {
			if (payload.errors) {
				if (payload.errors['too_many_channels']) {
					showErrorGrowl(
						$gettext(
							`There are too many public channels in this community. Remove or archive another channel before restoring this one.`
						)
					);
				}
			}
		}
	}
}

createAppRoute({});
</script>

<template>
	<AppCommunitiesViewPageContainer full>
		<div class="row">
			<div class="col-md-8">
				<h2 class="section-header">
					{{ $gettext(`Details`) }}
				</h2>

				<FormCommunityChannelEdit
					:community="community"
					:model="channel"
					@submit="onSubmit"
					@background-change="onBackgroundChange"
				/>

				<template v-if="canEditDescription">
					<h2>
						{{ $gettext(`Edit Description`) }}
					</h2>
					<FormCommunityChannelDescription :model="channel!" />
				</template>
			</div>
		</div>
		<template v-if="shouldShowArchiveOptions">
			<section class="section">
				<div class="row">
					<div class="col-md-8">
						<div class="well fill-offset">
							<template v-if="!channel!.is_archived">
								<h4 class="section-header">
									{{ $gettext(`Archive Channel`) }}
								</h4>

								<div class="page-help">
									<p>
										{{
											$gettext(
												`Archiving a channel will hide it from the community's channel list and sets it to read-only for all users. Any existing posts in the channel will remain there, and the channel can still be viewed.`
											)
										}}
									</p>
								</div>

								<AppButton :disabled="!canArchive" @click="onClickArchive">
									{{ $gettext(`Archive Channel`) }}
								</AppButton>

								<p v-if="!canArchive" class="help-block sans-margin-bottom">
									{{ $gettext(`The last public channel cannot be archived.`) }}
								</p>
							</template>

							<template v-else>
								<h4 class="sans-margin-top">
									{{ $gettext(`Restore Channel`) }}
								</h4>

								<div class="page-help">
									<p>
										{{
											$gettext(
												`Restoring a channel will remove it from the archive and make it publicly visible again.`
											)
										}}
									</p>
								</div>

								<AppButton @click="onClickUnarchive">
									{{ $gettext(`Restore Channel`) }}
								</AppButton>
							</template>
						</div>
					</div>
				</div>
			</section>
		</template>
	</AppCommunitiesViewPageContainer>
</template>
