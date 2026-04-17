import bgApplyDesktop from '~app/views/landing/creators/_backgrounds/apply-desktop.png';
import bgApplySm from '~app/views/landing/creators/_backgrounds/apply-sm.png';
import bgApplyXs from '~app/views/landing/creators/_backgrounds/apply-xs.png';

interface CreatorBackground {
	src: string;
	paddingH: number;
	paddingV: number;
}

export const creatorApplyDesktop: CreatorBackground = {
	src: bgApplyDesktop,
	paddingH: 0,
	paddingV: 0,
};

export const creatorApplySm: CreatorBackground = {
	src: bgApplySm,
	paddingH: 0,
	paddingV: 0,
};

export const creatorApplyXs: CreatorBackground = {
	src: bgApplyXs,
	paddingH: 0,
	paddingV: 0,
};
