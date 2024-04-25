'use strict';

/**
 * blocked service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::blocked.blocked');
