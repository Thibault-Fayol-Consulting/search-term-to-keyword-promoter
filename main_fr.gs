/**
 * --------------------------------------------------------------------------
 * search-term-to-keyword-promoter - Google Ads Script for SMBs
 * --------------------------------------------------------------------------
 * Author: Thibault Fayol - Consultant SEA PME
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */
var CONFIG = { TEST_MODE: true, CONVERSION_THRESHOLD: 3 };
function main() {
    Logger.log("Scan des requêtes avec Conv >= " + CONFIG.CONVERSION_THRESHOLD);
    var report = AdsApp.report("SELECT Query, Conversions, AdGroupId FROM SEARCH_QUERY_PERFORMANCE_REPORT WHERE Conversions >= " + CONFIG.CONVERSION_THRESHOLD + " DURING LAST_30_DAYS");
    var rows = report.rows();
    while (rows.hasNext()) {
        var row = rows.next();
        var term = "[" + row["Query"] + "]";
        Logger.log("Terme prometteur : " + term + " (" + row["Conversions"] + " convs)");
        if (!CONFIG.TEST_MODE) {
            var agIter = AdsApp.adGroups().withIds([row["AdGroupId"]]).get();
            if (agIter.hasNext()) {
                agIter.next().newKeywordBuilder().withText(term).build();
                Logger.log("A ajouté " + term + " en Mot-Clé Exact.");
            }
        }
    }
}
