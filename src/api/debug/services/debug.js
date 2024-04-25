'use strict';

/**
 * debug service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::debug.debug');
