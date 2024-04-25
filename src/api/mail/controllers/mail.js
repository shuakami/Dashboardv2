'use strict';

/**
 * mail controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::mail.mail');
