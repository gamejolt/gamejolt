const pofile = require('pofile');
const path = require('path');
const fs = require('fs-extra');
const readdirp = require('readdirp');
const { resolve } = require('path/posix');

/**
 * Some useful regexes for the task.
 *
 * find <AppTranslate> that only has the old style of translations in em:
 * 	<AppTranslate[.\n]*?>[\n\s]*[a-z0-9\-_]+(?:\.[a-z0-9\-_]+)+[\n\s]*</AppTranslate[\n\s]*>
 * 	>[\n\s]*[a-z0-9\-_]+(?:\.[a-z0-9\-_]+)+[\n\s]*</
 *
 * same for $gettext:
 * 	\$n?gettext(?:Interpolate)?\([\n\s]*['"`][a-z0-9\-_]+(?:\.[a-z0-9\-_]+)+['"`][\n\s]*\)
 */

(async () => {
	// Pulled from translate.service.ts
	const TranslationLangs = [
		{
			code: 'en_US',
			label: 'English',
		},
		{
			// Dutch
			code: 'nl',
			label: 'Nederlands',
		},
		{
			// Romanian
			code: 'ro',
			label: 'Română',
		},
		{
			// German
			code: 'de',
			label: 'Deutsch',
		},
		{
			// Spanish
			code: 'es',
			label: 'Español',
		},
		{
			// Spanish (Argentina)
			code: 'es_AR',
			label: 'Español (Argentina)',
		},
		{
			// Spanish (LA&C)
			code: 'es_419',
			label: 'Español (America Latina)',
		},
		{
			// Spanish (Columbia)
			code: 'es_CO',
			label: 'Español (Colombia)',
		},
		{
			// Spanish (Mexico)
			code: 'es_MX',
			label: 'Español (México)',
		},
		{
			// French
			code: 'fr',
			label: 'Français',
		},
		{
			// Russian
			code: 'ru',
			label: 'Русский',
		},
		{
			// Swedish
			code: 'sv',
			label: 'Svenska',
		},
		{
			// Turkish
			code: 'tr',
			label: 'Türkçe',
		},
		{
			// Portuguese
			code: 'pt',
			label: 'Português (Portugal)',
		},
		{
			// Portuguese (Brazil)
			code: 'pt_BR',
			label: 'Português (Brasil)',
		},
		{
			// Finnish
			code: 'fi',
			label: 'Suomi',
		},
		{
			// Norwegian
			code: 'nb',
			label: 'Norsk (bokmål)',
		},
		{
			// Greek
			code: 'el',
			label: 'Ελληνικά',
		},
		{
			// Malay
			code: 'ms',
			label: 'Bahasa Melayu',
		},
		{
			// Polish
			code: 'pl',
			label: 'Polski',
		},
		{
			// Ukranian
			code: 'uk',
			label: 'Українська',
		},
		{
			// Italian
			code: 'it',
			label: 'Italiano',
		},
		{
			// Traditional Chinese (Taiwan)
			code: 'zh_TW',
			label: '中文(台灣)',
		},
		{
			// Croation
			code: 'hr',
			label: 'Hrvatski',
		},
		{
			// Indonesian
			code: 'id',
			label: 'Bahasa Indonesia',
		},
		{
			// Czech
			code: 'cs',
			label: 'Čeština',
		},
		{
			// Bulgarian
			code: 'bg',
			label: 'Български',
		},
	];

	const langCodes = TranslationLangs.map(lang => lang.code);

	const rootDir = path.resolve(__dirname, '..');
	const inputDir = path.join(rootDir, 'translations-bak', 'input');
	const outputDir = path.join(rootDir, 'translations-bak', 'output');

	const inputTranslationsDir = path.join(inputDir, 'src-translations');
	const inputSiteTranslationsDir = path.join(inputDir, 'site-translations');
	const outputTranslationsDir = path.join(outputDir, 'src-translations');
	const outputSiteTranslationsDir = path.join(outputDir, 'site-translations');

	const _loadedMainJsons = {};
	async function getMainJson(langCode) {
		if (!langCodes.includes(langCode)) {
			throw new Error(`Unsupported language '${langCode}'`);
		}

		if (Object.prototype.hasOwnProperty.call(_loadedMainJsons, langCode)) {
			return _loadedMainJsons[langCode];
		}

		const loaded = await fs.readJson(path.join(inputTranslationsDir, langCode, 'main.json'), {
			encoding: 'utf8',
		});

		// Sanity check - make sure only the one expected language is defined in the loaded file.
		const loadedLangs = Object.keys(loaded);
		if (loadedLangs.length !== 1 || loadedLangs[0] !== langCode) {
			throw new Error(
				`Main.json for language '${langCode}' has wrong language keys defined on it: ${loadedLangs.join(
					', '
				)}`
			);
		}

		const result = loaded[langCode];
		_loadedMainJsons[langCode] = result;
		return result;
	}

	function getMainJsonDefinitions(mainJson) {
		return Object.keys(mainJson);
	}

	const _loadedPoFiles = {};
	async function getPoFile(langCode) {
		if (!langCodes.includes(langCode)) {
			throw new Error(`Unsupported language '${langCode}'`);
		}

		if (Object.prototype.hasOwnProperty.call(_loadedPoFiles, langCode)) {
			return _loadedPoFiles[langCode];
		}

		const poStr = await fs.readFile(path.join(inputSiteTranslationsDir, langCode, 'main.po'), {
			encoding: 'utf-8',
		});
		const result = pofile.parse(poStr);
		_loadedPoFiles[langCode] = result;
		return result;
	}

	function getPoDefinitions(poFile) {
		return poFile.items.map(item => item.msgid).filter(msgid => !!msgid);
	}

	async function findPoDefinitionsNotInMainJson() {
		const mainFile = await getMainJson('en_US');
		const mainDefs = getMainJsonDefinitions(mainFile);

		for (const langCode of langCodes) {
			const poFile = await getPoFile(langCode);
			const poDefs = getPoDefinitions(poFile);

			const missingDefs = poDefs.filter(poDef => mainDefs.includes(poDef));
			if (missingDefs.length > 0) {
				console.log(
					`Found some definition in '${langCode}' po file that do not exist in en_US/main.json:\n\t${missingDefs.join(
						`\n\t`
					)}`
				);
			}
		}
	}

	console.log('Finding en_US definitions in main.json and po files.');
	const enMainFile = await getMainJson('en_US');
	const enMainDefs = getMainJsonDefinitions(enMainFile);
	const enPoFile = await getPoFile('en_US');
	const enPoDefs = getPoDefinitions(enPoFile);

	const enMainUnusedDefs = Object.fromEntries(enMainDefs.map(defKey => [defKey, true]));
	const enPoUnusedDefs = Object.fromEntries(enPoDefs.map(defKey => [defKey, true]));
	const enUnusedDefs = Object.assign({}, enMainUnusedDefs, enPoUnusedDefs);
	for await (const entry of readdirp(path.join(rootDir, 'src'), {
		fileFilter: ['*.vue', '*.ts'],
	})) {
		const { fullPath } = entry;

		let contents = await fs.readFile(fullPath, { encoding: 'utf-8' });

		// collapse everything to one line so we can match strings that have been folded to multiple lines by auto formatting.
		contents = contents.replaceAll(/\s{2,}|\n/gi, ' ');
		// Trim strings inside elements so we can match things like <AppTranslate> my.key </AppTranslate>
		contents = contents.replaceAll(/>\s*(.*?)\s*</gi, '>$1<');

		for (const def in enUnusedDefs) {
			const isUnused = enUnusedDefs[def];
			if (!isUnused) {
				continue;
			}

			if (contents.includes(def)) {
				enUnusedDefs[def] = false;
			}
		}
	}

	const enPoUnusedDefKeys = enPoDefs.filter(def => enUnusedDefs[def] === true);
	console.log(`${enPoUnusedDefKeys.length}/${enPoDefs.length} po definitions are unused`);
	if (enPoUnusedDefKeys.length) {
		console.log('Removing unused definitions');
		enPoFile.items = enPoFile.items.filter(item => !enPoUnusedDefKeys.includes(item.msgid));
	}

	const enMainUnusedDefKeys = enMainDefs.filter(def => enUnusedDefs[def] === true);
	console.log(
		`${enMainUnusedDefKeys.length}/${enMainDefs.length} main.json definitions are unused`
	);
	if (enMainUnusedDefKeys.length) {
		console.log('Removing unused definitions');
		for (const mainUnusedDefKey of enMainUnusedDefKeys) {
			delete enMainFile[mainUnusedDefKey];
		}
	}

	const enPoUsedDefKeys = enPoDefs.filter(def => enUnusedDefs[def] === false);
	const enDefinedInPoButMissingInMainJson = enPoUsedDefKeys.filter(
		def => !enMainDefs.includes(def)
	);
	console.log(
		`${enDefinedInPoButMissingInMainJson.length} in-use definitions in po are missing from main.json`
	);

	if (enDefinedInPoButMissingInMainJson.length) {
		console.log('Adding them to main.json...');
		for (const defToAdd of enDefinedInPoButMissingInMainJson) {
			const poItem = enPoFile.items.find(item => item.msgid === defToAdd);

			// For plural items in the .po file we need to add the plural forms as an array value in the .json field.
			// The first element is the singular form, so would just be defToAdd, and is identical to the key we'll set in the .json.
			if (poItem.msgid_plural) {
				enMainDefs[defToAdd] = [defToAdd, ...poItem.msgstr.slice(1)];
			} else {
				enMainDefs[defToAdd] = defToAdd;
			}
		}
	}

	console.log('Loading string replaceable translations in order');
	const stringReplaceableTranslations = await fs.readJson(
		path.resolve(__dirname, 'string-replaceable-translations.json'),
		{
			encoding: 'utf-8',
		}
	);

	const stringReplaceableTranslationEntries = Object.entries(stringReplaceableTranslations)
		.sort((def1, def2) => {
			const def1Key = def1[0];
			const def2Key = def2[0];
			return def1Key.localeCompare(def2Key);
		})
		.reverse();

	console.log('Replacing in source files...');
	for await (const entry of readdirp(path.join(rootDir, 'src'), {
		fileFilter: ['*.vue', '*.ts'],
	})) {
		const { fullPath } = entry;

		const originalContents = await fs.readFile(fullPath, { encoding: 'utf-8' });
		let contents = originalContents;

		for ([defKey, defValue] of stringReplaceableTranslationEntries) {
			contents = contents.replaceAll(defKey, defValue);

			// // Quotes the value for use in regex.
			// // We want to convert all spaces to match line breaks and indentation changes.
			// // because the IDE tends to collapse these.
			// const valueQuoted = defValue.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
			// const defRegex = new RegExp(valueQuoted.replaceAll(' ', 's+'), 'ig');
			// contents = contents.replaceAll(defRegex);
		}

		if (contents != originalContents) {
			console.log(fullPath);
			const newPath = path.join(
				outputDir,
				'src',
				path.relative(path.join(rootDir, 'src'), fullPath)
			);

			await fs.mkdirp(path.dirname(newPath));
			await fs.writeFile(fullPath, contents, { encoding: 'utf-8' });
		}
	}

	await fs.mkdirp(path.join(outputTranslationsDir, 'en_US'));
	await fs.writeJson(
		path.join(outputTranslationsDir, 'en_US', 'main.json'),
		{ en_US: enMainFile },
		{ encoding: 'utf-8' }
	);

	await fs.mkdirp(path.join(outputSiteTranslationsDir, 'en_US'));
	await new Promise((resolve, reject) => {
		enPoFile.save(path.join(outputSiteTranslationsDir, 'en_US', 'main.po'), err => {
			if (err) {
				return reject(err);
			}
			return resolve();
		});
	});

	// findPoDefinitionsNotInMainJson();
	console.log('Done');
})();
