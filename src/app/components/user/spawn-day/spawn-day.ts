import * as distanceStrict from 'date-fns/distance_in_words_strict';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { sleep } from '../../../../utils/utils';
import AppAlertDismissable from '../../../../_common/alert/dismissable/dismissable.vue';
import { CommentModal } from '../../../../_common/comment/modal/modal.service';
import { User } from '../../../../_common/user/user.model';

@Component({
	components: {
		AppAlertDismissable,
	},
})
export default class AppUserSpawnDay extends Vue {
	@Prop(User)
	user!: User;

	$refs!: {
		container: HTMLElement;
	};

	get shouldShowSpawnDay() {
		if (this.user) {
			// Don't show for new users or users from the future
			if (Date.now() - this.user.created_on < 30 * 60 * 60 * 1000) {
				return false;
			}

			const createdDate = new Date(this.user.created_on);
			const createdDayOfMonth = createdDate.getUTCDate();
			const createdMonth = createdDate.getUTCMonth();

			const nowDate = new Date();
			const nowDayOfMonth = nowDate.getUTCDate();
			const nowMonth = nowDate.getUTCMonth();

			return createdDayOfMonth === nowDayOfMonth && createdMonth === nowMonth;
		}
		return false;
	}

	get spawnDayYear() {
		if (this.user) {
			const distance = distanceStrict(this.user.created_on, Date.now(), {
				unit: 'Y',
				partialMethod: 'ceil',
			});
			return distance;
		}
		return '';
	}

	showComments() {
		if (this.user) {
			CommentModal.show({
				resource: 'User',
				resourceId: this.user.id,
				displayMode: 'shouts',
			});
		}
	}

	async mounted() {
		if (!this.shouldShowSpawnDay) {
			return;
		}
		await this.$nextTick();
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
		await this.$nextTick();
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
