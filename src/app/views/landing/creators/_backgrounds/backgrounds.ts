import bgApplyDesktop from './apply-desktop.png';
import bgApplySm from './apply-sm.png';
import bgApplyXs from './apply-xs.png';

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
