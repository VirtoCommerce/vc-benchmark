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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5861368096439585, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7681130035144633, 500, 1500, "Get product detail  "], "isController": false}, {"data": [0.600828729281768, 500, 1500, "Create order from cart"], "isController": false}, {"data": [0.6662068965517242, 500, 1500, "Add payment method"], "isController": false}, {"data": [0.7579092159559835, 500, 1500, "Get cart"], "isController": false}, {"data": [0.7287798408488063, 500, 1500, "SignIn"], "isController": false}, {"data": [0.8984806629834254, 500, 1500, "Remove  cart"], "isController": false}, {"data": [0.48804780876494025, 500, 1500, " Search 50 products  with prices, availability, tax, discounts"], "isController": false}, {"data": [0.26393021368677305, 500, 1500, "Add  SKU to cart"], "isController": false}, {"data": [0.6779310344827586, 500, 1500, "Add delivery  address"], "isController": false}, {"data": [0.8938992042440318, 500, 1500, "Get me"], "isController": false}, {"data": [0.9785911602209945, 500, 1500, " Logout"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21402, 0, 0.0, 2482.950845715361, 2, 24395, 627.0, 10491.900000000001, 13102.750000000004, 17802.960000000006, 11.871776822577344, 24.425081284949826, 32.71570803746804], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get product detail  ", 7398, 0, 0.0, 524.3404974317366, 18, 5019, 388.0, 1145.1000000000004, 1558.0, 2621.3100000000068, 4.115178265984698, 5.334531629383641, 12.754811197319126], "isController": false}, {"data": ["Create order from cart", 724, 0, 0.0, 948.7859116022095, 138, 4780, 813.5, 1935.5, 2697.0, 4118.75, 0.40837507332701595, 0.12243276124159559, 0.8354311293629574], "isController": false}, {"data": ["Add payment method", 725, 0, 0.0, 755.0799999999982, 75, 6687, 602.0, 1656.6, 2228.8999999999996, 3510.9400000000005, 0.40808446278917004, 0.10920491936673171, 0.9619645755949731], "isController": false}, {"data": ["Get cart", 727, 0, 0.0, 517.7207702888578, 49, 3550, 346.0, 1142.6000000000001, 1477.000000000001, 2338.480000000001, 0.40843063757876474, 0.3521389842900273, 3.9522212699664716], "isController": false}, {"data": ["SignIn", 754, 0, 0.0, 540.3899204244032, 45, 4164, 501.5, 1138.5, 1342.25, 1907.7000000000012, 0.41898851504691115, 1.11123807754705, 0.751790629765022], "isController": false}, {"data": ["Remove  cart", 724, 0, 0.0, 296.71823204419906, 7, 3122, 145.0, 762.5, 1004.25, 2201.25, 0.4091447236436485, 0.08830174211449836, 0.7790701052389173], "isController": false}, {"data": [" Search 50 products  with prices, availability, tax, discounts", 753, 0, 0.0, 1247.419654714474, 96, 6006, 1220.0, 2667.2000000000003, 3013.5, 4434.280000000004, 0.41961315345135997, 15.502461544168046, 1.223673066568311], "isController": false}, {"data": ["Add  SKU to cart", 7394, 0, 0.0, 6121.783337841494, 220, 24395, 4491.5, 14159.0, 16282.5, 20109.750000000004, 4.111363800648343, 1.3251472508312805, 9.145544764217956], "isController": false}, {"data": ["Add delivery  address", 725, 0, 0.0, 684.6317241379302, 74, 3377, 592.0, 1421.9999999999998, 1878.0999999999972, 2789.7, 0.40821865204511915, 0.18141755968015927, 1.0448016583460444], "isController": false}, {"data": ["Get me", 754, 0, 0.0, 297.8289124668434, 4, 3335, 147.0, 663.5, 990.0, 2125.7500000000064, 0.4191597126365535, 0.18118043074497578, 0.7621194754930547], "isController": false}, {"data": [" Logout", 724, 0, 0.0, 142.72651933701653, 2, 2221, 80.5, 321.0, 430.5, 1108.5, 0.4092113243016701, 0.2249863042791409, 0.690880806533477], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21402, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
