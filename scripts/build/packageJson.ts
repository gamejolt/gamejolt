import { readFile, writeFile } from 'fs-extra';
import * as path from 'path';
import { escapeRegex } from './utils';

// These helper functions modify a json string using a dumb string replace.
// Modifying a json using JSON.parse() + JSON.stringify() does not preserve
// whitespace or quotation style. its easier to just monkey patch it like so.

export function updateJsonProperty(input: string, property: string, value: string): string {
	const escapedProperty = escapeRegex(property);
	const reg = new RegExp(`^(\\s*['"]${escapedProperty}['"]\\s*:\\s*['"]).*?(['"],?\\s*)$`, 'gim');
	return input.replace(reg, (_match, before, after) => `${before}${value}${after}`);
}

export function deactivateJsonProperty(input: string, property: string): string {
	const escapedProperty = escapeRegex(property);
	const reg = new RegExp(`^(\\s*['"])${escapedProperty}(['"].*?)$`, 'gim');
	return input.replace(reg, (_match, before, after) => `${before}_${property}${after}`);
}

export function activateJsonProperty(input: string, property: string): string {
	const escapedProperty = escapeRegex('_' + property);
	const reg = new RegExp(`^(\\s*['"])${escapedProperty}(['"].*?)$`, 'gim');
	return input.replace(reg, (_match, before, after) => `${before}${property}${after}`);
}

const projectRootDir = path.resolve(__dirname, '..', '..');
export const packageJsonPath = path.join(projectRootDir, 'package.json');

export async function patchPackageJson(cb: (packageJsonStr: string) => string | Promise<string>) {
	const oldPackageJsonStr = await readFile(packageJsonPath, {
		encoding: 'utf8',
	});

	const newPackageJsonStr = await cb(oldPackageJsonStr);

	if (newPackageJsonStr === oldPackageJsonStr) {
		return false;
	}

	await writeFile(packageJsonPath, newPackageJsonStr);
	return true;
}
