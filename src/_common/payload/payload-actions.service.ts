import { CreatorExperience } from '../creator/experience/experience.model';
import { UnknownModelData } from '../model/model.service';
import { ShellNotice } from '../shell/notice/AppShellNotice.vue';
import { StickerPackOpenModal } from '../sticker/pack/open-modal/modal.service';
import { UserStickerPack } from '../sticker/pack/user-pack.model';

export const PayloadAction = {
	UNLOCK_STICKER_PACK: 'unlock-sticker-pack',
	GAIN_CREATOR_EXPERIENCE: 'gain-creator-experience',
} as const;

export const PayloadActionDataFields = {
	'unlock-sticker-pack': {
		pack: 'user_sticker_pack',
	},
	'gain-creator-experience': {
		experience: 'experience',
		leveledUp: 'leveled_up',
		xpGained: 'xp_gained',
	},
} as const;

export const PayloadActionData = {
	[PayloadAction.UNLOCK_STICKER_PACK]: (data: any) => {
		const { pack } = PayloadActionDataFields['unlock-sticker-pack'];
		return {
			pack: data[pack],
		} as {
			pack: UnknownModelData;
		};
	},
	[PayloadAction.GAIN_CREATOR_EXPERIENCE]: (data: any) => {
		const { experience, leveledUp, xpGained } =
			PayloadActionDataFields['gain-creator-experience'];
		return {
			experience: data[experience],
			leveledUp: data[leveledUp] === true,
			xpGained: data[xpGained] ?? 0,
		} as {
			experience: UnknownModelData;
			leveledUp: boolean;
			xpGained: number;
		};
	},
} as const;

export default function checkPayloadActions(payload: any) {
	if (!payload || !payload.actions) {
		return;
	}

	if (!Array.isArray(payload.actions)) {
		return;
	}

	const actions: any[] = payload.actions;
	for (const { type, data } of actions) {
		switch (type) {
			case PayloadAction.UNLOCK_STICKER_PACK: {
				const payloadData = PayloadActionData[PayloadAction.UNLOCK_STICKER_PACK](data);
				if (payloadData.pack) {
					StickerPackOpenModal.show({
						pack: new UserStickerPack(payloadData.pack),
					});
				}
				break;
			}

			case PayloadAction.GAIN_CREATOR_EXPERIENCE: {
				const { experience, leveledUp, xpGained } =
					PayloadActionData[PayloadAction.GAIN_CREATOR_EXPERIENCE](data);

				ShellNotice.addCreatorExperience({
					experience: new CreatorExperience(experience),
					leveledUp,
					xpGained,
				});
				break;
			}
		}
	}
}
