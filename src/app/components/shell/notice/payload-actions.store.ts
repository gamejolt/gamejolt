import { inject, InjectionKey, ref, shallowReadonly } from 'vue';

import { CreatorExperienceModel } from '~common/creator/experience/experience.model';
import { UnknownModelData } from '~common/model/model.service';
import { storeModel } from '~common/model/model-store.service';
import { Payload } from '~common/payload/payload-service';
import { showStickerPackOpenModal } from '~common/sticker/pack/open-modal/modal.service';
import { UserStickerPackModel } from '~common/sticker/pack/user-pack.model';
import { StickerModel } from '~common/sticker/sticker.model';
import { arrayRemove } from '~utils/array';
import { clampNumber } from '~utils/number';

interface ShellNoticeItem {
	id: number;
	// NOTE: If adding new types, make sure they each have a unique [type]. That
	// should be enough to allow us to check [type] for different [data] types.
	data: CustomMessageNotice | CreatorExperienceNotice | StickerMasteryNotice;
}

interface CustomMessageNotice {
	type: 'custom-message';
	message: string;
	autoCloseMs?: number;
}

export interface CreatorExperienceNotice {
	type: 'creator-experience';
	experience: CreatorExperienceModel;
	leveledUp: boolean;
	xpGained: number;
}

export interface StickerMasteryNotice {
	type: 'sticker-mastery';
	sticker: StickerModel;
	progress: number;
	max: number;
}

interface PayloadData {
	actions?: (PackAction | CreatorExperienceAction | StickerMasteryProgressAction)[];
}

interface PackAction {
	type: 'unlock-sticker-pack';
	data: {
		user_sticker_pack: UnknownModelData;
	};
}

interface CreatorExperienceAction {
	type: 'gain-creator-experience';
	data: {
		experience: number;
		leveled_up: boolean;
		xp_gained: number;
	};
}

interface StickerMasteryProgressAction {
	type: 'sticker-mastery-progress';
	data: {
		sticker: UnknownModelData;
		progress: number;
		max: number;
	};
}

export const PayloadActionsStoreKey: InjectionKey<PayloadActionsStore> =
	Symbol('payload-actions-store');

export type PayloadActionsStore = ReturnType<typeof createPayloadActionsStore>;

export function usePayloadActionsStore() {
	return inject(PayloadActionsStoreKey)!;
}

export function createPayloadActionsStore() {
	let _idIncrementer = 0;
	const notices = ref<ShellNoticeItem[]>([]);

	function remove(id: number) {
		arrayRemove(notices.value, i => i.id === id);
	}

	function addNotice(data: ShellNoticeItem['data']) {
		// Notices render as ephemeral floating UI; nothing visible is
		// produced during SSR. Skip the push so the array doesn't accumulate
		// across concurrent requests.
		if (import.meta.env.SSR) {
			return;
		}

		notices.value.push({
			id: ++_idIncrementer,
			data,
		});
	}

	Payload.addPayloadHandler((payload: PayloadData) => {
		if (!payload || !payload.actions) {
			return;
		}

		for (const { type, data } of payload.actions) {
			switch (type) {
				case 'unlock-sticker-pack': {
					const { user_sticker_pack } = data;

					showStickerPackOpenModal({
						pack: storeModel(UserStickerPackModel, user_sticker_pack),
					});
					break;
				}

				case 'gain-creator-experience': {
					const { experience, leveled_up, xp_gained } = data;

					addNotice({
						type: 'creator-experience',
						experience: new CreatorExperienceModel(experience),
						leveledUp: leveled_up,
						xpGained: xp_gained,
					});
					break;
				}

				case 'sticker-mastery-progress': {
					const { max: rawMax, progress: rawProgress, sticker: stickerData } = data;
					const max = Math.max(1, rawMax);
					const progress = clampNumber(rawProgress, 0, max);
					const sticker = storeModel(StickerModel, stickerData);

					// Manually update the sticker to have the new progress.
					if (!stickerData.mastery) {
						sticker.mastery = clampNumber(Math.round((progress / max) * 100), 0, 100);
					}

					addNotice({
						type: 'sticker-mastery',
						sticker,
						max,
						progress,
					});
					break;
				}
			}
		}
	});

	return shallowReadonly({
		notices,
		remove,
		addNotice,
	});
}
