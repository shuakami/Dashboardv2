'use strict';

/**
 * appt service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::appt.appt');
