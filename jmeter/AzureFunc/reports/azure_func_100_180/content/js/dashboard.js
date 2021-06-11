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

    var data = {"OkPercent": 91.90266414936019, "KoPercent": 8.097335850639816};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3765470946087686, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.42812321734169995, 500, 1500, "Get product detail  "], "isController": false}, {"data": [0.21935483870967742, 500, 1500, "Create order from cart"], "isController": false}, {"data": [0.31875, 500, 1500, "Add payment method"], "isController": false}, {"data": [0.16857142857142857, 500, 1500, "Get cart"], "isController": false}, {"data": [0.5838926174496645, 500, 1500, "Remove  cart"], "isController": false}, {"data": [0.29411764705882354, 500, 1500, " Search 50 products  with prices, availability, tax, discounts"], "isController": false}, {"data": [0.33371958285052145, 500, 1500, "Add  SKU to cart"], "isController": false}, {"data": [0.3614457831325301, 500, 1500, "Add delivery  address"], "isController": false}, {"data": [0.5591836734693878, 500, 1500, "Get me"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4767, 386, 8.097335850639816, 2182.1369834277307, 115, 179972, 1052.0, 3177.199999999998, 5003.199999999974, 27226.519999999568, 18.72841635465735, 41.28650634814543, 29.336626875248005], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get product detail  ", 1753, 158, 9.01312036508842, 1891.4386765544768, 143, 154800, 815.0, 2722.600000000002, 3934.199999999999, 28073.500000000106, 7.054098862008466, 8.360850681869396, 12.998037129337888], "isController": false}, {"data": ["Create order from cart", 155, 21, 13.548387096774194, 2218.8967741935485, 202, 30063, 1560.0, 4175.2, 4984.999999999995, 28089.55999999999, 0.7867141740516288, 1.5030493501360256, 0.620875698526053], "isController": false}, {"data": ["Add payment method", 160, 21, 13.125, 2452.9999999999995, 342, 67311, 1209.5, 3328.4000000000005, 6090.399999999992, 64645.29999999994, 0.7847599615467619, 1.0972892750902474, 0.8622971579427519], "isController": false}, {"data": ["Get cart", 175, 10, 5.714285714285714, 5351.097142857143, 213, 94792, 3005.0, 10539.2, 14223.199999999999, 94592.12, 0.7879617455829115, 20.32260631292437, 6.634690663103578], "isController": false}, {"data": ["Remove  cart", 149, 4, 2.684563758389262, 1715.214765100671, 169, 65062, 645.0, 1969.0, 4087.5, 53148.0, 0.7337804962129048, 0.27008427856819234, 0.47514230078352], "isController": false}, {"data": [" Search 50 products  with prices, availability, tax, discounts", 238, 28, 11.764705882352942, 1984.3067226890753, 228, 17203, 1144.5, 4050.2999999999997, 5670.049999999988, 15639.86999999995, 1.3291634089132134, 7.917497102926394, 2.208369619471127], "isController": false}, {"data": ["Add  SKU to cart", 1726, 119, 6.8945538818076475, 2118.575898030127, 155, 177829, 1277.0, 2798.699999999999, 4326.999999999997, 23449.87000000001, 6.991392405063291, 6.2434493670886075, 6.642120253164557], "isController": false}, {"data": ["Add delivery  address", 166, 15, 9.036144578313253, 1861.6746987951806, 140, 21925, 1093.5, 3110.6000000000004, 8007.950000000009, 17901.650000000074, 0.9128553124329795, 1.4028792061458257, 1.187704326989172], "isController": false}, {"data": ["Get me", 245, 10, 4.081632653061225, 2939.4775510204076, 115, 179972, 662.0, 3819.6000000000013, 5717.499999999998, 76140.37999999938, 0.9625584410482065, 0.5055887321730248, 0.4624639040584607], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, 0.25906735751295334, 0.020977554017201593], "isController": false}, {"data": ["502/Bad Gateway", 7, 1.8134715025906736, 0.14684287812041116], "isController": false}, {"data": ["503/Server has been shutdown", 1, 0.25906735751295334, 0.020977554017201593], "isController": false}, {"data": ["Test failed: text expected not to contain /&quot;errors&quot;:/", 337, 87.30569948186529, 7.0694357037969375], "isController": false}, {"data": ["500/Internal Server Error", 35, 9.067357512953368, 0.7342143906020558], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 5, 1.2953367875647668, 0.10488777008600797], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4767, 386, "Test failed: text expected not to contain /&quot;errors&quot;:/", 337, "500/Internal Server Error", 35, "502/Bad Gateway", 7, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 5, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get product detail  ", 1753, 158, "Test failed: text expected not to contain /&quot;errors&quot;:/", 146, "500/Internal Server Error", 8, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2, "502/Bad Gateway", 1, "503/Server has been shutdown", 1], "isController": false}, {"data": ["Create order from cart", 155, 21, "Test failed: text expected not to contain /&quot;errors&quot;:/", 19, "500/Internal Server Error", 2, null, null, null, null, null, null], "isController": false}, {"data": ["Add payment method", 160, 21, "Test failed: text expected not to contain /&quot;errors&quot;:/", 17, "500/Internal Server Error", 3, "502/Bad Gateway", 1, null, null, null, null], "isController": false}, {"data": ["Get cart", 175, 10, "Test failed: text expected not to contain /&quot;errors&quot;:/", 6, "500/Internal Server Error", 3, "502/Bad Gateway", 1, null, null, null, null], "isController": false}, {"data": ["Remove  cart", 149, 4, "Test failed: text expected not to contain /&quot;errors&quot;:/", 3, "502/Bad Gateway", 1, null, null, null, null, null, null], "isController": false}, {"data": [" Search 50 products  with prices, availability, tax, discounts", 238, 28, "Test failed: text expected not to contain /&quot;errors&quot;:/", 27, "500/Internal Server Error", 1, null, null, null, null, null, null], "isController": false}, {"data": ["Add  SKU to cart", 1726, 119, "Test failed: text expected not to contain /&quot;errors&quot;:/", 101, "500/Internal Server Error", 12, "502/Bad Gateway", 3, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1], "isController": false}, {"data": ["Add delivery  address", 166, 15, "Test failed: text expected not to contain /&quot;errors&quot;:/", 14, "500/Internal Server Error", 1, null, null, null, null, null, null], "isController": false}, {"data": ["Get me", 245, 10, "500/Internal Server Error", 5, "Test failed: text expected not to contain /&quot;errors&quot;:/", 4, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
