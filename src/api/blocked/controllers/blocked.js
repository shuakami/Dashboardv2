'use strict';

/**
 * blocked controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::blocked.blocked');
