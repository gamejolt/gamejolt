export function FormValidatorContentNoMediaUpload(json: string) {
	// This works because json always escapes the " character.
	// If a user were to put `"type":"mediaUpload"` in their content, it would come out as `\"type\":\"mediaUpload\"`.
	return !json.includes('"type":"mediaUpload"');
}
