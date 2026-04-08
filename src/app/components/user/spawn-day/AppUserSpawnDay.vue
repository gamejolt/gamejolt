<script lang="ts" setup>
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import { TranslateDirective as vTranslate } from '../../../../_common/translate/translate-directive';
import { formatDistanceStrict } from 'date-fns';
import { computed, nextTick, onMounted, useTemplateRef } from 'vue';
import AppAlertDismissable from '../../../../_common/alert/dismissable/AppAlertDismissable.vue';
import { ContentDocument } from '../../../../_common/content/content-document';
import { ContentWriter } from '../../../../_common/content/content-writer';
import {
	$createFiresidePost,
	FiresidePostModel,
} from '../../../../_common/fireside/post/post-model';
import { useCommonStore } from '../../../../_common/store/common-store';
import { UserModel } from '../../../../_common/user/user.model';
import { sleep } from '../../../../utils/utils';
import { showCommentModal } from '../../comment/modal/modal.service';
import { showPostEditModal } from '../../post/edit-modal/edit-modal-service';

type Props = {
	user: UserModel;
};

const { user } = defineProps<Props>();

const emit = defineEmits<{
	'post-add': [post: FiresidePostModel];
}>();

const { user: appUser } = useCommonStore();

const containerRef = useTemplateRef('container');

const shouldShowSpawnDay = computed(() => {
	return !!user.is_spawnday;
});

const isOwnSpawnDay = computed(() => {
	return appUser.value && user.id === appUser.value.id;
});

const spawnDayYear = computed(() => {
	if (user) {
		const distance = formatDistanceStrict(user.created_on, Date.now(), {
			unit: 'year',
			roundingMethod: 'round',
		});
		return distance;
	}
	return '';
});

function showComments() {
	if (user) {
		showCommentModal({
			model: user,
			displayMode: 'shouts',
		});
	}
}

async function showNewPost() {
	const postProvider = $createFiresidePost().then(newPost => {
		const spawnDayDoc = new ContentDocument('fireside-post-lead', []);
		const writer = new ContentWriter(spawnDayDoc);
		writer.appendTag('spawnday');

		newPost.lead_content = spawnDayDoc.toJson();
		return newPost;
	});

	const post = await showPostEditModal(postProvider);

	if (!post) {
		return;
	}

	emit('post-add', post);
}

async function drop(elem: HTMLDivElement) {
	await nextTick();
	elem.animate(
		[
			{ top: elem.style.top },
			{ top: '100%' },
		],
		{
			duration: Math.random() * 2000 + 2000,
			iterations: Infinity,
		}
	);
}

onMounted(async () => {
	if (!shouldShowSpawnDay.value) {
		return;
	}
	await nextTick();
	await sleep(1000);
	for (let i = 0; i < 55; i++) {
		const width = Math.random() * 10;
		const height = width * 0.4;
		const elem = document.createElement('div');
		elem.style.width = width + 'px';
		elem.style.height = height + 'px';
		elem.style.top = '-150px';
		elem.style.left = Math.random() * 100 + '%';
		elem.style.opacity = (Math.random() + 0.5).toString();
		elem.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
		elem.style.position = 'relative';
		switch (Math.ceil(Math.random() * 3)) {
			case 1:
				elem.style.backgroundColor = 'gold';
				break;
			case 2:
				elem.style.backgroundColor = 'orangered';
				break;
			case 3:
				elem.style.backgroundColor = 'dodgerblue';
				break;
		}

		containerRef.value?.appendChild(elem);
		drop(elem);
	}
});
</script>

<template>
	<AppAlertDismissable
		v-if="shouldShowSpawnDay"
		alert-type="info"
		:dismiss-key="`user-spawn-day-${user.id}-${spawnDayYear}`"
	>
		<div ref="container" class="-confetti-container" />

		<template v-if="isOwnSpawnDay">
			<h4>
				<span v-translate="{ username: user.display_name }">
					&nbsp;&nbsp; 🥳 &nbsp;&nbsp; You are celebrating your Spawn Day today!
				</span>
			</h4>

			<p v-translate="{ years: spawnDayYear }">
				That means on this day, you have been on Game Jolt for %{ years }!
			</p>
			<p>
				<AppTranslate>Tell your followers, let the world know!</AppTranslate>
			</p>
			<AppButton @click="showNewPost">
				<AppTranslate>Celebrate</AppTranslate>
			</AppButton>
		</template>
		<template v-else>
			<h4>
				<span v-translate="{ username: user.display_name }">
					&nbsp;&nbsp; 🥳 &nbsp;&nbsp; %{ username } is celebrating their Spawn Day!
				</span>
			</h4>

			<p v-translate="{ years: spawnDayYear }">
				That means on this day, they have been on Game Jolt for %{ years }!
			</p>
			<template v-if="user.shouts_enabled">
				<p>
					<AppTranslate>
						It is customary to wish them a happy Spawn Day, so you should too.
					</AppTranslate>
				</p>
				<AppButton @click="showComments">
					<AppTranslate>Send your wishes</AppTranslate>
				</AppButton>
			</template>
		</template>
	</AppAlertDismissable>
</template>

<style lang="stylus" scoped>
.-confetti-container
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 0
	overflow: hidden
	pointer-events: none
	*
		pointer-events: none
</style>
