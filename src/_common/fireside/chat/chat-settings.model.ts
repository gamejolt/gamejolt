import { ContextCapabilities, ContextCapabilityType } from '../../content/content-context';
import { Model } from '../../model/model.service';
import { FIRESIDE_ROLES } from '../role/role.model';

export class FiresideChatSettings extends Model {
	constructor(data: any = {}) {
		super(data);
	}

	declare allow_images: FIRESIDE_ROLES;
	declare allow_gifs: FIRESIDE_ROLES;
	declare allow_links: FIRESIDE_ROLES;
	declare allow_spoilers: FIRESIDE_ROLES;
	declare max_message_length: number;
	declare slow_mode_enabled: boolean;
	declare slow_mode_seconds: number;
}

Model.create(FiresideChatSettings);

/**
 * Generates the correct context capabilities for the fireside depending on
 * their role and what the chat settings are defined as.
 */
export function createFiresideChatContextCapabilities(
	settings: FiresideChatSettings,
	role: FIRESIDE_ROLES
) {
	// Base capabilities for all chat messages.
	const capabilities = ContextCapabilities.getForContext('fireside-chat-message');

	// Remove capabilities that the given role does not have access to. If the
	// required role's power is higher than the input role's power, they don't
	// have access.
	const rolePower = _getRolePower(role);

	if (_getRolePower(settings.allow_images) > rolePower) {
		capabilities.removeCapability(ContextCapabilityType.Media);
	}

	if (_getRolePower(settings.allow_gifs) > rolePower) {
		capabilities.removeCapability(ContextCapabilityType.Gif);
	}

	if (_getRolePower(settings.allow_links) > rolePower) {
		capabilities.removeCapability(ContextCapabilityType.TextLink);
		capabilities.removeCapability(ContextCapabilityType.CustomLink);
	}

	if (_getRolePower(settings.allow_spoilers) > rolePower) {
		capabilities.removeCapability(ContextCapabilityType.Spoiler);
	}

	return capabilities;
}

const _rolePowers: Record<FIRESIDE_ROLES, number> = {
	host: 4,
	cohost: 3,
	guest: 2,
	audience: 1,
};

function _getRolePower(role: FIRESIDE_ROLES) {
	return _rolePowers[role] || 0;
}
