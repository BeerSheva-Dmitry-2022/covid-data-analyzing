import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle";
import "bootstrap-icons/font/bootstrap-icons.css"
import DataProcessor from "./services/dataProcessor";
import Spinner from "./ui-ux/spinner";
import { dataProvider } from "./config/servicesConfig";
import TableHandler from "./ui-ux/table-handler";
import config from "./config/config.json";
import FormHandler from "./ui-ux/form-handler";
import { objToExponential } from "./utilities/extensions";

/***** OBJECTS *****/
const firstObservationDay = '2020-01-22';
const dataProcessor = new DataProcessor(dataProvider, config);
const spinner = new Spinner("spinner");
const mainTableHandler = new TableHandler(undefined, 'main-body',
    ['continent', 'confirmed', 'deaths', 'vaccinated']);
const historyTableHandler = new TableHandler('history-header', 'history-body',
    ['country', 'confirmed', 'deaths', 'vaccinated'], historySort);
const statTableHandler = new TableHandler('stat-header', 'stat-body',
    ['country', 'confirmed', 'deaths', 'vaccinated'], statSort);
const historyFormHandler = new FormHandler('history-form', 'alert');
const statFormHandler = new FormHandler('stat-form', 'alert');

/***** FUNCTIONS *****/
async function poller() {
    const continentsData = await dataProcessor.getStatisticsContinents();
    fillMainTable(continentsData);
    fillMapData(continentsData);
}
function fillMainTable(continentsArr) {
    mainTableHandler.clear();
    continentsArr.forEach(c => {
        const color = config.continentColors[c.continent.toLowerCase()];
        mainTableHandler.addRowColored(objToExponential(c), color);
    });
}
function fillMapData(continentsArr) {

}

function fillHistTable(from, to, num) {
    historyTableHandler.clear();
    spinner.wait(async () => {
        let histArr = await dataProcessor.getHistoryStatistics(from, to);
        if (typeof num == 'number') {
            for (let i = 0; i < num; i++) {
                historyTableHandler.addRow(objToExponential(histArr[i]));
            }
        } else {
            histArr.forEach(obj => {
                historyTableHandler.addRow(objToExponential(obj));
            });
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
    fillMainTable(continentsData);
    fillMapData(continentsData);
});
setInterval(poller, config.pollingIntervalInSeconds * 1000);

fillHistTable(new Date(firstObservationDay), new Date());
historyFormHandler.addHandler(async data => 
    fillHistTable(new Date(data.fromDate), new Date(data.toDate), data.countriesNum));