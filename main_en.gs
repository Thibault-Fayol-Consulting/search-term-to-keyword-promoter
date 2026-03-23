/**
 * --------------------------------------------------------------------------
 * Search Term to Keyword Promoter — Google Ads Script
 * --------------------------------------------------------------------------
 * Finds converting search terms and adds them as exact match keywords
 * to their originating ad groups using GAQL.
 *
 * Author:  Thibault Fayol — Thibault Fayol Consulting
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */

var CONFIG = {
  TEST_MODE: true,
  EMAIL: 'you@example.com',
  MIN_CONVERSIONS: 3,
  DATE_RANGE: 'LAST_30_DAYS'
};

function main() {
  try {
    Logger.log('=== Search Term to Keyword Promoter ===');
    Logger.log('Min conversions: ' + CONFIG.MIN_CONVERSIONS);

    var query =
      'SELECT search_term_view.search_term, ' +
      'metrics.conversions, metrics.cost_micros, metrics.clicks, ' +
      'ad_group.id, ad_group.name, campaign.name ' +
      'FROM search_term_view ' +
      'WHERE metrics.conversions >= ' + CONFIG.MIN_CONVERSIONS + ' ' +
      'AND segments.date DURING ' + CONFIG.DATE_RANGE;

    var rows = AdsApp.search(query);
    var promoted = [];
    var seen = {};

    while (rows.hasNext()) {
      var row = rows.next();
      var term = row.searchTermView.searchTerm;
      var adGroupId = row.adGroup.id;
      var key = term + '|' + adGroupId;
      if (seen[key]) continue;
      seen[key] = true;

      var exactTerm = '[' + term + ']';
      var cost = row.metrics.costMicros / 1e6;
      var cpa = row.metrics.conversions > 0 ? cost / row.metrics.conversions : 0;

      var entry = {
        term: term, exactTerm: exactTerm,
        conversions: row.metrics.conversions, clicks: row.metrics.clicks,
        cost: cost, cpa: cpa,
        campaign: row.campaign.name, adGroup: row.adGroup.name, adGroupId: adGroupId
      };

      Logger.log('Promoting: "' + term + '" — ' + entry.conversions + ' conv, CPA $' + cpa.toFixed(2));

      if (!CONFIG.TEST_MODE) {
        var agIter = AdsApp.adGroups().withIds([adGroupId]).get();
        if (agIter.hasNext()) {
          agIter.next().newKeywordBuilder().withText(exactTerm).build();
          Logger.log('Added "' + exactTerm + '" to ' + entry.adGroup);
        }
      }

      promoted.push(entry);
    }

    Logger.log('Total promoted: ' + promoted.length);
    if (promoted.length > 0) sendReport_(promoted);

  } catch (e) {
    Logger.log('ERROR: ' + e.message);
    MailApp.sendEmail(CONFIG.EMAIL, 'Search Term Promoter — Error', e.message);
  }
}

function sendReport_(promoted) {
  var subject = (CONFIG.TEST_MODE ? '[TEST] ' : '') +
    'Search Term Promoter — ' + promoted.length + ' term(s) promoted';

  var body = 'Search Term Promotion Report\n============================\n\n';
  body += promoted.length + ' term(s) ' +
    (CONFIG.TEST_MODE ? 'identified (TEST MODE)' : 'added as exact match') + ':\n\n';

  for (var i = 0; i < promoted.length; i++) {
    var p = promoted[i];
    body += '- "' + p.term + '" -> ' + p.exactTerm + '\n';
    body += '  Conv: ' + p.conversions + ' | Clicks: ' + p.clicks +
      ' | CPA: $' + p.cpa.toFixed(2) + ' | Cost: $' + p.cost.toFixed(2) + '\n';
    body += '  ' + p.campaign + ' > ' + p.adGroup + '\n\n';
  }

  MailApp.sendEmail(CONFIG.EMAIL, subject, body);
}
