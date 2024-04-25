'use strict';

/**
 * ailog service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::ailog.ailog');
