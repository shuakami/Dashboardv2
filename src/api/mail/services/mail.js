'use strict';

/**
 * mail service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::mail.mail');
