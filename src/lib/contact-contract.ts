export const CONTACT_TOPICS = [
	'general',
	'ministry',
	'japan',
	'media',
	'collaboration',
	'other',
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const CONTACT_RESPONSE_CODES = [
	'sent',
	'invalid_content_type',
	'invalid_content_length',
	'request_too_large',
	'malformed_request',
	'invalid_fields',
	'spam_detected',
	'invalid_name',
	'invalid_email',
	'invalid_topic',
	'invalid_message',
	'rate_limited',
	'rate_limit_unavailable',
	'captcha_missing',
	'captcha_invalid',
	'captcha_unavailable',
	'captcha_hostname_mismatch',
	'captcha_action_mismatch',
	'not_configured',
	'delivery_failed',
] as const;

export type ContactResponseCode = (typeof CONTACT_RESPONSE_CODES)[number];
