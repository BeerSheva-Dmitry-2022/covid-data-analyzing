import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle";
import "bootstrap-icons/font/bootstrap-icons.css"
import DataProcessor from "./services/dataProcessor";
import Spinner from "./ui-ux/spinner";
import { dataProvider } from "./config/servicesConfig";
import TableHandler from "./ui-ux/table-handler";
import config from "./config/config.json";
import FormHandler from "./ui-ux/form-handler";
import { objToExponential, convertDate } from "./utilities/extensions";
import DashboardHandler from "./ui-ux/dashboard-handler";
import _ from "lodash";

/***** OBJECTS *****/
const firstObservationDay = '2020-01-22';
const dataProcessor = new DataProcessor(dataProvider, config);
const spinner = new Spinner("spinner");
const dashboard = new DashboardHandler('dashboard', 'conventions');
const historyTableHandler = new TableHandler('history-header', 'history-body',
    ['country', 'confirmed', 'deaths', 'vaccinated'], historySort);
const statTableHandler = new TableHandler('stat-header', 'stat-body',
    ['country', 'confirmed', 'deaths', 'vaccinated'], statSort);
const historyFormHandler = new FormHandler('history-form', 'alert');
const statFormHandler = new FormHandler('stat-form', 'alert');

/***** FUNCTIONS *****/



async function poller() {
    const continentsData = await dataProcessor.getStatisticsContinents();
    fillDashboard(continentsData);
    fillMapData(continentsData);
}

function fillDashboard(continentsArr) {
    dashboard.clear();
    continentsArr.forEach(data => {
        const color = config.continentColors[data.continent.toLowerCase()];
        dashboard.addEntry(data, color)
    });
    dashboard.addConventions();
}

function fillMapData(continentsArr) {

}

function fillHistTable(from, to, num) {
    historyTableHandler.clear();
    spinner.wait(async () => {
        let histArr = await dataProcessor.getHistoryStatistics(from, to);
        if (num == '' || num == undefined) {
            histArr.forEach(obj => {
                historyTableHandler.addRow(objToExponential(obj));
            });
        } else {
            for (let i = 0; i < num; i++) {
                historyTableHandler.addRow(objToExponential(histArr[i]));
            }
        }
    });
}

function historySort(key, headerId){
    historyTableHandler.clear();
    const sorted = dataProcessor.sort(key, headerId);
    sorted.forEach(c => historyTableHandler.addRow(c));
}

function statSort(key, headerId){
    statTableHandler.clear();
    const sorted = dataProcessor.sort(key, headerId);
    sorted.forEach(c => statTableHandler.addRow(c));
}

/***** ACTIONS *****/
spinner.wait(async () => {
    const continentsData = await dataProcessor.getStatisticsContinents();
    fillDashboard(continentsData);
    fillMapData(continentsData);
});
setInterval(poller, config.pollingIntervalInSeconds * 1000);

FormHandler.fillCalendarValues('dateFromHist', undefined, convertDate(new Date()));
FormHandler.fillCalendarValues('dateToHist', convertDate(new Date()), convertDate(new Date()));

fillHistTable(new Date(firstObservationDay), new Date());
historyFormHandler.addHandler(async data => 
    fillHistTable(new Date(data.fromDate), new Date(data.toDate), data.countriesNum));