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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6687931951089846, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8630769230769231, 500, 1500, "Get product detail  "], "isController": false}, {"data": [0.6276041666666666, 500, 1500, "Create order from cart"], "isController": false}, {"data": [0.7916666666666666, 500, 1500, "Add payment method"], "isController": false}, {"data": [0.8619791666666666, 500, 1500, "Get cart"], "isController": false}, {"data": [0.8299492385786802, 500, 1500, "SignIn"], "isController": false}, {"data": [0.9427083333333334, 500, 1500, "Remove  cart"], "isController": false}, {"data": [0.5355329949238579, 500, 1500, " Search 50 products  with prices, availability, tax, discounts"], "isController": false}, {"data": [0.3556410256410256, 500, 1500, "Add  SKU to cart"], "isController": false}, {"data": [0.75, 500, 1500, "Add delivery  address"], "isController": false}, {"data": [0.8883248730964467, 500, 1500, "Get me"], "isController": false}, {"data": [0.9921875, 500, 1500, " Logout"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 5643, 0, 0.0, 1569.4699627857526, 3, 16575, 445.0, 6348.800000000001, 7874.000000000001, 9858.12, 3.129512920679076, 6.413906194195067, 8.626862082371131], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get product detail  ", 1950, 0, 0.0, 327.9620512820513, 22, 9836, 105.0, 760.0, 978.3499999999995, 1981.800000000001, 1.093400514851463, 1.427043183572975, 3.3889173589667534], "isController": false}, {"data": ["Create order from cart", 192, 0, 0.0, 943.4270833333335, 161, 4713, 901.0, 1865.3000000000002, 2300.8499999999995, 4157.789999999996, 0.11217901901784932, 0.03363179574070287, 0.22948633913703953], "isController": false}, {"data": ["Add payment method", 192, 0, 0.0, 452.8593750000001, 81, 1821, 151.5, 1052.0, 1220.75, 1568.0399999999981, 0.11214612640270272, 0.03000785022884819, 0.264355197009203], "isController": false}, {"data": ["Get cart", 192, 0, 0.0, 279.7447916666667, 54, 1266, 81.0, 805.5000000000002, 920.0999999999999, 1113.4799999999989, 0.11216112880829385, 0.09669652981061709, 1.0853355421384103], "isController": false}, {"data": ["SignIn", 197, 0, 0.0, 363.45685279187825, 56, 2798, 120.0, 949.0000000000002, 1147.9999999999998, 1809.1800000000103, 0.11114076118445586, 0.29476366932633463, 0.20139139188711935], "isController": false}, {"data": ["Remove  cart", 192, 0, 0.0, 221.5729166666666, 9, 2696, 57.5, 517.5000000000005, 800.75, 2300.7499999999973, 0.11229120853413184, 0.024234723716839005, 0.21381523636714547], "isController": false}, {"data": [" Search 50 products  with prices, availability, tax, discounts", 197, 0, 0.0, 1040.9796954314727, 114, 5557, 741.0, 2077.2000000000003, 2532.7999999999997, 4015.460000000016, 0.11158817731757882, 4.122200958199748, 0.3254111229551608], "isController": false}, {"data": ["Add  SKU to cart", 1950, 0, 0.0, 3793.468717948716, 254, 16575, 2939.0, 8575.9, 9350.849999999995, 10974.68, 1.095897185736027, 0.3531996281396049, 2.4377455758068614], "isController": false}, {"data": ["Add delivery  address", 192, 0, 0.0, 505.0468750000001, 92, 2090, 493.5, 951.7, 1146.8999999999996, 1739.3899999999974, 0.112165781024354, 0.04983928746687604, 0.28707566502040016], "isController": false}, {"data": ["Get me", 197, 0, 0.0, 336.8629441624367, 27, 7289, 237.0, 691.6, 845.9999999999998, 1904.8800000000563, 0.11120770437943843, 0.048042557410271754, 0.20219572591252413], "isController": false}, {"data": [" Logout", 192, 0, 0.0, 80.12499999999999, 3, 1316, 27.5, 210.80000000000007, 354.35, 745.9099999999958, 0.11229679106070753, 0.061741302116385094, 0.18958993759339787], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 5643, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
