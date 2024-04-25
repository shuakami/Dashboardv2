'use strict';

/**
 * debug router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::debug.debug');
