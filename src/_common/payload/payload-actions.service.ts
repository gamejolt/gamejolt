import { CreatorExperience } from '../creator/experience/experience.model';
import { UnknownModelData } from '../model/model.service';
import { getShellNotice } from '../shell/notice/notice.service';
import { StickerPackOpenModal } from '../sticker/pack/open-modal/modal.service';
import { UserStickerPack } from '../sticker/pack/user-pack.model';

interface PayloadData {
	actions?: (PackAction | CreatorExperienceAction)[];
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

export default function handlePayloadActions(payload: PayloadData) {
	if (!payload || !payload.actions) {
		return;
	}

	for (const { type, data } of payload.actions) {
		switch (type) {
			case 'unlock-sticker-pack': {
				const { user_sticker_pack } = data;

				StickerPackOpenModal.show({
					pack: new UserStickerPack(user_sticker_pack),
				});
				break;
			}

			case 'gain-creator-experience': {
				const { experience, leveled_up, xp_gained } = data;

				getShellNotice().addNotice({
					type: 'creator-experience',
					experience: new CreatorExperience(experience),
					leveledUp: leveled_up,
					xpGained: xp_gained,
				});
				break;
			}
		}
	}
}
