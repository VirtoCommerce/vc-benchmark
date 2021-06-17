/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 91.95989908378701, "KoPercent": 8.040100916212987};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7572035586243526, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8898163606010017, 500, 1500, "Get product detail  "], "isController": false}, {"data": [0.5955518945634267, 500, 1500, "Create order from cart"], "isController": false}, {"data": [0.685337726523888, 500, 1500, "Add payment method"], "isController": false}, {"data": [0.7034596375617792, 500, 1500, "Get cart"], "isController": false}, {"data": [0.7099673202614379, 500, 1500, "SignIn"], "isController": false}, {"data": [0.7125205930807249, 500, 1500, "Remove  cart"], "isController": false}, {"data": [0.6838235294117647, 500, 1500, " Search 50 products  with prices, availability, tax, discounts"], "isController": false}, {"data": [0.6987687813021702, 500, 1500, "Add  SKU to cart"], "isController": false}, {"data": [0.6960461285008237, 500, 1500, "Add delivery  address"], "isController": false}, {"data": [0.7140522875816994, 500, 1500, "Get me"], "isController": false}, {"data": [0.729818780889621, 500, 1500, " Logout"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 15062, 1211, 8.040100916212987, 588.871199043951, 1, 34395, 196.5, 1308.7000000000007, 2973.0, 6065.659999999982, 8.341797712236225, 17.580716754513443, 21.15599667438522], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get product detail  ", 4792, 15, 0.31302170283806346, 411.71848914858066, 2, 10876, 135.0, 945.7999999999993, 2068.3499999999885, 4682.539999999994, 2.675785481518542, 3.497272097042174, 8.267490759410478], "isController": false}, {"data": ["Create order from cart", 607, 134, 22.075782537067546, 703.1021416803956, 1, 9144, 365.0, 1962.2000000000048, 3360.000000000002, 5878.479999999988, 0.34262774596100026, 0.3037389279237097, 0.5479217221193021], "isController": false}, {"data": ["Add payment method", 607, 130, 21.4168039538715, 522.7660626029655, 1, 32457, 147.0, 804.4000000000001, 2292.0, 6572.399999999977, 0.3430512344475434, 0.2787004285314638, 0.633832478707652], "isController": false}, {"data": ["Get cart", 607, 132, 21.746293245469523, 339.54036243822077, 2, 10419, 113.0, 557.4000000000042, 1801.6, 5419.999999999981, 0.3433382203880684, 0.4482346619518467, 2.599858146731556], "isController": false}, {"data": ["SignIn", 612, 130, 21.241830065359476, 332.0751633986928, 1, 7478, 111.0, 462.6000000000017, 1719.9000000000008, 5552.840000000002, 0.34090776161189207, 0.9171725870261758, 0.48804053742131126], "isController": false}, {"data": ["Remove  cart", 607, 130, 21.4168039538715, 233.4217462932454, 1, 5428, 56.0, 473.2000000000005, 1469.4000000000033, 3768.839999999998, 0.3429568416782398, 0.2661892614675841, 0.5102854697251599], "isController": false}, {"data": [" Search 50 products  with prices, availability, tax, discounts", 612, 130, 21.241830065359476, 486.8562091503273, 1, 17398, 207.0, 1001.0000000000009, 2261.6500000000005, 5784.200000000001, 0.34148755774459744, 10.141752929880942, 0.7843051924382825], "isController": false}, {"data": ["Add  SKU to cart", 4792, 15, 0.31302170283806346, 989.0511268781306, 2, 20720, 462.5, 2790.2999999999984, 4494.849999999994, 7088.3299999999945, 2.670189771813561, 0.8790460443007998, 5.921098890773525], "isController": false}, {"data": ["Add delivery  address", 607, 130, 21.4168039538715, 468.0049423393737, 1, 34395, 154.0, 609.2000000000014, 2126.2000000000016, 5035.519999999998, 0.34311076542528773, 0.32844500590127906, 0.68860068711181], "isController": false}, {"data": ["Get me", 612, 130, 21.241830065359476, 253.5441176470587, 1, 7847, 63.0, 454.00000000000045, 1643.1500000000024, 4171.990000000002, 0.3411987449238324, 0.32138085417879264, 0.48858886286458647], "isController": false}, {"data": [" Logout", 607, 135, 22.240527182866558, 205.54530477759488, 1, 31953, 14.0, 189.4000000000001, 908.0000000000002, 3150.6399999999962, 0.3428340344392884, 0.35505005616943114, 0.4513353406821437], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to loadtest-platform.dev.govirto.com:443 [loadtest-platform.dev.govirto.com/168.62.24.35] failed: Connection refused (Connection refused)", 1200, 99.0916597853014, 7.967069446288673], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: loadtest-platform.dev.govirto.com:443 failed to respond", 1, 0.08257638315441784, 0.006639224538573895], "isController": false}, {"data": ["Test failed: text expected not to contain /&quot;errors&quot;:/", 4, 0.33030553261767137, 0.02655689815429558], "isController": false}, {"data": ["401/Unauthorized", 5, 0.41288191577208916, 0.03319612269286947], "isController": false}, {"data": ["404/Not Found", 1, 0.08257638315441784, 0.006639224538573895], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 15062, 1211, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to loadtest-platform.dev.govirto.com:443 [loadtest-platform.dev.govirto.com/168.62.24.35] failed: Connection refused (Connection refused)", 1200, "401/Unauthorized", 5, "Test failed: text expected not to contain /&quot;errors&quot;:/", 4, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: loadtest-platform.dev.govirto.com:443 failed to respond", 1, "404/Not Found", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get product detail  ", 4792, 15, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to loadtest-platform.dev.govirto.com:443 [loadtest-platform.dev.govirto.com/168.62.24.35] failed: Connection refused (Connection refused)", 15, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Create order from cart", 607, 134, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to loadtest-platform.dev.govirto.com:443 [loadtest-platform.dev.govirto.com/168.62.24.35] failed: Connection refused (Connection refused)", 129, "Test failed: text expected not to contain /&quot;errors&quot;:/", 4, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: loadtest-platform.dev.govirto.com:443 failed to respond", 1, null, null, null, null], "isController": false}, {"data": ["Add payment method", 607, 130, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to loadtest-platform.dev.govirto.com:443 [loadtest-platform.dev.govirto.com/168.62.24.35] failed: Connection refused (Connection refused)", 129, "404/Not Found", 1, null, null, null, null, null, null], "isController": false}, {"data": ["Get cart", 607, 132, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to loadtest-platform.dev.govirto.com:443 [loadtest-platform.dev.govirto.com/168.62.24.35] failed: Connection refused (Connection refused)", 132, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["SignIn", 612, 130, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to loadtest-platform.dev.govirto.com:443 [loadtest-platform.dev.govirto.com/168.62.24.35] failed: Connection refused (Connection refused)", 130, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Remove  cart", 607, 130, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to loadtest-platform.dev.govirto.com:443 [loadtest-platform.dev.govirto.com/168.62.24.35] failed: Connection refused (Connection refused)", 130, null, null, null, null, null, null, null, null], "isController": false}, {"data": [" Search 50 products  with prices, availability, tax, discounts", 612, 130, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to loadtest-platform.dev.govirto.com:443 [loadtest-platform.dev.govirto.com/168.62.24.35] failed: Connection refused (Connection refused)", 130, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Add  SKU to cart", 4792, 15, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to loadtest-platform.dev.govirto.com:443 [loadtest-platform.dev.govirto.com/168.62.24.35] failed: Connection refused (Connection refused)", 15, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Add delivery  address", 607, 130, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to loadtest-platform.dev.govirto.com:443 [loadtest-platform.dev.govirto.com/168.62.24.35] failed: Connection refused (Connection refused)", 130, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Get me", 612, 130, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to loadtest-platform.dev.govirto.com:443 [loadtest-platform.dev.govirto.com/168.62.24.35] failed: Connection refused (Connection refused)", 130, null, null, null, null, null, null, null, null], "isController": false}, {"data": [" Logout", 607, 135, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to loadtest-platform.dev.govirto.com:443 [loadtest-platform.dev.govirto.com/168.62.24.35] failed: Connection refused (Connection refused)", 130, "401/Unauthorized", 5, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
