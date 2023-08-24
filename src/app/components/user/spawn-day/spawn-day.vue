<script lang="ts">
import { formatDistanceStrict } from 'date-fns';
import { nextTick } from 'vue';
import { setup } from 'vue-class-component';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppAlertDismissable from '../../../../_common/alert/dismissable/dismissable.vue';
import { ContentDocument } from '../../../../_common/content/content-document';
import { ContentWriter } from '../../../../_common/content/content-writer';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { useCommonStore } from '../../../../_common/store/common-store';
import { User } from '../../../../_common/user/user.model';
import { sleep } from '../../../../utils/utils';
import { CommentModal } from '../../comment/modal/modal.service';
import { PostEditModal } from '../../post/edit-modal/edit-modal-service';

@Options({
	components: {
		AppAlertDismissable,
	},
})
export default class AppUserSpawnDay extends Vue {
	@Prop(Object)
	user!: User;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	declare $refs: {
		container: HTMLElement;
	};

	@Emit('post-add')
	emitPostAdd(_post: FiresidePost) {}

	get shouldShowSpawnDay() {
		return !!this.user.is_spawnday;
	}

	get isOwnSpawnDay() {
		return this.app.user && this.user.id === this.app.user.id;
	}

	get spawnDayYear() {
		if (this.user) {
			const distance = formatDistanceStrict(this.user.created_on, Date.now(), {
				unit: 'year',
				roundingMethod: 'round',
			});
			return distance;
		}
		return '';
	}

	showComments() {
		if (this.user) {
			CommentModal.show({
				model: this.user,
				displayMode: 'shouts',
			});
		}
	}

	async showNewPost() {
		const postProvider = FiresidePost.$create().then(newPost => {
			// Create a doc and append the "#spawnday" tag.
			const spawnDayDoc = new ContentDocument('fireside-post-lead', []);
			const writer = new ContentWriter(spawnDayDoc);
			writer.appendTag('spawnday');

			newPost.lead_content = spawnDayDoc.toJson();
			return newPost;
		});

		const post = await PostEditModal.show(postProvider);

		if (!post) {
			return;
		}

		this.emitPostAdd(post);
	}

	async mounted() {
		if (!this.shouldShowSpawnDay) {
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

			this.$refs.container.appendChild(elem);
			this.drop(elem);
		}
	}

	reset(elem: HTMLDivElement) {
		const width = Math.random() * 10;
		const height = width * 0.4;
		elem.style.width = width + 'px';
		elem.style.height = height + 'px';
		elem.style.top = '-150px';
		elem.style.left = Math.random() * 100 + '%';
		elem.style.opacity = (Math.random() + 0.5).toString();
		this.drop(elem);
	}

	async drop(elem: HTMLDivElement) {
		await nextTick();
		elem.animate(
			[
				// Keyframes, TS doesn't like this for some reason, but it works
				{ top: elem.style.top },
				{ top: '100%' },
			],
			{
				duration: Math.random() * 2000 + 2000,
				iterations: 1000,
			}
		);
	}
}
</script>

<template>
	<AppAlertDismissable
		v-if="shouldShowSpawnDay"
		alert-type="info"
		:dismiss-key="`user-spawn-day-${user.id}-${spawnDayYear}`"
	>
		<div ref="container" class="-confetti-container"></div>

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
