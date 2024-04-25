'use strict';

/**
 * debug controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::debug.debug');
