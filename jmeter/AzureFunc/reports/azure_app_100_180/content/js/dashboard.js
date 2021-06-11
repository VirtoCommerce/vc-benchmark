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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.08205841446453407, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.08596491228070176, 500, 1500, "Get product detail  "], "isController": false}, {"data": [0.0, 500, 1500, "Create order from cart"], "isController": false}, {"data": [0.0, 500, 1500, "Add payment method"], "isController": false}, {"data": [0.0, 500, 1500, "Get cart"], "isController": false}, {"data": [0.7727272727272727, 500, 1500, "Remove  cart"], "isController": false}, {"data": [0.019230769230769232, 500, 1500, " Search 50 products  with prices, availability, tax, discounts"], "isController": false}, {"data": [0.00842358604091456, 500, 1500, "Add  SKU to cart"], "isController": false}, {"data": [0.0, 500, 1500, "Add delivery  address"], "isController": false}, {"data": [0.5269230769230769, 500, 1500, "Get me"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2157, 0, 0.0, 4282.3402874362455, 208, 31223, 3505.0, 7338.8, 8179.5, 16761.720000000016, 11.629160781100053, 21.356409205138505, 19.14803706525431], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get product detail  ", 855, 0, 0.0, 2580.589473684209, 583, 16671, 2432.0, 4060.6, 4531.2, 5974.639999999963, 5.523398537429908, 5.4195067621256365, 11.052191018744026], "isController": false}, {"data": ["Create order from cart", 38, 0, 0.0, 9012.552631578952, 5991, 22162, 7740.5, 13535.500000000002, 17905.04999999999, 22162.0, 0.5023066449881693, 0.5920227012861694, 0.4758178180063714], "isController": false}, {"data": ["Add payment method", 43, 0, 0.0, 6749.953488372093, 5127, 16887, 6213.0, 8313.400000000001, 11095.199999999995, 16887.0, 0.5496612552729132, 0.1889460565000639, 0.6919075762175636], "isController": false}, {"data": ["Get cart", 51, 0, 0.0, 3427.588235294118, 2038, 6205, 3243.0, 4551.6, 4925.599999999999, 6205.0, 0.5928646989758553, 20.382686988508887, 5.085667495902259], "isController": false}, {"data": ["Remove  cart", 33, 0, 0.0, 605.7878787878788, 339, 1519, 452.0, 1077.8, 1455.9999999999998, 1519.0, 0.5183056118362154, 0.15134118939358243, 0.41758020484851344], "isController": false}, {"data": [" Search 50 products  with prices, availability, tax, discounts", 130, 0, 0.0, 5811.307692307693, 821, 31223, 2483.5, 22429.50000000001, 28268.85, 30811.94, 0.7165455888351173, 4.494138192017682, 1.3024637110998425], "isController": false}, {"data": ["Add  SKU to cart", 831, 0, 0.0, 6110.643802647412, 1221, 19697, 6373.0, 7969.6, 8452.199999999999, 11864.039999999992, 5.397155289991557, 2.1285092063388973, 5.987469149834383], "isController": false}, {"data": ["Add delivery  address", 46, 0, 0.0, 5155.369565217391, 3897, 9231, 4798.0, 7459.200000000006, 8754.4, 9231.0, 0.5467143655142086, 0.560038671127539, 0.7987155183684143], "isController": false}, {"data": ["Get me", 130, 0, 0.0, 1019.3769230769233, 208, 3198, 920.5, 1857.4, 2390.8499999999963, 3121.1199999999994, 0.7260703953174045, 0.6117219440115949, 0.3417636040458877], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2157, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
