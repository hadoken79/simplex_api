document.addEventListener("DOMContentLoaded", event => {

    const maxDateOptions = {
        dateFormat: 'YYYY-MM-DD',
        color: 'info'
    };
    
    // Initialize all input of date type.
    const calendars = bulmaCalendar.attach('[type="date"]', maxDateOptions);
    
    // Loop on each calendar initialized
    calendars.forEach(calendar => {
        // Add listener to date:selected event
        calendar.on('date:selected', date => {
            console.log(date);
        });
    });
    
    
    // To access to bulmaCalendar instance of an element
    const element = document.querySelector('#maxDatePicker');
    if (element) {
        // bulmaCalendar instance is available as element.bulmaCalendar
        element.bulmaCalendar.on('select', datepicker => {
            console.log(datepicker.data.value());
            maxDate = datepicker.data.value();
        });
    }

});



