export const gjSectionNames = Object.freeze([
	'app',
	'auth',
	'checkout',
	'claim',
	'client',
	'editor',
	'gameserver',
	'site-editor',
	'widget-package',
	'z',
] as const);

export type GjSectionName = typeof gjSectionNames[number];

export type GjSectionConfig = {
	// Title to default to in the web page.
	title: string;

	// Whether this section should set up a vue router.
	hasRouter: boolean;

	// Whether to block crawlers from hitting pages in this section.
	allowCrawlers: boolean;

	// A css class to apply to the html body element.
	htmlBodyClass: string;

	// Additional scripts to embed in the index.html's head element.
	jsScripts: string;

	// Whether this section should get built for desktop app.
	desktopApp: boolean;
	// Whether this section should get built for ssr.
	ssr: boolean;
	// Whether this section should get built for mobile app.
	mobileApp: boolean;
};

const sectionDefaultConfig: GjSectionConfig = Object.freeze({
	title: 'Game Jolt - Games for the love of it',
	hasRouter: true,
	allowCrawlers: false,
	htmlBodyClass: '',
	jsScripts: '',
	desktopApp: false,
	ssr: false,
	mobileApp: false,
});

const sectionOverrides: Partial<Record<GjSectionName, Partial<GjSectionConfig>>> = Object.freeze({
	app: {
		title: 'Game Jolt - Games for the love of it',
		allowCrawlers: true,
		desktopApp: true,
		ssr: true,
	},
	auth: {
		title: 'Game Jolt - Games for the love of it',
		allowCrawlers: true,
		htmlBodyClass: 'fill-darkest',
		desktopApp: true,
	},
	checkout: {
		title: 'Checkout - Game Jolt',
		jsScripts: '<script type="text/javascript" src="https://js.stripe.com/v2/"></script>',
		desktopApp: true,
	},
	claim: {
		title: 'Claim - Game Jolt',
	},
	'site-editor': {
		title: 'Edit Site - Game Jolt',
	},
	gameserver: {
		title: 'Playing Game - Game Jolt',
		hasRouter: false,
	},
	client: {
		title: 'Game Jolt',
		htmlBodyClass: 'fill-darkest',
		desktopApp: true,
	},
	'widget-package': {
		title: 'Get Game from Game Jolt',
		hasRouter: false,
	},
	z: {
		title: 'Game Jolt - Games for the love of it',
		htmlBodyClass: 'main-body',
	},
	editor: {
		title: 'Editor',
		hasRouter: false,
		mobileApp: true,
	},
});

function mergeSectionConfig(sectionConfig: Partial<GjSectionConfig>): GjSectionConfig {
	return Object.assign({}, sectionDefaultConfig, sectionConfig);
}

export const gjSectionConfigs = Object.freeze(
	Object.fromEntries(
		gjSectionNames.map(name => {
			const sectionConfig = mergeSectionConfig(sectionOverrides[name] ?? {});
			return [name, sectionConfig];
		})
	)
) as Record<GjSectionName, GjSectionConfig>;
