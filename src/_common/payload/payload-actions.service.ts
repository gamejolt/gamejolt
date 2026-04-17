import { CreatorExperienceModel } from '~common/creator/experience/experience.model';
import { UnknownModelData } from '~common/model/model.service';
import { storeModel } from '~common/model/model-store.service';
import { getShellNotice } from '~common/shell/notice/notice.service';
import { showStickerPackOpenModal } from '~common/sticker/pack/open-modal/modal.service';
import { UserStickerPackModel } from '~common/sticker/pack/user-pack.model';
import { StickerModel } from '~common/sticker/sticker.model';
import { clampNumber } from '~utils/number';

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

export default function handlePayloadActions(payload: PayloadData) {
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

				getShellNotice().addNotice({
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

				getShellNotice().addNotice({
					type: 'sticker-mastery',
					sticker,
					max,
					progress,
				});
				break;
			}
		}
	}
}
