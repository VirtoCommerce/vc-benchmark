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

    var data = {"OkPercent": 99.91050119331742, "KoPercent": 0.08949880668257756};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.1725338106603023, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.1579475419234628, 500, 1500, "Get product detail  "], "isController": false}, {"data": [0.0022222222222222222, 500, 1500, "Create order from cart"], "isController": false}, {"data": [0.0014814814814814814, 500, 1500, "Add payment method"], "isController": false}, {"data": [0.03240058910162003, 500, 1500, "Get cart"], "isController": false}, {"data": [0.4978693181818182, 500, 1500, "SignIn"], "isController": false}, {"data": [0.39020771513353114, 500, 1500, "Remove  cart"], "isController": false}, {"data": [0.04758522727272727, 500, 1500, " Search 50 products  with prices, availability, tax, discounts"], "isController": false}, {"data": [0.07929104477611941, 500, 1500, "Add  SKU to cart"], "isController": false}, {"data": [0.0014749262536873156, 500, 1500, "Add delivery  address"], "isController": false}, {"data": [0.6882102272727273, 500, 1500, "Get me"], "isController": false}, {"data": [0.9770029673590505, 500, 1500, " Logout"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20112, 18, 0.08949880668257756, 2641.794202466176, 6, 35779, 2361.0, 4812.0, 5538.0, 8708.790000000034, 11.161180048391751, 36.556475526995605, 30.725512514844947], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get product detail  ", 6977, 0, 0.0, 2426.0411351583716, 22, 35779, 2151.0, 4163.4, 5031.799999999996, 7756.020000000049, 3.8748496322863777, 5.02490165875165, 12.009934500143286], "isController": false}, {"data": ["Create order from cart", 675, 0, 0.0, 2891.3229629629623, 1317, 6920, 2840.0, 3592.0, 3855.3999999999996, 4626.68, 0.3766480444433532, 0.45513981855468705, 0.7705247943571427], "isController": false}, {"data": ["Add payment method", 675, 0, 0.0, 5426.3792592592545, 818, 34187, 5180.0, 6428.599999999999, 6951.999999999998, 13460.120000000003, 0.377170616900261, 0.10092260647526514, 0.8879863379373293], "isController": false}, {"data": ["Get cart", 679, 0, 0.0, 2263.5861561119295, 321, 9213, 2154.0, 2922.0, 3316.0, 5149.200000000008, 0.378700416180045, 13.413118132394837, 3.664533387510081], "isController": false}, {"data": ["SignIn", 704, 0, 0.0, 944.2897727272727, 129, 2482, 904.5, 1354.5, 1546.25, 1910.8000000000002, 0.39325390796071036, 1.0429856301726295, 0.70424206768045], "isController": false}, {"data": ["Remove  cart", 674, 16, 2.373887240356083, 1452.9599406528193, 348, 14847, 1179.5, 1800.0, 2381.75, 10743.25, 0.3802650345736518, 0.16322929061247493, 0.7240780124438065], "isController": false}, {"data": [" Search 50 products  with prices, availability, tax, discounts", 704, 0, 0.0, 3412.190340909089, 290, 23301, 2367.5, 6592.0, 7237.5, 8888.950000000003, 0.39285407368469216, 14.511965591682042, 1.145641095891271], "isController": false}, {"data": ["Add  SKU to cart", 6968, 2, 0.02870264064293915, 3017.0374569460373, 95, 30364, 2843.0, 4621.1, 5198.649999999998, 9639.109999999908, 3.869511712936431, 1.2411840258804139, 8.581114597632979], "isController": false}, {"data": ["Add delivery  address", 678, 0, 0.0, 5045.979351032446, 815, 34074, 4831.0, 5902.2, 6340.8499999999985, 13207.910000000007, 0.37790977989263574, 0.39453456167482037, 0.9661207087313324], "isController": false}, {"data": ["Get me", 704, 0, 0.0, 590.5042613636352, 38, 2021, 571.5, 915.5, 1014.75, 1348.1500000000035, 0.39330993213727633, 0.17002278746402807, 0.7151198792192128], "isController": false}, {"data": [" Logout", 674, 0, 0.0, 219.5682492581602, 6, 1284, 194.0, 390.0, 486.25, 696.5, 0.38031610249349684, 0.209099575882655, 0.6420953128438504], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected not to contain /&quot;errors&quot;:/", 18, 100.0, 0.08949880668257756], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20112, 18, "Test failed: text expected not to contain /&quot;errors&quot;:/", 18, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Remove  cart", 674, 16, "Test failed: text expected not to contain /&quot;errors&quot;:/", 16, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["Add  SKU to cart", 6968, 2, "Test failed: text expected not to contain /&quot;errors&quot;:/", 2, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
