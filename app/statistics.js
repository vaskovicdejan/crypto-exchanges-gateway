"use strict";
const _ = require('lodash');

class Statistics
{

constructor()
{
    this._statistics = {
        exchanges:{},
        others:{}
    };
}

/**
 * Increment counter for a given exchange API
 *
 * @param {string} exchange exchange identifier
 * @param {string} api api
 * @param {boolean} success indicates whether or not we want to increase success statistic (optional, default = true)
 */
increaseExchangeStatistic(exchange, api, success)
{
    if (undefined === this._statistics.exchanges[exchange])
    {
        this._statistics.exchanges[exchange] = {};
    }
    if (undefined === this._statistics.exchanges[exchange][api])
    {
        this._statistics.exchanges[exchange][api] = {success:0, failure:0};
    }
    if (undefined === success || success)
    {
        ++this._statistics.exchanges[exchange][api].success;
    }
    else
    {
        ++this._statistics.exchanges[exchange][api].failure;
    }
}

/**
 * Increment counter for a non exchange API
 *
 * @param {string} id service id
 * @param {string} api api
 * @param {boolean} success indicates whether or not we want to increase success statistic (optional, default = true)
 */
increaseStatistic(id, api, success)
{
    if (undefined === this._statistics.others[id])
    {
        this._statistics.others[id] = {};
    }
    if (undefined === this._statistics.others[id][api])
    {
        this._statistics.others[id][api] = {success:0, failure:0};
    }
    if (undefined === success || success)
    {
        ++this._statistics.others[id][api].success;
    }
    else
    {
        ++this._statistics.others[id][api].failure;
    }
}

getStatistics()
{
    return this._statistics;
}

}

let statistics = new Statistics();

module.exports = statistics;
