filtervalues = Vue.component('filter-values', {
    props: ['websiteText', 'classValue', 'classLabel', 'currentFilter', 'appliedFilters', 'totalValues', 'appliedRanges', 'appliedQuantities'],
    data() {
        return {
            items: [],
            itemsType: '',
            fullPropertyValues: [],
            displayCount: 1,
            currentPage: 1,
            filterProperty: "",
            query: "",
            noValueURL: ""
        }
    },
    template: `
    <div v-if="websiteText!=''">
        <div class="header">
            <p class="heading"> 
                {{ classLabel }} 
                <a 
                    title="superclass" 
                    :href="pathForView('superclass')" 
                    onclick="return false;" 
                    class="classOptions" 
                    @click.exact="changePage('superclass')" 
                    @click.ctrl="window.open(pathForView('superclass'))">
                    &uarr;
                </a>
                <a 
                    title="subclass" 
                    :href="pathForView('subclass')" 
                    onclick="return false;" 
                    class="classOptions" 
                    @click.exact="changePage('subclass')" 
                    @click.ctrl="window.open(pathForView('subclass'))">
                    &darr;
                </a>
            </p>
            <p v-for="filter in appliedFilters">
                <b>{{filter.filterValueLabel}}</b>: 
                <span 
                    v-if="filter.value == 'novalue'" 
                    :style="{ fontStyle: 'italic' }">{{ filter.valueLabel }}
                </span>
                <span v-else>
                    {{ filter.valueLabel }}
                </span> 
                ( <a @click="removeFilter(filter)">X</a> )
            </p>
            <p v-for="range in appliedRanges">
                <b>{{range.filterValueLabel}}</b>: 
                <span
                    v-if="range.valueLL == 'novalue'" 
                    :style="{ fontStyle: 'italic' }">
                    {{ range.valueLabel }}
                </span>
                <span v-else>
                    {{ range.valueLabel }}
                </span> 
                ( <a @click="removeRange(range)">X</a> )</p>
            <p v-for="quantity in appliedQuantities">
                <b>{{quantity.filterValueLabel}}</b>: 
                <span 
                    v-if="quantity.valueLL == 'novalue'" 
                    :style="{ fontStyle: 'italic' }">
                    {{ quantity.valueLabel }}
                </span>
                <span v-else>
                    {{ quantity.valueLabel }}
                </span> 
                {{quantity.unit}}
                ( <a @click="removeQuantity(quantity)">X</a> )
            </p>
        </div>
        <div class="content">
            <div v-if="itemsType==''">
                <a @click="changePage('view-all-items')">{{ websiteText.viewList }}</a>
                <p v-html="displayMessage(websiteText.gettingValues, currentFilter.valueLabel)"></p>
                <img src='images/loading.gif'>
            </div>
            <div v-else-if="itemsType=='Additionalempty'">
                <a @click="changePage('view-all-items')">{{ websiteText.viewList }}</a>
                <p v-html="displayMessage(websiteText.noAdditionalValues, currentFilter.valueLabel)"></p>
            </div>
            <div v-else-if="itemsType=='Error'">
                <a @click="changePage('view-all-items')">{{ websiteText.viewList }}</a>
                <p v-html="displayMessage(websiteText.filterError, currentFilter.valueLabel)"></p>
            </div>
            <div v-else-if="itemsType=='Item'">
                <p v-if="totalValues!=''" v-html="displayMessage(websiteText.itemCount.split('|')[(totalValues>1?0:1)], (totalValues<1000000?numberWithCommas(totalValues):'1 million +'))"></p>
                <a @click="changePage('view-all-items')">{{ websiteText.viewList }}</a>
                <p v-if="appliedFilters.findIndex(filter => filter.filterValue == currentFilter.value) != -1" v-html="displayMessage(websiteText.selectAdditionalValue, currentFilter.valueLabel)"></p>
                <p v-else v-html="displayMessage(websiteText.selectValue, currentFilter.valueLabel)"></p>
                <div v-if="items.length>resultsPerPage && itemsType=='Item'" style="text-align: center">
                    <a v-if="currentPage>1" @click="currentPage>1?currentPage--:''">&lt;</a>
                    <input 
                        v-model.lazy="currentPage" 
                        type="text" 
                        style="margin-bottom: 15px;width: 48px;text-align: center"> 
                    {{items.length<1000000?" / " + Math.ceil(items.length/resultsPerPage):''}}
                    <a v-if="currentPage<items.length/resultsPerPage" @click="currentPage<items.length/resultsPerPage?currentPage++:''">&gt;</a>
                </div>
                <ul>
                    <li v-if="appliedFilters.findIndex(filter => filter.filterValue == currentFilter.value) ==-1">
                        <i>
                            <a 
                                :href="noValueURL" 
                                onclick="return false;" 
                                @click.exact="applyFilter('novalue')" 
                                @click.ctrl="window.open(noValueURL, '_blank')">
                                {{ websiteText.noValue }}
                            </a>
                        </i>
                    </li>
                    <li v-for="(item,index) in items" v-if="index < currentPage*resultsPerPage && index >= (currentPage-1)*resultsPerPage">
                        <a 
                            :href="item.href" 
                            onclick="return false;" 
                            @click.exact="applyFilter(item)" 
                            @click.ctrl="window.open(item.href, '_blank')">
                            {{item.valueLabel.value}}
                        </a> 
                        <span class="result-count">
                            {{ websiteText.results.split('|')[((item.count.value)>1?0:1)].replace('$1', numberWithCommas(item.count.value)) }}
                        <span>
                    </li>
                </ul>
            </div>
            <div v-else-if="itemsType=='ItemFail'">
                <p><i v-html="displayMessage(websiteText.filterTimeout, currentFilter.valueLabel)"></i></p>
                <a @click="changePage('view-all-items')">{{ websiteText.viewList }}</a>
                <p v-html="displayMessage(websiteText.selectValue, currentFilter.valueLabel)"></p>
                <ul>
                    <li>
                        <i>
                            <a 
                            :href="noValueURL" 
                            onclick="return false;" 
                            @click.exact="applyFilter('novalue')" 
                            @click.ctrl="window.open(noValueURL, '_blank')">
                            {{ websiteText.noValue }}
                        </i>
                    </li>
                    <li v-for="item in items">
                        <a 
                            :href="item.href" 
                            onclick="return false;" 
                            @click.exact="applyFilter(item)" 
                            @click.ctrl="window.open(item.href, '_blank')">
                            {{item.valueLabel.value}}
                        </a>
                    </li>
                </ul>
            </div>
            <div v-else-if="itemsType=='Time'">
                <p v-if="totalValues!=''" v-html="displayMessage(websiteText.itemCount.split('|')[(totalValues>1?0:1)], (totalValues<1000000?numberWithCommas(totalValues):'1 million +'))"></p>
                <a @click="changePage('view-all-items')">{{ websiteText.viewList }}</a>
                <p v-html="displayMessage(websiteText.selectValue, currentFilter.valueLabel)"></p>
                <ul v-if="displayCount == 1">
                    <li v-if="appliedRanges.findIndex(filter => filter.filterValue == currentFilter.value) ==-1">
                        <i>
                            <a 
                                :href="noValueURL" 
                                onclick="return false;" 
                                @click.exact="applyRange('novalue')" 
                                @click.ctrl="window.open(noValueURL, '_blank')">
                                {{ websiteText.noValue }}
                            </a>
                        </i>
                    </li>
                    <li v-for="item in items" v-if="item.numValues>0">
                        <a 
                            :href="item.href" 
                            onclick="return false;" 
                            @click.exact="applyRange(item)" 
                            @click.ctrl="window.open(item.href, '_blank')">
                            {{item.bucketName}} 
                        </a> 
                        <span class="result-count">
                            {{ websiteText.results.split('|')[(item.numValues>1?0:1)].replace('$1',numberWithCommas(item.numValues)) }}
                        <span>
                    </li>
                </ul>
                <ul v-if="displayCount == 0">
                    <li>
                        <i>
                            <a 
                                :href="noValueURL" 
                                onclick="return false;" 
                                @click.exact="applyFilter('novalue')" 
                                @click.ctrl="window.open(noValueURL, '_blank')">
                                {{ websiteText.noValue }}
                            </a>
                        </i>
                    </li>
                    <li v-for="item in items">
                        <a 
                            :href="item.href" 
                            onclick="return false;" 
                            @click.exact="applyRange(item)" 
                            @click.ctrl="window.open(item.href, '_blank')">
                            {{item.bucketName}} 
                        </a>
                    </li>
                </ul>
            </div>
            <div v-else-if="itemsType=='TimeFail'">
                <p><i v-html="displayMessage(websiteText.filterTimeout, currentFilter.valueLabel)"></i></p>
                <a @click="changePage('view-all-items')">{{ websiteText.viewList }}</a>
                <p v-html="displayMessage(websiteText.selectValue, currentFilter.valueLabel)"></p>
                <ul>
                    <li>
                        <i>
                            <a 
                                :href="noValueURL" 
                                onclick="return false;" 
                                @click.exact="applyFilter('novalue')" 
                                @click.ctrl="window.open(noValueURL, '_blank')">
                                {{ websiteText.noValue }}
                            </a>
                            </i>
                        </li>
                    <li v-for="item in items">
                        <a 
                            :href="item.href" 
                            onclick="return false;" 
                            @click.exact="applyRange(item)" 
                            @click.ctrl="window.open(item.href, '_blank')">
                            {{item.bucketName}} 
                        </a>
                    </li>
                </ul>
            </div>
            <div v-else-if="itemsType=='Quantity'">
                <p v-if="displayCount == 1 && totalValues!=''" v-html="displayMessage(websiteText.itemCount.split('|')[(totalValues>1?0:1)], (totalValues<1000000?numberWithCommas(totalValues):'1 million +'))"></p>
                <p v-if="displayCount == 0"><i v-html="displayMessage(websiteText.filterTimeout, currentFilter.valueLabel)"></i></p>
                <a @click="changePage('view-all-items')">{{ websiteText.viewList }}</a>
                <p v-html="displayMessage(websiteText.selectValue, currentFilter.valueLabel)"></p>
                <ul v-if="displayCount == 1">
                    <li v-if="appliedQuantities.findIndex(filter => filter.filterValue == currentFilter.value) ==-1">
                        <i>
                            <a 
                                :href="noValueURL" 
                                onclick="return false;" 
                                @click.exact="applyQuantityRange('novalue')" 
                                @click.ctrl="window.open(noValueURL, '_blank')">
                                {{ websiteText.noValue }}
                            </a>
                        </i>
                    </li>
                    <li v-for="item in items" v-if="item.numValues>0">
                        <a 
                            :href="item.href" 
                            onclick="return false;" 
                            @click.exact="applyQuantityRange(item)" 
                            @click.ctrl="window.open(item.href, '_blank')">
                            {{item.bucketName}} {{item.unit}} 
                        </a> 
                        <span class="result-count">
                            {{ websiteText.results.split('|')[(item.numValues>1?0:1)].replace('$1',numberWithCommas(item.numValues)) }}
                        <span>
                    </li>
                </ul>
                <ul v-if="displayCount == 0">
                    <li>
                        <i>
                            <a 
                                :href="noValueURL" 
                                onclick="return false;" 
                                @click.exact="applyQuantityRange('novalue')" 
                                @click.ctrl="window.open(noValueURL, '_blank'>
                                {{ websiteText.noValue }}
                            </a>
                        </i>
                    </li>
                    <li v-for="item in items">
                        <a 
                            :href="item.href" 
                            onclick="return false;" 
                            @click.exact="applyQuantityRange(item)" 
                            @click.ctrl="window.open(item.href, '_blank')">
                            {{item.bucketName}} 
                        </a>
                    </li>
                </ul>
            </div>
            <div v-if="items.length>resultsPerPage && itemsType=='Item'" style="text-align: center">
                <a v-if="currentPage>1" @click="currentPage>1?currentPage--:''">&lt;</a>
                <input 
                    v-model.lazy="currentPage" 
                    type="text" 
                    style="margin-bottom: 15px;width: 48px;text-align: center"> 
                {{items.length<1000000?" / " + Math.ceil(items.length/resultsPerPage):''}}
                <a v-if="currentPage<items.length/resultsPerPage" @click="currentPage<items.length/resultsPerPage?currentPage++:''">&gt;</a>
            </div>
            <a :href="query">{{ websiteText.viewQuery }}</a>
        </div>
    </div>`,
    methods: {
        changePage(page) {
            this.$emit('change-page', page)
        },
        pathForView(view) {
            return window.location.href + '&view=' + view;
        },
        displayMessage(message, value){
            return message.replace("$1","<b>"+value+"</b>")
        },
        applyFilter(filter) {
            this.$emit('apply-filter', filter)
        },
        applyRange(range) {
            this.$emit('apply-range', range)
        },
        applyQuantityRange(range) {
            this.$emit('apply-quantity', range)
        },
        removeFilter(value) {
            this.$emit("remove-filter", value, 'filter-values');
        },
        removeRange(range) {
            this.$emit("remove-range", range, 'filter-values');
        },
        removeQuantity(quantity) {
            this.$emit("remove-quantity", quantity, 'filter-values');
        },
        monthNumberToString(monthNum) {
            if (monthNum == 1) {
                return 'January';
            } else if (monthNum == 2) {
                return 'February';
            } else if (monthNum == 3) {
                return 'March';
            } else if (monthNum == 4) {
                return 'April';
            } else if (monthNum == 5) {
                return 'May';
            } else if (monthNum == 6) {
                return 'June';
            } else if (monthNum == 7) {
                return 'July';
            } else if (monthNum == 8) {
                return 'August';
            } else if (monthNum == 9) {
                return 'September';
            } else if (monthNum == 10) {
                return 'October';
            } else if (monthNum == 11) {
                return 'November';
            } else if (monthNum == 12) {
                return 'December';
            }
            return 'Invalid month - ' + monthNum;
        },
        monthStringToNumber(monthName) {
            if (monthName == 'January') {
                return 1;
            } else if (monthName == 'February') {
                return 2;
            } else if (monthName == 'March') {
                return 3;
            } else if (monthName == 'April') {
                return 4;
            } else if (monthName == 'May') {
                return 5;
            } else if (monthName == 'June') {
                return 6;
            } else if (monthName == 'July') {
                return 7;
            } else if (monthName == 'August') {
                return 8;
            } else if (monthName == 'September') {
                return 9;
            } else if (monthName == 'October') {
                return 10;
            } else if (monthName == 'November') {
                return 11;
            } else if (monthName == 'December') {
                return 12;
            }
            return 'Invalid month - ' + monthName;
        },
        parseDate(date) {
            if (date.split("-")[0] == "") {
                year = "-" + "0".repeat(6 - date.split("-")[1].length) + date.split("-")[1]
                return date.replace(/^-(\w+)(?=-)/g, year)
            }
            return date
        },
        yearToBCFormat(year) {
            if (Number(year) < 0) {
                return (Number(year) * -1) + " BC"
            }
            return year
        },
        getUTCTime(date){
            localTime = date.getTime()
            localOffset = date.getTimezoneOffset() * 60000;
            utc = localTime + localOffset;
            return new Date(utc)
        },
        generateDatePropertyValues(dateArray, range) {
            var len = dateArray.length,
                start = 0,
                end = len - 1;
            len > 50000 ? val = 0 : val = 1;
            for (let i = start; i <= end; i++) {
                dateArray[i].time.value = this.parseDate(dateArray[i].time.value)
            }
            ll = earliestDate = this.getUTCTime(new Date(dateArray[start].time.value))
            ul = latestDate = this.getUTCTime(new Date(dateArray[end].time.value))
            index = this.appliedRanges.findIndex(filter => filter.filterValue == range.value);
            if (index != -1) {
                ll = new Date(this.parseDate(String(this.appliedRanges[index].valueLL)));
                ul = new Date(this.parseDate(String(this.appliedRanges[index].valueUL)));
            }
            while (earliestDate < ll || earliestDate == "Invalid Date") {
                start++;
                earliestDate = this.getUTCTime(new Date(dateArray[start].time.value));
            }
            while (latestDate > ul || latestDate == "Invalid Date") {
                latestDate = this.getUTCTime(new Date(dateArray[--end].time.value));
            }
            var earliestYear = earliestDate.getFullYear();
            var earliestMonth = earliestDate.getMonth() + 1;
            var earliestDay = earliestDate.getDate();
            var latestYear = latestDate.getFullYear();
            var latestMonth = latestDate.getMonth() + 1;
            var latestDay = latestDate.getDate();
            var yearDifference = latestYear - earliestYear;
            var monthDifference = (12 * yearDifference) + (latestMonth - earliestMonth);
            var dayDifference = (30 * monthDifference) + (latestDay - earliestDay);
            var propertyValues = [];
            if (yearDifference > 300) {
                // Split into centuries.
                // This, and the other year-based ones, should probably be
                // done as dates instead of just integers, to handle BC years
                // correctly.
                var curYear = iniYear = Math.floor((earliestYear-1) / 100) * 100+1;
                while (curYear <= latestYear) {
                    if(curYear>0){
                        propertyValues.push({
                            bucketName: curYear + " - " + (curYear + 99),
                            bucketLL: curYear + '-01-01',
                            bucketUL: (curYear + 99) + '-12-30',
                            size: 1,
                            numValues: 0
                        });
                    }
                    else{
                        propertyValues.push({
                            bucketName: this.yearToBCFormat(curYear-1) + " - " + this.yearToBCFormat(curYear + 98),
                            bucketLL: curYear-1 + '-01-01',
                            bucketUL: (curYear + 98) + '-12-30',
                            size: 1,
                            numValues: 0
                        });
                    }
                    curYear += 100;
                }
                for (var i = start; i <= end && val != 0; i++) {
                    date = this.getUTCTime(new Date(dateArray[i].time.value));
                    year = Number(date.getFullYear());
                    index = Math.floor((year - iniYear) / 100);
                    propertyValues[index].numValues += 1
                }
            } else if (yearDifference > 150) {
                // Split into fifty-year increments.
                var curYear = iniYear = Math.floor(earliestYear / 50) * 50;
                while (curYear <= latestYear) {
                    propertyValues.push({
                        bucketName: this.yearToBCFormat(curYear) + " - " + this.yearToBCFormat(curYear + 49),
                        bucketLL: curYear + '-01-01',
                        bucketUL: (curYear + 49) + '-12-30',
                        size: 1,
                        numValues: 0
                    });
                    curYear += 50;
                }
                for (var i = start; i <= end && val != 0; i++) {
                    date = this.getUTCTime(new Date(dateArray[i].time.value));
                    year = Number(date.getFullYear());
                    index = Math.floor((year - iniYear) / 50);
                    propertyValues[index].numValues += 1
                }
            } else if (yearDifference > 50) {
                // Split into decades.
                var curYear = iniYear = Math.floor(earliestYear / 10) * 10;
                while (curYear <= latestYear) {
                    propertyValues.push({
                        bucketName: this.yearToBCFormat(curYear) + " - " + this.yearToBCFormat(curYear + 9),
                        bucketLL: curYear + '-01-01',
                        bucketUL: (curYear + 9) + '-12-30',
                        size: 1,
                        numValues: 0
                    });
                    curYear += 10;
                }
                for (var i = start; i <= end && val != 0; i++) {
                    date = this.getUTCTime(new Date(dateArray[i].time.value));
                    year = Number(date.getFullYear());
                    index = Math.floor((year - iniYear) / 10);
                    propertyValues[index].numValues += 1
                }
            } else if (yearDifference > 15) {
                // Split into five-year increments.
                var curYear = iniYear = Math.floor(earliestYear / 5) * 5;
                while (curYear <= latestYear) {
                    propertyValues.push({
                        bucketName: this.yearToBCFormat(curYear) + " - " + this.yearToBCFormat(curYear + 4),
                        bucketLL: curYear + '-01-01',
                        bucketUL: (curYear + 4) + '-12-30',
                        size: 1,
                        numValues: 0
                    });
                    curYear += 5;
                }
                for (var i = start; i <= end && val != 0; i++) {
                    date = this.getUTCTime(new Date(dateArray[i].time.value));
                    year = Number(date.getFullYear());
                    index = Math.floor((year - iniYear) / 5);
                    propertyValues[index].numValues += 1
                }
            } else if (yearDifference > 2) {
                // Split into years.
                var curYear = iniYear = earliestYear;
                while (curYear <= latestYear) {
                    propertyValues.push({
                        bucketName: this.yearToBCFormat(curYear),
                        bucketLL: curYear + '-01-01',
                        bucketUL: curYear + '-12-30',
                        size: 2,
                        numValues: 0
                    });
                    curYear++;
                }
                for (var i = start; i <= end && val != 0; i++) {
                    date = this.getUTCTime(new Date(dateArray[i].time.value));
                    year = Number(date.getFullYear());
                    index = Math.floor(year - iniYear);
                    propertyValues[index].numValues += 1
                }
            } else if (monthDifference > 1) {
                // Split into months.
                var curYear = iniYear = earliestYear;
                var curMonth = iniMonth = earliestMonth;
                // Add in year filter values as well, to handle year-only
                // values.
                while (curYear < latestYear || (curYear == latestYear && curMonth <= latestMonth)) {
                    propertyValues.push({
                        bucketName: this.monthNumberToString(curMonth) + " " + this.yearToBCFormat(curYear),
                        bucketLL: curYear + "-" + curMonth + "-01",
                        bucketUL: curYear + "-" + curMonth + "-30",
                        size: 3,
                        numValues: 0
                    });
                    if (curMonth == 12) {
                        curMonth = 1;
                        curYear++;
                        // Year-only filter value.
                        // propertyValues.push(curYear);
                    } else {
                        curMonth++;
                    }
                }
                for (var i = start; i <= end && val != 0; i++) {
                    date = this.getUTCTime(new Date(dateArray[i].time.value));
                    year = date.getFullYear();
                    month = date.getMonth();
                    index = Math.floor(((year - iniYear) * 12 + month - iniMonth + 1));
                    propertyValues[index].numValues += 1
                }
            } else if (dayDifference > 1) {
                // Split into days.
                var curDay = iniDay = earliestDay
                while (curDay <= latestDay) {
                    propertyValues.push({
                        bucketName: this.monthNumberToString(earliestMonth) + " " + curDay + ", " + earliestYear,
                        bucketLL: earliestYear + "-" + earliestMonth + "-" + curDay,
                        bucketUL: earliestYear + "-" + earliestMonth + "-" + (curDay + 1),
                        size: 4,
                        numValues: 0
                    });
                    curDay += 1;
                }
                for (var i = start; i <= end && val != 0; i++) {
                    date = this.getUTCTime(new Date(dateArray[i].time.value));
                    day = Number(date.getDate());
                    index = Math.floor(day - iniDay);
                    propertyValues[index].numValues += 1
                }
            } else if (dayDifference == 0) {

                var curDate = new Date();
                curDate.setTime(earliestDate.getTime());
                propertyValues.push({
                    bucketName: this.monthNumberToString(curDate.getMonth() + 1) + " " + curDate.getDate() + ", " + curDate.getFullYear(),
                    bucketLL: curDate.getFullYear() + "-" + (curDate.getMonth() + 1) + "-" + curDate.getDate(),
                    bucketUL: curDate.getFullYear() + "-" + (curDate.getMonth() + 1) + "-" + (curDate.getDate() + 1),
                    size: 5,
                    numValues: len

                });
            }
            this.displayCount = val;
            return propertyValues;
        },
        getNearestNiceNumber(num, previousNum, nextNum) {
            if (previousNum == null) {
                var smallestDifference = nextNum - num;
            } else if (nextNum == null) {
                var smallestDifference = num - previousNum;
            } else {
                var smallestDifference = Math.min(num - previousNum, nextNum - num);
            }

            var base10LogOfDifference = Math.log(smallestDifference) / Math.LN10;
            var significantFigureOfDifference = Math.floor(base10LogOfDifference);

            var powerOf10InCorrectPlace = Math.pow(10, Math.floor(base10LogOfDifference));
            var significantDigitsOnly = Math.round(num / powerOf10InCorrectPlace);
            var niceNumber = significantDigitsOnly * powerOf10InCorrectPlace;

            // Special handling if it's the first or last number in the series -
            // we have to make sure that the "nice" equivalent is on the right
            // "side" of the number.

            // That's especially true for the last number -
            // it has to be greater, not just equal to, because of the way
            // number filtering works.
            // ...or does it??
            if (previousNum == null && niceNumber > num) {
                niceNumber -= powerOf10InCorrectPlace;
            }
            if (nextNum == null && niceNumber < num) {
                niceNumber += powerOf10InCorrectPlace;
            }

            // Now, we have to turn it into a string, so that the resulting
            // number doesn't end with something like ".000000001" due to
            // floating-point arithmetic.
            var numDecimalPlaces = Math.max(0, 0 - significantFigureOfDifference);
            return niceNumber.toFixed(numDecimalPlaces);
        },
        generateIndividualFilterValuesFromNumbers(uniqueValues, unit) {
            // Unfortunately, object keys aren't necessarily cycled through
            // in the correct order - put them in an array, so that they can
            // be sorted.
            var uniqueValuesArray = [];
            for (uniqueValue in uniqueValues) {
                uniqueValuesArray.push(uniqueValue);
            }

            // Sort numerically, not alphabetically.
            uniqueValuesArray.sort(function (a, b) { return a - b; });

            var propertyValues = [];
            for (i = 0; i < uniqueValuesArray.length; i++) {
                var uniqueValue = uniqueValuesArray[i];
                var curBucket = {};
                curBucket['bucketName'] = numberWithCommas(uniqueValue);
                curBucket['numValues'] = uniqueValues[uniqueValue];
                curBucket['bucketUL'] = uniqueValue;
                curBucket['bucketLL'] = uniqueValue;
                curBucket['unit'] = unit;
                propertyValues.push(curBucket);
            }
            return propertyValues;
        },
        generateFilterValuesFromNumbers(numberArray, unit = '') {
            var numNumbers = numberArray.length;
            // First, find the number of unique values - if it's the value of
            // gBucketsPerFilter, or fewer, just display each one as its own
            // bucket.
            var numUniqueValues = 0;
            var uniqueValues = {};
            for (i = 0; i < numNumbers; i++) {
                var curNumber = Number(numberArray[i].amount.value);
                if (!uniqueValues.hasOwnProperty(curNumber)) {
                    uniqueValues[curNumber] = 1;
                    numUniqueValues++;
                    if (numUniqueValues > gBucketsPerFilter) continue;
                } else {
                    // We do this now to save time on the next step,
                    // if we're creating individual filter values.
                    uniqueValues[curNumber]++;
                }
            }
            if (numUniqueValues <= gBucketsPerFilter) {
                return this.generateIndividualFilterValuesFromNumbers(uniqueValues, unit);
            }
            var propertyValues = [];
            var separatorValue = Number(numberArray[0].amount.value);
            // Make sure there are at least, on average, five numbers per bucket.
            // HACK - add 3 to the number so that we don't end up with just one
            // bucket ( 7 + 3 / 5 = 2).
            var numBuckets = Math.min(gBucketsPerFilter, Math.floor((numNumbers + 3) / 5));
            var bucketSeparators = [];
            bucketSeparators.push(Number(numberArray[0].amount.value));
            for (i = 1; i < numBuckets; i++) {
                separatorIndex = Math.floor(numNumbers * i / numBuckets) - 1;
                previousSeparatorValue = separatorValue;
                separatorValue = Number(numberArray[separatorIndex].amount.value);
                if (separatorValue == previousSeparatorValue) {
                    continue;
                }
                bucketSeparators.push(separatorValue);
            }
            bucketSeparators.push(Math.ceil(Number(numberArray[numberArray.length - 1].amount.value)));
            bucketSeparators.sort(function (a, b) { return a - b });
            // Get the closest "nice" (few significant digits) number for each of
            // the bucket separators, with the number of significant digits
            // required based on their proximity to their neighbors.
            // The first and last separators need special handling.
            bucketSeparators[0] = this.getNearestNiceNumber(bucketSeparators[0], null, bucketSeparators[1]);
            for (i = 1; i < bucketSeparators.length - 1; i++) {
                bucketSeparators[i] = this.getNearestNiceNumber(bucketSeparators[i], bucketSeparators[i - 1], bucketSeparators[i + 1]);
            }
            bucketSeparators[bucketSeparators.length - 1] = this.getNearestNiceNumber(bucketSeparators[bucketSeparators.length - 1], bucketSeparators[bucketSeparators.length - 2], null);
            var oldSeparatorValue = bucketSeparators[0];
            var separatorValue;
            for (i = 1; i < bucketSeparators.length; i++) {
                separatorValue = bucketSeparators[i];
                var curBucket = {};
                curBucket['numValues'] = 0;
                var curFilter = new NumberRange(oldSeparatorValue, separatorValue);
                curBucket['bucketName'] = curFilter.toString();
                curBucket['bucketLL'] = curFilter.lowNumber;
                curBucket['bucketUL'] = curFilter.highNumber;
                curBucket['unit'] = unit;
                propertyValues.push(curBucket);
                oldSeparatorValue = separatorValue;
            }
            var curSeparator = 0;
            for (i = 0; i < numberArray.length; i++) {
                if (curSeparator < propertyValues.length - 1) {
                    var curNumber = Number(numberArray[i].amount.value);
                    while (curNumber >= bucketSeparators[curSeparator + 1]) {
                        curSeparator++;
                    }
                }
                propertyValues[curSeparator]['numValues']++;
            }
            return propertyValues;
        },
        getTimePrecision(earliestDate, latestDate) {
            var earliestYear = earliestDate.getFullYear();
            var earliestMonth = earliestDate.getMonth() + 1;
            var earliestDay = earliestDate.getDate();
            var latestYear = latestDate.getFullYear();
            var latestMonth = latestDate.getMonth() + 1;
            var latestDay = latestDate.getDate();
            var yearDifference = latestYear - earliestYear;
            var monthDifference = (12 * yearDifference) + (latestMonth - earliestMonth);
            var dayDifference = (30 * monthDifference) + (latestDay - earliestDay);
            if (dayDifference <= 1) return 11
            else if (monthDifference <= 1) return 10
            else if (yearDifference <= 1) return 9
            else if (yearDifference <= 10) return 8
            else if (yearDifference <= 100) return 7
            else if (yearDifference <= 1000) return 6
            else if (yearDifference <= 1e4) return 5
            else if (yearDifference <= 1e5) return 4
            else if (yearDifference <= 1e6) return 3
            else if (yearDifference <= 1e8) return 1
            return 0
        }
    },
    mounted() {
        var filterString = "";
        var noValueString = "";
        for (let i = 0; i < this.appliedFilters.length; i++) {
            if (this.appliedFilters[i].value == "novalue") {
                noValueString += " FILTER(NOT EXISTS { ?item wdt:" + this.appliedFilters[i].filterValue + " ?no. }).\n"
            }
            else {
                filterString += "?item wdt:" + this.appliedFilters[i].filterValue + " wd:" + this.appliedFilters[i].value + ".\n";
            }
        }
        var filterRanges = ""
        timeString = "?item wdt:" + this.currentFilter.value + " ?time.\n";
        for (let i = 0; i < this.appliedRanges.length; i++) {
            if (this.appliedRanges[i].valueLL == "novalue") {
                noValueString += " FILTER(NOT EXISTS { ?item wdt:" + this.appliedRanges[i].filterValue + " ?no. }).\n"
            }
            else if(this.appliedRanges[i].filterValue != this.currentFilter.value) {
                timePrecision = this.getTimePrecision(new Date(this.parseDate(this.appliedRanges[i].valueLL)), new Date(this.parseDate(this.appliedRanges[i].valueUL)))
                filterRanges += "?item (p:" + this.appliedRanges[i].filterValue + "/psv:" + this.appliedRanges[i].filterValue + ") ?timenode" + i + ".\n" +
                    "  ?timenode" + i + " wikibase:timeValue ?time" + i + ".\n" +
                    "  ?timenode" + i + " wikibase:timePrecision ?timeprecision" + i + ".\n" +
                    "  FILTER('" + this.appliedRanges[i].valueLL + "'^^xsd:dateTime <= ?time" + i + " && ?time" + i + " <= '" + this.appliedRanges[i].valueUL + "'^^xsd:dateTime).\n" +
                    "  FILTER(?timeprecision" + i + ">=" + timePrecision + ")\n";
            }
            else{
                timePrecision = this.getTimePrecision(new Date(this.appliedRanges[i].valueLL), new Date(this.appliedRanges[i].valueUL))
                timeString = "?item (p:" + this.appliedRanges[i].filterValue + "/psv:" + this.appliedRanges[i].filterValue + ") ?timenode.\n" +
                    "  ?timenode wikibase:timeValue ?time.\n" +
                    "  ?timenode wikibase:timePrecision ?timeprecision.\n" +
                    "  FILTER('" + this.appliedRanges[i].valueLL + "'^^xsd:dateTime <= ?time && ?time <= '" + this.appliedRanges[i].valueUL + "'^^xsd:dateTime).\n" +
                    "  FILTER(?timeprecision>=" + timePrecision + ")\n";
            }
        }
        var filterQuantities = "";
        for (let i = 0; i < this.appliedQuantities.length; i++) {
            if (this.appliedQuantities[i].valueLL == "novalue") {
                noValueString += " FILTER(NOT EXISTS { ?item wdt:" + this.appliedQuantities[i].filterValue + " ?no. }).\n"
            }
            else if (this.appliedQuantities[i].unit == "") {
                filterQuantities += "?item (p:" + this.appliedQuantities[i].filterValue + "/psv:" + this.appliedQuantities[i].filterValue + ") ?amount" + i + ".\n" +
                    "  ?amount" + i + " wikibase:quantityAmount ?amountValue" + i + ".\n" +
                    "FILTER(" + this.appliedQuantities[i].valueUL + " >= ?amountValue" + i + " && ?amountValue" + i + " >" + this.appliedQuantities[i].valueLL + ")\n"
            }
            else {
                filterQuantities += "?item (p:" + this.appliedQuantities[i].filterValue + "/psn:" + this.appliedQuantities[i].filterValue + ") ?amount" + i + ".\n" +
                    "  ?amount" + i + " wikibase:quantityAmount ?amountValue" + i + ".\n" +
                    "FILTER(" + this.appliedQuantities[i].valueUL + " >= ?amountValue" + i + " && ?amountValue" + i + " >" + this.appliedQuantities[i].valueLL + ")\n"

            }
        }
        var sparqlQuery = "SELECT ?property WHERE {\n" +
            "  wd:" + this.currentFilter.value + " wikibase:propertyType ?property.\n" +
            "}";
        const fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
        let vm = this;
        axios.get(fullUrl)
            .then((response) => {
                if (response.data['results']['bindings'][0].property.value.split("#")[1] == "Time") {
                    var q = window.location.search;
                    parameters = new URLSearchParams(q)
                    parameters.delete("cf")
                    parameters.set("r." + this.currentFilter.value, "novalue")
                    this.noValueURL = window.location.pathname + "?" + parameters
                    var sparqlQuery = "SELECT ?time WHERE {\n" +
                        "?item wdt:" + instanceOf + " wd:" + this.classValue + ".\n" +
                        filterString +
                        filterRanges +
                        timeString +
                        filterQuantities +
                        noValueString +
                        "}\n" +
                        "ORDER by ?time";
                    this.query = 'https://query.wikidata.org/#' + encodeURIComponent(sparqlQuery);
                    const fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
                    axios.get(fullUrl)
                        .then(response => {
                            if (response.data['results']['bindings'].length) {
                                arr = this.generateDatePropertyValues(response.data['results']['bindings'], this.currentFilter)
                                for (var i = 0; i < arr.length; i++) {
                                    var q = window.location.search;
                                    parameters = new URLSearchParams(q)
                                    parameters.delete("cf")
                                    if (arr[i].size == 1) parameters.set("r." + this.currentFilter.value, (new Date(this.parseDate(arr[i].bucketLL))).getFullYear() + "~" + (new Date(this.parseDate(arr[i].bucketUL))).getFullYear())
                                    else if (arr[i].size == 2) parameters.set("r." + this.currentFilter.value, (new Date(this.parseDate(arr[i].bucketLL))).getFullYear())
                                    else if (arr[i].size == 3) parameters.set("r." + this.currentFilter.value, (new Date(this.parseDate(arr[i].bucketLL))).getFullYear() + "-" + (Number((new Date(arr[i].bucketLL)).getMonth()) + 1))
                                    else if (arr[i].size == 4) parameters.set("r." + this.currentFilter.value, arr[i].bucketLL)
                                    else if (arr[i].size == 5) parameters.set("r." + this.currentFilter.value, arr[i].bucketLL)
                                    arr[i]['href'] = window.location.pathname + "?" + parameters
                                }
                                if(arr.length) {
                                    vm.items = arr;
                                    this.itemsType = 'Time'
                                }
                                else {
                                    this.itemsType = 'Additionalempty'
                                }
                            }
                            else {
                                index = vm.appliedRanges.findIndex(filter => filter.filterValue == vm.currentFilter.value)
                                if (index = -1) this.itemsType = "Additionalempty"
                                else this.itemsType = 'Time'
                            }
                        })
                        .catch(error => {
                            var sparqlQuery = "SELECT ?time WHERE{SELECT ?time WHERE {\n" +
                                "  hint:Query hint:optimizer \"None\".\n" +
                                "?item wdt:" + instanceOf + " wd:" + vm.classValue + ".\n" +
                                filterString +
                                "?item wdt:" + vm.currentFilter.value + " ?time.\n" +
                                filterRanges +
                                filterQuantities +
                                "}\n" +
                                "LIMIT " + resultsPerPage + "\n" +
                                "}\n" +
                                "ORDER BY ?time";
                            const fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
                            axios.get(fullUrl)
                                .then(res => {
                                    if (res.data['results']['bindings'].length) {
                                        arr = vm.generateDatePropertyValues(res.data['results']['bindings'], vm.currentFilter)
                                        for (var i = 0; i < arr.length; i++) {
                                            var q = window.location.search;
                                            parameters = new URLSearchParams(q)
                                            parameters.delete("cf")
                                            if (arr[i].size == 1) parameters.set("r." + this.currentFilter.value, (new Date(this.parseDate(arr[i].bucketLL))).getFullYear() + "~" + (new Date(this.parseDate(arr[i].bucketUL))).getFullYear())
                                            else if (arr[i].size == 2) parameters.set("r." + this.currentFilter.value, (new Date(this.parseDate(arr[i].bucketLL))).getFullYear())
                                            else if (arr[i].size == 3) parameters.set("r." + this.currentFilter.value, (new Date(this.parseDate(arr[i].bucketLL))).getFullYear() + "-" + (Number((new Date(arr[i].bucketLL)).getMonth()) + 1))
                                            else if (arr[i].size == 4) parameters.set("r." + this.currentFilter.value, arr[i].bucketLL)
                                            else if (arr[i].size == 5) parameters.set("r." + this.currentFilter.value, arr[i].bucketLL)
                                            arr[i]['href'] = window.location.pathname + "?" + parameters
                                        }
                                        vm.items = arr
                                        vm.displayCount = 0
                                        vm.itemsType = 'Time'
                                    }
                                    else {
                                        vm.itemsType = 'TimeFail'
                                    }

                                }
                                )
                                .catch(error => {
                                    vm.itemsType = 'Error'
                                })
                        })
                }
                else if (response.data['results']['bindings'][0].property.value.split("#")[1] == "Quantity") {
                    var q = window.location.search;
                    parameters = new URLSearchParams(q)
                    parameters.delete("cf")
                    parameters.set("q." + this.currentFilter.value, "novalue")
                    this.noValueURL = window.location.pathname + "?" + parameters
                    var sparqlQuery = "SELECT ?item ?amount WHERE {\n" +
                        "    ?item wdt:" + instanceOf + " wd:" + this.classValue + ".\n" +
                        filterString +
                        "    ?item (p:" + this.currentFilter.value + "/psn:" + this.currentFilter.value + ") ?v.\n" +
                        "    ?v wikibase:quantityAmount ?amount.\n" +
                        filterRanges +
                        filterQuantities +
                        noValueString +
                        "}\n" +
                        "ORDER BY ?amount";
                    this.query = 'https://query.wikidata.org/#' + encodeURIComponent(sparqlQuery);
                    const fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
                    axios.get(fullUrl)
                        .then(response => (response.data['results']['bindings'].length ? response : ''))
                        .then(
                            function (response) {
                                if (response == "") {
                                    var sparqlQuery = "SELECT ?amount WHERE {\n" +
                                        "    ?item wdt:" + instanceOf + " wd:" + vm.classValue + ".\n" +
                                        filterString +
                                        "    ?item (p:" + vm.currentFilter.value + "/psv:" + vm.currentFilter.value + ") ?v.\n" +
                                        "    ?v wikibase:quantityAmount ?amount.\n" +
                                        filterRanges +
                                        filterQuantities +
                                        noValueString +
                                        "}\n" +
                                        "ORDER BY ?amount";
                                    this.query = 'https://query.wikidata.org/#' + encodeURIComponent(sparqlQuery);
                                    const fullUr = sparqlEndpoint + encodeURIComponent(sparqlQuery);
                                    axios.get(fullUr)
                                        .then(res => {
                                            if (res.data['results']['bindings'].length) {
                                                arr = vm.generateFilterValuesFromNumbers(res.data['results']['bindings'])
                                                for (var i = 0; i < arr.length; i++) {
                                                    var q = window.location.search;
                                                    parameters = new URLSearchParams(q)
                                                    parameters.delete("cf")
                                                    parameters.set("q." + vm.currentFilter.value, arr[i].bucketLL + "~" + arr[i].bucketUL + (arr[i].unit != "" ? ("~" + arr[i].unit) : ""))
                                                    arr[i]['href'] = window.location.pathname + "?" + parameters
                                                }
                                                vm.items = arr
                                                vm.itemsType = 'Quantity'
                                            }
                                            else {
                                                index = vm.appliedQuantities.findIndex(filter => filter.filterValue == vm.currentFilter.value)
                                                if (index != -1) {
                                                    vm.itemsType = "Additionalempty"
                                                }
                                                else {
                                                    vm.itemsType = 'Quantity'
                                                }
                                            }
                                        })
                                        .catch(error => {
                                            sparqlQuery = "SELECT ?amount WHERE\n" +
                                                "{\n" +
                                                "  SELECT ?amount WHERE {\n" +
                                                "    hint:Query hint:optimizer \"None\".\n" +
                                                "    ?item wdt:" + instanceOf + " wd:" + vm.classValue + ".\n" +
                                                "    ?item (p:" + vm.currentFilter.value + "/psv:" + vm.currentFilter.value + ") ?v.\n" +
                                                "    ?v wikibase:quantityAmount ?amount.\n" +
                                                "}\n" +
                                                "LIMIT " + resultsPerPage + "\n" +
                                                "}\n" +
                                                "ORDER BY ?amount";
                                            const fullUr = sparqlEndpoint + encodeURIComponent(sparqlQuery);
                                            axios.get(fullUr)
                                                .then(r => {
                                                    if (r.data['results']['bindings'].length) {
                                                        arr = vm.generateFilterValuesFromNumbers(r.data['results']['bindings'])
                                                        for (var i = 0; i < arr.length; i++) {
                                                            var q = window.location.search;
                                                            parameters = new URLSearchParams(q)
                                                            parameters.delete("cf")
                                                            parameters.set("q." + vm.currentFilter.value, arr[i].bucketLL + "~" + arr[i].bucketUL + (arr[i].unit != "" ? ("~" + arr[i].unit) : ""))
                                                            arr[i]['href'] = window.location.pathname + "?" + parameters
                                                        }
                                                        vm.items = arr
                                                    }
                                                    vm.itemsType = 'Quantity'

                                                })
                                                .catch(error => {
                                                    vm.itemsType = 'Error'
                                                })
                                        })
                                }
                                else {
                                    firstItem = response.data['results']['bindings'][0].item.value.split("/").slice(-1)[0];
                                    var unitQuery = "SELECT ?unitLabel WHERE {\n" +
                                        "    wd:" + firstItem + " (p:" + vm.currentFilter.value + "/psn:" + vm.currentFilter.value + ") ?v.\n" +
                                        "    ?v wikibase:quantityAmount ?amount;\n" +
                                        "       wikibase:quantityUnit ?unit.\n" +
                                        "  SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }\n" +
                                        "}";
                                    const url = sparqlEndpoint + encodeURIComponent(unitQuery);
                                    axios.get(url)
                                        .then(res => {
                                            if (response.data['results']['bindings'].length) {
                                                arr = vm.generateFilterValuesFromNumbers(response.data['results']['bindings'], res.data['results']['bindings'][0].unitLabel.value)
                                                for (var i = 0; i < arr.length; i++) {
                                                    var q = window.location.search;
                                                    parameters = new URLSearchParams(q)
                                                    parameters.delete("cf")
                                                    parameters.set("quantity," + vm.currentFilter.value, arr[i].bucketLL + "~" + arr[i].bucketUL + (arr[i].unit != "" ? ("~" + arr[i].unit) : ""))
                                                    arr[i]['href'] = window.location.pathname + "?" + parameters
                                                }
                                                vm.items = arr
                                                vm.itemsType = 'Quantity'
                                            }
                                            else {
                                                index = vm.appliedFilters.findIndex(filter => filter.filterValue == vm.currentFilter.value)
                                                if (index = -1) this.itemsType = "Additionalempty"
                                                else this.itemsType = 'Quantity'
                                            }
                                        })
                                        .catch(error => {
                                            vm.itemsType = 'Error'
                                        })

                                }
                            }
                        )
                        .catch(error => {
                            sparqlQuery = "SELECT ?amount WHERE\n" +
                                "{\n" +
                                "  SELECT ?item ?amount WHERE {\n" +
                                "  hint:Query hint:optimizer \"None\".\n" +
                                "    ?item wdt:" + instanceOf + " wd:" + vm.classValue + ".\n" +
                                "    ?item (p:" + vm.currentFilter.value + "/psn:" + vm.currentFilter.value + ") ?v.\n" +
                                "    ?v wikibase:quantityAmount ?amount.\n" +
                                "}\n" +
                                "LIMIT " + resultsPerPage + "\n" +
                                "}\n" +
                                "ORDER BY ?amount";
                            this.query = 'https://query.wikidata.org/#' + encodeURIComponent(sparqlQuery);
                            const url = sparqlEndpoint + encodeURIComponent(sparqlQuery);
                            axios.get(url)
                                .then(res => {
                                    if (vm.itemsType = 'Quantity') {
                                        arr = vm.generateFilterValuesFromNumbers(res.data['results']['bindings'])
                                        for (var i = 0; i < arr.length; i++) {
                                            var q = window.location.search;
                                            parameters = new URLSearchParams(q)
                                            parameters.delete("cf")
                                            parameters.set("q." + vm.currentFilter.value, arr[i].bucketLL + "~" + arr[i].bucketUL + (arr[i].unit != "" ? ("~" + arr[i].unit) : ""))
                                            arr[i]['href'] = window.location.pathname + "?" + parameters
                                        }
                                        vm.items = arr
                                        vm.displayCount = 0
                                    }
                                })
                                .catch(error => {
                                    vm.itemsType = 'Error'
                                })
                        })
                }
                else {
                    var q = window.location.search;
                    parameters = new URLSearchParams(q)
                    parameters.set("f." + this.currentFilter.value, "novalue")
                    this.noValueURL = window.location.pathname + "?" + parameters
                    var sparqlQuery = "SELECT ?value ?valueLabel ?count WHERE {\n" +
                        "  {\n" +
                        "SELECT ?value (COUNT(?value) AS ?count) WHERE {\n" +
                        "  ?item wdt:" + instanceOf + " wd:" + this.classValue + ".\n" +
                        " ?item wdt:" + this.currentFilter.value + " ?value.\n" +
                        filterString +
                        filterRanges +
                        filterQuantities +
                        noValueString +
                        "}\n" +
                        "GROUP BY ?value    \n" +
                        "  }\n" +
                        "  SERVICE wikibase:label { bd:serviceParam wikibase:language \"" + lang + "\". }\n" +
                        "}\n" +
                        "ORDER BY DESC (?count)";
                    this.query = 'https://query.wikidata.org/#' + encodeURIComponent(sparqlQuery);
                    const fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
                    axios.get(fullUrl)
                        .then(response => {
                            if (response.data['results']['bindings'].length) {
                                arr = [...response.data['results']['bindings']]
                                index = []
                                for (let i = 0; i < vm.appliedFilters.length; i++) {
                                    if (vm.appliedFilters[i].filterValue == vm.currentFilter.value) {
                                        index.push(vm.appliedFilters[i].value)
                                    }
                                }
                                arr = arr.filter(x => !index.includes(x.value.value.split('/').slice(-1)[0]))
                                if (arr.length > 0) {
                                    this.itemsType = "Item"
                                    this.items = arr
                                }
                                else {
                                    this.itemsType = "Additionalempty"
                                }
                                for (var i = 0; i < arr.length; i++) {
                                    var q = window.location.search;
                                    parameters = new URLSearchParams(q)
                                    parameters.delete("cf")
                                    var existingValues = ""
                                    for (let i = 0; i < vm.appliedFilters.length; i++) {
                                        if (vm.appliedFilters[i].filterValue == this.currentFilter.value) {
                                            existingValues = existingValues + vm.appliedFilters[i].value + "-";
                                        }
                                    }
                                    parameters.set("f." + this.currentFilter.value, existingValues + arr[i].value.value.split('/').slice(-1)[0])
                                    arr[i]['href'] = window.location.pathname + "?" + parameters
                                }
                            }
                            else {
                                index = vm.appliedFilters.findIndex(filter => filter.filterValue == vm.currentFilter.value)
                                if (index = -1) this.itemsType = "Additionalempty"
                                else this.itemsType = 'Item'
                            }
                        })
                        .catch(error => {
                            sparqlQuery = "SELECT ?value ?valueLabel WHERE{\n" +
                                "{\n" +
                                "  SELECT DISTINCT ?value\n" +
                                "{\n" +
                                "  SELECT ?value WHERE {\n" +
                                "    hint:Query hint:optimizer \"None\".\n" +
                                "  ?item wdt:" + instanceOf + " wd:" + vm.classValue + ".\n" +
                                " ?item wdt:" + vm.currentFilter.value + " ?value.\n" +
                                filterString +
                                filterRanges +
                                filterQuantities +
                                "}\n" +
                                "LIMIT 300\n" +
                                "      }\n" +
                                "\n" +
                                "}\n" +
                                "  SERVICE wikibase:label { bd:serviceParam wikibase:language \"" + lang + "\". }\n" +
                                "  }\n" +
                                "ORDER BY ?valueLabel";
                            const fullUrl = sparqlEndpoint + encodeURIComponent(sparqlQuery);
                            axios.get(fullUrl)
                                .then((res) => {
                                    vm.itemsType = "ItemFail"
                                    arr = [...res.data['results']['bindings']].slice(0).sort(
                                        function (a, b) {
                                            var x = a.valueLabel.value.toLowerCase();
                                            var y = b.valueLabel.value.toLowerCase();
                                            return x < y ? -1 : x > y ? 1 : 0;
                                        }
                                    )
                                    for (var i = 0; i < arr.length; i++) {
                                        var q = window.location.search;
                                        parameters = new URLSearchParams(q)
                                        parameters.delete("cf")
                                        parameters.set("f." + this.currentFilter.value, arr[i].value.value.split('/').slice(-1)[0])
                                        arr[i]['href'] = window.location.pathname + "?" + parameters
                                    }
                                    vm.items = arr
                                })
                                .catch(error => {
                                    vm.itemsType = 'Error'
                                })

                        })
                }
            })
    }
})