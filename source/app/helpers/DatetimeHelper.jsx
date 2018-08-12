var moment = require('moment');

export default class DatetimeHelper {

    static getFullNowString() {
        moment.locale('vi');
        return moment().format('Do MMMM YYYY, h:mm:ss a');
    }

}