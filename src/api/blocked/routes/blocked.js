'use strict';

/**
 * blocked router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::blocked.blocked');
