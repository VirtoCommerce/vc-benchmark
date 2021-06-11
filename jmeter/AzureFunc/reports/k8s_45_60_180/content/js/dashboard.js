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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3158347676419966, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.48414376321353064, 500, 1500, "Get product detail  "], "isController": false}, {"data": [0.02631578947368421, 500, 1500, "Create order from cart"], "isController": false}, {"data": [0.175, 500, 1500, "Add payment method"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "Get cart"], "isController": false}, {"data": [0.5294117647058824, 500, 1500, "Remove  cart"], "isController": false}, {"data": [0.26229508196721313, 500, 1500, " Search 50 products  with prices, availability, tax, discounts"], "isController": false}, {"data": [0.08531317494600432, 500, 1500, "Add  SKU to cart"], "isController": false}, {"data": [0.1956521739130435, 500, 1500, "Add delivery  address"], "isController": false}, {"data": [0.9193548387096774, 500, 1500, "Get me"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1162, 0, 0.0, 6058.856282271947, 4, 61002, 1895.5, 18161.600000000002, 33870.44999999998, 47142.66999999999, 5.913967549520572, 19.97113155524114, 8.700334696463834], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get product detail  ", 473, 0, 0.0, 2970.1670190274854, 31, 31884, 896.0, 10764.400000000003, 14354.099999999991, 24624.399999999998, 2.5581948771201106, 3.3768878011152217, 4.684194721289265], "isController": false}, {"data": ["Create order from cart", 19, 0, 0.0, 5787.578947368422, 1395, 18106, 4196.0, 16503.0, 18106.0, 18106.0, 0.14171278547667707, 0.16769394839789964, 0.11015954808538567], "isController": false}, {"data": ["Add payment method", 20, 0, 0.0, 5817.35, 922, 47200, 1942.0, 28267.800000000057, 46384.39999999999, 47200.0, 0.16218758616215517, 0.043397850203545425, 0.1766007407917998], "isController": false}, {"data": ["Get cart", 24, 0, 0.0, 5937.291666666668, 402, 33406, 1707.0, 20654.0, 30854.75, 33406.0, 0.18405613712182214, 6.335632237624141, 1.5475813873231334], "isController": false}, {"data": ["Remove  cart", 17, 0, 0.0, 4172.470588235294, 112, 16424, 700.0, 14079.999999999998, 16424.0, 16424.0, 0.1552511415525114, 0.03350634988584475, 0.09869970034246575], "isController": false}, {"data": [" Search 50 products  with prices, availability, tax, discounts", 61, 0, 0.0, 4218.196721311475, 237, 31101, 1695.0, 13198.000000000002, 23032.999999999985, 31101.0, 0.35542607428987616, 13.130274717771304, 0.5856586853605243], "isController": false}, {"data": ["Add  SKU to cart", 463, 0, 0.0, 10145.427645788337, 230, 61002, 3804.0, 38102.000000000015, 42771.2, 52823.00000000003, 2.386622542500438, 0.7597180850446912, 2.242120005747482], "isController": false}, {"data": ["Add delivery  address", 23, 0, 0.0, 9823.913043478262, 609, 31897, 3593.0, 30272.600000000006, 31875.8, 31897.0, 0.17281928362649998, 0.1771045443957712, 0.22311239546311812], "isController": false}, {"data": ["Get me", 62, 0, 0.0, 244.69354838709674, 4, 2753, 76.0, 684.8000000000002, 1099.1, 2753.0, 0.34429142603287427, 0.09750440776321634, 0.1613866059529098], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1162, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
