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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.48460322240626413, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.652521774356897, 500, 1500, "Get product detail  "], "isController": false}, {"data": [0.4893162393162393, 500, 1500, "Create order from cart"], "isController": false}, {"data": [0.6180851063829788, 500, 1500, "Get cart"], "isController": false}, {"data": [0.6044921875, 500, 1500, "SignIn"], "isController": false}, {"data": [0.8579059829059829, 500, 1500, "Remove  cart"], "isController": false}, {"data": [0.4453125, 500, 1500, " Search 50 products  with prices, availability, tax, discounts"], "isController": false}, {"data": [0.18506888168557536, 500, 1500, "Add  SKU to cart"], "isController": false}, {"data": [0.8203125, 500, 1500, "Get me"], "isController": false}, {"data": [0.9057815845824411, 500, 1500, " Logout"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 13282, 0, 0.0, 6022.876072880548, 3, 46394, 903.0, 25503.7, 30239.0, 36864.34, 7.324492325882005, 16.21130058043238, 20.282249723821916], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get product detail  ", 4937, 0, 0.0, 1030.806765242048, 17, 10971, 338.0, 2818.2, 4135.099999999999, 6950.699999999996, 2.7436953914586986, 3.5585545051039293, 8.50395955341731], "isController": false}, {"data": ["Create order from cart", 468, 0, 0.0, 1509.2970085470083, 127, 9541, 1069.5, 3612.1000000000004, 4864.199999999999, 6584.1, 0.2621600531938433, 0.07859681282276355, 0.5363129091349335], "isController": false}, {"data": ["Get cart", 470, 0, 0.0, 1030.7063829787248, 53, 7015, 398.5, 2933.4000000000015, 3580.5, 5352.8200000000015, 0.2630511130700024, 0.22742213844464035, 2.5454420141949656], "isController": false}, {"data": ["SignIn", 512, 0, 0.0, 998.6308593750007, 41, 6929, 656.5, 2415.2, 3395.299999999999, 5283.18, 0.28467566434515146, 0.7550137380680864, 0.49387824391950574], "isController": false}, {"data": ["Remove  cart", 468, 0, 0.0, 359.20726495726456, 9, 5819, 123.0, 998.4000000000008, 1442.749999999998, 2740.38, 0.2623036085802425, 0.056631245754380694, 0.4994639861839421], "isController": false}, {"data": [" Search 50 products  with prices, availability, tax, discounts", 512, 0, 0.0, 2275.462890625001, 95, 12893, 1579.0, 5431.499999999999, 7390.449999999999, 11698.500000000002, 0.2841060425803932, 10.496111788410083, 0.828505345577268], "isController": false}, {"data": ["Add  SKU to cart", 4936, 0, 0.0, 14478.739870340374, 375, 46394, 15949.0, 31860.6, 34684.899999999994, 39552.26, 2.7237235994426743, 0.879917448681869, 6.058799654085448], "isController": false}, {"data": ["Get me", 512, 0, 0.0, 533.3007812499999, 4, 6623, 147.0, 1577.4999999999998, 2545.299999999995, 5019.690000000003, 0.28474500862021024, 0.12308239426338914, 0.5177247641607808], "isController": false}, {"data": [" Logout", 467, 0, 0.0, 281.38972162740896, 3, 3266, 126.0, 742.5999999999999, 1203.1999999999964, 2187.359999999999, 0.26224360353034926, 0.14418276248787754, 0.44275214589111445], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 13282, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
