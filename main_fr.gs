/**
 * search-term-to-keyword-promoter - Script Google Ads for SMBs
 * Author: Thibault Fayol
 */
var CONFIG = { TEST_MODE: true, MIN_CONV: 3 };
function main(){
  var report = AdsApp.report("SELECT Query, Conversions FROM SEARCH_QUERY_PERFORMANCE_REPORT WHERE Conversions >= " + CONFIG.MIN_CONV);
  var rows = report.rows();
  while(rows.hasNext()){
    Logger.log("Should promote: [" + rows.next()["Query"] + "]");
  }
}